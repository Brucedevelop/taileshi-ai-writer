import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const topicList = await prisma.topicList.findUnique({
    where: { id, userId: session.user.id },
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
        include: { article: { select: { id: true, publishStatus: true } } },
      },
    },
  });

  if (!topicList) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ topicList });
}
