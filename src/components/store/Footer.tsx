import Link from 'next/link';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { PiPawPrintFill } from 'react-icons/pi';
import { STORE_BRAND_NAME } from '@/lib/storefront';

interface FooterProps {
  siteName?: string | null;
  footerDescription?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactAddress?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  youtube?: string | null;
}

export default function Footer({
  siteName = STORE_BRAND_NAME,
  footerDescription,
  contactPhone,
  contactEmail,
  contactAddress,
  instagram,
  facebook,
  twitter,
  youtube,
}: FooterProps) {
  return (
    <footer className="bg-[#20120b] text-gray-300">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Link href="/" className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#991b1b] shadow-md">
                <PiPawPrintFill className="text-white" size={20} />
              </div>
              <div>
                <span className="text-xl font-bold text-white">{siteName}</span>
                <p className="text-xs text-gray-500">Kedi ve kopek mamasi odakli online pet market</p>
              </div>
            </Link>

            <p className="mb-5 max-w-md text-sm leading-relaxed text-gray-400">
              {footerDescription || 'Sade vitrin, guven veren siparis akisi ve secili mama markalariyla ihtiyacin olan urune daha kolay ulas.'}
            </p>

            <div className="grid max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { title: 'Ayni Gun Kargo', desc: 'Hizli siparis cikisi' },
                { title: 'Guvenli Odeme', desc: 'iyzico altyapisi' },
                { title: 'Telefon Destegi', desc: 'Gercek destek hatti' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Hizli Baglantilar</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Ana Sayfa' },
                { href: '/urunler', label: 'Tum Mamalar' },
                { href: '/urunler?kategori=kedi-mamalari', label: 'Kedi Mamasi' },
                { href: '/urunler?kategori=kopek-mamalari', label: 'Kopek Mamasi' },
                { href: '/iletisim', label: 'Iletisim' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-400 transition-colors hover:text-primary-400">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Iletisim</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <FiPhone size={15} className="mt-0.5 shrink-0 text-primary-400" />
                <span>{contactPhone || '0850 305 07 34'}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <FiMail size={15} className="mt-0.5 shrink-0 text-primary-400" />
                <span>{contactEmail || 'destek@kosempetshop.com'}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <FiMapPin size={15} className="mt-0.5 shrink-0 text-primary-400" />
                <span>{contactAddress || 'Ikitelli OSB, Basaksehir, Istanbul'}</span>
              </li>
            </ul>

            <div className="mt-5 flex items-center gap-3">
              {[
                { Icon: FiInstagram, href: instagram },
                { Icon: FiFacebook, href: facebook },
                { Icon: FiTwitter, href: twitter },
                { Icon: FiYoutube, href: youtube },
              ].map(({ Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href || '#'}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-gray-400 transition-colors hover:bg-primary-500 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 md:flex-row">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {siteName}. Tum haklari saklidir.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Guvenli odeme:</span>
            <div className="flex items-center gap-2">
              <span className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-gray-400">iyzico</span>
              <span className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-gray-400">VISA</span>
              <span className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-gray-400">MC</span>
              <span className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-gray-400">Troy</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
