'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiTruck, FiTag } from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

const FREE_SHIPPING_MIN = 250;
const SHIPPING_COST = 29.90;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');

  const subtotal = getTotalPrice();
  const shippingCost = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        const discountAmount =
          data.discountType === 'PERCENTAGE'
            ? (subtotal * data.discountValue) / 100
            : data.discountValue;
        setDiscount(discountAmount);
        setCouponApplied(couponCode);
        toast.success(`Kupon uygulandı! ${formatPrice(discountAmount)} indirim`);
      } else {
        toast.error(data.message || 'Geçersiz kupon kodu');
      }
    } catch {
      toast.error('Kupon kontrol edilirken hata oluştu');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag size={40} className="text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Sepetiniz Boş</h1>
          <p className="text-gray-500 mb-8">
            Henüz sepetinize ürün eklemediniz. Alışverişe başlamak için ürünleri inceleyin.
          </p>
          <Link href="/urunler" className="btn-primary px-8 py-3.5 text-base">
            <FiShoppingBag size={18} />
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Sepetim ({items.length} ürün)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const itemPrice = item.discountPrice ?? item.price;
            return (
              <div key={item.id} className="card p-4 flex gap-4">
                {/* Image */}
                <Link href={`/urunler/${item.slug}`} className="shrink-0">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                    <Image
                      src={item.image || '/images/placeholder-product.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/urunler/${item.slug}`}>
                    <h3 className="font-semibold text-gray-800 text-sm hover:text-primary-600 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary-600">{formatPrice(itemPrice)}</span>
                    {item.discountPrice && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <FiMinus size={13} />
                      </button>
                      <span className="w-9 h-8 flex items-center justify-center text-gray-900 font-semibold text-sm border-x border-gray-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <FiPlus size={13} />
                      </button>
                    </div>

                    {/* Subtotal & remove */}
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 text-sm">
                        {formatPrice(itemPrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Clear cart */}
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
          >
            <FiTrash2 size={14} />
            Sepeti Temizle
          </button>
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiTag className="text-primary-500" size={16} />
              Kupon Kodu
            </h3>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                <div>
                  <p className="text-green-700 font-semibold text-sm">{couponApplied}</p>
                  <p className="text-green-600 text-xs">-{formatPrice(discount)} indirim uygulandı</p>
                </div>
                <button
                  onClick={() => { setDiscount(0); setCouponApplied(''); setCouponCode(''); }}
                  className="text-green-700 hover:text-red-500 transition-colors text-xs"
                >
                  Kaldır
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Kupon kodunu girin"
                  className="input-field py-2.5 text-sm flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                />
                <button
                  onClick={applyCoupon}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 rounded-xl font-semibold text-sm transition-colors"
                >
                  Uygula
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Sipariş Özeti</h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Kupon İndirimi</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <FiTruck size={14} />
                  Kargo
                </span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 font-medium">Ücretsiz!</span>
                ) : (
                  <span>{formatPrice(shippingCost)}</span>
                )}
              </div>
              {shippingCost > 0 && (
                <div className="bg-primary-50 rounded-xl p-2.5">
                  <p className="text-xs text-primary-600 text-center">
                    Ücretsiz kargo için <strong>{formatPrice(FREE_SHIPPING_MIN - subtotal)}</strong> daha ekleyin
                  </p>
                  <div className="mt-2 h-1.5 bg-primary-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-base text-gray-900">
                <span>Toplam</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href={{
                pathname: '/odeme',
                query: couponApplied ? { kupon: couponApplied } : {},
              }}
              className="btn-primary w-full justify-center mt-5 py-3.5 text-base"
            >
              Ödemeye Geç
            </Link>

            <Link href="/urunler" className="btn-secondary w-full justify-center mt-2 py-2.5 text-sm">
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
