import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { completeThreeDSPayment } from '@/lib/iyzico';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const paymentId = formData.get('paymentId') as string;
  const conversationData = formData.get('conversationData') as string;
  const conversationId = formData.get('conversationId') as string;
  const status = formData.get('status') as string;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (status !== 'success') {
    // Update order
    if (conversationId) {
      await prisma.order.updateMany({
        where: { paymentId: conversationId },
        data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
      });
    }
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz`);
  }

  try {
    const result = await completeThreeDSPayment({
      locale: 'tr',
      conversationId,
      paymentId,
      conversationData,
    });

    if (result.status === 'success') {
      const order = await prisma.order.updateMany({
        where: { paymentId: conversationId },
        data: {
          paymentStatus: 'SUCCESS',
          status: 'PREPARING',
          paymentMethod: `${result.cardFamily} **** ${result.lastFourDigits}`,
        },
      });

      // Fetch order number
      const updatedOrder = await prisma.order.findFirst({
        where: { paymentId: conversationId },
        select: { orderNumber: true },
      });

      return NextResponse.redirect(
        `${siteUrl}/odeme/basarili?siparis=${updatedOrder?.orderNumber || ''}`
      );
    } else {
      await prisma.order.updateMany({
        where: { paymentId: conversationId },
        data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
      });
      return NextResponse.redirect(`${siteUrl}/odeme/basarisiz`);
    }
  } catch (error) {
    console.error('3DS callback error:', error);
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz`);
  }
}
