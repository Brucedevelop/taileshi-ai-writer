import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { WPClient } from '@/lib/wordpress/wp-client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  username: z.string().min(1),
  appPassword: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { name, url, username, appPassword } = parsed.data;

  const client = new WPClient(url, username, appPassword);
  const test = await client.testConnection();

  if (!test.success) {
    return NextResponse.json({ error: `Connection failed: ${test.error}` }, { status: 400 });
  }

  const site = await prisma.wordPressSite.create({
    data: { userId: session.user.id, name, url, username, appPassword },
  });

  return NextResponse.json({ site, siteName: test.siteName });
}
