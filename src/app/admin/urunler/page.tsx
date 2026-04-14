import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { FiPlus, FiEdit2, FiPackage } from 'react-icons/fi';
import DeleteProductButton from './DeleteProductButton';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} ürün</p>
        </div>
        <Link href="/admin/urunler/yeni" className="btn-primary py-2.5 px-5">
          <FiPlus size={18} />
          Yeni Ürün
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Ürün</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Kategori</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Fiyat</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Stok</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Durum</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {product.images[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiPackage size={16} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge badge-gray">{product.category?.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    {product.discountPrice ? (
                      <div>
                        <span className="font-bold text-primary-600">{formatPrice(Number(product.discountPrice))}</span>
                        <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(Number(product.price))}</span>
                      </div>
                    ) : (
                      <span className="font-medium">{formatPrice(Number(product.price))}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-amber-500' : 'text-green-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${product.isActive ? 'badge-green' : 'badge-red'}`}>
                      {product.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/urunler/${product.id}`}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <FiEdit2 size={14} />
                      </Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-14 text-gray-400">
              <FiPackage size={32} className="mx-auto mb-3 opacity-30" />
              <p>Henüz ürün eklenmemiş</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
