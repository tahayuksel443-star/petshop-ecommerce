import { prisma } from '@/lib/prisma';

const defaultSiteSettings = {
  siteName: 'Kosem Pet Shop',
  siteDescription: null,
  logo: null,
  favicon: null,
  announcementText: 'Hizli teslimat ve guvenli alisveris',
  contactEmail: 'destek@kosempetshop.com',
  contactPhone: '0850 305 07 34',
  contactAddress: 'Istanbul, Turkiye',
  facebook: null,
  instagram: null,
  twitter: null,
  youtube: null,
  whatsapp: null,
  freeShippingMin: null,
  shippingCost: null,
  heroBadge: null,
  heroTitle: null,
  heroDescription: null,
  heroPrimaryText: null,
  heroPrimaryLink: null,
  heroSecondaryText: null,
  heroSecondaryLink: null,
  categoriesTitle: null,
  categoriesDescription: null,
  featuredTitle: null,
  featuredDescription: null,
  bestsellerTitle: null,
  bestsellerDescription: null,
  footerDescription: 'Kedi ve kopek mamasi odakli online pet market.',
};

export async function getSiteSettings() {
  try {
    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      settings = await prisma.siteSettings.create({ data: {} });
    }

    return settings;
  } catch (error) {
    console.error('Site settings fallback kullanildi:', error);
    return defaultSiteSettings;
  }
}
