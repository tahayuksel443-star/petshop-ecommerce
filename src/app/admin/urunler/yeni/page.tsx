import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
        <p className="text-gray-500 text-sm mt-1">Yeni ürün bilgilerini doldurun</p>
      </div>
      <ProductForm categories={categories as any} />
    </div>
  );
}
