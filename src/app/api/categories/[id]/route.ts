import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const body = await req.json();
  const { name, ...rest } = body;

  let updateData: any = { ...rest };
  if (name) {
    updateData.name = name;
    const current = await prisma.category.findUnique({ where: { id: params.id } });
    if (current && current.name !== name) {
      let newSlug = slugify(name);
      const existing = await prisma.category.findFirst({ where: { slug: newSlug, id: { not: params.id } } });
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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
