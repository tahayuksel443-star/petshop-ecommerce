import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
  return NextResponse.json(product);
}

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const body = await req.json();
  const { name, ...rest } = body;

  let updateData: any = { ...rest };
  if (name) {
    updateData.name = name;
    // Only regenerate slug if name changes
    const current = await prisma.product.findUnique({ where: { id: params.id } });
    if (current && current.name !== name) {
      let newSlug = slugify(name);
      const existing = await prisma.product.findFirst({ where: { slug: newSlug, id: { not: params.id } } });
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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
