'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CustomerForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/auth/password-reset/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, authType: 'CUSTOMER' }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || 'Sifre sifirlama istegi gonderilemedi');
    } else {
      toast.success('Eger hesap uygunsa sifre yenileme maili gonderildi');
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-14">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900">Sifremi Unuttum</h1>
        <p className="mt-2 text-sm text-gray-500">Kayitli e-posta adresinizi girin, size sifre yenileme baglantisi gonderelim.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">E-posta</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Gonderiliyor...' : 'Sifre yenileme baglantisi gonder'}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-500">
          Giris sayfasina donmek icin{' '}
          <Link href="/hesap/giris" className="font-semibold text-primary-600 hover:underline">
            tiklayin
          </Link>
        </p>
      </div>
    </div>
  );
}
