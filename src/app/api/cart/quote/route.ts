import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const cartQuoteSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      quantity: z.number().int().min(1).max(20),
    })
  ).min(1).max(50),
});

export async function POST(req: NextRequest) {
  const parsed = cartQuoteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz sepet verisi' }, { status: 400 });
  }

  const { items } = parsed.data;
  const productIds = items.map((item) => item.id);

  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discountPrice: true,
        stock: true,
        images: true,
      },
    }),
    prisma.siteSettings.findFirst({
      select: {
        freeShippingMin: true,
        shippingCost: true,
      },
    }),
  ]);

  const productMap = new Map(products.map((product) => [product.id, product]));
  const quoteItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.id);
    if (!product) continue;

    const quantity = Math.min(item.quantity, product.stock);
    if (quantity <= 0) continue;

    const price = Number(product.price);
    const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
    const unitPrice = discountPrice ?? price;
    const lineTotal = unitPrice * quantity;
    subtotal += lineTotal;

    quoteItems.push({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || '/images/placeholder-product.jpg',
      quantity,
      stock: product.stock,
      price,
      discountPrice,
      lineTotal,
    });
  }

  const freeShippingMin = settings?.freeShippingMin ? Number(settings.freeShippingMin) : null;
  const defaultShippingCost = Number(settings?.shippingCost ?? 0);
  const shippingCost = freeShippingMin !== null && subtotal >= freeShippingMin ? 0 : defaultShippingCost;

  return NextResponse.json({
    items: quoteItems,
    subtotal,
    shippingCost,
    freeShippingMin,
  });
}
