import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { applyRateLimit, getClientIp, tooManyRequestsResponse } from '@/lib/security';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().min(10).max(20).optional().nullable(),
  password: z.string().min(6).max(72),
});

export async function POST(req: NextRequest) {
  const limiter = applyRateLimit(`customer-register:${getClientIp(req)}`, 5, 15 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse();

  const parsed = registerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz kayit bilgisi' }, { status: 400 });
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();
  const existing = await prisma.customerUser.findUnique({ where: { email } });

  if (existing) {
    return NextResponse.json({ error: 'Bu e-posta ile zaten uyelik var' }, { status: 409 });
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

  return NextResponse.json(customer, { status: 201 });
}
