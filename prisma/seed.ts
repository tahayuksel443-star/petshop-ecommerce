import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Veritabani seed basliyor...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kosempetshop.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: 'Kosem Admin',
      role: 'SUPER_ADMIN',
      emailVerifiedAt: new Date(),
      mfaEnabled: true,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Kosem Admin',
      role: 'SUPER_ADMIN',
      emailVerifiedAt: new Date(),
      mfaEnabled: true,
    },
  });
  console.log('Admin kullanicisi hazir:', adminEmail);

  const existingSettings = await prisma.siteSettings.findFirst();
  if (existingSettings) {
    await prisma.siteSettings.update({
      where: { id: existingSettings.id },
      data: {
        siteName: 'Köşem Pet Shop',
        siteDescription: 'Kedi ve kopek mamasi odakli online pet market',
        announcementText: 'Hizli teslimat ve guvenli alisveris',
        contactEmail: 'destek@kosempetshop.com',
        contactPhone: '0850 305 07 34',
        contactAddress: 'Basaksehir, Istanbul, Türkiye',
        instagram: 'https://instagram.com/kosempetshop',
        facebook: 'https://facebook.com/kosempetshop',
        freeShippingMin: 500,
        shippingCost: 49.90,
        heroBadge: 'Bugunun Mama Firsati',
        heroTitle: 'Kedi ve kopek\nmamasinda hesapli sepet',
        heroDescription: 'Mahalle petshop samimiyeti, buyuk depo fiyati. Royal Canin, Pro Plan, N&D ve Reflex gibi markalarda gunluk kampanyalar.',
        heroPrimaryText: 'Mama Alisverisine Basla',
        heroPrimaryLink: '/urunler',
        heroSecondaryText: 'Indirimli Urunler',
        heroSecondaryLink: '/urunler?indirimli=true',
        categoriesTitle: 'Ihtiyaca Gore Mama Sec',
        categoriesDescription: 'Sadece kedi ve kopek mamalarina odaklanan sade vitrin sayesinde aradigin urunu daha hizli bul.',
        featuredTitle: 'Bugun En Cok Incelenen Mamalar',
        featuredDescription: 'Stok, fiyat ve marka dengesiyle vitrinde en cok ilgi goren urunler.',
        bestsellerTitle: 'En Cok Siparis Verilen Mamalar',
        bestsellerDescription: 'Ailelerin tekrar tekrar tercih ettigi, sepetten en hizli cikan urunler.',
        footerDescription: 'Sade vitrin, guven veren siparis akisi ve secili mama markalariyla ihtiyacin olan urune daha kolay ulas.',
      },
    });
  } else {
    await prisma.siteSettings.create({
      data: {
        siteName: 'Köşem Pet Shop',
        siteDescription: 'Kedi ve kopek mamasi odakli online pet market',
        announcementText: 'Hizli teslimat ve guvenli alisveris',
        contactEmail: 'destek@kosempetshop.com',
        contactPhone: '0850 305 07 34',
        contactAddress: 'Basaksehir, Istanbul, Türkiye',
        instagram: 'https://instagram.com/kosempetshop',
        facebook: 'https://facebook.com/kosempetshop',
        freeShippingMin: 500,
        shippingCost: 49.90,
        heroBadge: 'Bugunun Mama Firsati',
        heroTitle: 'Kedi ve kopek\nmamasinda hesapli sepet',
        heroDescription: 'Mahalle petshop samimiyeti, buyuk depo fiyati. Royal Canin, Pro Plan, N&D ve Reflex gibi markalarda gunluk kampanyalar.',
        heroPrimaryText: 'Mama Alisverisine Basla',
        heroPrimaryLink: '/urunler',
        heroSecondaryText: 'Indirimli Urunler',
        heroSecondaryLink: '/urunler?indirimli=true',
        categoriesTitle: 'Ihtiyaca Gore Mama Sec',
        categoriesDescription: 'Sadece kedi ve kopek mamalarina odaklanan sade vitrin sayesinde aradigin urunu daha hizli bul.',
        featuredTitle: 'Bugun En Cok Incelenen Mamalar',
        featuredDescription: 'Stok, fiyat ve marka dengesiyle vitrinde en cok ilgi goren urunler.',
        bestsellerTitle: 'En Cok Siparis Verilen Mamalar',
        bestsellerDescription: 'Ailelerin tekrar tekrar tercih ettigi, sepetten en hizli cikan urunler.',
        footerDescription: 'Sade vitrin, guven veren siparis akisi ve secili mama markalariyla ihtiyacin olan urune daha kolay ulas.',
      },
    });
  }
  console.log('Site ayarlari guncellendi');

  const categoryData = [
    {
      name: 'Kedi Mamasi',
      slug: 'kedi-mamalari',
      icon: '🐱',
      description: 'Yavru, yetiskin ve kisirlastirilmis kediler icin kuru ve yas mama cesitleri',
      sortOrder: 1,
    },
    {
      name: 'Kopek Mamasi',
      slug: 'kopek-mamalari',
      icon: '🐶',
      description: 'Yavru, yetiskin ve buyuk irk kopekler icin mama cesitleri',
      sortOrder: 2,
    },
  ] as const;

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      create: {
        ...cat,
        isActive: true,
      },
    });
    categories[cat.slug] = created.id;
  }
  console.log('Kategoriler hazir');

  const productData = [
    {
      name: 'Pro Plan Sterilised Somonlu Kedi Mamasi 10 kg',
      slug: 'pro-plan-sterilised-somonlu-kedi-mamasi-10kg',
      description: 'Kisirlastirilmis yetiskin kediler icin somonlu premium kuru mama.',
      shortDesc: 'Kisirlastirilmis kediler icin somonlu premium mama',
      price: 2149.90,
      discountPrice: 1949.90,
      stock: 18,
      isActive: true,
      isFeatured: true,
      isBestseller: true,
      brand: 'Pro Plan',
      weight: '10 kg',
      sku: 'PP-KEDI-STERI-10',
      categoryId: categories['kedi-mamalari'],
      images: ['/images/products/placeholder-cat-1.svg'],
    },
    {
      name: 'Royal Canin Kitten Kedi Mamasi 4 kg',
      slug: 'royal-canin-kitten-kedi-mamasi-4kg',
      description: 'Yavru kedilerin bagisiklik ve sindirim destegi icin gelistirilmis premium mama.',
      shortDesc: 'Yavru kediler icin premium kuru mama',
      price: 1299.90,
      discountPrice: 1169.90,
      stock: 24,
      isActive: true,
      isFeatured: true,
      isBestseller: false,
      brand: 'Royal Canin',
      weight: '4 kg',
      sku: 'RC-KITTEN-4',
      categoryId: categories['kedi-mamalari'],
      images: ['/images/products/placeholder-cat-2.svg'],
    },
    {
      name: "N&D Pumpkin Kuzu Etli Yetiskin Kedi Mamasi 5 kg",
      slug: 'nd-pumpkin-kuzu-etli-yetiskin-kedi-mamasi-5kg',
      description: 'Tahilsiz formul, yuksek et orani ve dengeli vitamin-mineral icerigi.',
      shortDesc: 'Tahilsiz kuzu etli yetiskin kedi mamasi',
      price: 1749.90,
      discountPrice: null,
      stock: 11,
      isActive: true,
      isFeatured: false,
      isBestseller: true,
      brand: "N&D",
      weight: '5 kg',
      sku: 'ND-KEDI-LAMB-5',
      categoryId: categories['kedi-mamalari'],
      images: ['/images/products/placeholder-cat-3.svg'],
    },
    {
      name: 'Reflex Plus Tavuklu Yetiskin Kedi Mamasi 15 kg',
      slug: 'reflex-plus-tavuklu-yetiskin-kedi-mamasi-15kg',
      description: 'Yetiskin kediler icin ekonomik ve dengeli tavuklu kuru mama.',
      shortDesc: 'Ekonomik yetiskin kedi mamasi',
      price: 1549.90,
      discountPrice: 1399.90,
      stock: 32,
      isActive: true,
      isFeatured: false,
      isBestseller: true,
      brand: 'Reflex Plus',
      weight: '15 kg',
      sku: 'REF-KEDI-15',
      categoryId: categories['kedi-mamalari'],
      images: ['/images/products/placeholder-cat-4.svg'],
    },
    {
      name: 'Royal Canin Medium Adult Kopek Mamasi 15 kg',
      slug: 'royal-canin-medium-adult-kopek-mamasi-15kg',
      description: 'Orta irk yetiskin kopeklerin gunluk beslenmesi icin premium formul.',
      shortDesc: 'Orta irk kopekler icin premium mama',
      price: 2599.90,
      discountPrice: 2349.90,
      stock: 14,
      isActive: true,
      isFeatured: true,
      isBestseller: true,
      brand: 'Royal Canin',
      weight: '15 kg',
      sku: 'RC-DOG-MED-15',
      categoryId: categories['kopek-mamalari'],
      images: ['/images/products/placeholder-dog-1.svg'],
    },
    {
      name: 'Pro Plan Puppy Tavuklu Kopek Mamasi 12 kg',
      slug: 'pro-plan-puppy-tavuklu-kopek-mamasi-12kg',
      description: 'Yavru kopeklerin kemik ve kas gelisimi icin zengin icerikli mama.',
      shortDesc: 'Yavru kopekler icin tavuklu premium mama',
      price: 2199.90,
      discountPrice: 1999.90,
      stock: 19,
      isActive: true,
      isFeatured: true,
      isBestseller: false,
      brand: 'Pro Plan',
      weight: '12 kg',
      sku: 'PP-DOG-PUPPY-12',
      categoryId: categories['kopek-mamalari'],
      images: ['/images/products/placeholder-dog-2.svg'],
    },
    {
      name: 'N&D Düşük Tahilli Kuzu Etli Kopek Mamasi 10 kg',
      slug: 'nd-dusuk-tahilli-kuzu-etli-kopek-mamasi-10kg',
      description: 'Hassas sindirime sahip kopekler icin dusuk tahilli kuzu etli formul.',
      shortDesc: 'Dusuk tahilli kuzu etli kopek mamasi',
      price: 2099.90,
      discountPrice: null,
      stock: 9,
      isActive: true,
      isFeatured: false,
      isBestseller: true,
      brand: "N&D",
      weight: '10 kg',
      sku: 'ND-DOG-LAMB-10',
      categoryId: categories['kopek-mamalari'],
      images: ['/images/products/placeholder-dog-3.svg'],
    },
    {
      name: 'Reflex High Energy Yetiskin Kopek Mamasi 15 kg',
      slug: 'reflex-high-energy-yetiskin-kopek-mamasi-15kg',
      description: 'Hareketli ve aktif kopekler icin yuksek enerjili kuru mama.',
      shortDesc: 'Aktif kopekler icin yuksek enerjili mama',
      price: 1499.90,
      discountPrice: 1349.90,
      stock: 27,
      isActive: true,
      isFeatured: false,
      isBestseller: true,
      brand: 'Reflex',
      weight: '15 kg',
      sku: 'REF-DOG-ENERGY-15',
      categoryId: categories['kopek-mamalari'],
      images: ['/images/products/placeholder-dog-4.svg'],
    },
  ];

  for (const product of productData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product as any,
      create: product as any,
    });
  }
  console.log('Mama urunleri hazir');

  await prisma.coupon.upsert({
    where: { code: 'MAMA10' },
    update: {
      description: 'Ilk mama siparisine ozel indirim',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 500,
      maxUses: 500,
      isActive: true,
    },
    create: {
      code: 'MAMA10',
      description: 'Ilk mama siparisine ozel indirim',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 500,
      maxUses: 500,
      isActive: true,
    },
  });
  console.log('Kupon hazir');

  console.log('Seed tamamlandi');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
