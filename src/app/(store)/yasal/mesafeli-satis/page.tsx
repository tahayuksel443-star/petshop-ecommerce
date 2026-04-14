import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mesafeli Satış Sözleşmesi' };

export default function DistanceSalesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mesafeli Satış Sözleşmesi</h1>
      <p className="text-gray-400 text-sm mb-8">Son güncelleme: Ocak 2024</p>
      <div className="space-y-6 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Madde 1 - Taraflar</h2>
          <p><strong>Satıcı:</strong> PawShop E-Ticaret A.Ş., Bağcılar, İstanbul</p>
          <p className="mt-1"><strong>Alıcı:</strong> Sipariş sırasında belirtilen müşteri bilgileri</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Madde 2 - Sözleşmenin Konusu</h2>
          <p>Bu sözleşme, alıcının PawShop web sitesi üzerinden elektronik ortamda siparişini verdiği ürünlerin satışı ve teslimatına ilişkin tarafların hak ve yükümlülüklerini kapsamaktadır.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Madde 3 - Teslimat</h2>
          <p>Ürünler, sipariş tarihinden itibaren en geç 30 gün içinde teslim edilir. Kargo süresi 1-5 iş günüdür.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Madde 4 - İptal ve İade</h2>
          <p>Alıcı, ürünü teslim aldıktan itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin iade hakkına sahiptir. İade edilen ürün, teslim alınan haliyle iade edilmelidir.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Madde 5 - Ödeme</h2>
          <p>Ödeme, kredi/banka kartı ile iyzico güvenli ödeme altyapısı üzerinden yapılmaktadır. Ödeme tutarı sipariş onayında belirtilen tutardır.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Madde 6 - Uyuşmazlık</h2>
          <p>Bu sözleşmeden doğan uyuşmazlıklarda İstanbul mahkemeleri ve icra daireleri yetkilidir.</p>
        </section>
      </div>
    </div>
  );
}
