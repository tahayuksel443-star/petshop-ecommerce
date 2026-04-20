import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { retrieveCheckoutFormPayment } from '@/lib/iyzico';
import { releaseOrderResources } from '@/lib/orderReservations';
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
  const limiter = await applyRateLimit(`payment-callback:${ip}`, 30, 10 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse();

  const formData = await req.formData();
  const token = String(formData.get('token') || '');
  const conversationId = String(formData.get('conversationId') || '');
  const status = String(formData.get('status') || '');

  if (!token) {
    return redirectTo('/odeme/basarisiz');
  }

  const existingOrder = await prisma.order.findFirst({
    where: { paymentId: token },
    include: { items: true },
  });

  if (!existingOrder) {
    return redirectTo('/odeme/basarisiz');
  }

  if (existingOrder.paymentStatus === 'SUCCESS') {
    return redirectTo(`/odeme/basarili?siparis=${existingOrder.orderNumber}${existingOrder.trackingToken ? `&takip=${existingOrder.trackingToken}` : ''}`);
  }

  if (status !== 'success') {
    await releaseOrderResources(existingOrder.id);
    return redirectTo('/odeme/basarisiz');
  }

  try {
    const result = await retrieveCheckoutFormPayment({
      locale: 'tr',
      conversationId,
      token,
    });

    if (result.status !== 'success') {
      await releaseOrderResources(existingOrder.id);
      return redirectTo('/odeme/basarisiz');
    }

    if (
      !isSuccessfulPaymentState(result?.status) ||
      !isSuccessfulPaymentState(result?.paymentStatus) ||
      (result?.conversationId && String(result.conversationId) !== conversationId) ||
      (result?.basketId && String(result.basketId) !== existingOrder.orderNumber) ||
      !amountsMatch(Number(existingOrder.totalAmount), result?.paidPrice) ||
      (result?.currency && String(result.currency).toUpperCase() !== 'TRY')
    ) {
      await releaseOrderResources(existingOrder.id);
      return redirectTo('/odeme/basarisiz');
    }

    await prisma.order.updateMany({
      where: {
        id: existingOrder.id,
        paymentStatus: 'PENDING',
      },
      data: {
        paymentStatus: 'SUCCESS',
        status: 'PREPARING',
        paymentMethod: `${result.cardFamily || 'Kart'} **** ${result.lastFourDigits || ''}`.trim(),
      },
    });

    return redirectTo(`/odeme/basarili?siparis=${existingOrder.orderNumber}${existingOrder.trackingToken ? `&takip=${existingOrder.trackingToken}` : ''}`);
  } catch (error) {
    console.error('3DS callback error:', error);

    await releaseOrderResources(existingOrder.id);

    return redirectTo('/odeme/basarisiz');
  }
}
