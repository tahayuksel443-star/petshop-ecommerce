'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import { formatPrice, calculateDiscountPercent } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const discountPercent =
    product.discountPrice
      ? calculateDiscountPercent(Number(product.price), Number(product.discountPrice))
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      image: product.images[0] || '/images/placeholder-product.jpg',
      stock: product.stock,
    });
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="group card overflow-hidden flex flex-col">
      {/* Image */}
      <Link href={`/urunler/${product.slug}`} className="block relative">
        <div className="relative h-52 bg-gray-50 product-image-container">
          <Image
            src={imageError ? '/images/placeholder-product.jpg' : (product.images[0] || '/images/placeholder-product.jpg')}
            alt={product.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {discountPercent && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                -%{discountPercent}
              </span>
            )}
            {product.isBestseller && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                Çok Satan
              </span>
            )}
            {product.isFeatured && !product.isBestseller && (
              <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                Öne Çıkan
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                Stok Yok
              </span>
            )}
          </div>

          {/* Hover actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-colors ${
                isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:text-red-500'
              }`}
            >
              <FiHeart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <Link
              href={`/urunler/${product.slug}`}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md text-gray-500 hover:text-primary-500 transition-colors"
            >
              <FiEye size={14} />
            </Link>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        {product.category && (
          <span className="text-xs text-primary-500 font-semibold mb-1 uppercase tracking-wide">
            {product.category.name}
          </span>
        )}

        {/* Name */}
        <Link href={`/urunler/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-primary-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar key={star} size={11} className={star <= 4 ? 'text-amber-400' : 'text-gray-200'} />
            ))}
          </div>
          <span className="text-xs text-gray-400">(24)</span>
        </div>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              {product.discountPrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(Number(product.discountPrice))}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(Number(product.price))}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(Number(product.price))}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-xs text-red-500 font-medium">Son {product.stock} adet</span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg active:scale-95'
            }`}
          >
            <FiShoppingCart size={15} />
            {isOutOfStock ? 'Stok Yok' : 'Sepete Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}
