import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const [
    totalProducts,
    totalOrders,
    pendingOrders,
    lowStockProducts,
    recentOrders,
    totalRevenue,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true },
      include: { category: true },
      orderBy: { stock: 'asc' },
      take: 10,
    }),
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'SUCCESS' },
      _sum: { totalAmount: true },
    }),
  ]);

  return NextResponse.json({
    totalProducts,
    totalOrders,
    pendingOrders,
    lowStockProducts,
    recentOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
  });
}
