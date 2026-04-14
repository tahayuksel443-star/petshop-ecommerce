import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { FiPackage, FiShoppingBag, FiDollarSign, FiClock, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/types';

export const revalidate = 30;

async function getDashboardData() {
  const [totalProducts, totalOrders, pendingOrders, lowStockProducts, recentOrders, totalRevenue] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, isActive: true },
        include: { category: true },
        orderBy: { stock: 'asc' },
        take: 5,
      }),
      prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 7,
      }),
      prisma.order.aggregate({
        where: { paymentStatus: 'SUCCESS' },
        _sum: { totalAmount: true },
      }),
    ]);

  return { totalProducts, totalOrders, pendingOrders, lowStockProducts, recentOrders, totalRevenue };
}

export default async function AdminDashboard() {
  const { totalProducts, totalOrders, pendingOrders, lowStockProducts, recentOrders, totalRevenue } =
    await getDashboardData();

  const stats = [
    {
      title: 'Toplam Ürün',
      value: totalProducts,
      icon: <FiPackage size={22} />,
      color: 'bg-blue-50 text-blue-600',
      link: '/admin/urunler',
    },
    {
      title: 'Toplam Sipariş',
      value: totalOrders,
      icon: <FiShoppingBag size={22} />,
      color: 'bg-green-50 text-green-600',
      link: '/admin/siparisler',
    },
    {
      title: 'Toplam Gelir',
      value: formatPrice(Number(totalRevenue._sum.totalAmount || 0)),
      icon: <FiDollarSign size={22} />,
      color: 'bg-primary-50 text-primary-600',
      link: '/admin/siparisler',
    },
    {
      title: 'Bekleyen Sipariş',
      value: pendingOrders,
      icon: <FiClock size={22} />,
      color: 'bg-amber-50 text-amber-600',
      link: '/admin/siparisler?status=PENDING',
    },
  ];

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    PREPARING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">PawShop yönetim paneline hoşgeldiniz</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <FiArrowRight size={16} className="text-gray-300" />
              </div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-0.5">{stat.title}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Son Siparişler</h2>
            <Link href="/admin/siparisler" className="text-sm text-primary-600 hover:underline">
              Tümünü gör →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Sipariş No</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Müşteri</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Tutar</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Durum</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <Link href={`/admin/siparisler/${order.id}`} className="font-mono text-xs text-primary-600 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-gray-700">{order.customerName}</td>
                    <td className="py-3 px-2 font-semibold">{formatPrice(Number(order.totalAmount))}</td>
                    <td className="py-3 px-2">
                      <span className={`badge ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-400 text-xs">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <FiAlertTriangle className="text-amber-500" size={16} />
              Düşük Stok
            </h2>
            <Link href="/admin/urunler" className="text-sm text-primary-600 hover:underline">
              Tümü →
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Düşük stoklu ürün yok</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <Link key={product.id} href={`/admin/urunler/${product.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category?.name}</p>
                    </div>
                    <span className={`ml-2 shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${
                      product.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {product.stock === 0 ? 'Tükendi' : `${product.stock} adet`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
