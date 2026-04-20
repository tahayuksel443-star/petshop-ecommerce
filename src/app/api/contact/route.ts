import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { applyRateLimit, getClientIp, tooManyRequestsResponse } from '@/lib/security';
import { getSiteSettings } from '@/lib/siteSettings';

export const runtime = 'nodejs';

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(5000),
});

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function POST(req: NextRequest) {
  const limiter = await applyRateLimit(`contact:${getClientIp(req)}`, 8, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return tooManyRequestsResponse('Cok fazla mesaj denemesi yapildi. Lutfen biraz sonra tekrar deneyin.');
  }

  const rawBody = await req.json();
  const normalizedBody = {
    name: typeof rawBody?.name === 'string' ? rawBody.name.trim() : rawBody?.name,
    email: typeof rawBody?.email === 'string' ? rawBody.email.trim() : rawBody?.email,
    subject: typeof rawBody?.subject === 'string' ? rawBody.subject.trim() : rawBody?.subject,
    message: typeof rawBody?.message === 'string' ? rawBody.message.trim() : rawBody?.message,
  };

  const parsed = contactSchema.safeParse(normalizedBody);
  if (!parsed.success) {
    return NextResponse.json({
      error: 'Gecersiz mesaj bilgisi',
      details: parsed.error.flatten(),
    }, { status: 400 });
  }

  const transporter = getTransporter();
  if (!transporter) {
    return NextResponse.json({ error: 'Mail servisi henuz ayarlanmamis' }, { status: 500 });
  }

  const settings = await getSiteSettings();
  const toEmail = settings.contactEmail?.trim();

  if (!toEmail) {
    return NextResponse.json({ error: 'Site ayarlarinda alici e-posta tanimli degil' }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com';

  try {
    await transporter.sendMail({
      from,
      to: toEmail,
      replyTo: email,
      subject: `[Iletisim] ${subject}`,
      text: [
        `Gonderen: ${name}`,
        `E-posta: ${email}`,
        `Konu: ${subject}`,
        '',
        message,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f2937">
          <h2 style="margin-bottom:16px">Yeni iletisim formu mesaji</h2>
          <p><strong>Gonderen:</strong> ${escapeHtml(name)}</p>
          <p><strong>E-posta:</strong> ${escapeHtml(email)}</p>
          <p><strong>Konu:</strong> ${escapeHtml(subject)}</p>
          <p><strong>Mesaj:</strong></p>
          <div style="white-space:pre-wrap;border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb">${escapeHtml(message)}</div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form mail error:', error);
    return NextResponse.json({ error: 'Mesaj gonderilemedi' }, { status: 500 });
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
