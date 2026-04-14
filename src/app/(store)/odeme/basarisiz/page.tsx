import Link from 'next/link';
import { FiXCircle, FiShoppingCart, FiHome, FiPhone } from 'react-icons/fi';

export default function FailedPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiXCircle className="text-red-500" size={48} />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-3">Ödeme Başarısız</h1>
        <p className="text-gray-500 mb-6">
          Ödeme işleminiz tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz.
        </p>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8 text-left">
          <h3 className="font-semibold text-red-900 mb-3">Olası Nedenler</h3>
          <ul className="space-y-2 text-sm text-red-700">
            <li className="flex items-start gap-2"><span>•</span> Hatalı kart bilgileri</li>
            <li className="flex items-start gap-2"><span>•</span> Yetersiz bakiye</li>
            <li className="flex items-start gap-2"><span>•</span> Bankanız tarafından engelleme</li>
            <li className="flex items-start gap-2"><span>•</span> 3D Secure onayı verilmedi</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-secondary py-3 px-6">
            <FiHome size={16} />
            Ana Sayfa
          </Link>
          <Link href="/sepet" className="btn-primary py-3 px-6">
            <FiShoppingCart size={16} />
            Tekrar Dene
          </Link>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          Yardım için:{' '}
          <a href="tel:+902125550123" className="text-primary-500 hover:underline inline-flex items-center gap-1">
            <FiPhone size={13} />
            +90 (212) 555 0123
          </a>
        </p>
      </div>
    </div>
  );
}
