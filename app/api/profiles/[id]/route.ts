import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  bizName: z.string().optional().nullable(),
  bizEmail: z.string().optional().nullable(),
  bizWebsite: z.string().optional().nullable(),
  brandName: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  mainProducts: z.string().optional().nullable(),
  businessModel: z.string().optional().nullable(),
  companyStatus: z.string().optional().nullable(),
  exportCountries: z.string().optional().nullable(),
  customerPosition: z.string().optional().nullable(),
  customerType: z.string().optional().nullable(),
  advantages: z.string().optional().nullable(),
  mainChannels: z.string().optional().nullable(),
  personaName: z.string().optional().nullable(),
  personaCountry: z.string().optional().nullable(),
  personaAge: z.string().optional().nullable(),
  personaTraits: z.string().optional().nullable(),
  personaProducts: z.string().optional().nullable(),
  personaPreferences: z.string().optional().nullable(),
  personaRole: z.string().optional().nullable(),
  personaSourcingRegion: z.string().optional().nullable(),
  personaBusinessModel: z.string().optional().nullable(),
  personaFindSuppliers: z.string().optional().nullable(),
  personaRequirements: z.string().optional().nullable(),
  personaPainPoints: z.string().optional().nullable(),
  summaryZh: z.string().optional().nullable(),
  summaryEn: z.string().optional().nullable(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const profile = await prisma.roleProfile.findUnique({ where: { id } });
  if (!profile || profile.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const profile = await prisma.roleProfile.findUnique({ where: { id } });
  if (!profile || profile.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json() as unknown;
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.roleProfile.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ profile: updated });
}
