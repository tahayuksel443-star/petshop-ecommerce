'use client';

import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const faqs = [
  { q: 'Kargo süresi ne kadardır?', a: 'Siparişleriniz genellikle 1-3 iş günü içinde teslim edilir. İstanbul içi siparişler aynı gün veya ertesi gün teslim edilebilir.' },
  { q: 'Ücretsiz kargo şartı nedir?', a: '250 TL ve üzeri alışverişlerde kargo ücretsizdir. Altındaki alışverişlerde 29,90 TL kargo ücreti uygulanır.' },
  { q: 'İade koşulları nelerdir?', a: 'Teslim tarihinden itibaren 14 gün içinde, açılmamış ve orijinal ambalajındaki ürünleri iade edebilirsiniz. Bozuk veya hatalı ürünlerde süre fark etmeksizin iade yapılır.' },
  { q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?', a: 'Kredi kartı, banka kartı ve iyzico altyapısı ile güvenli ödeme yapabilirsiniz. Taksit seçenekleri bazı kartlar için mevcuttur.' },
  { q: 'Sipariş takibi nasıl yapabilirim?', a: 'Siparişiniz kargoya verildiğinde e-posta ve SMS ile kargo takip numarası gönderilir. Bu numarayla kargo firmasının web sitesinden takip edebilirsiniz.' },
  { q: 'Mama tazeliği nasıl garanti edilir?', a: 'Tüm mamalarımızı sıcaklık kontrollü depomuzda saklıyoruz. Son kullanma tarihi ve seri numarasını her zaman kontrol ediyor, en taze ürünleri gönderiyoruz.' },
  { q: 'Toplu alımda indirim var mı?', a: 'Evet! Belirli ürünlerde toplu alım indirimleri sunuyoruz. Detaylar için müşteri hizmetlerimizi arayabilirsiniz.' },
  { q: 'Kupon kodunu nasıl kullanabilirim?', a: 'Sepet sayfasında "Kupon Kodu" alanına kodunuzu girerek uygulayabilirsiniz. İlk alışverişte geçerli HOSGELDIN10 koduyla %10 indirim kazanabilirsiniz.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left gap-3"
      >
        <span className="font-semibold text-gray-900 text-sm md:text-base">{q}</span>
        <FiChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <p className="text-gray-600 text-sm leading-relaxed pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div>
      <div className="bg-gradient-to-br from-primary-50 to-amber-50 py-16 px-4 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-3">Sık Sorulan Sorular</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Merak ettiklerinizi aşağıda bulabilirsiniz. Cevap bulamadıysanız bize yazın.
        </p>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-3">
          {faqs.map((faq) => <FaqItem key={faq.q} {...faq} />)}
        </div>
      </div>
    </div>
  );
}
