'use client';

import { signOut } from 'next-auth/react';
import { FiLogOut, FiUser, FiBell } from 'react-icons/fi';

interface Props {
  user?: { name?: string | null; email?: string | null };
}

export default function AdminHeader({ user }: Props) {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">Yönetim Paneli</h2>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 transition-colors">
          <FiBell size={16} />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
          <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
            <FiUser size={16} className="text-primary-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/giris' })}
            className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
            title="Çıkış Yap"
          >
            <FiLogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
