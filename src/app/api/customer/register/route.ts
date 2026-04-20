import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendEmailVerification } from '@/lib/accountSecurity';
import { applyRateLimit, getClientIp, tooManyRequestsResponse } from '@/lib/security';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().min(10).max(20).optional().nullable(),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Sifre en az bir harf ve bir rakam icermelidir'),
});

export async function POST(req: NextRequest) {
  const limiter = await applyRateLimit(`customer-register:${getClientIp(req)}`, 5, 15 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse();

  const parsed = registerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz kayit bilgisi' }, { status: 400 });
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();
  const existing = await prisma.customerUser.findUnique({ where: { email } });

  if (existing) {
    return NextResponse.json({ error: 'Kayit istegi islenemedi' }, { status: 400 });
  }

  const password = await bcrypt.hash(data.password, 10);
  const customer = await prisma.customerUser.create({
    data: {
      name: data.name,
      email,
      phone: data.phone || null,
      password,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });

  try {
    await sendEmailVerification(email, 'CUSTOMER');
  } catch (error) {
    console.error('Customer verification email error:', error);
  }

  return NextResponse.json(
    {
      ...customer,
      verificationPending: true,
    },
    { status: 201 }
  );
}
