import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: {} });
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const body = await req.json();
  let settings = await prisma.siteSettings.findFirst();

  if (settings) {
    settings = await prisma.siteSettings.update({ where: { id: settings.id }, data: body });
  } else {
    settings = await prisma.siteSettings.create({ data: body });
  }

  return NextResponse.json(settings);
}
