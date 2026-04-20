import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { applyRateLimit, getClientIp, tooManyRequestsResponse } from '@/lib/security';

const orderTrackingSchema = z.object({
  orderNumber: z.string().trim().min(3).max(60),
  email: z.string().trim().email().max(150),
});

export async function POST(req: NextRequest) {
  const limiter = applyRateLimit(`order-tracking:${getClientIp(req)}`, 10, 10 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse();

  const parsed = orderTrackingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz siparis takip bilgisi' }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: parsed.data.orderNumber,
      customerEmail: parsed.data.email.toLowerCase(),
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Siparis bulunamadi' }, { status: 404 });
  }

  return NextResponse.json(order);
}
