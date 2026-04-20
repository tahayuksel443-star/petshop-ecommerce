'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

function sanitizeCallbackUrl(callbackUrl: string | null) {
  if (!callbackUrl) return '/hesap/siparisler';
  if (!callbackUrl.startsWith('/')) return '/hesap/siparisler';
  if (callbackUrl.startsWith('//')) return '/hesap/siparisler';
  return callbackUrl;
}

export default function CustomerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams?.get('callbackUrl') || null);
  const prefilledEmail = searchParams?.get('email') || '';
  const [form, setForm] = useState({ email: prefilledEmail, password: '' });
  const [loading, setLoading] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn('customer-credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.ok) {
      toast.success('Giris basarili');
      router.push(callbackUrl);
      router.refresh();
    } else {
      if (result?.error === 'EMAIL_NOT_VERIFIED') {
        toast.error('Once e-posta adresinizi dogrulayin');
      } else {
        toast.error('E-posta veya sifre hatali');
      }
    }

    setLoading(false);
  };

  const handleResendVerification = async () => {
    const email = (form.email || prefilledEmail).trim();
    if (!email) {
      toast.error('Once e-posta adresinizi girin');
      return;
    }

    setResendingVerification(true);

    const res = await fetch('/api/auth/email-verification/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, authType: 'CUSTOMER' }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || 'Dogrulama maili gonderilemedi');
    } else {
      toast.success('Dogrulama maili tekrar gonderildi');
    }

    setResendingVerification(false);
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-14">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900">Uye Girisi</h1>
        <p className="mt-2 text-sm text-gray-500">Siparislerinizi takip etmek ve daha hizli odeme icin giris yapin.</p>

        {searchParams?.get('verified') === '1' ? (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            E-posta adresiniz dogrulandi. Artik giris yapabilirsiniz.
          </div>
        ) : null}

        {searchParams?.get('verified') === '0' ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Dogrulama baglantisi gecersiz veya suresi dolmus.
          </div>
        ) : null}

        {searchParams?.get('verifyEmail') === '1' ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Hesabiniz olusturuldu. Giris yapmadan once e-posta kutunuzdaki dogrulama baglantisina tiklayin.
          </div>
        ) : null}

        {searchParams?.get('reset') === '1' ? (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Sifreniz yenilendi. Yeni sifrenizle giris yapabilirsiniz.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">E-posta</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={prefilledEmail || 'ornek@mail.com'}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Sifre</label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Giris yapiliyor...' : 'Giris Yap'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendingVerification}
            className="font-semibold text-primary-600 hover:underline disabled:opacity-60"
          >
            {resendingVerification ? 'Gonderiliyor...' : 'Dogrulama mailini tekrar gonder'}
          </button>
          <Link href="/hesap/sifre-sifirla" className="font-semibold text-gray-600 hover:underline">
            Sifremi unuttum
          </Link>
        </div>

        <p className="mt-5 text-sm text-gray-500">
          Hesabiniz yok mu?{' '}
          <Link href="/hesap/kayit" className="font-semibold text-primary-600 hover:underline">
            Uye olun
          </Link>
        </p>
      </div>
    </div>
  );
}
