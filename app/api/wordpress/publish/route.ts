import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { WPClient } from '@/lib/wordpress/wp-client';
import { prisma } from '@/lib/prisma';
import { deductCredits } from '@/lib/billing/credits';
import { z } from 'zod';

const schema = z.object({
  articleId: z.string(),
  wpSiteId: z.string(),
  publishStatus: z.enum(['draft', 'publish', 'future']),
  scheduledDate: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { articleId, wpSiteId, publishStatus, scheduledDate } = parsed.data;

  const [article, wpSite] = await Promise.all([
    prisma.article.findUnique({ where: { id: articleId, userId: session.user.id } }),
    prisma.wordPressSite.findUnique({ where: { id: wpSiteId, userId: session.user.id } }),
  ]);

  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  if (!wpSite) return NextResponse.json({ error: 'WordPress site not found' }, { status: 404 });

  const client = new WPClient(wpSite.url, wpSite.username, wpSite.appPassword);

  const result = await client.createPost({
    title: article.title,
    content: article.markdownContent,
    status: publishStatus,
    date: scheduledDate,
  });

  const creditResult = await deductCredits({
    userId: session.user.id,
    articleCount: 1,
    withImages: article.withImages,
    description: `Publish article: ${article.title}`,
    articleId: article.id,
  });

  if (!creditResult.success) {
    return NextResponse.json({ error: creditResult.error }, { status: 402 });
  }

  await prisma.article.update({
    where: { id: articleId },
    data: {
      wpPostId: result.id,
      wpUrl: result.link,
      publishStatus: publishStatus === 'future' ? 'scheduled' : 'published',
      publishedAt: publishStatus !== 'future' ? new Date() : null,
    },
  });

  return NextResponse.json({ result, credits: creditResult });
}
