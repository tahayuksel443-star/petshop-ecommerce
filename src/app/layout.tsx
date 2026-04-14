import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { STORE_BRAND_NAME } from '@/lib/storefront';

export const metadata: Metadata = {
  title: {
    default: `${STORE_BRAND_NAME} - Kedi ve Kopek Mamasi`,
    template: `%s | ${STORE_BRAND_NAME}`,
  },
  description: "Turkiye'nin kedi ve kopek mamasi odakli online pet marketi. Yetiskin, yavru, kisirlastirilmis ve veteriner diyet mamalar uygun fiyatla.",
  keywords: ['kedi mamasi', 'kopek mamasi', 'online mama', 'pet market', 'kedi kopek mamasi', 'mama kampanya'],
  authors: [{ name: STORE_BRAND_NAME }],
  creator: STORE_BRAND_NAME,
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: STORE_BRAND_NAME,
    title: `${STORE_BRAND_NAME} - Kedi ve Kopek Mamasi`,
    description: "Kedi ve kopek mamasinda hesapli fiyat, hizli kargo ve guvenli odeme.",
  },
  twitter: {
    card: 'summary_large_image',
    title: `${STORE_BRAND_NAME} - Kedi ve Kopek Mamasi`,
    description: "Kedi ve kopek mamasinda hesapli fiyat, hizli kargo ve guvenli odeme.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1c1917',
              border: '1px solid #fed7aa',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: { primary: '#f97316', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
