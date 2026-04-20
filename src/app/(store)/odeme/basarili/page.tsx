import Link from 'next/link';
import { FiCheckCircle, FiShoppingBag, FiHome, FiTruck } from 'react-icons/fi';

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { siparis?: string; takip?: string };
}) {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 animate-bounce-gentle">
          <FiCheckCircle className="text-green-500" size={48} />
        </div>

        <h1 className="mb-3 text-3xl font-black text-gray-900">Siparisiniz Alindi!</h1>
        <p className="mb-2 text-gray-500">
          Odemeniz basariyla tamamlandi. Siparisiniz hazirlanmaya baslandi.
        </p>
        {searchParams.siparis ? (
          <div className="mb-6 space-y-3">
            <div className="inline-block rounded-xl border border-primary-100 bg-primary-50 px-4 py-2">
              <p className="text-xs text-gray-500">Siparis No</p>
              <p className="text-lg font-bold text-primary-700">{searchParams.siparis}</p>
            </div>
            {searchParams.takip ? (
              <div className="mx-auto max-w-md rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Siparis Takip Kodu</p>
                <p className="mt-1 break-all text-sm font-bold text-amber-900">{searchParams.takip}</p>
                <p className="mt-2 text-xs text-amber-800">
                  Uyeliksiz siparis takibi icin bu kodu ve e-posta adresinizi kullanabilirsiniz.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mb-8 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: <FiCheckCircle className="text-green-500" />, label: 'Siparis Alindi', done: true },
            { icon: <FiShoppingBag className="text-primary-500" />, label: 'Hazirlaniyor', done: false },
            { icon: <FiTruck className="text-gray-400" />, label: 'Kargoda', done: false },
          ].map((step, i) => (
            <div key={i} className={`rounded-2xl p-3 text-xs font-medium ${step.done ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="mb-1.5 flex justify-center text-lg">{step.icon}</div>
              <p className={step.done ? 'text-green-700' : 'text-gray-500'}>{step.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-8 rounded-2xl bg-gray-50 p-5 text-left">
          <h3 className="mb-3 font-semibold text-gray-900">Sonraki Adimlar</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              Siparis onay e-postasi gonderildi
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary-500">→</span>
              Siparisiniz 1-2 is gunu icinde kargoya verilecek
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary-500">→</span>
              Kargo takip numarasi SMS ile bildirilecek
            </li>
          </ul>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {searchParams.takip ? (
            <Link href={`/siparis-takip?kod=${encodeURIComponent(searchParams.takip)}`} className="btn-secondary px-6 py-3">
              <FiTruck size={16} />
              Siparisi Takip Et
            </Link>
          ) : null}
          <Link href="/" className="btn-secondary px-6 py-3">
            <FiHome size={16} />
            Ana Sayfaya Don
          </Link>
          <Link href="/urunler" className="btn-primary px-6 py-3">
            <FiShoppingBag size={16} />
            Alisverise Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
}
