import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Kullanım Koşulları' };

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Kullanım Koşulları</h1>
      <p className="text-gray-400 text-sm mb-8">Son güncelleme: Ocak 2024</p>
      <div className="space-y-6 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Kabul</h2>
          <p>PawShop web sitesini kullanarak bu koşulları kabul etmiş sayılırsınız. Koşulları kabul etmiyorsanız siteyi kullanmayınız.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Hizmet</h2>
          <p>PawShop, evcil hayvan ürünleri satışı yapan bir e-ticaret platformudur. Ürün bilgileri, fiyatlar ve stok durumu değişebilir.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Kullanıcı Yükümlülükleri</h2>
          <p>Kullanıcılar, doğru kişisel bilgi sağlamak, hesap güvenliğini korumak ve platformu yasalara uygun kullanmakla yükümlüdür.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Fikri Mülkiyet</h2>
          <p>Sitedeki tüm içerik (metinler, görseller, logolar) PawShop'a aittir. İzinsiz kopyalanması yasaktır.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Sorumluluk Sınırı</h2>
          <p>PawShop, ürün kullanımından doğabilecek zararlar için mevzuatta belirtilen sınırlar çerçevesinde sorumludur.</p>
        </section>
      </div>
    </div>
  );
}
