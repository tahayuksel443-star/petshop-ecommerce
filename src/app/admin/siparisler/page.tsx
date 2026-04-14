import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/types';

export const revalidate = 0;

interface SearchParams {
  status?: string;
  page?: string;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const page = Number(searchParams.page || 1);
  const limit = 20;
  const where: any = {};
  if (searchParams.status) where.status = searchParams.status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    PREPARING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const paymentColors: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-600',
    SUCCESS: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-600',
    REFUNDED: 'bg-blue-100 text-blue-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
          <p className="text-gray-500 text-sm">{total} sipariş</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { label: 'Tümü', value: '' },
          { label: 'Bekliyor', value: 'PENDING' },
          { label: 'Hazırlanıyor', value: 'PREPARING' },
          { label: 'Kargoda', value: 'SHIPPED' },
          { label: 'Teslim Edildi', value: 'DELIVERED' },
          { label: 'İptal', value: 'CANCELLED' },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/siparisler?status=${tab.value}` : '/admin/siparisler'}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              (searchParams.status || '') === tab.value
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Sipariş No</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Müşteri</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Ürünler</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Tutar</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Sipariş Durumu</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Ödeme</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Tarih</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs text-primary-600 font-semibold">{order.orderNumber}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerEmail}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600">{order.items.length} ürün</span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{formatPrice(Number(order.totalAmount))}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${paymentColors[order.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/siparisler/${order.id}`}
                      className="text-primary-600 hover:underline text-xs font-medium"
                    >
                      Görüntüle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-14 text-gray-400">
              <p>Sipariş bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
