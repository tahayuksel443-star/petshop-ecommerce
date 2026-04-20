import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { applyRateLimit, getClientIp, tooManyRequestsResponse } from '@/lib/security';

const orderTrackingSchema = z.object({
  trackingCode: z.string().trim().min(6).max(80).optional(),
  orderNumber: z.string().trim().min(3).max(60).optional(),
  email: z.string().trim().email().max(150),
}).refine((data) => Boolean(data.trackingCode || data.orderNumber), {
  message: 'Takip kodu veya siparis numarasi gereklidir',
  path: ['trackingCode'],
});

export async function POST(req: NextRequest) {
  const limiter = applyRateLimit(`order-tracking:${getClientIp(req)}`, 5, 15 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse();

  const parsed = orderTrackingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz siparis takip bilgisi' }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      customerEmail: parsed.data.email.toLowerCase(),
      OR: [
        ...(parsed.data.trackingCode ? [{ trackingToken: parsed.data.trackingCode }] : []),
        ...(parsed.data.orderNumber ? [{ orderNumber: parsed.data.orderNumber }] : []),
      ],
    },
    select: {
      id: true,
      orderNumber: true,
      trackingToken: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          productName: true,
          quantity: true,
          price: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Siparis bilgileri eslesmedi' }, { status: 404 });
  }

  return NextResponse.json(order);
}
