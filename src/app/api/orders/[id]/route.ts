import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdminSession, unauthorizedResponse } from '@/lib/security';

const orderPatchSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']).optional(),
});

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

  const order = await prisma.order.update({
    where: { id: params.id },
    data: parsed.data,
    include: { items: true },
  });

  return NextResponse.json(order);
}
