import nodemailer from 'nodemailer';

export function getMailTransporter() {
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

export function getMailFromAddress() {
  return process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com';
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}) {
  const transporter = getMailTransporter();
  if (!transporter) {
    throw new Error('MAIL_NOT_CONFIGURED');
  }

  await transporter.sendMail({
    from: getMailFromAddress(),
    ...options,
  });
}
