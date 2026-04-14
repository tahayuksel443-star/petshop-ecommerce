import { getSiteSettings } from '@/lib/siteSettings';
import FaqAccordion from './FaqAccordion';

export const dynamic = 'force-dynamic';

function isFaqItem(value: unknown): value is { q: string; a: string } {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'q' in value &&
      'a' in value &&
      typeof (value as { q: unknown }).q === 'string' &&
      typeof (value as { a: unknown }).a === 'string'
  );
}

export default async function FaqPage() {
  const settings = await getSiteSettings();
  const rawFaqItems: unknown = settings.faqItems;
  const faqItems: Array<{ q: string; a: string }> = Array.isArray(rawFaqItems)
    ? rawFaqItems.filter(isFaqItem)
    : [];

  return (
    <div>
      <div className="bg-gradient-to-br from-primary-50 to-amber-50 px-4 py-16 text-center">
        <h1 className="mb-3 text-4xl font-black text-gray-900">
          {settings.faqTitle || 'Sik Sorulan Sorular'}
        </h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          {settings.faqDescription || 'Merak ettiklerinizi asagida bulabilirsiniz. Cevap bulamadiysaniz bize yazin.'}
        </p>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-12">
        <FaqAccordion items={faqItems} />
      </div>
    </div>
  );
}
