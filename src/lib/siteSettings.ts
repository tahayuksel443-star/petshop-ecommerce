import { prisma } from '@/lib/prisma';

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findFirst();

  if (!settings) {
    settings = await prisma.siteSettings.create({ data: {} });
  }

  return settings;
}
