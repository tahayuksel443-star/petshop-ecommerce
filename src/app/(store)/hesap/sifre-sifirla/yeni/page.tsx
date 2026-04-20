'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CustomerResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      toast.error('Sifreler uyusmuyor');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/password-reset/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast.error(data.error || 'Sifre yenilenemedi');
      setLoading(false);
      return;
    }

    toast.success('Sifreniz yenilendi');
    router.push('/hesap/giris?reset=1');
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-14">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900">Yeni Sifre Belirleyin</h1>
        <p className="mt-2 text-sm text-gray-500">En az bir harf ve bir rakam iceren yeni sifrenizi girin.</p>

        {!token ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Gecerli bir sifre yenileme baglantisi bulunamadi.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Yeni sifre</label>
              <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Yeni sifre tekrar</label>
              <input type="password" className="input-field" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Kaydediliyor...' : 'Sifreyi yenile'}
            </button>
          </form>
        )}

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
