'use client';

import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedForm = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (normalizedForm.name.length < 2) {
      toast.error('Ad soyad en az 2 karakter olmali');
      return;
    }

    if (!normalizedForm.email) {
      toast.error('E-posta alani zorunlu');
      return;
    }

    if (!normalizedForm.subject) {
      toast.error('Lutfen bir konu secin');
      return;
    }

    if (normalizedForm.message.length < 10) {
      toast.error('Mesaj en az 10 karakter olmali');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedForm),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detailedMessage =
          data?.details?.fieldErrors
            ? Object.values(data.details.fieldErrors).flat().filter(Boolean)[0]
            : null;

        toast.error(detailedMessage || data.error || 'Mesaj gonderilemedi');
        return;
      }

      toast.success('Mesajiniz alindi. En kisa surede size donus yapacagiz.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Mesaj gonderilirken baglanti hatasi olustu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Mesaj Gonder</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Adiniz *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Adiniz Soyadiniz"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">E-posta *</label>
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
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Konu *</label>
          <select
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="input-field"
            required
          >
            <option value="">Konu secin</option>
            <option>Siparis Hakkinda</option>
            <option>Urun Hakkinda</option>
            <option>Iade / Degisim</option>
            <option>Odeme Sorunu</option>
            <option>Diger</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Mesajiniz *</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Mesajinizi buraya yazin..."
            rows={6}
            className="input-field resize-none"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
          {loading ? <span className="spinner h-5 w-5" /> : <FiSend size={18} />}
          {loading ? 'Gonderiliyor...' : 'Gonder'}
        </button>
      </form>
    </div>
  );
}
