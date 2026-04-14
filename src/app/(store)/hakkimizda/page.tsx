import { Metadata } from 'next';
import { FiHeart, FiAward, FiTruck, FiUsers } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'PawShop hakkında bilgi edinin. Misyonumuz, değerlerimiz ve ekibimiz.',
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-50 to-amber-50 py-16 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <span className="text-5xl mb-4 block">🐾</span>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Hakkımızda</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            2018'den bu yana Türkiye'deki evcil hayvan sahiplerinin en güvenilir alışveriş adresi olarak hizmet veriyoruz.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-14 max-w-4xl">
        {/* Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hikayemiz</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              PawShop, iki kedi ve bir köpek sahibi olan Ahmet ve Ayşe tarafından, evcil hayvanlarına en kaliteli ürünlere ulaşmak isteyen pet sahiplerinin ihtiyacını karşılamak amacıyla kuruldu.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Bugün 500'den fazla ürün çeşidi, 15.000'i aşkın mutlu müşteri ve Türkiye genelinde güvenilir teslimat ağımızla hizmet vermeye devam ediyoruz.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Her ürünü önce kendi dostlarımızda test ediyor, sadece kalite standartlarımızı geçenleri raflarımıza alıyoruz.
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl p-10 text-center">
            <span className="text-8xl">🏠</span>
            <p className="text-gray-700 font-semibold mt-4 text-lg">Evcil Dostlarınız İçin</p>
            <p className="text-gray-500 text-sm mt-1">En iyi ürünler, en uygun fiyatlar</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-14">
          {[
            { number: '15.000+', label: 'Mutlu Müşteri', icon: <FiUsers className="text-primary-500" /> },
            { number: '500+', label: 'Ürün Çeşidi', icon: <FiAward className="text-amber-500" /> },
            { number: '48 Saat', label: 'İçinde Teslimat', icon: <FiTruck className="text-green-500" /> },
            { number: '4.9/5', label: 'Müşteri Puanı', icon: <FiHeart className="text-red-500" /> },
          ].map((stat) => (
            <div key={stat.label} className="card p-6 text-center">
              <div className="flex justify-center mb-2 text-2xl">{stat.icon}</div>
              <p className="text-2xl font-black text-gray-900">{stat.number}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Değerlerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: '🌿', title: 'Kalite', desc: 'Sadece test edilmiş, güvenilir markaların ürünlerini satıyoruz.' },
              { icon: '💚', title: 'Güven', desc: 'Şeffaf fiyatlandırma, dürüst ürün açıklamaları ve koşulsuz iade.' },
              { icon: '🚀', title: 'Hız', desc: 'Siparişleriniz ortalama 24-48 saat içinde kapınızda.' },
            ].map((v) => (
              <div key={v.title} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <span className="text-4xl block mb-3">{v.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
