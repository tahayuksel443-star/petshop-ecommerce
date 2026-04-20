'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CustomerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/hesap/siparisler';
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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
      toast.error('E-posta veya sifre hatali');
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-14">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900">Uye Girisi</h1>
        <p className="mt-2 text-sm text-gray-500">Siparislerinizi takip etmek ve daha hizli odeme icin giris yapin.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">E-posta</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
