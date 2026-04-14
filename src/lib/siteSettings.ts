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
  faqTitle: 'Sik Sorulan Sorular',
  faqDescription: 'Merak ettiklerinizi asagida bulabilirsiniz. Cevap bulamadiysaniz bize yazin.',
  faqItems: [
    {
      q: 'Kargo suresi ne kadardir?',
      a: 'Siparisleriniz genellikle 1-3 is gunu icinde teslim edilir. Yogun donemlerde sure biraz uzayabilir.',
    },
    {
      q: 'Ucretsiz kargo sarti nedir?',
      a: 'Belirlenen sepet tutarini gecen siparislerde kargo ucretsiz uygulanir.',
    },
    {
      q: 'Iade kosullari nelerdir?',
      a: 'Acilmamis ve kullanilmamis urunleri yasal sure icinde iade edebilirsiniz.',
    },
    {
      q: 'Hangi odeme yontemleri mevcut?',
      a: 'Kredi karti, banka karti ve iyzico altyapisi ile guvenli odeme yapabilirsiniz.',
    },
  ],
  contactTitle: 'Iletisim',
  contactDescription: 'Sorulariniz icin bize ulasin. Hafta ici belirlenen saatlerde hizmetinizdeyiz.',
  contactPhoneSecondary: null,
  contactEmailSecondary: null,
  contactAddressSecondary: null,
  contactHoursWeekday: 'Hafta ici: 09:00-18:00',
  contactHoursWeekend: 'Cumartesi: 10:00-16:00',
  contactMapEmbedUrl: null,
  footerDescription: 'Kedi ve kopek mamasi odakli online pet market.',
};

export async function getSiteSettings() {
  try {
    const { prisma } = await import('@/lib/prisma');
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
