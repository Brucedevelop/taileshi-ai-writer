import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateCompletion } from '@/lib/llm/openrouter-client';
import { TOPIC_GENERATOR_SYSTEM, buildTopicPrompt } from '@/lib/llm/prompts/topic-generator';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  product: z.string().min(1),
  country: z.string().min(1),
  customerType: z.string().min(1),
  profileId: z.string().optional(),
  listName: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { product, country, customerType, profileId, listName } = parsed.data;

  const profile = profileId
    ? await prisma.roleProfile.findUnique({ where: { id: profileId } })
    : null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferredModel: true },
  });

  const content = await generateCompletion(
    buildTopicPrompt({ product, country, customerType, profile: profile ? JSON.stringify(profile) : undefined }),
    TOPIC_GENERATOR_SYSTEM,
    user?.preferredModel ?? 'openai/gpt-4o',
    { maxTokens: 8000 }
  );

  // Parse numbered list
  const lines = content.split('\n')
    .map((l) => l.replace(/^\d+\.\s*/, '').trim())
    .filter((l) => l.length > 0);

  const topicList = await prisma.topicList.create({
    data: {
      userId: session.user.id,
      name: listName ?? `${product} - ${country} - ${customerType}`,
      product,
      country,
      customerType,
      items: {
        create: lines.map((title) => ({ title })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ topicList });
}
