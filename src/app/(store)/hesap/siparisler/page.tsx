import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, formatPrice } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/types';

export const dynamic = 'force-dynamic';

export default async function CustomerOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { authType?: string }).authType !== 'customer') {
    redirect('/hesap/giris?callbackUrl=/hesap/siparisler');
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Siparislerim</h1>
          <p className="mt-1 text-sm text-gray-500">Hesabiniza bagli siparisleri buradan takip edebilirsiniz.</p>
        </div>
        <Link href="/siparis-takip" className="btn-secondary py-3 px-5">Misafir Siparis Takibi</Link>
      </div>

      {orders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">Hesabiniza bagli bir siparis bulunamadi.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Siparis No</p>
                  <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
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
                <p className="mb-2 text-sm font-semibold text-gray-800">Urunler</p>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm text-gray-600">
                      <span>{item.productName} x {item.quantity}</span>
                      <span>{formatPrice(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
