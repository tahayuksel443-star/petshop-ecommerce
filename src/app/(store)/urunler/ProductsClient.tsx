'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/store/ProductCard';
import { Product, Category } from '@/types';
import { FiSearch, FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi';

interface Props {
  initialProducts: Product[];
  categories: (Category & { _count: { products: number } })[];
  searchParams: Record<string, string | undefined>;
}

export default function ProductsClient({ initialProducts, categories, searchParams }: Props) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams as any);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/urunler?${params.toString()}`);
  };

  const clearFilters = () => router.push('/urunler');

  const activeFiltersCount = Object.values(searchParams).filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          {searchParams.kategori
            ? categories.find((c) => c.slug === searchParams.kategori)?.name || 'Ürünler'
            : searchParams.search
            ? `"${searchParams.search}" için sonuçlar`
            : 'Tum Mamalar'}
        </h1>
        <p className="text-gray-500 text-sm">{initialProducts.length} urun bulundu</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters - desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterPanel
            categories={categories}
            searchParams={searchParams}
            updateParam={updateParam}
            clearFilters={clearFilters}
          />
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-0 max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                defaultValue={searchParams.search || ''}
                placeholder="Mama ara..."
                onChange={(e) => {
                  const val = e.target.value;
                  const timeout = setTimeout(() => updateParam('search', val), 500);
                  return () => clearTimeout(timeout);
                }}
                className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 text-sm w-full bg-white"
              />
            </div>

            {/* Sort */}
            <select
              value={searchParams.sirala || ''}
              onChange={(e) => updateParam('sirala', e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 text-sm bg-white text-gray-700 cursor-pointer"
            >
              <option value="">Varsayılan Sıralama</option>
              <option value="fiyat-artan">Fiyat: Düşükten Yükseğe</option>
              <option value="fiyat-azalan">Fiyat: Yüksekten Düşüğe</option>
              <option value="isim">İsme Göre (A-Z)</option>
            </select>

            {/* Mobile filter button */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white relative"
            >
              <FiFilter size={16} />
              Filtrele
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View mode */}
            <div className="hidden sm:flex border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <FiGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <FiList size={16} />
              </button>
            </div>

            {/* Active filters clear */}
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
                <FiX size={14} />
                Temizle
              </button>
            )}
          </div>

          {/* Products grid */}
          {initialProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🔍</p>
              <p className="text-gray-500 text-lg">Ürün bulunamadı</p>
              <p className="text-gray-400 text-sm mt-1">Farklı filtreler deneyin</p>
              <button onClick={clearFilters} className="mt-4 btn-primary py-2 px-6">
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col gap-4'
            }>
              {initialProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="relative ml-auto w-80 bg-white h-full overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Filtreler</h3>
              <button onClick={() => setShowFilters(false)}>
                <FiX size={22} className="text-gray-500" />
              </button>
            </div>
            <FilterPanel
              categories={categories}
              searchParams={searchParams}
              updateParam={(k, v) => { updateParam(k, v); setShowFilters(false); }}
              clearFilters={() => { clearFilters(); setShowFilters(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  categories,
  searchParams,
  updateParam,
  clearFilters,
}: {
  categories: (Category & { _count: { products: number } })[];
  searchParams: Record<string, string | undefined>;
  updateParam: (k: string, v: string) => void;
  clearFilters: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Kategoriler</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('kategori', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between ${
              !searchParams.kategori ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
                <span>Tum Mama Gruplari</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => updateParam('kategori', cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between ${
                searchParams.kategori === cat.slug
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-gray-400 text-xs">{cat._count.products}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Fiyat Aralığı</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={searchParams.minFiyat || ''}
            onBlur={(e) => updateParam('minFiyat', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={searchParams.maxFiyat || ''}
            onBlur={(e) => updateParam('maxFiyat', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Özellikler</h3>
        <div className="space-y-2">
          {[
            { label: 'İndirimli Ürünler', key: 'indirimli', value: 'true' },
            { label: 'Öne Çıkan', key: 'ozellik', value: 'one-cikan' },
            { label: 'Çok Satan', key: 'ozellik', value: 'cok-satan' },
          ].map((filter) => (
            <label key={filter.label} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={searchParams[filter.key] === filter.value}
                onChange={(e) => updateParam(filter.key, e.target.checked ? filter.value : '')}
                className="w-4 h-4 rounded accent-primary-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">{filter.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={clearFilters} className="w-full btn-secondary py-2.5 text-sm">
        <FiX size={14} />
        Filtreleri Temizle
      </button>
    </div>
  );
}
