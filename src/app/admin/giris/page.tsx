'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { PiPawPrintFill } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { STORE_BRAND_NAME } from '@/lib/storefront';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.ok) {
      toast.success('Giris basarili');
      router.push('/admin');
    } else {
      toast.error('E-posta veya sifre hatali');
    }

    setLoading(false);
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 flex w-full justify-center py-3.5 text-base"
            >
              {loading ? <span className="spinner h-5 w-5" /> : <FiLogIn size={18} />}
              {loading ? 'Giris yapiliyor...' : 'Giris Yap'}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-center text-xs text-amber-700">
              <strong>Test hesabi:</strong>
              <br />
              admin@kosempetshop.com / admin123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
