'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PiPawPrintFill } from 'react-icons/pi';
import {
  FiExternalLink,
  FiGrid,
  FiPackage,
  FiPercent,
  FiSettings,
  FiShoppingBag,
  FiTag,
  FiUsers,
} from 'react-icons/fi';
import { STORE_BRAND_NAME } from '@/lib/storefront';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <FiGrid size={18} /> },
  { href: '/admin/urunler', label: 'Urunler', icon: <FiPackage size={18} /> },
  { href: '/admin/kategoriler', label: 'Kategoriler', icon: <FiTag size={18} /> },
  { href: '/admin/siparisler', label: 'Siparisler', icon: <FiShoppingBag size={18} /> },
  { href: '/admin/musteriler', label: 'Musteriler', icon: <FiUsers size={18} /> },
  { href: '/admin/kampanyalar', label: 'Kampanyalar', icon: <FiPercent size={18} /> },
  { href: '/admin/ayarlar', label: 'Site Ayarlari', icon: <FiSettings size={18} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname() ?? '';

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-gray-100 bg-white md:flex">
      <div className="border-b border-gray-100 p-5">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 shadow-md">
            <PiPawPrintFill className="text-white" size={20} />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">{STORE_BRAND_NAME}</span>
            <p className="text-xs text-gray-400 -mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-primary-50 hover:text-primary-600"
        >
          <FiExternalLink size={15} />
          Siteyi Goruntule
        </Link>
      </div>
    </aside>
  );
}
