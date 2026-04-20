import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/accountSecurity';

function redirectTo(path: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${siteUrl}${path}`);
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  if (!token) {
    return redirectTo('/hesap/giris?verified=0');
  }

  const authType = await verifyEmailToken(token);
  if (!authType) {
    return redirectTo('/hesap/giris?verified=0');
  }

  if (authType === 'ADMIN') {
    return redirectTo('/admin/giris?verified=1');
  }

  return redirectTo('/hesap/giris?verified=1');
}
