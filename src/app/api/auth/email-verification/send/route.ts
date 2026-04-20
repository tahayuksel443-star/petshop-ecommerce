import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendEmailVerification } from '@/lib/accountSecurity';
import { applyRateLimit, getClientIp, tooManyRequestsResponse } from '@/lib/security';

const requestSchema = z.object({
  email: z.string().trim().email().max(150),
  authType: z.enum(['ADMIN', 'CUSTOMER']),
});

export async function POST(req: NextRequest) {
  const limiter = await applyRateLimit(`verify-email-send:${getClientIp(req)}`, 5, 15 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse();

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz istek' }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const authType = parsed.data.authType;

  const user =
    authType === 'ADMIN'
      ? await prisma.adminUser.findUnique({ where: { email }, select: { emailVerifiedAt: true } })
      : await prisma.customerUser.findUnique({ where: { email }, select: { emailVerifiedAt: true } });

  if (user && !user.emailVerifiedAt) {
    try {
      await sendEmailVerification(email, authType);
    } catch (error) {
      console.error('Email verification send error:', error);
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Eger hesap uygunsa dogrulama e-postasi gonderildi',
  });
}
