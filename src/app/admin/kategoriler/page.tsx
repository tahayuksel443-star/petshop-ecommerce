'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<(Category & { _count: { products: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '', sortOrder: '0' });

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditing(cat);
      setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', sortOrder: cat.sortOrder?.toString() || '0' });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', icon: '', sortOrder: '0' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('İsim zorunludur'); return; }
    const payload = { ...form, sortOrder: Number(form.sortOrder) };
    const url = editing ? `/api/categories/${editing.id}` : '/api/categories';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      toast.success(editing ? 'Kategori güncellendi' : 'Kategori eklendi');
      setShowModal(false);
      fetchCategories();
    } else {
      toast.error('Bir hata oluştu');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" kategorisini silmek istiyor musunuz?`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Kategori silindi');
      fetchCategories();
    } else {
      toast.error('Silme başarısız - bu kategoride ürünler olabilir');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
          <p className="text-gray-500 text-sm">{categories.length} kategori</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary py-2.5 px-5">
          <FiPlus size={18} />
          Yeni Kategori
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-14 text-gray-400">Yükleniyor...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Kategori</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Açıklama</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Ürün Sayısı</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Sıra</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon || '📦'}</span>
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate">{cat.description || '-'}</td>
                  <td className="py-3 px-4">
                    <span className="badge badge-gray">{(cat as any)._count?.products || 0} ürün</span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{cat.sortOrder}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openModal(cat)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg text-gray-900 mb-5">
              {editing ? 'Kategori Düzenle' : 'Yeni Kategori'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Adı *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="örn: Kedi Mamaları" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">İkon (Emoji)</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field" placeholder="🐱" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Açıklama</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Kısa açıklama..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sıralama</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center py-2.5">İptal</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center py-2.5">
                {editing ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
