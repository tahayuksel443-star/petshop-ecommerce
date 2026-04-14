export const ALLOWED_STORE_CATEGORY_SLUGS = ['kedi-mamalari', 'kopek-mamalari'] as const;

export const STORE_BRAND_NAME = 'Köşem Pet Shop';

export function isAllowedStoreCategory(slug?: string | null) {
  return !!slug && ALLOWED_STORE_CATEGORY_SLUGS.includes(
    slug as (typeof ALLOWED_STORE_CATEGORY_SLUGS)[number]
  );
}
