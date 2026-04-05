import { Queue, Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const publishQueue = new Queue('batch-publish', { connection });

export interface PublishJobData {
  publishJobId: string;
  userId: string;
  wpSiteId: string;
  topicIds: string[];
  withImages: boolean;
  publishMode: 'immediate' | 'scheduled';
  dailyLimit?: number;
  dailyStartHour?: number;
  dailyEndHour?: number;
  timezone?: string;
}

export async function addPublishJob(data: PublishJobData): Promise<void> {
  await publishQueue.add('publish', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
}

export function createBatchPublishWorker() {
  return new Worker(
    'batch-publish',
    async (job: Job<PublishJobData>) => {
      const { publishJobId, topicIds, withImages } = job.data;

      // Update job status to processing
      const { prisma } = await import('@/lib/prisma');
      await prisma.publishJob.update({
        where: { id: publishJobId },
        data: { status: 'processing' },
      });

      let completed = 0;
      let failed = 0;

      for (const topicId of topicIds) {
        try {
          // 1. Research phase
          const { searchGoogle, extractInsights } = await import('@/lib/serp/serpapi-client');
          const topic = await prisma.topicItem.findUnique({
            where: { id: topicId },
            include: { topicList: true },
          });

          if (!topic) continue;

          const serpResults = await searchGoogle(topic.title);
          const insights = extractInsights(serpResults);

          // 2. Generate article
          const { generateCompletion } = await import('@/lib/llm/openrouter-client');
          const { ARTICLE_GENERATOR_SYSTEM, buildArticlePrompt } = await import(
            '@/lib/llm/prompts/article-generator'
          );

          const jobData = await prisma.publishJob.findUnique({
            where: { id: publishJobId },
            include: { user: true },
          });

          const articleContent = await generateCompletion(
            buildArticlePrompt({
              topic: topic.title,
              materials: insights,
              profile: '',
            }),
            ARTICLE_GENERATOR_SYSTEM,
            jobData?.user.preferredModel ?? 'openai/gpt-4o'
          );

          // 3. Save article
          const article = await prisma.article.create({
            data: {
              userId: job.data.userId,
              topicItemId: topicId,
              title: topic.title,
              markdownContent: articleContent,
              serpInsights: insights,
              withImages,
              publishStatus: 'generated',
              cost: withImages ? 10 : 6,
            },
          });

          await prisma.topicItem.update({
            where: { id: topicId },
            data: { status: 'completed' },
          });

          completed++;

          await prisma.publishJob.update({
            where: { id: publishJobId },
            data: { completedCount: completed },
          });

          await job.updateProgress(Math.round((completed / topicIds.length) * 100));
        } catch (error) {
          failed++;
          console.error(`Failed to process topic ${topicId}:`, error);

          await prisma.publishJob.update({
            where: { id: publishJobId },
            data: { failedCount: failed },
          });
        }
      }

      await prisma.publishJob.update({
        where: { id: publishJobId },
        data: { status: failed === topicIds.length ? 'failed' : 'completed' },
      });
    },
    { connection }
  );
}
