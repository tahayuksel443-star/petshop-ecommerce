import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/accountSecurity';
import { applyRateLimit, getClientIp, tooManyRequestsResponse } from '@/lib/security';

const requestSchema = z.object({
  email: z.string().trim().email().max(150),
  authType: z.enum(['ADMIN', 'CUSTOMER']),
});

export async function POST(req: NextRequest) {
  const limiter = await applyRateLimit(`password-reset-request:${getClientIp(req)}`, 5, 15 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse();

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz istek' }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const authType = parsed.data.authType;
  const user =
    authType === 'ADMIN'
      ? await prisma.adminUser.findUnique({ where: { email }, select: { id: true } })
      : await prisma.customerUser.findUnique({ where: { email }, select: { id: true } });

  if (user) {
    try {
      await sendPasswordResetEmail(email, authType);
    } catch (error) {
      console.error('Password reset send error:', error);
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Eger hesap uygunsa sifre yenileme e-postasi gonderildi',
  });
}
