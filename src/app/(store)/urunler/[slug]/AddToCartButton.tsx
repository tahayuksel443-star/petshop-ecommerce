'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import { FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';

export default function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, items, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.id === product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
        image: product.images[0] || '/images/placeholder-product.jpg',
        stock: product.stock,
      });
    }
  };

  if (product.stock === 0) {
    return (
      <button disabled className="w-full py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold text-lg cursor-not-allowed">
        Stok Tükendi
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <FiMinus size={16} />
          </button>
          <span className="w-12 h-11 flex items-center justify-center text-gray-900 font-bold text-lg border-x border-gray-200">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <FiPlus size={16} />
          </button>
        </div>
        <span className="text-sm text-gray-400">Stok: {product.stock}</span>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        className="w-full py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
      >
        <FiShoppingCart size={22} />
        Sepete Ekle
        {cartItem && (
          <span className="bg-white/20 text-white text-sm px-2 py-0.5 rounded-lg">
            Sepette: {cartItem.quantity}
          </span>
        )}
      </button>
    </div>
  );
}
