import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const includeItems = searchParams.get('includeItems') === 'true';

  const topicLists = await prisma.topicList.findMany({
    where: { userId: session.user.id },
    include: includeItems
      ? { items: { orderBy: { createdAt: 'asc' } } }
      : { _count: { select: { items: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ topicLists });
}
