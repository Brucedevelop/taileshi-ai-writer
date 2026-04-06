import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { jobId } = await params;

  const job = await prisma.publishJob.findUnique({
    where: { id: jobId, userId: session.user.id },
    include: { wpSite: { select: { name: true, url: true } } },
  });

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  return NextResponse.json({ job });
}
