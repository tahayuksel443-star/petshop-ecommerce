import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  shortDesc: z.string().optional(),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  brand: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  categoryId: z.string(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categorySlug = searchParams.get('kategori');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');
  const bestseller = searchParams.get('bestseller');
  const active = searchParams.get('active');
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 50);

  const where: any = {};
  if (active !== null) where.isActive = active === 'true';
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
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
  }

  const data = parsed.data;
  let slug = slugify(data.name);

  // Slug unique check
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const product = await prisma.product.create({
    data: { ...data, slug },
    include: { category: true },
  });

  return NextResponse.json(product, { status: 201 });
}
