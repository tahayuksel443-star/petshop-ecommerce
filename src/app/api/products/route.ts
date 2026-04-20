import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { requireAdminSession, unauthorizedResponse } from '@/lib/security';

const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).nullable().optional(),
  shortDesc: z.string().trim().max(500).nullable().optional(),
  price: z.number().positive().max(1000000),
  discountPrice: z.number().positive().max(1000000).optional().nullable(),
  stock: z.number().int().min(0).max(1000000),
  images: z.array(z.string().trim().max(100000)).max(20).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  brand: z.string().trim().max(120).optional().nullable(),
  weight: z.string().trim().max(120).optional().nullable(),
  sku: z.string().trim().max(120).optional().nullable(),
  categoryId: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categorySlug = searchParams.get('kategori');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');
  const bestseller = searchParams.get('bestseller');
  const active = searchParams.get('active');
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 50)));

  const where: Record<string, unknown> = {
    isActive: active !== null ? active === 'true' : true,
  };
  if (categorySlug) where.category = { slug: categorySlug };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (featured === 'true') where.isFeatured = true;
  if (bestseller === 'true') where.isBestseller = true;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDesc: true,
        price: true,
        discountPrice: true,
        stock: true,
        images: true,
        isActive: true,
        isFeatured: true,
        isBestseller: true,
        brand: true,
        weight: true,
        sku: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const parsed = productSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz urun verisi' }, { status: 400 });
  }

  const data = parsed.data;
  let slug = slugify(data.name);

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const product = await prisma.product.create({
    data: { ...data, slug },
    include: { category: true },
  });

  return NextResponse.json(product, { status: 201 });
}
