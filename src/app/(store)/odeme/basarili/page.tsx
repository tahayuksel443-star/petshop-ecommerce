import Link from 'next/link';
import { FiCheckCircle, FiShoppingBag, FiHome, FiTruck } from 'react-icons/fi';

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { siparis?: string };
}) {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto">
        {/* Success icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
          <FiCheckCircle className="text-green-500" size={48} />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-3">Siparişiniz Alındı!</h1>
        <p className="text-gray-500 mb-2">
          Ödemeniz başarıyla tamamlandı. Siparişiniz hazırlanmaya başlandı.
        </p>
        {searchParams.siparis && (
          <div className="inline-block bg-primary-50 border border-primary-100 rounded-xl px-4 py-2 mb-6">
            <p className="text-xs text-gray-500">Sipariş No</p>
            <p className="font-bold text-primary-700 text-lg">{searchParams.siparis}</p>
          </div>
        )}

        {/* Steps */}
        <div className="grid grid-cols-3 gap-3 mb-8 text-center">
          {[
            { icon: <FiCheckCircle className="text-green-500" />, label: 'Sipariş Alındı', done: true },
            { icon: <FiShoppingBag className="text-primary-500" />, label: 'Hazırlanıyor', done: false },
            { icon: <FiTruck className="text-gray-400" />, label: 'Kargoda', done: false },
          ].map((step, i) => (
            <div key={i} className={`p-3 rounded-2xl text-xs font-medium ${step.done ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="flex justify-center mb-1.5 text-lg">{step.icon}</div>
              <p className={step.done ? 'text-green-700' : 'text-gray-500'}>{step.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">Sonraki Adımlar</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              Sipariş onay e-postası gönderildi
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">→</span>
              Siparişiniz 1-2 iş günü içinde kargoya verilecek
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">→</span>
              Kargo takip numarası SMS ile bildirilecek
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-secondary py-3 px-6">
            <FiHome size={16} />
            Ana Sayfaya Dön
          </Link>
          <Link href="/urunler" className="btn-primary py-3 px-6">
            <FiShoppingBag size={16} />
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
}
