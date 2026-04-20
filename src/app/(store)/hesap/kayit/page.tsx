'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.passwordConfirm) {
      toast.error('Sifreler uyusmuyor');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/customer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast.error(data.error || 'Uyelik olusturulamadi');
      setLoading(false);
      return;
    }

    toast.success('Uyelik olusturuldu. E-posta dogrulamasini tamamlayin');
    router.push(`/hesap/giris?verifyEmail=1&email=${encodeURIComponent(form.email)}`);

    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-14">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900">Uye Ol</h1>
        <p className="mt-2 text-sm text-gray-500">Siparislerinizi panelden takip etmek ve bilgilerinizi kaydetmek icin hesap olusturun.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Ad Soyad</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">E-posta</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefon</label>
            <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Sifre</label>
            <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Sifre Tekrar</label>
            <input type="password" className="input-field" value={form.passwordConfirm} onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Olusturuluyor...' : 'Uye Ol'}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-500">
          Zaten hesabiniz var mi?{' '}
          <Link href="/hesap/giris" className="font-semibold text-primary-600 hover:underline">
            Giris yapin
          </Link>
        </p>
      </div>
    </div>
  );
}
