import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminSession, unauthorizedResponse } from '@/lib/security';

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

const faqItemSchema = z.object({
  q: z.string().trim().min(1).max(200),
  a: z.string().trim().min(1).max(2000),
});

const settingsSchema = z.object({
  siteName: z.string().trim().min(2).max(120).optional(),
  siteDescription: z.string().trim().max(500).nullable().optional(),
  logo: z.string().trim().max(2000).nullable().optional(),
  favicon: z.string().trim().max(2000).nullable().optional(),
  announcementText: z.string().trim().max(250).nullable().optional(),
  contactEmail: z.string().trim().email().max(150).nullable().optional().or(z.literal('')),
  contactPhone: z.string().trim().max(50).nullable().optional(),
  contactAddress: z.string().trim().max(300).nullable().optional(),
  facebook: z.string().trim().url().max(500).nullable().optional().or(z.literal('')),
  instagram: z.string().trim().url().max(500).nullable().optional().or(z.literal('')),
  twitter: z.string().trim().url().max(500).nullable().optional().or(z.literal('')),
  youtube: z.string().trim().url().max(500).nullable().optional().or(z.literal('')),
  whatsapp: z.string().trim().max(100).nullable().optional(),
  freeShippingMin: z.number().min(0).max(1000000).nullable().optional(),
  shippingCost: z.number().min(0).max(1000000).optional(),
  heroBadge: z.string().trim().max(120).nullable().optional(),
  heroTitle: z.string().trim().max(250).nullable().optional(),
  heroDescription: z.string().trim().max(1000).nullable().optional(),
  heroPrimaryText: z.string().trim().max(80).nullable().optional(),
  heroPrimaryLink: z.string().trim().max(500).nullable().optional(),
  heroSecondaryText: z.string().trim().max(80).nullable().optional(),
  heroSecondaryLink: z.string().trim().max(500).nullable().optional(),
  categoriesTitle: z.string().trim().max(150).nullable().optional(),
  categoriesDescription: z.string().trim().max(600).nullable().optional(),
  featuredTitle: z.string().trim().max(150).nullable().optional(),
  featuredDescription: z.string().trim().max(600).nullable().optional(),
  bestsellerTitle: z.string().trim().max(150).nullable().optional(),
  bestsellerDescription: z.string().trim().max(600).nullable().optional(),
  faqTitle: z.string().trim().max(150).nullable().optional(),
  faqDescription: z.string().trim().max(600).nullable().optional(),
  faqItems: z.array(faqItemSchema).max(30).optional(),
  contactTitle: z.string().trim().max(150).nullable().optional(),
  contactDescription: z.string().trim().max(600).nullable().optional(),
  contactPhoneSecondary: z.string().trim().max(50).nullable().optional(),
  contactEmailSecondary: z.string().trim().email().max(150).nullable().optional().or(z.literal('')),
  contactAddressSecondary: z.string().trim().max(300).nullable().optional(),
  contactHoursWeekday: z.string().trim().max(120).nullable().optional(),
  contactHoursWeekend: z.string().trim().max(120).nullable().optional(),
  contactMapEmbedUrl: z.string().trim().url().max(2000).nullable().optional().or(z.literal('')),
  footerDescription: z.string().trim().max(500).nullable().optional(),
});

function normalizeEmptyStrings<T extends Record<string, unknown>>(data: T): T {
  const normalized = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value === '' ? null : value])
  );

  return normalized as T;
}

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
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { prisma } = await import('@/lib/prisma');
  const body = await req.json();
  const parsed = settingsSchema.safeParse(normalizeEmptyStrings(body));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz ayar verisi' }, { status: 400 });
  }

  let settings = await prisma.siteSettings.findFirst();

  if (settings) {
    settings = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: parsed.data,
    });
  } else {
    settings = await prisma.siteSettings.create({ data: parsed.data });
  }

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  return saveSettings(req);
}

export async function POST(req: NextRequest) {
  return saveSettings(req);
}
