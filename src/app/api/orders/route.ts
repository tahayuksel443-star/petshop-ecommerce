import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession, unauthorizedResponse } from '@/lib/security';

export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, limit });
}
