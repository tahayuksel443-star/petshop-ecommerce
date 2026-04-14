import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { requireAdminSession, unauthorizedResponse } from '@/lib/security';

const categoryUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  icon: z.string().trim().max(100).nullable().optional(),
  image: z.string().trim().max(5000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const parsed = categoryUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz kategori verisi' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.name) {
    const current = await prisma.category.findUnique({ where: { id: params.id } });
    if (current && current.name !== parsed.data.name) {
      let newSlug = slugify(parsed.data.name);
      const existing = await prisma.category.findFirst({
        where: { slug: newSlug, id: { not: params.id } },
      });
      if (existing) newSlug = `${newSlug}-${Date.now()}`;
      updateData.slug = newSlug;
    }
  }

  const category = await prisma.category.update({
    where: { id: params.id },
    data: updateData,
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json(category);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
