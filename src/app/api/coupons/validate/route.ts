import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { code, orderAmount } = await req.json();

  if (!code) return NextResponse.json({ valid: false, message: 'Kupon kodu gerekli' });

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase(), isActive: true },
  });

  if (!coupon) return NextResponse.json({ valid: false, message: 'Geçersiz kupon kodu' });

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, message: 'Kupon süresi dolmuş' });
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, message: 'Kupon kullanım limiti dolmuş' });
  }

  if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
    return NextResponse.json({
      valid: false,
      message: `Bu kupon için minimum ${coupon.minOrderAmount} TL alışveriş gerekli`,
    });
  }

  return NextResponse.json({
    valid: true,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    description: coupon.description,
  });
}
