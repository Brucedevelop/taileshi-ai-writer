import { NextResponse } from 'next/server';
import { verifyCallback } from '@/lib/payment/hupijiao-client';
import { addCredits } from '@/lib/billing/credits';
import { prisma } from '@/lib/prisma';
import type { CallbackParams } from '@/lib/payment/hupijiao-client';

export async function POST(request: Request) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = String(value);
  });

  const appSecret = process.env.HUPIJIAO_APP_SECRET!;

  if (!verifyCallback(params as CallbackParams, appSecret)) {
    return new Response('fail', { status: 400 });
  }

  const { trade_order_id, trade_status } = params;

  if (trade_status !== 'TRADE_SUCCESS') {
    return new Response('success');
  }

  const order = await prisma.order.findUnique({ where: { orderId: trade_order_id } });
  if (!order || order.status === 'paid') {
    return new Response('success');
  }

  await prisma.order.update({
    where: { orderId: trade_order_id },
    data: { status: 'paid', paidAt: new Date() },
  });

  await addCredits(order.userId, order.credits, order.orderId, `Purchase: ¥${order.amount}`);

  return new Response('success');
}
