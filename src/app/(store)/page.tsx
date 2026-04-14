import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Hero from '@/components/store/Hero';
import ProductCard from '@/components/store/ProductCard';
import CategoryCard from '@/components/store/CategoryCard';
import { ALLOWED_STORE_CATEGORY_SLUGS, STORE_BRAND_NAME } from '@/lib/storefront';
import { getSiteSettings } from '@/lib/siteSettings';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';

export const metadata: Metadata = {
  title: `${STORE_BRAND_NAME} | Ana Sayfa`,
  description: 'Kedi ve kopek mamalarinda gunluk kampanyalar, hizli teslimat ve guvenli odeme.',
};

export const revalidate = 60;

async function getData() {
  const [featuredProducts, bestsellerProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        category: { slug: { in: [...ALLOWED_STORE_CATEGORY_SLUGS] } },
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        isBestseller: true,
        category: { slug: { in: [...ALLOWED_STORE_CATEGORY_SLUGS] } },
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.category.findMany({
      where: { isActive: true, slug: { in: [...ALLOWED_STORE_CATEGORY_SLUGS] } },
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
      take: 10,
    }),
  ]);

  return { featuredProducts, bestsellerProducts, categories };
}

export default async function HomePage() {
  const settings = await getSiteSettings();
  const { featuredProducts, bestsellerProducts, categories } = await getData();

  return (
    <>
      <Hero
        heroBadge={settings.heroBadge}
        heroTitle={settings.heroTitle}
        heroDescription={settings.heroDescription}
        heroPrimaryText={settings.heroPrimaryText}
        heroPrimaryLink={settings.heroPrimaryLink}
        heroSecondaryText={settings.heroSecondaryText}
        heroSecondaryLink={settings.heroSecondaryLink}
      />

      <section className="border-b border-[#f2e8dc] bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: <FiTruck />, title: 'Ayni Gun Kargo', desc: 'Hafta ici hizli cikis' },
              { icon: <FiShield />, title: 'Guvenli Odeme', desc: 'iyzico korumasi' },
              { icon: <FiRefreshCw />, title: 'Taze Stok', desc: 'Guncel parti urunler' },
              { icon: <FiHeadphones />, title: 'Telefon Destegi', desc: 'Siparis oncesi yardim' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3 rounded-2xl border border-[#f3e8d8] bg-[#fffaf3] p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-lg text-primary-500">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary-500">Kategoriler</p>
            <h2 className="section-title">{settings.categoriesTitle || 'Ihtiyaca Gore Mama Sec'}</h2>
            <p className="mt-2 max-w-xl text-sm text-gray-500">
              {settings.categoriesDescription || 'Sadece kedi ve kopek mamalarina odaklanan sade vitrin sayesinde aradigin urunu daha hizli bul.'}
            </p>
          </div>
          <Link href="/urunler" className="btn-outline px-4 py-2 text-sm">
            Tumunu Gor <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              slug={cat.slug}
              icon={cat.icon}
              productCount={cat._count.products}
            />
          ))}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="container mx-auto mb-16 px-4">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary-500">One Cikanlar</p>
              <h2 className="section-title">{settings.featuredTitle || 'Bugun En Cok Incelenen Mamalar'}</h2>
              <p className="mt-2 text-sm text-gray-500">{settings.featuredDescription || 'Stok, fiyat ve marka dengesiyle vitrinde en cok ilgi goren urunler.'}</p>
            </div>
            <Link href="/urunler?ozellik=one-cikan" className="btn-outline px-4 py-2 text-sm">
              Tumunu Gor <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </section>
      )}

      {bestsellerProducts.length > 0 && (
        <section className="mb-0 bg-gradient-to-b from-amber-50 via-[#fffaf5] to-white py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-amber-600">En Cok Satanlar</p>
                <h2 className="section-title">{settings.bestsellerTitle || 'En Cok Siparis Verilen Mamalar'}</h2>
                <p className="mt-2 text-sm text-gray-500">{settings.bestsellerDescription || 'Ailelerin tekrar tekrar tercih ettigi, sepetten en hizli cikan urunler.'}</p>
              </div>
              <Link href="/urunler?ozellik=cok-satan" className="btn-outline border-amber-400 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50">
                Tumunu Gor <FiArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-5">
              {bestsellerProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-[#ead7c3] bg-white p-7 shadow-sm lg:col-span-2">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary-500">Neden Köşem Pet Shop</p>
            <h2 className="section-title mb-4">Daha temiz, daha guven veren bir vitrin</h2>
            <p className="max-w-2xl leading-relaxed text-gray-600">
              Vitrini gereksiz kalabaliktan arindirip sadece kedi ve kopek mamalarina odakladik.
              Boylece urun secmek kolaylasiyor, kampanyalar daha net gorunuyor ve siparis akisi daha hizli ilerliyor.
            </p>
          </div>
          <div className="rounded-[2rem] border border-[#ead7c3] bg-gradient-to-br from-[#fff7ed] to-white p-7 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#b45309]">Hizli Bilgi</p>
            <div className="mt-4 space-y-4 text-sm text-gray-600">
              <div className="flex items-center justify-between border-b border-[#f1e4d4] pb-3">
                <span>Minimum ucretsiz kargo</span>
                <strong className="text-gray-900">500 TL</strong>
              </div>
              <div className="flex items-center justify-between border-b border-[#f1e4d4] pb-3">
                <span>Destek saatleri</span>
                <strong className="text-gray-900">09:00 - 18:00</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Guvenli odeme</span>
                <strong className="text-gray-900">iyzico</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
