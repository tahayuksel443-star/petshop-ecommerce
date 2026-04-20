'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import {
  FiShoppingCart,
  FiSearch,
  FiMenu,
  FiX,
  FiPhone,
  FiMail,
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiPackage,
} from 'react-icons/fi';
import { PiPawPrintFill } from 'react-icons/pi';

const categories = [
  { name: 'Kedi Mamasi', slug: 'kedi-mamalari' },
  { name: 'Kopek Mamasi', slug: 'kopek-mamalari' },
];

type NavbarCategory = {
  name: string;
  slug: string;
};

interface NavbarProps {
  siteName?: string | null;
  siteDescription?: string | null;
  announcementText?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  categories?: NavbarCategory[];
}

export default function Navbar({
  siteName = 'Kosem Pet Shop',
  siteDescription,
  announcementText,
  contactEmail,
  contactPhone,
  categories: dynamicCategories,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const pathname = usePathname() ?? '';
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const categoriesToShow = dynamicCategories?.length ? dynamicCategories : categories;
  const searchRef = useRef<HTMLFormElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const isCustomerLoggedIn = session?.user && (session.user as { authType?: string }).authType === 'customer';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setIsSearchOpen(false);
      if (!accountRef.current?.contains(event.target as Node)) setIsAccountOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const normalizedQuery = searchQuery.trim();

    if (normalizedQuery.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(normalizedQuery)}&limit=6&active=true`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          setSearchResults([]);
          return;
        }

        const data = await res.json();
        setSearchResults(data.products || []);
        setIsSearchOpen(true);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setSearchResults([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/urunler?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <div className="hidden bg-[#7f1d1d] py-2 text-xs text-white md:block">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <FiPhone size={12} />
              {contactPhone || '0850 305 07 34'}
            </span>
            <span className="flex items-center gap-1.5">
              <FiMail size={12} />
              {contactEmail || 'destek@kosempetshop.com'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>{announcementText || 'Hizli teslimat ve guvenli alisveris'}</span>
            <Link href="/siparis-takip" className="hover:underline">Siparis Takip</Link>
            <Link href="/sss" className="hover:underline">SSS</Link>
            <Link href="/iletisim" className="hover:underline">Iletisim</Link>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur transition-all duration-300 ${
          isScrolled ? 'shadow-[0_10px_35px_rgba(15,23,42,0.08)]' : 'border-b border-[#efe5d8]'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex min-h-16 items-center justify-between py-3 md:min-h-24 md:py-4">
            <Link href="/" className="flex shrink-0 items-center gap-3 md:gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[#991b1b] shadow-[0_10px_24px_rgba(153,27,27,0.25)] md:h-14 md:w-14">
                <PiPawPrintFill className="text-white" size={24} />
              </div>
              <div className="min-w-0 max-w-[15rem] md:max-w-[21rem]">
                <div className="text-xl font-black tracking-tight text-gray-900 md:text-2xl">
                  {siteName}
                </div>
                <div className="mt-1 text-xs leading-5 text-gray-400 md:text-[13px]">
                  {siteDescription || 'Kedi ve kopek mamasi'}
                </div>
              </div>
            </Link>

            <form ref={searchRef} onSubmit={handleSearch} className="relative mx-6 hidden max-w-2xl flex-1 md:flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setIsSearchOpen(true);
                }}
                placeholder="Marka, icerik veya mama ara..."
                className="w-full rounded-[1.35rem] border border-[#e8dccd] bg-[#fffaf5] py-3.5 pl-5 pr-12 text-sm text-gray-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all focus:border-[#d97706] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#fef3c7]"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-gray-400 transition-colors hover:bg-white hover:text-primary-500">
                <FiSearch size={18} />
              </button>

              {isSearchOpen && searchQuery.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-50 overflow-hidden rounded-[1.75rem] border border-[#efe4d5] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
                  <div className="border-b border-[#f4eadf] bg-[#fffaf5] px-5 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b45309]">Arama Sonuclari</p>
                  </div>
                  {searchLoading ? (
                    <div className="px-5 py-6 text-sm text-gray-400">Urunler araniyor...</div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="max-h-[26rem] overflow-y-auto p-2">
                        {searchResults.map((product) => (
                          <Link key={product.id} href={`/urunler/${product.slug}`} onClick={() => setIsSearchOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-[#fff7ed]">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#fffaf5]">
                              <Image src={product.images?.[0] || '/images/placeholder-product.svg'} alt={product.name} fill className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              {product.category?.name && <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">{product.category.name}</p>}
                              <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
                              <p className="mt-1 text-sm font-bold text-primary-600">{formatPrice(Number(product.discountPrice ?? product.price))}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-[#f4eadf] p-2">
                        <Link href={`/urunler?search=${encodeURIComponent(searchQuery)}`} onClick={() => setIsSearchOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50">
                          Tum sonuclari gor
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="px-5 py-6 text-sm text-gray-400">Bu aramayla eslesen urun bulunamadi.</div>
                  )}
                </div>
              )}
            </form>

            <div className="flex items-center gap-2 md:gap-3">
              <div ref={accountRef} className="relative hidden md:block">
                <button
                  onClick={() => setIsAccountOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-[1.2rem] border border-[#eadbc8] px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#fff7ed]"
                >
                  <FiUser size={17} />
                  {isCustomerLoggedIn ? session.user?.name?.split(' ')[0] : 'Uye Girisi'}
                  <FiChevronDown size={14} className={`transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAccountOpen ? (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-[1.5rem] border border-[#efe4d5] bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
                    {isCustomerLoggedIn ? (
                      <>
                        <Link href="/hesap/siparisler" className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-gray-700 hover:bg-[#fff7ed]">
                          <FiPackage size={16} />
                          Siparislerim
                        </Link>
                        <Link href="/siparis-takip" className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-gray-700 hover:bg-[#fff7ed]">
                          <FiPackage size={16} />
                          Siparis Takip
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <FiLogOut size={16} />
                          Cikis Yap
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/hesap/giris" className="block rounded-2xl px-4 py-3 text-sm text-gray-700 hover:bg-[#fff7ed]">Uye Girisi</Link>
                        <Link href="/hesap/kayit" className="block rounded-2xl px-4 py-3 text-sm text-gray-700 hover:bg-[#fff7ed]">Uye Ol</Link>
                        <Link href="/siparis-takip" className="block rounded-2xl px-4 py-3 text-sm text-gray-700 hover:bg-[#fff7ed]">Uyeliksiz Siparis Takip</Link>
                      </>
                    )}
                  </div>
                ) : null}
              </div>

              <Link
                href="/sepet"
                className="relative flex items-center gap-2 rounded-[1.2rem] bg-[#991b1b] px-3 py-2 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(153,27,27,0.25)] transition-all hover:bg-[#7f1d1d] hover:shadow-[0_16px_32px_rgba(127,29,29,0.3)] md:px-4 md:py-3"
              >
                <FiShoppingCart size={18} />
                <span className="hidden md:inline">Sepet</span>
                {totalItems > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-primary-100 bg-white text-xs font-bold text-[#991b1b] shadow">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden">
                {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>

          <nav className="hidden items-center gap-1 pb-5 md:flex">
            <Link href="/" className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${pathname === '/' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-[#fff7ed] hover:text-gray-900'}`}>Ana Sayfa</Link>
            <div className="relative" onMouseEnter={() => setIsCategoryOpen(true)} onMouseLeave={() => setIsCategoryOpen(false)}>
              <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-[#fff7ed] hover:text-gray-900">
                Mama Cesitleri
                <FiChevronDown size={14} className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoryOpen && (
                <>
                  <div className="absolute left-0 top-full h-3 w-56" />
                  <div className="absolute left-0 top-[calc(100%+0.25rem)] z-50 w-64 rounded-[1.75rem] border border-[#efe4d5] bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                    {categoriesToShow.map((cat) => (
                      <Link key={cat.slug} href={`/urunler?kategori=${cat.slug}`} className="block rounded-2xl px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600">
                        {cat.name}
                      </Link>
                    ))}
                    <div className="mt-2 border-t border-gray-100 pt-2">
                      <Link href="/urunler" className="block rounded-2xl px-4 py-3 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50">Tum mamalari gor</Link>
                    </div>
                  </div>
                </>
              )}
            </div>
            <Link href="/urunler" className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${pathname.startsWith('/urunler') ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-[#fff7ed] hover:text-gray-900'}`}>Tum Mamalar</Link>
            <Link href="/siparis-takip" className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${pathname === '/siparis-takip' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-[#fff7ed] hover:text-gray-900'}`}>Siparis Takip</Link>
            <Link href="/iletisim" className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${pathname === '/iletisim' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-[#fff7ed] hover:text-gray-900'}`}>Iletisim</Link>
          </nav>
        </div>

        {isMenuOpen && (
          <div className="space-y-1 border-t border-gray-100 bg-white px-4 py-4 shadow-lg md:hidden">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Mama ara..." className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-10 text-sm focus:border-primary-400 focus:outline-none" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><FiSearch size={18} /></button>
            </form>

            {[
              { href: '/', label: 'Ana Sayfa' },
              { href: '/urunler', label: 'Tum Mamalar' },
              { href: '/siparis-takip', label: 'Siparis Takip' },
              { href: '/iletisim', label: 'Iletisim' },
              { href: '/sss', label: 'Sik Sorulan Sorular' },
            ].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="block rounded-2xl px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-600">
                {item.label}
              </Link>
            ))}

            <div className="border-t border-gray-100 pt-2">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Hesabim</p>
              {isCustomerLoggedIn ? (
                <>
                  <Link href="/hesap/siparisler" onClick={() => setIsMenuOpen(false)} className="block rounded-2xl px-3 py-3 text-sm text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600">Siparislerim</Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="block w-full rounded-2xl px-3 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    Cikis Yap
                  </button>
                </>
              ) : (
                <>
                  <Link href="/hesap/giris" onClick={() => setIsMenuOpen(false)} className="block rounded-2xl px-3 py-3 text-sm text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600">Uye Girisi</Link>
                  <Link href="/hesap/kayit" onClick={() => setIsMenuOpen(false)} className="block rounded-2xl px-3 py-3 text-sm text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600">Uye Ol</Link>
                </>
              )}
            </div>

            <div className="border-t border-gray-100 pt-2">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Mama Cesitleri</p>
              {categoriesToShow.map((cat) => (
                <Link key={cat.slug} href={`/urunler?kategori=${cat.slug}`} onClick={() => setIsMenuOpen(false)} className="block rounded-2xl px-3 py-3 text-sm text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
