import { FiClock, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { getSiteSettings } from '@/lib/siteSettings';
import ContactForm from './ContactForm';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const contactCards = [
    {
      title: 'Telefon',
      icon: <FiPhone className="text-primary-500" size={20} />,
      lines: [settings.contactPhone, settings.contactPhoneSecondary].filter(Boolean) as string[],
    },
    {
      title: 'E-posta',
      icon: <FiMail className="text-primary-500" size={20} />,
      lines: [settings.contactEmail, settings.contactEmailSecondary].filter(Boolean) as string[],
    },
    {
      title: 'Adres',
      icon: <FiMapPin className="text-primary-500" size={20} />,
      lines: [settings.contactAddress, settings.contactAddressSecondary].filter(Boolean) as string[],
    },
    {
      title: 'Calisma Saatleri',
      icon: <FiClock className="text-primary-500" size={20} />,
      lines: [settings.contactHoursWeekday, settings.contactHoursWeekend].filter(Boolean) as string[],
    },
  ].filter((item) => item.lines.length > 0);

  return (
    <div>
      <div className="bg-gradient-to-br from-primary-50 to-amber-50 px-4 py-16 text-center">
        <h1 className="mb-3 text-4xl font-black text-gray-900">
          {settings.contactTitle || 'Iletisim'}
        </h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          {settings.contactDescription || 'Sorulariniz icin bize ulasin. Hafta ici belirlenen saatlerde hizmetinizdeyiz.'}
        </p>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4">
            {contactCards.map((item) => (
              <div key={item.title} className="card flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                  {item.icon}
                </div>
                <div>
                  <p className="mb-0.5 font-semibold text-gray-900">{item.title}</p>
                  {item.lines.map((line) => (
                    <p key={line} className="text-sm text-gray-500">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <ContactForm />

            {settings.contactMapEmbedUrl ? (
              <div className="card overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="text-lg font-bold text-gray-900">Magaza Konumu</h2>
                  <p className="mt-1 text-sm text-gray-500">Google Maps uzerinden konum bilginizi burada gosterebilirsiniz.</p>
                </div>
                <iframe
                  src={settings.contactMapEmbedUrl}
                  className="h-[360px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  title="Magaza Konumu"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
