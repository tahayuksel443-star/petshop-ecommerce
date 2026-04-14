import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdminSession, unauthorizedResponse } from '@/lib/security';

const couponSchema = z.object({
  code: z.string().trim().min(3).max(50),
  description: z.string().trim().max(300).nullable().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive().max(1000000),
  minOrderAmount: z.number().min(0).max(1000000).nullable().optional(),
  maxUses: z.number().int().min(1).max(1000000).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional().or(z.literal('')),
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const parsed = couponSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz kupon verisi' }, { status: 400 });
  }

  const data = parsed.data;

  const coupon = await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      description: data.description || null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount ?? null,
      maxUses: data.maxUses ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  return NextResponse.json(coupon, { status: 201 });
}
