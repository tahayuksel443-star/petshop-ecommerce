'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { FiLock, FiCreditCard, FiTruck, FiChevronRight, FiUser, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FREE_SHIPPING_MIN = 250;
const SHIPPING_COST = 29.90;

const CITIES = ['Adana','Adıyaman','Afyon','Ağrı','Amasya','Ankara','Antalya','Artvin','Aydın','Balıkesir','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Isparta','İçel','İstanbul','İzmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla','Muş','Nevşehir','Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yozgat','Zonguldak','Aksaray','Bayburt','Karaman','Kırıkkale','Batman','Şırnak','Bartın','Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye','Düzce'];

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8" />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponCode = searchParams?.get('kupon') ?? '';
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'address' | 'payment'>('address');

  const subtotal = getTotalPrice();
  const shippingCost = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    notes: '',
  });

  const [card, setCard] = useState({
    number: '',
    holder: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (e.target.name === 'number') {
      value = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    }
    if (e.target.name === 'cvc') value = value.replace(/\D/g, '').slice(0, 3);
    if (e.target.name === 'expireMonth') value = value.replace(/\D/g, '').slice(0, 2);
    if (e.target.name === 'expireYear') value = value.replace(/\D/g, '').slice(0, 4);
    setCard({ ...card, [e.target.name]: value });
  };

  const validateAddress = () => {
    const required = ['name', 'surname', 'email', 'phone', 'city', 'district', 'address'];
    for (const field of required) {
      if (!form[field as keyof typeof form].trim()) {
        toast.error('Lütfen tüm zorunlu alanları doldurun');
        return false;
      }
    }
    if (!form.email.includes('@')) { toast.error('Geçerli bir e-posta girin'); return false; }
    if (form.phone.length < 10) { toast.error('Geçerli bir telefon numarası girin'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddress()) return;
    if (!card.number || !card.holder || !card.expireMonth || !card.expireYear || !card.cvc) {
      toast.error('Lütfen kart bilgilerini eksiksiz doldurun');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: form,
          card: {
            cardHolderName: card.holder,
            cardNumber: card.number.replace(/\s/g, ''),
            expireMonth: card.expireMonth,
            expireYear: card.expireYear,
            cvc: card.cvc,
          },
          couponCode,
          totalAmount: total,
          shippingCost,
        }),
      });

      const data = await res.json();

      if (data.status === 'success' && data.threeDSHtmlContent) {
        // 3DS ödeme için yönlendir
        const form3DS = document.createElement('div');
        form3DS.innerHTML = data.threeDSHtmlContent;
        document.body.appendChild(form3DS);
        const formEl = form3DS.querySelector('form');
        if (formEl) {
          formEl.submit();
        } else {
          router.push(`/odeme/basarili?siparis=${data.orderNumber}`);
          clearCart();
        }
      } else if (data.orderNumber) {
        router.push(`/odeme/basarili?siparis=${data.orderNumber}`);
        clearCart();
      } else {
        toast.error(data.errorMessage || 'Ödeme işlemi başarısız');
        router.push('/odeme/basarisiz');
      }
    } catch (err) {
      toast.error('Bir hata oluştu, lütfen tekrar deneyin');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.replace('/sepet');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ödeme</h1>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-8">
        {['Teslimat Bilgileri', 'Ödeme'].map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <button
              onClick={() => i === 0 && setStep('address')}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                (i === 0 && step === 'address') || (i === 1 && step === 'payment')
                  ? 'text-primary-600'
                  : 'text-gray-400'
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                (i === 0 && step === 'address') || (i === 1 && step === 'payment')
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i === 0 && <FiChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* Address step */}
            {step === 'address' && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                  <FiTruck className="text-primary-500" size={20} />
                  Teslimat Bilgileri
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad *</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input name="name" value={form.name} onChange={handleFormChange} placeholder="Adınız" className="input-field pl-9" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Soyad *</label>
                    <input name="surname" value={form.surname} onChange={handleFormChange} placeholder="Soyadınız" className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta *</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="ornek@email.com" className="input-field pl-9" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon *</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} placeholder="05XX XXX XX XX" className="input-field pl-9" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Şehir *</label>
                    <select name="city" value={form.city} onChange={handleFormChange} className="input-field" required>
                      <option value="">Şehir seçin</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">İlçe *</label>
                    <input name="district" value={form.district} onChange={handleFormChange} placeholder="İlçeniz" className="input-field" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adres *</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-3 text-gray-400" size={15} />
                      <textarea name="address" value={form.address} onChange={handleFormChange} placeholder="Mahalle, sokak, bina no, daire no..." rows={3} className="input-field pl-9 resize-none" required />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Sipariş Notu (opsiyonel)</label>
                    <textarea name="notes" value={form.notes} onChange={handleFormChange} placeholder="Teslimat ile ilgili özel notunuz..." rows={2} className="input-field resize-none" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { if (validateAddress()) setStep('payment'); }}
                  className="btn-primary w-full justify-center mt-6 py-3.5"
                >
                  Ödeme Adımına Geç
                  <FiChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Payment step */}
            {step === 'payment' && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                  <FiCreditCard className="text-primary-500" size={20} />
                  Kart Bilgileri
                </h2>

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 mb-6 text-white">
                  <p className="text-xs text-gray-400 mb-4">Kart Önizlemesi</p>
                  <p className="text-xl tracking-widest font-mono mb-4">
                    {card.number || '•••• •••• •••• ••••'}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400">Kart Sahibi</p>
                      <p className="font-medium">{card.holder || 'AD SOYAD'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Son Kullanma</p>
                      <p className="font-medium">{card.expireMonth || 'AA'}/{card.expireYear?.slice(-2) || 'YY'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kart Numarası *</label>
                    <input name="number" value={card.number} onChange={handleCardChange} placeholder="0000 0000 0000 0000" className="input-field font-mono tracking-wider" maxLength={19} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kart Üzerindeki Ad *</label>
                    <input name="holder" value={card.holder} onChange={handleCardChange} placeholder="Ad Soyad" className="input-field uppercase" required />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ay *</label>
                      <input name="expireMonth" value={card.expireMonth} onChange={handleCardChange} placeholder="MM" className="input-field text-center font-mono" maxLength={2} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Yıl *</label>
                      <input name="expireYear" value={card.expireYear} onChange={handleCardChange} placeholder="YYYY" className="input-field text-center font-mono" maxLength={4} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV *</label>
                      <input name="cvc" value={card.cvc} onChange={handleCardChange} placeholder="•••" type="password" className="input-field text-center font-mono" maxLength={3} required />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 p-3 bg-green-50 rounded-xl">
                  <FiLock className="text-green-500 shrink-0" size={16} />
                  <p className="text-xs text-green-700">
                    Ödeme bilgileriniz <strong>iyzico</strong> tarafından 256-bit SSL ile şifrelenerek korunmaktadır.
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setStep('address')} className="btn-secondary py-3.5 px-5">
                    Geri
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 justify-center py-3.5 text-base"
                  >
                    {loading ? (
                      <>
                        <span className="spinner w-5 h-5" />
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <FiLock size={18} />
                        {formatPrice(total)} Öde
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Order summary sidebar */}
        <div className="card p-5 h-fit">
          <h3 className="font-bold text-gray-900 mb-4">Sipariş Özeti</h3>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {items.map((item) => {
              const price = item.discountPrice ?? item.price;
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                    <Image src={item.image || '/images/placeholder-product.jpg'} alt={item.name} fill className="object-cover" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-snug">{item.name}</p>
                    <p className="text-xs font-bold text-primary-600 mt-0.5">{formatPrice(price * item.quantity)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Ara Toplam</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Kargo</span>
              {shippingCost === 0 ? (
                <span className="text-green-600 font-medium">Ücretsiz</span>
              ) : (
                <span>{formatPrice(shippingCost)}</span>
              )}
            </div>
            <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
              <span>Toplam</span>
              <span className="text-primary-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
