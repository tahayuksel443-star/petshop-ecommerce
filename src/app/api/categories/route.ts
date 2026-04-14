import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { requireAdminSession, unauthorizedResponse } from '@/lib/security';

const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).nullable().optional(),
  icon: z.string().trim().max(100).nullable().optional(),
  image: z.string().trim().max(5000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const parsed = categorySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz kategori verisi' }, { status: 400 });
  }

  const data = parsed.data;
  let slug = slugify(data.name);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      icon: data.icon || null,
      image: data.image || null,
      sortOrder: data.sortOrder || 0,
    },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json(category, { status: 201 });
}
