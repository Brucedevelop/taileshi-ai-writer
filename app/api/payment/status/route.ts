import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { orderId } });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  return NextResponse.json({ status: order.status, credits: order.credits });
}
