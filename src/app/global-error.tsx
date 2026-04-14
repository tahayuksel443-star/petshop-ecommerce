'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="bg-[#f8f5ef]">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#eadfce] bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#b45309]">
              Sistem Hatasi
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900">
              Beklenmeyen bir hata olustu
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Uygulama acilirken kritik bir sorun yakalandi. Tekrar deneyebilir ya da ana sayfaya donebilirsin.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-2xl bg-[#991b1b] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7f1d1d]"
              >
                Tekrar Dene
              </button>
              <a
                href="/"
                className="rounded-2xl border border-[#e7d9c7] px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#fff7ed]"
              >
                Ana Sayfaya Don
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
