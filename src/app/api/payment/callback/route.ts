import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { completeThreeDSPayment, retrievePayment } from '@/lib/iyzico';
import { applyRateLimit, getClientIp, tooManyRequestsResponse } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function redirectTo(path: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${siteUrl}${path}`);
}

function isSuccessfulPaymentState(value: unknown) {
  return String(value || '').toLowerCase() === 'success';
}

function amountsMatch(expected: number, actual: unknown) {
  const numericActual = Number(actual);
  if (!Number.isFinite(numericActual)) return false;
  return Math.abs(expected - numericActual) < 0.01;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limiter = applyRateLimit(`payment-callback:${ip}`, 30, 10 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse();

  const formData = await req.formData();
  const paymentId = String(formData.get('paymentId') || '');
  const conversationData = String(formData.get('conversationData') || '');
  const conversationId = String(formData.get('conversationId') || '');
  const status = String(formData.get('status') || '');

  if (!conversationId) {
    return redirectTo('/odeme/basarisiz');
  }

  const existingOrder = await prisma.order.findFirst({
    where: { paymentId: conversationId },
    include: { items: true },
  });

  if (!existingOrder) {
    return redirectTo('/odeme/basarisiz');
  }

  if (existingOrder.paymentStatus === 'SUCCESS') {
    return redirectTo(`/odeme/basarili?siparis=${existingOrder.orderNumber}${existingOrder.trackingToken ? `&takip=${existingOrder.trackingToken}` : ''}`);
  }

  if (status !== 'success' || !paymentId || !conversationData) {
    await prisma.order.update({
      where: { id: existingOrder.id },
      data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
    });
    return redirectTo('/odeme/basarisiz');
  }

  try {
    const result = await completeThreeDSPayment({
      locale: 'tr',
      conversationId,
      paymentId,
      conversationData,
    });

    if (result.status !== 'success') {
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
      });
      return redirectTo('/odeme/basarisiz');
    }

    const verifiedPayment = await retrievePayment(paymentId);

    if (
      !isSuccessfulPaymentState(verifiedPayment?.status) ||
      !isSuccessfulPaymentState(verifiedPayment?.paymentStatus) ||
      (verifiedPayment?.conversationId && String(verifiedPayment.conversationId) !== conversationId) ||
      (verifiedPayment?.basketId && String(verifiedPayment.basketId) !== existingOrder.orderNumber) ||
      !amountsMatch(Number(existingOrder.totalAmount), verifiedPayment?.paidPrice) ||
      (verifiedPayment?.currency && String(verifiedPayment.currency).toUpperCase() !== 'TRY')
    ) {
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
      });
      return redirectTo('/odeme/basarisiz');
    }

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: existingOrder.id },
        include: { items: true },
      });

      if (!order) throw new Error('Order not found');
      if (order.paymentStatus === 'SUCCESS') return;

      for (const item of order.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
      }

      if (order.couponCode) {
        await tx.coupon.updateMany({
          where: { code: order.couponCode, isActive: true },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'SUCCESS',
          status: 'PREPARING',
          paymentMethod: `${result.cardFamily || 'Kart'} **** ${result.lastFourDigits || ''}`.trim(),
        },
      });
    });

    return redirectTo(`/odeme/basarili?siparis=${existingOrder.orderNumber}${existingOrder.trackingToken ? `&takip=${existingOrder.trackingToken}` : ''}`);
  } catch (error) {
    console.error('3DS callback error:', error);

    await prisma.order.updateMany({
      where: {
        id: existingOrder.id,
        paymentStatus: 'PENDING',
      },
      data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
    });

    return redirectTo('/odeme/basarisiz');
  }
}
