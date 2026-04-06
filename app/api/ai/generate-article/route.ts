import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateCompletion } from '@/lib/llm/openrouter-client';
import { ARTICLE_GENERATOR_SYSTEM, buildArticlePrompt } from '@/lib/llm/prompts/article-generator';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  topicItemId: z.string(),
  profileId: z.string().optional(),
  withImages: z.boolean().default(true),
  model: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { topicItemId, profileId, withImages, model } = parsed.data;

  const [topicItem, profile, user] = await Promise.all([
    prisma.topicItem.findUnique({ where: { id: topicItemId }, include: { topicList: true } }),
    profileId ? prisma.roleProfile.findUnique({ where: { id: profileId } }) : null,
    prisma.user.findUnique({ where: { id: session.user.id }, select: { preferredModel: true, role: true, credits: true } }),
  ]);

  if (!topicItem) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });

  const selectedModel = model ?? user?.preferredModel ?? 'openai/gpt-4o';
  const profileText = profile
    ? (profile.summaryEn || profile.summaryZh || JSON.stringify(profile))
    : '';

  const content = await generateCompletion(
    buildArticlePrompt({ topic: topicItem.title, materials: '', profile: profileText }),
    ARTICLE_GENERATOR_SYSTEM,
    selectedModel
  );

  const article = await prisma.article.create({
    data: {
      userId: session.user.id,
      topicItemId,
      profileId: profileId ?? null,
      title: topicItem.title,
      markdownContent: content,
      withImages,
      publishStatus: 'draft',
      cost: withImages ? 10 : 6,
      modelUsed: selectedModel,
    },
  });

  return NextResponse.json({ article });
}
