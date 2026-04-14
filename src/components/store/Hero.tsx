'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiArrowRight, FiShoppingBag, FiStar, FiTruck } from 'react-icons/fi';

const slides = [
  {
    tag: 'Bugunun Mama Firsati',
    title: 'Kedi ve kopek\nmamasinda hesapli sepet',
    desc: 'Mahalle petshop samimiyeti, buyuk depo fiyati. Royal Canin, Pro Plan, N&D ve Reflex gibi markalarda gunluk kampanyalar.',
    cta: 'Mama Alisverisine Basla',
    ctaLink: '/urunler',
    secondary: 'Indirimli Urunler',
    secondaryLink: '/urunler?indirimli=true',
    bg: 'from-[#fff4e6] via-white to-[#fde2e2]',
    accent: 'bg-[#fff1f2] text-[#b91c1c]',
    emoji: '🐾',
    emojiBg: 'bg-[#fde2e2]',
  },
  {
    tag: 'Cok satanlar',
    title: 'Buyuk boy mama\nstokta, fiyat yerinde',
    desc: 'Yetiskin, yavru ve kisirlastirilmis serilerde secili urunler; hizli kargo ve guvenli odeme ile kapinda.',
    cta: 'Kopek Mamalarini Incele',
    ctaLink: '/urunler?kategori=kopek-mamalari',
    secondary: 'Kedi Mamalarini Gor',
    secondaryLink: '/urunler?kategori=kedi-mamalari',
    bg: 'from-[#fff7ed] via-[#fffaf5] to-[#ffedd5]',
    accent: 'bg-[#ffedd5] text-[#9a3412]',
    emoji: '🦴',
    emojiBg: 'bg-[#ffedd5]',
  },
];

interface HeroProps {
  heroBadge?: string | null;
  heroTitle?: string | null;
  heroDescription?: string | null;
  heroPrimaryText?: string | null;
  heroPrimaryLink?: string | null;
  heroSecondaryText?: string | null;
  heroSecondaryLink?: string | null;
}

export default function Hero({
  heroBadge,
  heroTitle,
  heroDescription,
  heroPrimaryText,
  heroPrimaryLink,
  heroSecondaryText,
  heroSecondaryLink,
}: HeroProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const baseSlide = slides[current];
  const slide =
    current === 0
      ? {
          ...baseSlide,
          tag: heroBadge || baseSlide.tag,
          title: heroTitle || baseSlide.title,
          desc: heroDescription || baseSlide.desc,
          cta: heroPrimaryText || baseSlide.cta,
          ctaLink: heroPrimaryLink || baseSlide.ctaLink,
          secondary: heroSecondaryText || baseSlide.secondary,
          secondaryLink: heroSecondaryLink || baseSlide.secondaryLink,
        }
      : baseSlide;

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${slide.bg} transition-all duration-500`}>
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#b91c1c]" />
      <div className="container relative mx-auto px-4 pb-14 pt-14 md:pb-20 md:pt-16">
        <div className="grid grid-cols-1 items-center gap-10 rounded-[2.25rem] border border-[#f5e6d5] bg-white/92 p-7 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-sm md:p-12 lg:grid-cols-2">
          <div className="animate-fade-in">
            <span className={`mb-4 inline-block rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${slide.accent}`}>
              {slide.tag}
            </span>
            <h1 className="mb-4 whitespace-pre-line text-4xl font-black leading-tight text-gray-900 md:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-600">
              {slide.desc}
            </p>

            <div className="mb-10 flex flex-wrap gap-3">
              <Link href={slide.ctaLink} className="btn-primary px-8 py-3.5 text-base">
                <FiShoppingBag size={18} />
                {slide.cta}
              </Link>
              <Link href={slide.secondaryLink} className="btn-secondary px-6 py-3.5 text-base">
                {slide.secondary}
                <FiArrowRight size={16} />
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              {[
                { icon: <FiStar className="text-amber-500" />, val: '4.9/5', label: 'Gercek Musteri Yorumu' },
                { icon: <FiTruck className="text-primary-500" />, val: '81 Il', label: 'Hizli Teslimat' },
                { icon: <FiShoppingBag className="text-green-500" />, val: '2 Ana Kategori', label: 'Kedi ve Kopek Mamasi' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight text-gray-900">{stat.val}</p>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden items-center justify-center lg:flex">
            <div className="relative">
              <div className={`flex h-[21rem] w-[21rem] items-center justify-center rounded-full border-[16px] border-white text-[132px] shadow-[0_30px_60px_rgba(15,23,42,0.14)] ${slide.emojiBg}`}>
                {slide.emoji}
              </div>

              <div className="absolute -right-6 top-3 flex min-w-[180px] items-center gap-3 rounded-2xl bg-white p-4 shadow-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                  <span className="text-lg font-bold text-[#b91c1c]">%</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Secili mamalarda</p>
                  <p className="text-sm font-bold text-gray-900">Sepette ekstra indirim</p>
                </div>
              </div>

              <div className="absolute -bottom-2 -left-6 flex min-w-[180px] items-center gap-3 rounded-2xl bg-white p-4 shadow-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                  <FiTruck className="text-primary-500" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Siparis takibi acik</p>
                  <p className="text-sm font-bold text-gray-900">Ayni gun cikis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2 lg:absolute lg:bottom-7 lg:left-1/2 lg:mt-0 lg:-translate-x-1/2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-primary-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
