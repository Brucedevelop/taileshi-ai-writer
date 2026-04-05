import { prisma } from '@/lib/prisma';

export const PRICING = {
  WITH_IMAGES: 10,
  WITHOUT_IMAGES: 6,
} as const;

export const CREDIT_PACKAGES = [
  { id: 'starter', name: '入门版 Starter', price: 60, credits: 60, description: '6 articles with images or 10 without' },
  { id: 'basic', name: '基础版 Basic', price: 200, credits: 200, description: '20 articles with images or 33 without' },
  { id: 'pro', name: '专业版 Pro', price: 500, credits: 500, description: '50 articles with images or 83 without' },
  { id: 'ultimate', name: '旗舰版 Ultimate', price: 1000, credits: 1000, description: '100 articles with images or 166 without' },
] as const;

export type CreditPackage = (typeof CREDIT_PACKAGES)[number];

export interface DeductCreditsParams {
  userId: string;
  articleCount: number;
  withImages: boolean;
  description: string;
  articleId?: string;
}

export interface DeductCreditsResult {
  success: boolean;
  isAdmin: boolean;
  deducted: number;
  remaining: number;
  error?: string;
}

export async function deductCredits(
  params: DeductCreditsParams
): Promise<DeductCreditsResult> {
  const { userId, articleCount, withImages, description, articleId } = params;
  const costPerArticle = withImages ? PRICING.WITH_IMAGES : PRICING.WITHOUT_IMAGES;
  const totalCost = costPerArticle * articleCount;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, credits: true },
  });

  if (!user) {
    return { success: false, isAdmin: false, deducted: 0, remaining: 0, error: 'User not found' };
  }

  if (user.role === 'admin') {
    // Admin bypass: skip balance check, log with type 'admin_free', amount 0
    await prisma.creditLog.create({
      data: {
        userId,
        amount: 0,
        type: 'admin_free',
        description: `[ADMIN] ${description}`,
        articleId,
      },
    });
    return {
      success: true,
      isAdmin: true,
      deducted: 0,
      remaining: user.credits,
    };
  }

  // Normal user: check balance and deduct
  if (user.credits < totalCost) {
    return {
      success: false,
      isAdmin: false,
      deducted: 0,
      remaining: user.credits,
      error: `Insufficient credits. Required: ¥${totalCost}, Available: ¥${user.credits}`,
    };
  }

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: totalCost } },
    }),
    prisma.creditLog.create({
      data: {
        userId,
        amount: -totalCost,
        type: 'article_publish',
        description,
        articleId,
      },
    }),
  ]);

  return {
    success: true,
    isAdmin: false,
    deducted: totalCost,
    remaining: updatedUser.credits,
  };
}

export async function checkBalance(
  userId: string,
  requiredAmount: number
): Promise<{ sufficient: boolean; balance: number; isAdmin: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, role: true },
  });

  if (!user) return { sufficient: false, balance: 0, isAdmin: false };

  return {
    sufficient: user.role === 'admin' || user.credits >= requiredAmount,
    balance: user.credits,
    isAdmin: user.role === 'admin',
  };
}

export async function addCredits(
  userId: string,
  amount: number,
  orderId: string,
  description: string
): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    }),
    prisma.creditLog.create({
      data: {
        userId,
        amount,
        type: 'purchase',
        description,
        orderId,
      },
    }),
  ]);
}
