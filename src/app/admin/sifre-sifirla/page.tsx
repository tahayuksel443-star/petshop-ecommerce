'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/auth/password-reset/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, authType: 'ADMIN' }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || 'Sifre yenileme baglantisi gonderilemedi');
    } else {
      toast.success('Eger admin hesabi uygunsa sifre yenileme maili gonderildi');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2b160b] via-[#472716] to-[#7c2d12] p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-black text-gray-900">Admin Sifre Sifirlama</h1>
        <p className="mt-2 text-sm text-gray-500">Admin e-posta adresinizi girin, size sifre yenileme baglantisi gonderelim.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Admin e-postasi</label>
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Gonderiliyor...' : 'Sifre yenileme baglantisi gonder'}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-500">
          Admin girisine donmek icin{' '}
          <Link href="/admin/giris" className="font-semibold text-[#b91c1c] hover:underline">
            tiklayin
          </Link>
        </p>
      </div>
    </div>
  );
}
