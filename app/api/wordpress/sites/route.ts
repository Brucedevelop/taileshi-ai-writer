import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sites = await prisma.wordPressSite.findMany({
    where: { userId: session.user.id, isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ sites });
}
