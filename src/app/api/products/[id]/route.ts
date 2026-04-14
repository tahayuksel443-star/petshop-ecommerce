import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import {
  applyRateLimit,
  getClientIp,
  requireAdminSession,
  tooManyRequestsResponse,
  unauthorizedResponse,
} from '@/lib/security';

const productUpdateSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  shortDesc: z.string().trim().max(500).nullable().optional(),
  price: z.number().positive().max(1000000).optional(),
  discountPrice: z.number().positive().max(1000000).optional().nullable(),
  stock: z.number().int().min(0).max(1000000).optional(),
  images: z.array(z.string().trim().max(100000)).max(20).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  brand: z.string().trim().max(120).optional().nullable(),
  weight: z.string().trim().max(120).optional().nullable(),
  sku: z.string().trim().max(120).optional().nullable(),
  categoryId: z.string().min(1).optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: 'Urun bulunamadi' }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const limiter = applyRateLimit(`view:${params.id}:${getClientIp(req)}`, 30, 60 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse();

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      viewCount: {
        increment: 1,
      },
    },
    select: {
      id: true,
      viewCount: true,
    },
  });

  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const parsed = productUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz urun verisi' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.name) {
    const current = await prisma.product.findUnique({ where: { id: params.id } });
    if (current && current.name !== parsed.data.name) {
      let newSlug = slugify(parsed.data.name);
      const existing = await prisma.product.findFirst({
        where: { slug: newSlug, id: { not: params.id } },
      });
      if (existing) newSlug = `${newSlug}-${Date.now()}`;
      updateData.slug = newSlug;
    }
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: updateData,
    include: { category: true },
  });

  return NextResponse.json(product);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
