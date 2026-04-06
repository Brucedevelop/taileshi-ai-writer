import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateCompletion } from '@/lib/llm/openrouter-client';
import { ARTICLE_GENERATOR_SYSTEM, buildArticlePrompt } from '@/lib/llm/prompts/article-generator';
import { prisma } from '@/lib/prisma';
import { searchGoogle, extractInsights } from '@/lib/serp/serpapi-client';
import { z } from 'zod';

const schema = z.object({
  topic: z.string().min(1),
  profileId: z.string().optional(),
  withImages: z.boolean().default(true),
  model: z.string().optional(),
  serpEnabled: z.boolean().default(false),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { topic, profileId, withImages, model, serpEnabled } = parsed.data;

  const [profile, user] = await Promise.all([
    profileId ? prisma.roleProfile.findUnique({ where: { id: profileId } }) : Promise.resolve(null),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { preferredModel: true } }),
  ]);

  const selectedModel = model ?? user?.preferredModel ?? 'openai/gpt-4o';

  const topicList = await prisma.topicList.create({
    data: {
      userId: session.user.id,
      name: `Single: ${topic.slice(0, 50)}`,
    },
  });

  const topicItem = await prisma.topicItem.create({
    data: {
      topicListId: topicList.id,
      title: topic,
      status: 'processing',
    },
  });

  let serpInsights = '';
  if (serpEnabled) {
    try {
      const serpResults = await searchGoogle(topic);
      serpInsights = extractInsights(serpResults);
    } catch (err) {
      console.error('SERP search failed:', err);
    }
  }

  const profileText = profile ? JSON.stringify(profile) : '';
  const content = await generateCompletion(
    buildArticlePrompt({ topic, materials: serpInsights, profile: profileText }),
    ARTICLE_GENERATOR_SYSTEM,
    selectedModel
  );

  const article = await prisma.article.create({
    data: {
      userId: session.user.id,
      topicItemId: topicItem.id,
      profileId: profileId ?? null,
      title: topic,
      markdownContent: content,
      serpInsights: serpInsights || null,
      withImages,
      publishStatus: 'draft',
      cost: withImages ? 10 : 6,
      modelUsed: selectedModel,
    },
  });

  await prisma.topicItem.update({
    where: { id: topicItem.id },
    data: { status: 'completed' },
  });

  return NextResponse.json({ article });
}
