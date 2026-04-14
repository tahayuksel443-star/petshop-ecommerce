'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiGrid,
  FiPackage,
  FiTag,
  FiShoppingBag,
  FiUsers,
  FiPercent,
  FiSettings,
} from 'react-icons/fi';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <FiGrid size={16} /> },
  { href: '/admin/urunler', label: 'Urunler', icon: <FiPackage size={16} /> },
  { href: '/admin/kategoriler', label: 'Kategoriler', icon: <FiTag size={16} /> },
  { href: '/admin/siparisler', label: 'Siparisler', icon: <FiShoppingBag size={16} /> },
  { href: '/admin/musteriler', label: 'Musteriler', icon: <FiUsers size={16} /> },
  { href: '/admin/kampanyalar', label: 'Kampanyalar', icon: <FiPercent size={16} /> },
  { href: '/admin/ayarlar', label: 'Ayarlar', icon: <FiSettings size={16} /> },
];

export default function AdminMobileNav() {
  const pathname = usePathname() ?? '';

  return (
    <div className="border-b border-gray-100 bg-white px-4 py-3 md:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
