import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/types';
import OrderStatusChanger from './OrderStatusChanger';
import { FiArrowLeft } from 'react-icons/fi';

export const revalidate = 0;

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  const address = order.shippingAddress as any;

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    PREPARING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/siparisler" className="text-gray-500 hover:text-gray-800">
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sipariş Detayı</h1>
          <p className="text-gray-500 text-sm font-mono">{order.orderNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main */}
        <div className="xl:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sipariş Ürünleri</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.quantity} adet × {formatPrice(Number(item.price))}</p>
                  </div>
                  <span className="font-bold text-gray-900">{formatPrice(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam</span>
                <span>{formatPrice(Number(order.totalAmount) - Number(order.shippingCost) + Number(order.discountAmount))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim ({order.couponCode})</span>
                  <span>-{formatPrice(Number(order.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Kargo</span>
                <span>{Number(order.shippingCost) === 0 ? 'Ücretsiz' : formatPrice(Number(order.shippingCost))}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-1.5">
                <span>Toplam</span>
                <span className="text-primary-600">{formatPrice(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-0.5">Ad Soyad</p>
                <p className="font-medium text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">E-posta</p>
                <p className="font-medium text-gray-900">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Telefon</p>
                <p className="font-medium text-gray-900">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Ödeme Yöntemi</p>
                <p className="font-medium text-gray-900">{order.paymentMethod || '-'}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Teslimat Adresi</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {address.address}<br />
              {address.district}, {address.city}<br />
              Türkiye
            </p>
            {order.notes && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl">
                <p className="text-xs text-amber-700 font-medium">Not: {order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sipariş Durumu</h3>
            <div className="mb-3">
              <span className={`badge text-sm px-3 py-1.5 ${statusColors[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
            <OrderStatusChanger orderId={order.id} currentStatus={order.status} />
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sipariş Bilgileri</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Sipariş No</span>
                <span className="font-mono font-semibold text-primary-600">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ödeme Durumu</span>
                <span className="font-medium">{PAYMENT_STATUS_LABELS[order.paymentStatus]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sipariş Tarihi</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Güncelleme</span>
                <span className="font-medium">{formatDate(order.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
