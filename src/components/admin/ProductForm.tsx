'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import { Product, Category } from '@/types';

interface Props {
  product?: Product;
  categories: Category[];
}

export default function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(product);

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
    images: (product?.images || []) as string[],
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

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Gorsel yuklenemedi' }));
          toast.error(data.error || `${file.name} yuklenemedi`);
          continue;
        }

        const data = await res.json();
        if (typeof data.url === 'string' && data.url.length > 0) {
          uploadedUrls.push(data.url);
        }
      } catch {
        toast.error(`${file.name} yuklenirken baglanti hatasi olustu`);
      }
    }

    setForm((current) => ({ ...current, images: [...current.images, ...uploadedUrls] }));
    setUploading(false);

    if (uploadedUrls.length > 0) {
      toast.success(`${uploadedUrls.length} gorsel yuklendi`);
    }

    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, index) => index !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.categoryId) {
      toast.error('Kategori secin');
      return;
    }

    if (!form.price || Number.isNaN(Number(form.price))) {
      toast.error('Gecerli fiyat girin');
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stock: Number(form.stock),
    };

    const url = isEdit ? `/api/products/${product?.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(isEdit ? 'Urun guncellendi' : 'Urun eklendi');
      router.push('/admin/urunler');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({ error: 'Bir hata olustu' }));
      toast.error(data.error || 'Bir hata olustu');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Temel Bilgiler</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Urun Adi *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Urun adini girin"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Kisa Aciklama</label>
                <input
                  value={form.shortDesc}
                  onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                  placeholder="Urun listesinde gorunecek kisa aciklama"
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Detayli Aciklama</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Urun hakkinda detayli aciklama..."
                  rows={5}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Fiyat ve Stok</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Fiyat (TL) *</label>
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
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Indirimli Fiyat</label>
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
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Stok *</label>
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

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Urun Detaylari</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Marka</label>
                <input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Marka adi"
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Agirlik/Boyut</label>
                <input
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="Orn: 2kg, 500gr"
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">SKU</label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="Urun kodu"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Urun Gorselleri</h3>
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 p-8 text-center transition-colors hover:border-primary-400 hover:bg-primary-50"
            >
              <FiUpload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500">Gorsel yuklemek icin tiklayin</p>
              <p className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP, GIF (maks 5MB)</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            {uploading ? (
              <p className="mt-2 text-center text-sm text-primary-500">Yukleniyor...</p>
            ) : null}
            {form.images.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {form.images.map((img, i) => (
                  <div key={`${img}-${i}`} className="group relative">
                    <div className="relative h-24 overflow-hidden rounded-xl bg-gray-100">
                      <Image src={img} alt="" fill className="object-cover" unoptimized={img.startsWith('data:')} />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Kategori</h3>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Kategori secin</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Durum ve Ozellikler</h3>
            <div className="space-y-3">
              {[
                { key: 'isActive', label: 'Aktif', desc: 'Sitede goster' },
                { key: 'isFeatured', label: 'One Cikan', desc: 'Ana sayfada goster' },
                { key: 'isBestseller', label: 'Cok Satan', desc: 'Cok satan rozetini goster' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-center justify-between rounded-xl p-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form[item.key as keyof typeof form] as boolean}
                    onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                    className="h-4 w-4 accent-primary-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <span className="spinner h-4 w-4" /> : <FiSave size={16} />}
              {loading ? 'Kaydediliyor...' : isEdit ? 'Guncelle' : 'Kaydet'}
            </button>
            <Link href="/admin/urunler" className="btn-secondary w-full justify-center py-3">
              <FiArrowLeft size={16} />
              Iptal
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
