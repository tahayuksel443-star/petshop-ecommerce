'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { CartQuote } from '@/types';
import { formatPrice } from '@/lib/utils';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiTruck, FiTag } from 'react-icons/fi';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, syncItemsFromQuote } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const requestItems = useMemo(
    () => items.map((item) => ({ id: item.id, quantity: item.quantity })),
    [items]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadQuote() {
      if (requestItems.length === 0) {
        setQuote(null);
        return;
      }

      setQuoteLoading(true);
      const res = await fetch('/api/cart/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: requestItems }),
      });

      const data = await res.json().catch(() => null);
      if (!cancelled && res.ok) {
        setQuote(data);
        syncItemsFromQuote(data.items ?? []);
      }
      if (!cancelled) setQuoteLoading(false);
    }

    loadQuote();

    return () => {
      cancelled = true;
    };
  }, [requestItems, syncItemsFromQuote]);

  const subtotal = quote?.subtotal ?? 0;
  const shippingCost = quote?.shippingCost ?? 0;
  const freeShippingMin = quote?.freeShippingMin ?? null;
  const total = subtotal + shippingCost - discount;
  const displayItems = quote?.items ?? [];

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
        toast.success(`Kupon uygulandi! ${formatPrice(discountAmount)} indirim`);
      } else {
        toast.error(data.message || 'Gecersiz kupon kodu');
      }
    } catch {
      toast.error('Kupon kontrol edilirken hata olustu');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-50">
            <FiShoppingBag size={40} className="text-primary-400" />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Sepetiniz Bos</h1>
          <p className="mb-8 text-gray-500">Henuz sepetinize urun eklemediniz. Alisverise baslamak icin urunleri inceleyin.</p>
          <Link href="/urunler" className="btn-primary px-8 py-3.5 text-base">
            <FiShoppingBag size={18} />
            Alisverise Basla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl">Sepetim ({displayItems.length} urun)</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {displayItems.map((item) => {
            const itemPrice = item.discountPrice ?? item.price;
            return (
              <div key={item.id} className="card flex gap-4 p-4">
                <Link href={`/urunler/${item.slug}`} className="shrink-0">
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-50">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                </Link>

                <div className="min-w-0 flex-1">
                  <Link href={`/urunler/${item.slug}`}>
                    <h3 className="line-clamp-2 text-sm font-semibold text-gray-800 transition-colors hover:text-primary-600">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-bold text-primary-600">{formatPrice(itemPrice)}</span>
                    {item.discountPrice ? (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-0 overflow-hidden rounded-lg border border-gray-200">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50">
                        <FiMinus size={13} />
                      </button>
                      <span className="flex h-8 w-9 items-center justify-center border-x border-gray-200 text-sm font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50">
                        <FiPlus size={13} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(item.lineTotal)}</span>
                      <button onClick={() => removeItem(item.id)} className="p-1 text-gray-400 transition-colors hover:text-red-500">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={clearCart} className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-red-500">
            <FiTrash2 size={14} />
            Sepeti Temizle
          </button>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
              <FiTag className="text-primary-500" size={16} />
              Kupon Kodu
            </h3>
            {couponApplied ? (
              <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-green-700">{couponApplied}</p>
                  <p className="text-xs text-green-600">-{formatPrice(discount)} indirim uygulandi</p>
                </div>
                <button onClick={() => { setDiscount(0); setCouponApplied(''); setCouponCode(''); }} className="text-xs text-green-700 transition-colors hover:text-red-500">
                  Kaldir
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Kupon kodunu girin"
                  className="input-field flex-1 py-2.5 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                />
                <button onClick={applyCoupon} className="rounded-xl bg-primary-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600">
                  Uygula
                </button>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-4 font-semibold text-gray-900">Siparis Ozeti</h3>
            {quoteLoading ? <p className="text-sm text-gray-400">Gercek fiyatlar guncelleniyor...</p> : null}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between text-green-600">
                  <span>Kupon Indirimi</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <FiTruck size={14} />
                  Kargo
                </span>
                {shippingCost === 0 ? <span className="font-medium text-green-600">Ucretsiz!</span> : <span>{formatPrice(shippingCost)}</span>}
              </div>
              {shippingCost > 0 && freeShippingMin ? (
                <div className="rounded-xl bg-primary-50 p-2.5">
                  <p className="text-center text-xs text-primary-600">
                    Ucretsiz kargo icin <strong>{formatPrice(Math.max(0, freeShippingMin - subtotal))}</strong> daha ekleyin
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-100">
                    <div className="h-full rounded-full bg-primary-500 transition-all duration-300" style={{ width: `${Math.min(100, (subtotal / freeShippingMin) * 100)}%` }} />
                  </div>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-gray-100 pt-2.5 text-base font-bold text-gray-900">
                <span>Toplam</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>

            <Link href={{ pathname: '/odeme', query: couponApplied ? { kupon: couponApplied } : {} }} className="btn-primary mt-5 w-full justify-center py-3.5 text-base">
              Odemeye Gec
            </Link>
            <Link href="/urunler" className="btn-secondary mt-2 w-full justify-center py-2.5 text-sm">
              Alisverise Devam Et
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
