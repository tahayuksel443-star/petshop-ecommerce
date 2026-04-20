'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatDate, formatPrice } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/types';
import toast from 'react-hot-toast';

type TrackedOrder = {
  id: string;
  orderNumber: string;
  trackingToken?: string | null;
  status: keyof typeof ORDER_STATUS_LABELS;
  totalAmount: number | string;
  createdAt: string;
  items: Array<{ id: string; productName: string; quantity: number; price: number | string }>;
};

export default function OrderTrackingPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ trackingCode: searchParams?.get('kod') || '', email: '' });
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/order-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast.error(data.error || 'Siparis bilgileri eslesmedi');
      setOrder(null);
      setLoading(false);
      return;
    }

    setOrder(data);
    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900">Siparis Takibi</h1>
        <p className="mt-2 text-sm text-gray-500">
          Uyeliksiz verdiginiz siparisleri takip kodu ve e-posta ile sorgulayabilirsiniz.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            className="input-field"
            placeholder="Takip kodu"
            value={form.trackingCode}
            onChange={(e) => setForm({ ...form, trackingCode: e.target.value })}
            required
          />
          <input
            type="email"
            className="input-field"
            placeholder="E-posta"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary justify-center py-3 md:col-span-2">
            {loading ? 'Sorgulaniyor...' : 'Siparisi Sorgula'}
          </button>
        </form>

        {order ? (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-[#fffaf5] p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-500">Siparis No</p>
                <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
                {order.trackingToken ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Takip kodu: <span className="font-semibold text-gray-700">{order.trackingToken}</span>
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
                <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(Number(order.totalAmount))}</span>
              </div>
            </div>
            <div className="mt-4 border-t border-gray-100 pt-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 text-sm text-gray-600">
                  <span>{item.productName} x {item.quantity}</span>
                  <span>{formatPrice(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
