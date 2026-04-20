import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdminSession, unauthorizedResponse } from '@/lib/security';

const orderPatchSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
});

const allowedStatusTransitions: Record<string, string[]> = {
  PENDING: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: { include: { category: true } } } } },
  });

  if (!order) {
    return NextResponse.json({ error: 'Siparis bulunamadi' }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const parsed = orderPatchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz siparis guncellemesi' }, { status: 400 });
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id: params.id },
    select: { id: true, status: true, paymentStatus: true },
  });

  if (!existingOrder) {
    return NextResponse.json({ error: 'Siparis bulunamadi' }, { status: 404 });
  }

  if (!parsed.data.status) {
    return NextResponse.json({ error: 'Guncellenecek siparis durumu belirtilmedi' }, { status: 400 });
  }

  if (existingOrder.paymentStatus !== 'SUCCESS' && parsed.data.status !== 'CANCELLED') {
    return NextResponse.json({ error: 'Odeme basarili olmadan siparis durumu ilerletilemez' }, { status: 400 });
  }

  if (!allowedStatusTransitions[existingOrder.status]?.includes(parsed.data.status)) {
    return NextResponse.json({
      error: `${existingOrder.status} durumundan ${parsed.data.status} durumuna gecis izinli degil`,
    }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
    include: { items: true },
  });

  return NextResponse.json(order);
}
