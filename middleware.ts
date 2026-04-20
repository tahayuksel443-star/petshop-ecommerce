import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

function isAdminToken(token: Awaited<ReturnType<typeof getToken>>) {
  const sessionToken = token as { authType?: string; role?: string } | null;

  return (
    !!sessionToken &&
    sessionToken.authType === 'admin' &&
    ['ADMIN', 'SUPER_ADMIN'].includes(String(sessionToken.role || ''))
  );
}

function applySecurityHeaders(response: NextResponse, isHttps: boolean) {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "img-src 'self' data: blob: https:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline'",
    "font-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-src 'self' https://*.iyzipay.com https://*.iyzico.com https://www.google.com https://maps.google.com",
    "form-action 'self' https://*.iyzipay.com https://*.iyzico.com",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; '));

  if (isHttps) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname, protocol } = req.nextUrl;
  const isHttps = protocol === 'https:';

  if (pathname.startsWith('/admin') && pathname !== '/admin/giris') {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!isAdminToken(token)) {
      const loginUrl = new URL('/admin/giris', req.url);
      return applySecurityHeaders(NextResponse.redirect(loginUrl), isHttps);
    }
  }

  return applySecurityHeaders(NextResponse.next(), isHttps);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
