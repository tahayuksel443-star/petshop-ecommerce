'use client';

import { useState } from 'react';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Mesajınız alındı! En kısa sürede size dönüş yapacağız.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-50 to-amber-50 py-16 px-4 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-3">İletişim</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Sorularınız için bize ulaşın. Haftaiçi 09:00-18:00 arası hizmetinizdeyiz.
        </p>
      </div>

      <div className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            {[
              { icon: <FiPhone className="text-primary-500" size={20} />, title: 'Telefon', lines: ['+90 (212) 555 0123', '+90 (212) 555 0124'] },
              { icon: <FiMail className="text-primary-500" size={20} />, title: 'E-posta', lines: ['info@pawshop.com.tr', 'destek@pawshop.com.tr'] },
              { icon: <FiMapPin className="text-primary-500" size={20} />, title: 'Adres', lines: ['Bağcılar Mahallesi', 'İstanbul, Türkiye'] },
              { icon: <FiClock className="text-primary-500" size={20} />, title: 'Çalışma Saatleri', lines: ['Haftaiçi: 09:00-18:00', 'Cumartesi: 10:00-16:00'] },
            ].map((item) => (
              <div key={item.title} className="card p-5 flex gap-4">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-0.5">{item.title}</p>
                  {item.lines.map((line) => (
                    <p key={line} className="text-sm text-gray-500">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Mesaj Gönder</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adınız *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Adınız Soyadınız"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="ornek@email.com"
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Konu *</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Konu seçin</option>
                    <option>Sipariş Hakkında</option>
                    <option>Ürün Hakkında</option>
                    <option>İade / Değişim</option>
                    <option>Ödeme Sorunu</option>
                    <option>Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mesajınız *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Mesajınızı buraya yazın..."
                    rows={6}
                    className="input-field resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3.5"
                >
                  {loading ? <span className="spinner w-5 h-5" /> : <FiSend size={18} />}
                  {loading ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
