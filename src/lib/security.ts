import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

export async function requireAdminSession() {
  const { authOptions } = await import('@/lib/auth');
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user as { authType?: string }).authType !== 'admin' ||
    !['ADMIN', 'SUPER_ADMIN'].includes((session.user as { role?: string }).role || '')
  ) {
    return null;
  }

  return session;
}

export async function requireCustomerSession() {
  const { authOptions } = await import('@/lib/auth');
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user as { authType?: string }).authType !== 'customer' ||
    (session.user as { role?: string }).role !== 'CUSTOMER'
  ) {
    return null;
  }

  return session;
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export function applyRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}

export function tooManyRequestsResponse(message = 'Cok fazla istek gonderildi. Lutfen biraz sonra tekrar deneyin.') {
  return NextResponse.json({ error: message }, { status: 429 });
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 401 });
}
