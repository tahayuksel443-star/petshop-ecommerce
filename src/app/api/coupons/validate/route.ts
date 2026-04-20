import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { applyRateLimit, getClientIp, tooManyRequestsResponse } from '@/lib/security';

const couponValidationSchema = z.object({
  code: z.string().trim().min(3).max(50),
  orderAmount: z.number().min(0).max(1000000),
});

export async function POST(req: NextRequest) {
  const limiter = await applyRateLimit(`coupon-validate:${getClientIp(req)}`, 20, 10 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse();

  const parsed = couponValidationSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ valid: false, message: 'Kupon bilgisi gecersiz' }, { status: 400 });
  }

  const { code, orderAmount } = parsed.data;
  const coupon = await prisma.coupon.findFirst({
    where: { code: code.toUpperCase(), isActive: true },
  });

  if (!coupon) {
    return NextResponse.json({ valid: false, message: 'Gecersiz kupon kodu' });
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, message: 'Kupon suresi dolmus' });
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, message: 'Kupon kullanim limiti dolmus' });
  }

  if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
    return NextResponse.json({
      valid: false,
      message: `Bu kupon icin minimum ${coupon.minOrderAmount} TL alisveris gerekli`,
    });
  }

  return NextResponse.json({
    valid: true,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    description: coupon.description,
  });
}
