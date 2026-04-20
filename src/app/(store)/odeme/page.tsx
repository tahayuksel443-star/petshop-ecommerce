'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { CartQuote } from '@/types';
import { formatPrice } from '@/lib/utils';
import { FiLock, FiCreditCard, FiTruck, FiChevronRight, FiUser, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FREE_SHIPPING_MIN = 250;
const SHIPPING_COST = 29.9;

const CITIES = ['Adana','Adiyaman','Afyon','Agri','Amasya','Ankara','Antalya','Artvin','Aydin','Balikesir','Bilecik','Bingol','Bitlis','Bolu','Burdur','Bursa','Canakkale','Cankiri','Corum','Denizli','Diyarbakir','Edirne','Elazig','Erzincan','Erzurum','Eskisehir','Gaziantep','Giresun','Gumushane','Hakkari','Hatay','Isparta','Istanbul','Izmir','Kars','Kastamonu','Kayseri','Kirklareli','Kirsehir','Kocaeli','Konya','Kutahya','Malatya','Manisa','Kahramanmaras','Mardin','Mugla','Mus','Nevsehir','Nigde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Tekirdag','Tokat','Trabzon','Tunceli','Sanliurfa','Usak','Van','Yozgat','Zonguldak','Aksaray','Bayburt','Karaman','Kirikkale','Batman','Sirnak','Bartin','Ardahan','Igdir','Yalova','Karabuk','Kilis','Osmaniye','Duzce'];

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
  const { data: session } = useSession();
  const couponCode = searchParams?.get('kupon') ?? '';
  const { items, clearCart, syncItemsFromQuote } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'member'>('guest');
  const [quote, setQuote] = useState<CartQuote | null>(null);

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

  useEffect(() => {
    const isCustomer = session?.user && (session.user as { authType?: string }).authType === 'customer';
    if (!isCustomer) return;

    const nameParts = (session.user?.name || '').split(' ');
    setCheckoutMode('member');
    setForm((current) => ({
      ...current,
      name: current.name || nameParts[0] || '',
      surname: current.surname || nameParts.slice(1).join(' ') || '',
      email: current.email || session.user?.email || '',
    }));
  }, [session]);

  useEffect(() => {
    let cancelled = false;

    async function loadQuote() {
      if (items.length === 0) {
        setQuote(null);
        return;
      }

      const res = await fetch('/api/cart/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });

      const data = await res.json().catch(() => null);
      if (!cancelled && res.ok) {
        setQuote(data);
        syncItemsFromQuote(data.items ?? []);
      }
    }

    loadQuote();

    return () => {
      cancelled = true;
    };
  }, [items, syncItemsFromQuote]);

  const subtotal = quote?.subtotal ?? 0;
  const shippingCost = quote?.shippingCost ?? 0;
  const total = subtotal + shippingCost;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (e.target.name === 'number') value = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    if (e.target.name === 'cvc') value = value.replace(/\D/g, '').slice(0, 3);
    if (e.target.name === 'expireMonth') value = value.replace(/\D/g, '').slice(0, 2);
    if (e.target.name === 'expireYear') value = value.replace(/\D/g, '').slice(0, 4);
    setCard({ ...card, [e.target.name]: value });
  };

  const validateAddress = () => {
    const required = ['name', 'surname', 'email', 'phone', 'city', 'district', 'address'];
    for (const field of required) {
      if (!form[field as keyof typeof form].trim()) {
        toast.error('Lutfen tum zorunlu alanlari doldurun');
        return false;
      }
    }
    if (!form.email.includes('@')) {
      toast.error('Gecerli bir e-posta girin');
      return false;
    }
    if (form.phone.replace(/\D/g, '').length < 10) {
      toast.error('Gecerli bir telefon numarasi girin');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddress()) return;
    if (!card.number || !card.holder || !card.expireMonth || !card.expireYear || !card.cvc) {
      toast.error('Lutfen kart bilgilerini eksiksiz doldurun');
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
        }),
      });

      const data = await res.json();

      if (data.status === 'success' && data.threeDSHtmlContent) {
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
        toast.error(data.errorMessage || data.error || 'Odeme islemi basarisiz');
        router.push('/odeme/basarisiz');
      }
    } catch {
      toast.error('Bir hata olustu, lutfen tekrar deneyin');
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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Odeme</h1>

      <div className="mb-6 rounded-3xl border border-[#f3e5d4] bg-[#fffaf5] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Odeme sekli</p>
            <p className="mt-1 text-sm text-gray-500">Uye olarak devam edip siparislerinizi panelden takip edebilir ya da hizlica uyeliksiz devam edebilirsiniz.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCheckoutMode('guest')}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${checkoutMode === 'guest' ? 'bg-[#991b1b] text-white' : 'bg-white text-gray-700 border border-[#eadbc8]'}`}
            >
              Uyeliksiz Devam Et
            </button>
            <Link href="/hesap/giris?callbackUrl=/odeme" className="rounded-2xl border border-[#eadbc8] bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#fff7ed]">
              Uye Girisi
            </Link>
            <Link href="/hesap/kayit" className="rounded-2xl border border-[#eadbc8] bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#fff7ed]">
              Uye Ol
            </Link>
          </div>
        </div>
        {checkoutMode === 'member' ? (
          <p className="mt-3 text-sm text-green-700">Hesabinizla devam ediyorsunuz. Bu siparis hesabinizdaki siparislerim alanina dusacak.</p>
        ) : (
          <p className="mt-3 text-sm text-amber-700">Misafir olarak devam ediyorsunuz. Siparis takibi icin siparis numarasi ve e-posta kullanabilirsiniz.</p>
        )}
      </div>

      <div className="mb-8 flex items-center gap-3">
        {['Teslimat Bilgileri', 'Odeme'].map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <button onClick={() => i === 0 && setStep('address')} className={`flex items-center gap-2 text-sm font-medium transition-colors ${((i === 0 && step === 'address') || (i === 1 && step === 'payment')) ? 'text-primary-600' : 'text-gray-400'}`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${((i === 0 && step === 'address') || (i === 1 && step === 'payment')) ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i === 0 && <FiChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {step === 'address' && (
              <div className="card p-6">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <FiTruck className="text-primary-500" size={20} />
                  Teslimat Bilgileri
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Ad *</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input name="name" value={form.name} onChange={handleFormChange} placeholder="Adiniz" className="input-field pl-9" required />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Soyad *</label>
                    <input name="surname" value={form.surname} onChange={handleFormChange} placeholder="Soyadiniz" className="input-field" required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">E-posta *</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="ornek@email.com" className="input-field pl-9" required />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefon *</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} placeholder="05XX XXX XX XX" className="input-field pl-9" required />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Sehir *</label>
                    <select name="city" value={form.city} onChange={handleFormChange} className="input-field" required>
                      <option value="">Sehir secin</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Ilce *</label>
                    <input name="district" value={form.district} onChange={handleFormChange} placeholder="Ilceniz" className="input-field" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Adres *</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-3 text-gray-400" size={15} />
                      <textarea name="address" value={form.address} onChange={handleFormChange} placeholder="Mahalle, sokak, bina no, daire no..." rows={3} className="input-field resize-none pl-9" required />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Siparis Notu</label>
                    <textarea name="notes" value={form.notes} onChange={handleFormChange} placeholder="Teslimat ile ilgili ozel notunuz..." rows={2} className="input-field resize-none" />
                  </div>
                </div>
                <button type="button" onClick={() => { if (validateAddress()) setStep('payment'); }} className="btn-primary mt-6 w-full justify-center py-3.5">
                  Odeme Adimina Gec
                  <FiChevronRight size={18} />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="card p-6">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <FiCreditCard className="text-primary-500" size={20} />
                  Kart Bilgileri
                </h2>

                <div className="mb-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-5 text-white">
                  <p className="mb-4 text-xs text-gray-400">Kart Onizlemesi</p>
                  <p className="mb-4 font-mono text-xl tracking-widest">{card.number || '•••• •••• •••• ••••'}</p>
                  <div className="flex items-end justify-between">
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
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Kart Numarasi *</label>
                    <input name="number" value={card.number} onChange={handleCardChange} placeholder="0000 0000 0000 0000" className="input-field font-mono tracking-wider" maxLength={19} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Kart Uzerindeki Ad *</label>
                    <input name="holder" value={card.holder} onChange={handleCardChange} placeholder="Ad Soyad" className="input-field uppercase" required />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Ay *</label>
                      <input name="expireMonth" value={card.expireMonth} onChange={handleCardChange} placeholder="MM" className="input-field text-center font-mono" maxLength={2} required />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Yil *</label>
                      <input name="expireYear" value={card.expireYear} onChange={handleCardChange} placeholder="YYYY" className="input-field text-center font-mono" maxLength={4} required />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">CVV *</label>
                      <input name="cvc" value={card.cvc} onChange={handleCardChange} placeholder="•••" type="password" className="input-field text-center font-mono" maxLength={3} required />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3">
                  <FiLock className="shrink-0 text-green-500" size={16} />
                  <p className="text-xs text-green-700">Odeme bilgileriniz <strong>iyzico</strong> tarafindan 256-bit SSL ile sifrelenerek korunmaktadir.</p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setStep('address')} className="btn-secondary px-5 py-3.5">Geri</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3.5 text-base">
                    {loading ? (<><span className="spinner h-5 w-5" />Isleniyor...</>) : (<><FiLock size={18} />{formatPrice(total)} Ode</>)}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="card h-fit p-5">
          <h3 className="mb-4 font-bold text-gray-900">Siparis Ozeti</h3>
          <div className="mb-4 max-h-60 space-y-3 overflow-y-auto">
            {(quote?.items ?? []).map((item) => {
              const price = item.discountPrice ?? item.price;
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    <Image src={item.image || '/images/placeholder-product.jpg'} alt={item.name} fill className="object-cover" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">{item.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-medium leading-snug text-gray-700">{item.name}</p>
                    <p className="mt-0.5 text-xs font-bold text-primary-600">{formatPrice(price * item.quantity)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between text-gray-600"><span>Ara Toplam</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600">
              <span>Kargo</span>
              {shippingCost === 0 ? <span className="font-medium text-green-600">Ucretsiz</span> : <span>{formatPrice(shippingCost)}</span>}
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
              <span>Toplam</span>
              <span className="text-primary-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
