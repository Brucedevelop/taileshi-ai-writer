import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createPayment } from '@/lib/payment/hupijiao-client';
import { prisma } from '@/lib/prisma';
import { generateOrderId } from '@/lib/utils';
import { CREDIT_PACKAGES } from '@/lib/billing/credits';
import { z } from 'zod';

const schema = z.object({
  packageId: z.string(),
  payType: z.enum(['wxpay', 'alipay']),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { packageId, payType } = parsed.data;

  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return NextResponse.json({ error: 'Invalid package' }, { status: 400 });

  const orderId = generateOrderId();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  await prisma.order.create({
    data: {
      orderId,
      userId: session.user.id,
      credits: pkg.credits,
      amount: pkg.price,
      status: 'pending',
      payType,
    },
  });

  const result = await createPayment({
    orderId,
    amount: pkg.price,
    subject: pkg.name,
    payType,
    notifyUrl: `${baseUrl}/api/payment/callback`,
    returnUrl: `${baseUrl}/billing?order=${orderId}`,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ orderId, qrCodeUrl: result.qrCodeUrl, payUrl: result.payUrl });
}
