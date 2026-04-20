import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { consumePasswordResetToken } from '@/lib/accountSecurity';
import { applyRateLimit, getClientIp, tooManyRequestsResponse } from '@/lib/security';

const confirmSchema = z.object({
  token: z.string().trim().min(20).max(200),
  password: z.string().min(8).max(72).regex(/^(?=.*[A-Za-z])(?=.*\d).+$/),
});

export async function POST(req: NextRequest) {
  const limiter = await applyRateLimit(`password-reset-confirm:${getClientIp(req)}`, 10, 15 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse();

  const parsed = confirmSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz sifre yenileme istegi' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const authType = await consumePasswordResetToken(parsed.data.token, passwordHash);

  if (!authType) {
    return NextResponse.json({ error: 'Baglanti gecersiz veya suresi dolmus' }, { status: 400 });
  }

  return NextResponse.json({ success: true, authType });
}
