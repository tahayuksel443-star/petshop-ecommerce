import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createThreeDSPayment } from '@/lib/iyzico';
import { generateOrderNumber, generateTrackingToken } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { applyRateLimit, getClientIp, hasTrustedOrigin, tooManyRequestsResponse } from '@/lib/security';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const paymentSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      quantity: z.number().int().min(1).max(20),
    })
  ).min(1).max(50),
  shippingAddress: z.object({
    name: z.string().trim().min(2).max(60),
    surname: z.string().trim().min(2).max(60),
    phone: z.string().trim().min(10).max(20),
    email: z.string().trim().email().max(150),
    address: z.string().trim().min(5).max(300),
    city: z.string().trim().min(2).max(80),
    district: z.string().trim().min(2).max(80),
    notes: z.string().trim().max(500).optional().nullable(),
  }),
  card: z.object({
    cardHolderName: z.string().trim().min(2).max(80),
    cardNumber: z.string().trim().regex(/^\d{12,19}$/),
    expireMonth: z.string().trim().regex(/^(0[1-9]|1[0-2])$/),
    expireYear: z.string().trim().regex(/^\d{2,4}$/),
    cvc: z.string().trim().regex(/^\d{3,4}$/),
  }),
  couponCode: z.string().trim().max(50).optional().nullable(),
});

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('90')) return `+${digits}`;
  if (digits.startsWith('0')) return `+9${digits}`;
  return `+90${digits}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const customerSession =
    session?.user && (session.user as { authType?: string }).authType === 'customer'
      ? session.user
      : null;
  const ip = getClientIp(req);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!hasTrustedOrigin(req, siteUrl)) {
    return NextResponse.json({ error: 'Guvenilmeyen istek kaynagi' }, { status: 403 });
  }

  const limiter = applyRateLimit(`payment-create:${ip}`, 10, 10 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse('Cok fazla odeme denemesi yapildi. Lutfen biraz sonra tekrar deneyin.');

  const parsed = paymentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz odeme bilgisi' }, { status: 400 });
  }

  const { items, shippingAddress, card, couponCode } = parsed.data;

  const productIds = items.map((item) => item.id);
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        discountPrice: true,
        stock: true,
      },
    }),
    prisma.siteSettings.findFirst(),
  ]);

  if (products.length !== items.length) {
    return NextResponse.json({ error: 'Sepette gecersiz veya pasif urun var' }, { status: 400 });
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const normalizedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.id);
    if (!product) {
      return NextResponse.json({ error: 'Urun bulunamadi' }, { status: 400 });
    }

    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `${product.name} icin yeterli stok yok` }, { status: 400 });
    }

    const unitPrice = Number(product.discountPrice ?? product.price);
    subtotal += unitPrice * item.quantity;
    normalizedItems.push({
      product,
      quantity: item.quantity,
      unitPrice,
    });
  }

  const freeShippingMin = settings?.freeShippingMin ? Number(settings.freeShippingMin) : null;
  const defaultShippingCost = Number(settings?.shippingCost ?? 0);
  const shippingCost = freeShippingMin !== null && subtotal >= freeShippingMin ? 0 : defaultShippingCost;

  let discountAmount = 0;
  let appliedCouponCode: string | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode.toUpperCase(),
        isActive: true,
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Kupon kodu gecersiz' }, { status: 400 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Kuponun suresi dolmus' }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Kupon kullanim limiti dolmus' }, { status: 400 });
    }

    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json({ error: 'Kupon minimum sepet tutarini saglamiyor' }, { status: 400 });
    }

    discountAmount =
      coupon.discountType === 'PERCENTAGE'
        ? (subtotal * Number(coupon.discountValue)) / 100
        : Number(coupon.discountValue);

    discountAmount = Math.min(discountAmount, subtotal);
    appliedCouponCode = coupon.code;
  }

  const finalAmount = Number((subtotal + shippingCost - discountAmount).toFixed(2));
  const orderNumber = generateOrderNumber();
  const trackingToken = generateTrackingToken();
  const conversationId = uuidv4();

  const basketItems = normalizedItems.map(({ product, quantity, unitPrice }) => ({
    id: product.id,
    name: product.name.slice(0, 50),
    category1: 'Evcil Hayvan Urunleri',
    itemType: 'PHYSICAL',
    price: (unitPrice * quantity).toFixed(2),
  }));

  if (!siteUrl) {
    return NextResponse.json({ error: 'Odeme ortami eksik ayarlanmis' }, { status: 500 });
  }

  const normalizedEmail = shippingAddress.email.trim().toLowerCase();

  const paymentRequest = {
    locale: 'tr',
    conversationId,
    price: subtotal.toFixed(2),
    paidPrice: finalAmount.toFixed(2),
    currency: 'TRY',
    installment: '1',
    basketId: orderNumber,
    paymentChannel: 'WEB',
    paymentGroup: 'PRODUCT',
    callbackUrl: `${siteUrl}/api/payment/callback`,
    buyer: {
      id: conversationId,
      name: shippingAddress.name,
      surname: shippingAddress.surname,
      gsmNumber: normalizePhone(shippingAddress.phone),
      email: normalizedEmail,
      identityNumber: '11111111111',
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
    const result = await createThreeDSPayment(paymentRequest as never);

    if (result.status !== 'success' || !result.threeDSHtmlContent) {
      return NextResponse.json({
        status: 'error',
        errorMessage: result.errorMessage || 'Odeme baslatilamadi',
        errorCode: result.errorCode,
      }, { status: 400 });
    }

    await prisma.order.create({
      data: {
        orderNumber,
        trackingToken,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentId: conversationId,
        totalAmount: finalAmount,
        shippingCost,
        discountAmount,
        couponCode: appliedCouponCode,
        shippingAddress,
        customerName: `${shippingAddress.name} ${shippingAddress.surname}`,
        customerEmail: normalizedEmail,
        customerPhone: shippingAddress.phone,
        customerId: customerSession?.id,
        notes: shippingAddress.notes || null,
        items: {
          create: normalizedItems.map(({ product, quantity, unitPrice }) => ({
            productId: product.id,
            productName: product.name,
            quantity,
            price: unitPrice,
          })),
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      threeDSHtmlContent: result.threeDSHtmlContent,
      orderNumber,
      trackingToken,
    });
  } catch (error) {
    console.error('iyzico error:', error);
    return NextResponse.json({ status: 'error', errorMessage: 'Odeme servisi hatasi' }, { status: 500 });
  }
}
