import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import { FiUsers } from 'react-icons/fi';

export const revalidate = 0;

export default async function AdminCustomersPage() {
  // Group orders by customer email
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      totalAmount: true,
      createdAt: true,
      status: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by email
  const customerMap = new Map<string, typeof orders>();
  for (const order of orders) {
    const existing = customerMap.get(order.customerEmail) || [];
    customerMap.set(order.customerEmail, [...existing, order]);
  }

  const customers = Array.from(customerMap.entries()).map(([email, customerOrders]) => ({
    email,
    name: customerOrders[0].customerName,
    phone: customerOrders[0].customerPhone,
    orderCount: customerOrders.length,
    totalSpent: customerOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
    lastOrder: customerOrders[0].createdAt,
  }));

  customers.sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
        <p className="text-gray-500 text-sm">{customers.length} müşteri</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Müşteri</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Telefon</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Sipariş Sayısı</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Toplam Harcama</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Son Sipariş</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((customer) => (
                <tr key={customer.email} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-bold text-sm">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-400">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{customer.phone}</td>
                  <td className="py-3 px-4">
                    <span className="badge badge-gray">{customer.orderCount} sipariş</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-primary-600">{formatPrice(customer.totalSpent)}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(customer.lastOrder)}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-gray-400">
                    <FiUsers size={32} className="mx-auto mb-3 opacity-30" />
                    <p>Henüz müşteri yok</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
