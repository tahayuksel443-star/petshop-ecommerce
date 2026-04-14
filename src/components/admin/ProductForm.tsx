'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, Category } from '@/types';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Props {
  product?: Product;
  categories: Category[];
}

export default function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    shortDesc: product?.shortDesc || '',
    price: product?.price?.toString() || '',
    discountPrice: product?.discountPrice?.toString() || '',
    stock: product?.stock?.toString() || '0',
    brand: product?.brand || '',
    weight: product?.weight || '',
    sku: product?.sku || '',
    categoryId: product?.categoryId || '',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isBestseller: product?.isBestseller ?? false,
    images: product?.images || [] as string[],
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        uploadedUrls.push(data.url);
      }
    }

    setForm((f) => ({ ...f, images: [...f.images, ...uploadedUrls] }));
    setUploading(false);
    toast.success(`${uploadedUrls.length} görsel yüklendi`);
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error('Kategori seçin'); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error('Geçerli fiyat girin'); return; }

    setLoading(true);
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stock: Number(form.stock),
    };

    const url = isEdit ? `/api/products/${product.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(isEdit ? 'Ürün güncellendi' : 'Ürün eklendi');
      router.push('/admin/urunler');
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Bir hata oluştu');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main fields */}
        <div className="xl:col-span-2 space-y-5">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Temel Bilgiler</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ürün Adı *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ürün adını girin"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kısa Açıklama</label>
                <input
                  value={form.shortDesc}
                  onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                  placeholder="Ürün listesinde görünecek kısa açıklama"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Detaylı Açıklama</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ürün hakkında detaylı açıklama..."
                  rows={5}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          {/* Price & Stock */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Fiyat & Stok</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fiyat (TL) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">İndirimli Fiyat</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.discountPrice}
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                  placeholder="0.00"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok *</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ürün Detayları</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Marka</label>
                <input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Marka adı"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ağırlık/Boyut</label>
                <input
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="örn: 2kg, 500ml"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU</label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="Ürün kodu"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ürün Görselleri</h3>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
            >
              <FiUpload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500">Görsel yüklemek için tıklayın</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (maks 5MB)</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            {uploading && <p className="text-sm text-primary-500 mt-2 text-center">Yükleniyor...</p>}
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <div className="relative h-20 rounded-xl overflow-hidden bg-gray-100">
                      <Image src={img} alt="" fill className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Category */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Kategori</h3>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Kategori seçin</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Durum & Özellikler</h3>
            <div className="space-y-3">
              {[
                { key: 'isActive', label: 'Aktif', desc: 'Sitede göster' },
                { key: 'isFeatured', label: 'Öne Çıkan', desc: 'Ana sayfada göster' },
                { key: 'isBestseller', label: 'Çok Satan', desc: 'Çok satan rozetini göster' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form[item.key as keyof typeof form] as boolean}
                    onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                    className="w-4 h-4 accent-primary-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? <span className="spinner w-4 h-4" /> : <FiSave size={16} />}
              {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Kaydet'}
            </button>
            <Link href="/admin/urunler" className="btn-secondary w-full justify-center py-3">
              <FiArrowLeft size={16} />
              İptal
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
