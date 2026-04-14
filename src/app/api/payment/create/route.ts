import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createThreeDSPayment } from '@/lib/iyzico';
import { generateOrderNumber } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { items, shippingAddress, card, couponCode, totalAmount, shippingCost } = body;

  if (!items?.length || !shippingAddress || !card) {
    return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
  }

  // Coupon check
  let discountAmount = 0;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode, isActive: true },
    });
    if (coupon) {
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (Number(totalAmount) * Number(coupon.discountValue)) / 100;
      } else {
        discountAmount = Number(coupon.discountValue);
      }
    }
  }

  const finalAmount = Math.max(0, Number(totalAmount) - discountAmount);
  const orderNumber = generateOrderNumber();
  const conversationId = uuidv4();

  // Prepare iyzico payment
  const basketItems = items.map((item: any) => ({
    id: item.id,
    name: item.name.slice(0, 50),
    category1: 'Evcil Hayvan Ürünleri',
    itemType: 'PHYSICAL',
    price: ((item.discountPrice ?? item.price) * item.quantity).toFixed(2),
  }));

  // Basket total must equal price
  const basketTotal = basketItems.reduce((sum: number, i: any) => sum + parseFloat(i.price), 0);

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '85.34.78.112';

  const paymentRequest = {
    locale: 'tr',
    conversationId,
    price: basketTotal.toFixed(2),
    paidPrice: finalAmount.toFixed(2),
    currency: 'TRY',
    installment: '1',
    basketId: orderNumber,
    paymentChannel: 'WEB',
    paymentGroup: 'PRODUCT',
    callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/callback`,
    buyer: {
      id: conversationId,
      name: shippingAddress.name,
      surname: shippingAddress.surname,
      gsmNumber: shippingAddress.phone.replace(/\D/g, '').replace(/^0/, '+90'),
      email: shippingAddress.email,
      identityNumber: '74300864791',
      registrationAddress: `${shippingAddress.address}, ${shippingAddress.district}/${shippingAddress.city}`,
      ip,
      city: shippingAddress.city,
      country: 'Turkey',
    },
    shippingAddress: {
      contactName: `${shippingAddress.name} ${shippingAddress.surname}`,
      city: shippingAddress.city,
      country: 'Turkey',
      address: `${shippingAddress.address}, ${shippingAddress.district}`,
    },
    billingAddress: {
      contactName: `${shippingAddress.name} ${shippingAddress.surname}`,
      city: shippingAddress.city,
      country: 'Turkey',
      address: `${shippingAddress.address}, ${shippingAddress.district}`,
    },
    basketItems,
    paymentCard: {
      cardHolderName: card.cardHolderName,
      cardNumber: card.cardNumber,
      expireMonth: card.expireMonth,
      expireYear: card.expireYear,
      cvc: card.cvc,
      registerCard: '0',
    },
  };

  try {
    const result = await createThreeDSPayment(paymentRequest as any);

    // Create order in DB (pending)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentId: conversationId,
        totalAmount: finalAmount,
        shippingCost: shippingCost || 0,
        discountAmount,
        couponCode: couponCode || null,
        shippingAddress: shippingAddress,
        customerName: `${shippingAddress.name} ${shippingAddress.surname}`,
        customerEmail: shippingAddress.email,
        customerPhone: shippingAddress.phone,
        notes: shippingAddress.notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.discountPrice ?? item.price,
          })),
        },
      },
    });

    // Update coupon usage
    if (couponCode && discountAmount > 0) {
      await prisma.coupon.update({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    if (result.status === 'success') {
      return NextResponse.json({
        status: 'success',
        threeDSHtmlContent: result.threeDSHtmlContent,
        orderNumber,
      });
    } else {
      return NextResponse.json({
        status: 'error',
        errorMessage: result.errorMessage || 'Ödeme başlatılamadı',
        errorCode: result.errorCode,
      });
    }
  } catch (error: any) {
    console.error('iyzico error:', error);
    return NextResponse.json({ status: 'error', errorMessage: 'Ödeme servisi hatası' }, { status: 500 });
  }
}
