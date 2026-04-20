import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

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

function applyMemoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
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

async function applyRedisRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult | null> {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!baseUrl || !token) return null;

  try {
    const response = await fetch(`${baseUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['PTTL', key],
      ]),
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data = await response.json() as Array<{ result?: number }>;
    const currentCount = Number(data?.[0]?.result ?? 0);
    let ttl = Number(data?.[1]?.result ?? -1);

    if (currentCount === 1 || ttl < 0) {
      await fetch(`${baseUrl}/pexpire/${encodeURIComponent(key)}/${windowMs}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });
      ttl = windowMs;
    }

    const resetAt = Date.now() + Math.max(ttl, 0);
    return {
      allowed: currentCount <= limit,
      remaining: Math.max(0, limit - currentCount),
      resetAt,
    };
  } catch {
    return null;
  }
}

export async function applyRateLimit(key: string, limit: number, windowMs: number) {
  const distributedResult = await applyRedisRateLimit(key, limit, windowMs);
  if (distributedResult) {
    return distributedResult;
  }

  return applyMemoryRateLimit(key, limit, windowMs);
}

export function tooManyRequestsResponse(message = 'Cok fazla istek gonderildi. Lutfen biraz sonra tekrar deneyin.') {
  return NextResponse.json({ error: message }, { status: 429 });
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 401 });
}

export function hasTrustedOrigin(req: NextRequest, trustedSiteUrl?: string | null) {
  if (!trustedSiteUrl) return true;

  try {
    const trustedOrigin = new URL(trustedSiteUrl).origin;
    const requestOrigin = req.headers.get('origin');
    const referer = req.headers.get('referer');

    if (requestOrigin) {
      return requestOrigin === trustedOrigin;
    }

    if (referer) {
      return new URL(referer).origin === trustedOrigin;
    }

    return true;
  } catch {
    return false;
  }
}
