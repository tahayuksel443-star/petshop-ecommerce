'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { PiPawPrintFill } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { STORE_BRAND_NAME } from '@/lib/storefront';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn('admin-credentials', {
      email: form.email,
      password: form.password,
      otp: form.otp,
      redirect: false,
    });

    if (result?.ok) {
      toast.success('Giris basarili');
      router.push('/admin');
    } else if (result?.error === 'MFA_REQUIRED') {
      setMfaRequired(true);
      toast.success('Dogrulama kodu e-posta adresinize gonderildi');
    } else if (result?.error === 'MFA_INVALID') {
      setMfaRequired(true);
      toast.error('Dogrulama kodu gecersiz veya suresi dolmus');
    } else if (result?.error === 'EMAIL_NOT_VERIFIED') {
      toast.error('Admin e-posta adresi henuz dogrulanmamis');
    } else {
      toast.error('E-posta veya sifre hatali');
    }

    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!form.email) {
      toast.error('Once admin e-posta adresini girin');
      return;
    }

    setResendingVerification(true);
    const res = await fetch('/api/auth/email-verification/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, authType: 'ADMIN' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || 'Dogrulama maili gonderilemedi');
    } else {
      toast.success('Admin dogrulama maili gonderildi');
    }
    setResendingVerification(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2b160b] via-[#472716] to-[#7c2d12] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b91c1c] shadow-lg">
              <PiPawPrintFill className="text-white" size={32} />
            </div>
            <h1 className="text-center text-2xl font-black text-gray-900">{STORE_BRAND_NAME} Admin</h1>
            <p className="mt-1 text-sm text-gray-400">Yonetim paneline giris yapin</p>
          </div>

          {searchParams?.get('verified') === '1' ? (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Admin e-posta adresi dogrulandi. Artik giris yapabilirsiniz.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">E-posta</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@kosempetshop.com"
                  className="input-field pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Sifre</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="********"
                  className="input-field pl-10"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {mfaRequired ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Dogrulama Kodu</label>
                <input
                  type="text"
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                  placeholder="6 haneli kod"
                  className="input-field"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 flex w-full justify-center py-3.5 text-base"
            >
              {loading ? <span className="spinner h-5 w-5" /> : <FiLogIn size={18} />}
              {loading ? 'Giris yapiliyor...' : mfaRequired ? 'Kodu Dogrula' : 'Giris Yap'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className="font-semibold text-[#b91c1c] hover:underline disabled:opacity-60"
            >
              {resendingVerification ? 'Gonderiliyor...' : 'Dogrulama mailini tekrar gonder'}
            </button>
            <Link href="/admin/sifre-sifirla" className="font-semibold text-gray-600 hover:underline">
              Sifre sifirla
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
