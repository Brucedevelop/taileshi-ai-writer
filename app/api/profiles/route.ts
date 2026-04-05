import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profiles = await prisma.roleProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;

  const profile = await prisma.roleProfile.create({
    data: {
      userId: session.user.id,
      name: String(body.name ?? ''),
      bizName: body.bizName ? String(body.bizName) : null,
      bizEmail: body.bizEmail ? String(body.bizEmail) : null,
      bizWebsite: body.bizWebsite ? String(body.bizWebsite) : null,
      brandName: body.brandName ? String(body.brandName) : null,
      country: body.country ? String(body.country) : null,
      mainProducts: body.mainProducts ? String(body.mainProducts) : null,
      businessModel: body.businessModel ? String(body.businessModel) : null,
    },
  });

  return NextResponse.json({ profile });
}
