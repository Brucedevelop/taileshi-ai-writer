import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, PRICING } from '@/lib/billing/credits';
import { z } from 'zod';

const schema = z.object({
  topicIds: z.array(z.string()).min(1),
  wpSiteId: z.string(),
  profileId: z.string().optional(),
  withImages: z.boolean().default(true),
  model: z.string().optional(),
  publishMode: z.enum(['immediate', 'scheduled']).default('immediate'),
  scheduledStart: z.string().optional(),
  dailyLimit: z.number().int().positive().optional(),
  dailyStartHour: z.number().int().min(0).max(23).optional(),
  dailyEndHour: z.number().int().min(0).max(23).optional(),
  timezone: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const {
    topicIds,
    wpSiteId,
    withImages,
    publishMode,
    scheduledStart,
    dailyLimit,
    dailyStartHour,
    dailyEndHour,
    timezone,
  } = parsed.data;

  const wpSite = await prisma.wordPressSite.findUnique({
    where: { id: wpSiteId, userId: session.user.id },
  });
  if (!wpSite) return NextResponse.json({ error: 'WordPress site not found' }, { status: 404 });

  const totalCost = (withImages ? PRICING.WITH_IMAGES : PRICING.WITHOUT_IMAGES) * topicIds.length;

  const creditResult = await deductCredits({
    userId: session.user.id,
    articleCount: topicIds.length,
    withImages,
    description: `Batch publish: ${topicIds.length} articles`,
  });

  if (!creditResult.success) {
    return NextResponse.json({ error: creditResult.error }, { status: 402 });
  }

  const publishJob = await prisma.publishJob.create({
    data: {
      userId: session.user.id,
      wpSiteId,
      totalArticles: topicIds.length,
      withImages,
      publishMode,
      scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
      dailyLimit: dailyLimit ?? null,
      dailyStartHour: dailyStartHour ?? null,
      dailyEndHour: dailyEndHour ?? null,
      timezone: timezone ?? 'UTC',
      status: 'pending',
      totalCost,
    },
  });

  try {
    const { addPublishJob } = await import('@/lib/queue/batch-publisher');
    await addPublishJob({
      publishJobId: publishJob.id,
      userId: session.user.id,
      wpSiteId,
      topicIds,
      withImages,
      publishMode,
      dailyLimit,
      dailyStartHour,
      dailyEndHour,
      timezone,
    });
  } catch (err) {
    console.error('Failed to queue batch publish job:', err);
  }

  return NextResponse.json({ jobId: publishJob.id });
}
