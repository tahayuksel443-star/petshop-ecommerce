import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductsClient from './ProductsClient';
import { ALLOWED_STORE_CATEGORY_SLUGS, isAllowedStoreCategory } from '@/lib/storefront';

export const metadata: Metadata = {
  title: 'Tum Mamalar',
  description: 'Kedi ve kopek mamalarini marka, kategori ve fiyat araligina gore kesfedin.',
};

export const revalidate = 60;

type SearchParams = Record<string, string | undefined> & {
  kategori?: string;
  search?: string;
  sirala?: string;
  ozellik?: string;
  indirimli?: string;
  minFiyat?: string;
  maxFiyat?: string;
};

async function getProducts(params: SearchParams) {
  const where: any = { isActive: true };
  where.category = { slug: { in: [...ALLOWED_STORE_CATEGORY_SLUGS] } };

  if (params.kategori && isAllowedStoreCategory(params.kategori)) {
    where.category = { slug: params.kategori };
  }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { brand: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.ozellik === 'one-cikan') where.isFeatured = true;
  if (params.ozellik === 'cok-satan') where.isBestseller = true;
  if (params.indirimli === 'true') where.discountPrice = { not: null };
  if (params.minFiyat || params.maxFiyat) {
    where.price = {};
    if (params.minFiyat) where.price.gte = Number(params.minFiyat);
    if (params.maxFiyat) where.price.lte = Number(params.maxFiyat);
  }

  let orderBy: any = { createdAt: 'desc' };
  if (params.sirala === 'fiyat-artan') orderBy = { price: 'asc' };
  if (params.sirala === 'fiyat-azalan') orderBy = { price: 'desc' };
  if (params.sirala === 'isim') orderBy = { name: 'asc' };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
    }),
    prisma.category.findMany({
      where: { isActive: true, slug: { in: [...ALLOWED_STORE_CATEGORY_SLUGS] } },
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return { products, categories };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { products, categories } = await getProducts(searchParams);

  return (
    <ProductsClient
      initialProducts={products as any}
      categories={categories as any}
      searchParams={searchParams}
    />
  );
}
