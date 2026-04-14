import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/store/ProductCard';
import AddToCartButton from './AddToCartButton';
import { formatPrice, calculateDiscountPercent } from '@/lib/utils';
import { isAllowedStoreCategory } from '@/lib/storefront';
import { FiTruck, FiShield, FiRefreshCw, FiStar, FiChevronRight } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });
  if (product && !isAllowedStoreCategory(product.category?.slug)) {
    return { title: 'Urun Bulunamadi' };
  }
  if (!product) return { title: 'Ürün Bulunamadı' };
  return {
    title: product.name,
    description: product.shortDesc || product.description || undefined,
    openGraph: {
      title: product.name,
      description: product.shortDesc || '',
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, isActive: true },
    include: { category: true },
  });

  if (!product) notFound();
  if (!isAllowedStoreCategory(product.category?.slug)) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
    include: { category: true },
    take: 4,
  });

  const discountPercent = product.discountPrice
    ? calculateDiscountPercent(Number(product.price), Number(product.discountPrice))
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary-500 transition-colors">Ana Sayfa</Link>
        <FiChevronRight size={14} />
        <Link href="/urunler" className="hover:text-primary-500 transition-colors">Ürünler</Link>
        <FiChevronRight size={14} />
        {product.category && (
          <>
            <Link href={`/urunler?kategori=${product.category.slug}`} className="hover:text-primary-500 transition-colors">
              {product.category.name}
            </Link>
            <FiChevronRight size={14} />
          </>
        )}
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div>
          <div className="relative h-[400px] md:h-[480px] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <Image
              src={product.images[0] || '/images/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {discountPercent && (
              <div className="absolute top-4 left-4">
                <span className="bg-red-500 text-white font-bold px-3 py-1.5 rounded-xl text-sm">
                  -%{discountPercent} İndirim
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-3">
              {product.images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 hover:border-primary-300 cursor-pointer transition-colors">
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          {/* Category badge */}
          {product.category && (
            <Link
              href={`/urunler?kategori=${product.category.slug}`}
              className="inline-block text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-3 hover:bg-primary-100 transition-colors uppercase tracking-wide"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <FaStar key={s} size={14} className={s <= 4 ? 'text-amber-400' : 'text-gray-200'} />
              ))}
            </div>
            <span className="text-sm text-gray-500">4.8 (47 değerlendirme)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
            {product.discountPrice ? (
              <div>
                <span className="text-3xl font-black text-primary-600">
                  {formatPrice(Number(product.discountPrice))}
                </span>
                <span className="text-xl text-gray-400 line-through ml-3">
                  {formatPrice(Number(product.price))}
                </span>
                <span className="ml-3 bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-lg">
                  %{discountPercent} Tasarruf
                </span>
              </div>
            ) : (
              <span className="text-3xl font-black text-gray-900">
                {formatPrice(Number(product.price))}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mb-5">
            {product.stock > 0 ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full"></span>
                <span className="text-sm font-medium text-green-700">
                  {product.stock <= 5
                    ? `Son ${product.stock} adet kaldı!`
                    : 'Stokta Mevcut'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-400 rounded-full"></span>
                <span className="text-sm font-medium text-red-600">Stok Tükendi</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            {product.brand && (
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-0.5">Marka</p>
                <p className="font-semibold text-gray-900">{product.brand}</p>
              </div>
            )}
            {product.weight && (
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-0.5">Ağırlık / Boyut</p>
                <p className="font-semibold text-gray-900">{product.weight}</p>
              </div>
            )}
            {product.sku && (
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-0.5">Ürün Kodu</p>
                <p className="font-semibold text-gray-900">{product.sku}</p>
              </div>
            )}
          </div>

          {/* Add to cart */}
          <AddToCartButton product={product as any} />

          {/* Guarantees */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: <FiTruck className="text-primary-500" />, text: 'Ücretsiz Kargo', sub: '250 TL üzeri' },
              { icon: <FiShield className="text-green-500" />, text: 'Güvenli Ödeme', sub: 'SSL şifreleme' },
              { icon: <FiRefreshCw className="text-blue-500" />, text: '14 Gün İade', sub: 'Koşulsuz' },
            ].map((g) => (
              <div key={g.text} className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <span className="text-xl mb-1">{g.icon}</span>
                <p className="text-xs font-semibold text-gray-800">{g.text}</p>
                <p className="text-xs text-gray-400">{g.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mb-14 bg-white rounded-3xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ürün Açıklaması</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Benzer Ürünler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
