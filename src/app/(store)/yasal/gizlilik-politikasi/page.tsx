import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Gizlilik Politikası' };

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Gizlilik Politikası</h1>
      <p className="text-gray-400 text-sm mb-8">Son güncelleme: Ocak 2024</p>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Toplanan Bilgiler</h2>
          <p>PawShop olarak, hizmetlerimizi sunmak amacıyla şu kişisel bilgileri toplamaktayız: ad-soyad, e-posta adresi, telefon numarası, teslimat adresi ve ödeme bilgileri.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Bilgilerin Kullanımı</h2>
          <p>Toplanan bilgiler yalnızca sipariş işleme, teslimat, müşteri hizmetleri ve kampanya bildirimleri (onay verildiğinde) amacıyla kullanılmaktadır.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Bilgi Güvenliği</h2>
          <p>Kişisel bilgileriniz SSL şifreleme ile korunmaktadır. Ödeme bilgileriniz iyzico güvenli ödeme altyapısı üzerinden işlenmekte, sistemlerimizde saklanmamaktadır.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Üçüncü Taraflarla Paylaşım</h2>
          <p>Bilgileriniz, kargo hizmetleri ve ödeme sağlayıcısı dışında herhangi bir üçüncü tarafla paylaşılmamaktadır.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Çerezler</h2>
          <p>Web sitemiz, kullanıcı deneyimini geliştirmek amacıyla çerez kullanmaktadır. Tarayıcı ayarlarınızdan çerez kullanımını kısıtlayabilirsiniz.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. İletişim</h2>
          <p>Gizlilik politikamız hakkında sorularınız için: <strong>info@pawshop.com.tr</strong></p>
        </section>
      </div>
    </div>
  );
}
