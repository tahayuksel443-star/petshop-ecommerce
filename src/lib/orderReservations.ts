import { prisma } from '@/lib/prisma';

export function getPaymentReservationTtlMs() {
  const ttlMinutes = Number(process.env.PAYMENT_RESERVATION_TTL_MINUTES || 30);
  if (!Number.isFinite(ttlMinutes) || ttlMinutes <= 0) {
    return 30 * 60 * 1000;
  }

  return ttlMinutes * 60 * 1000;
}

export async function releaseOrderResources(orderId: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return;
    if (order.paymentStatus !== 'PENDING' || order.status !== 'PENDING') return;

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
        },
      });
    }

    if (order.couponCode) {
      await tx.coupon.updateMany({
        where: { code: order.couponCode, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'FAILED',
        status: 'CANCELLED',
      },
    });
  });
}

export async function cleanupExpiredPendingOrders() {
  const cutoff = new Date(Date.now() - getPaymentReservationTtlMs());

  const expiredOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: { lt: cutoff },
    },
    select: {
      id: true,
      orderNumber: true,
      trackingToken: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 100,
  });

  for (const order of expiredOrders) {
    await releaseOrderResources(order.id);
  }

  return {
    cleanedCount: expiredOrders.length,
    cleanedOrderIds: expiredOrders.map((order) => order.id),
    cutoff: cutoff.toISOString(),
  };
}
