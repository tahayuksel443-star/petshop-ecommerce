import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  slug: string;
  icon?: string | null;
  productCount?: number;
}

export default function CategoryCard({ name, slug, icon, productCount }: CategoryCardProps) {
  return (
    <Link href={`/urunler?kategori=${slug}`} className="group">
      <div className="flex cursor-pointer flex-col items-center gap-3 rounded-[1.75rem] border border-[#f3e8d8] bg-gradient-to-b from-white to-[#fff9f0] p-5 text-center transition-all duration-200 group-hover:-translate-y-1 group-hover:border-[#fdba74] group-hover:shadow-lg">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1e6] text-4xl transition-colors group-hover:bg-[#ffe4cc]">
          {icon || '🐾'}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm group-hover:text-primary-600 transition-colors">
            {name}
          </p>
          {productCount !== undefined && (
            <p className="mt-1 text-xs text-gray-500">{productCount} urun secenegi</p>
          )}
        </div>
      </div>
    </Link>
  );
}
