'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiLayout, FiType, FiBell } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { SiteSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    if (res.ok) {
      toast.success('Ayarlar kaydedildi');
    } else {
      toast.error('Kaydetme basarisiz');
    }

    setSaving(false);
  };

  const updateField = (key: keyof SiteSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="py-14 text-center text-gray-400">Yukleniyor...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Ayarlari</h1>
          <p className="text-sm text-gray-500">Header, hero, ana sayfa bloklari ve footer iceriklerini yonetin</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2.5">
          {saving ? <span className="spinner h-4 w-4" /> : <FiSave size={16} />}
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
            <FiLayout /> Genel Bilgiler
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Site Adi</label>
              <input value={settings.siteName || ''} onChange={(e) => updateField('siteName', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Site Aciklamasi</label>
              <textarea value={settings.siteDescription || ''} onChange={(e) => updateField('siteDescription', e.target.value)} rows={3} className="input-field resize-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Footer Aciklamasi</label>
              <textarea value={settings.footerDescription || ''} onChange={(e) => updateField('footerDescription', e.target.value)} rows={3} className="input-field resize-none" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
            <FiBell /> Ust Bilgi ve Iletisim
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Ust Duyuru Metni</label>
              <input value={settings.announcementText || ''} onChange={(e) => updateField('announcementText', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">E-posta</label>
              <input type="email" value={settings.contactEmail || ''} onChange={(e) => updateField('contactEmail', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefon</label>
              <input value={settings.contactPhone || ''} onChange={(e) => updateField('contactPhone', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Adres</label>
              <textarea value={settings.contactAddress || ''} onChange={(e) => updateField('contactAddress', e.target.value)} rows={2} className="input-field resize-none" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 xl:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
            <FiType /> Hero Alani
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Hero Rozeti</label>
              <input value={settings.heroBadge || ''} onChange={(e) => updateField('heroBadge', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Birincil Buton Metni</label>
              <input value={settings.heroPrimaryText || ''} onChange={(e) => updateField('heroPrimaryText', e.target.value)} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Hero Basligi</label>
              <textarea value={settings.heroTitle || ''} onChange={(e) => updateField('heroTitle', e.target.value)} rows={2} className="input-field resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Hero Aciklamasi</label>
              <textarea value={settings.heroDescription || ''} onChange={(e) => updateField('heroDescription', e.target.value)} rows={3} className="input-field resize-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Birincil Buton Linki</label>
              <input value={settings.heroPrimaryLink || ''} onChange={(e) => updateField('heroPrimaryLink', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Ikincil Buton Metni</label>
              <input value={settings.heroSecondaryText || ''} onChange={(e) => updateField('heroSecondaryText', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Ikincil Buton Linki</label>
              <input value={settings.heroSecondaryLink || ''} onChange={(e) => updateField('heroSecondaryLink', e.target.value)} className="input-field" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Kategori Blogu</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Baslik</label>
              <input value={settings.categoriesTitle || ''} onChange={(e) => updateField('categoriesTitle', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Aciklama</label>
              <textarea value={settings.categoriesDescription || ''} onChange={(e) => updateField('categoriesDescription', e.target.value)} rows={3} className="input-field resize-none" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">One Cikanlar Blogu</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Baslik</label>
              <input value={settings.featuredTitle || ''} onChange={(e) => updateField('featuredTitle', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Aciklama</label>
              <textarea value={settings.featuredDescription || ''} onChange={(e) => updateField('featuredDescription', e.target.value)} rows={3} className="input-field resize-none" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Cok Satanlar Blogu</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Baslik</label>
              <input value={settings.bestsellerTitle || ''} onChange={(e) => updateField('bestsellerTitle', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Aciklama</label>
              <textarea value={settings.bestsellerDescription || ''} onChange={(e) => updateField('bestsellerDescription', e.target.value)} rows={3} className="input-field resize-none" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Sosyal Medya</h3>
          <div className="space-y-4">
            {[
              { key: 'instagram', label: 'Instagram', icon: <FiInstagram />, placeholder: 'https://instagram.com/...' },
              { key: 'facebook', label: 'Facebook', icon: <FiFacebook />, placeholder: 'https://facebook.com/...' },
              { key: 'twitter', label: 'Twitter / X', icon: <FiTwitter />, placeholder: 'https://twitter.com/...' },
              { key: 'youtube', label: 'YouTube', icon: <FiYoutube />, placeholder: 'https://youtube.com/...' },
            ].map((item) => (
              <div key={item.key}>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  {item.icon} {item.label}
                </label>
                <input
                  value={(settings as any)[item.key] || ''}
                  onChange={(e) => updateField(item.key as keyof SiteSettings, e.target.value)}
                  className="input-field"
                  placeholder={item.placeholder}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Kargo Ayarlari</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Kargo Ucreti (TL)</label>
              <input
                type="number"
                step="0.01"
                value={settings.shippingCost || ''}
                onChange={(e) => updateField('shippingCost', Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Ucretsiz Kargo Min. Tutar (TL)</label>
              <input
                type="number"
                step="0.01"
                value={settings.freeShippingMin || ''}
                onChange={(e) => updateField('freeShippingMin', Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
