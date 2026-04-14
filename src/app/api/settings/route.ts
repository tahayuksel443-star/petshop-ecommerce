import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const fallbackSettings = {
  siteName: 'Kosem Pet Shop',
  announcementText: 'Hizli teslimat ve guvenli alisveris',
  contactEmail: 'destek@kosempetshop.com',
  contactPhone: '0850 305 07 34',
  contactAddress: 'Istanbul, Turkiye',
  footerDescription: 'Kedi ve kopek mamasi odakli online pet market.',
};

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');
    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      settings = await prisma.siteSettings.create({ data: {} });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings API fallback kullanildi:', error);
    return NextResponse.json(fallbackSettings);
  }
}

async function saveSettings(req: NextRequest) {
  const [{ getServerSession }, { authOptions }, { prisma }] = await Promise.all([
    import('next-auth'),
    import('@/lib/auth'),
    import('@/lib/prisma'),
  ]);

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 401 });
  }

  const body = await req.json();
  let settings = await prisma.siteSettings.findFirst();

  if (settings) {
    settings = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: body,
    });
  } else {
    settings = await prisma.siteSettings.create({ data: body });
  }

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  return saveSettings(req);
}

export async function POST(req: NextRequest) {
  return saveSettings(req);
}
