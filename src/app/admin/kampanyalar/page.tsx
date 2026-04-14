'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Coupon } from '@/types';
import { FiPlus, FiTrash2, FiPercent } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminCampaignsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxUses: '',
    expiresAt: '',
  });

  const fetchCoupons = async () => {
    const res = await fetch('/api/coupons');
    const data = await res.json();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.discountValue) { toast.error('Zorunlu alanları doldurun'); return; }
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, discountValue: Number(form.discountValue), minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null, maxUses: form.maxUses ? Number(form.maxUses) : null }),
    });
    if (res.ok) {
      toast.success('Kupon oluşturuldu');
      setShowModal(false);
      fetchCoupons();
    } else {
      toast.error('Bir hata oluştu');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kampanyalar & Kuponlar</h1>
          <p className="text-gray-500 text-sm">{coupons.length} kupon</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary py-2.5 px-5">
          <FiPlus size={18} />
          Yeni Kupon
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-gray-400">Yükleniyor...</p>
        ) : coupons.length === 0 ? (
          <div className="col-span-3 text-center py-14 text-gray-400">
            <FiPercent size={32} className="mx-auto mb-3 opacity-30" />
            <p>Henüz kupon oluşturulmadı</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon.id} className={`bg-white rounded-2xl border p-5 ${coupon.isActive ? 'border-green-100' : 'border-gray-100 opacity-60'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-lg font-mono text-primary-700">{coupon.code}</p>
                  {coupon.description && <p className="text-xs text-gray-500">{coupon.description}</p>}
                </div>
                <span className={`badge ${coupon.isActive ? 'badge-green' : 'badge-gray'}`}>
                  {coupon.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <p>
                  <strong>İndirim:</strong>{' '}
                  {coupon.discountType === 'PERCENTAGE' ? `%${coupon.discountValue}` : `${coupon.discountValue} TL`}
                </p>
                {coupon.minOrderAmount && <p><strong>Min. Tutar:</strong> {coupon.minOrderAmount} TL</p>}
                {coupon.maxUses && (
                  <p><strong>Kullanım:</strong> {coupon.usedCount}/{coupon.maxUses}</p>
                )}
                {coupon.expiresAt && (
                  <p><strong>Son Kullanma:</strong> {formatDate(coupon.expiresAt)}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg text-gray-900 mb-5">Yeni Kupon Oluştur</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kupon Kodu *</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field font-mono" placeholder="INDIRIM20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Açıklama</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Kısa açıklama" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tür</label>
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="input-field">
                    <option value="PERCENTAGE">Yüzde (%)</option>
                    <option value="FIXED">Sabit (TL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Değer *</label>
                  <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="input-field" placeholder="10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Min. Tutar (TL)</label>
                  <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="input-field" placeholder="200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Max. Kullanım</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="input-field" placeholder="Sınırsız" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Son Kullanma Tarihi</label>
                <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center py-2.5">İptal</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center py-2.5">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
