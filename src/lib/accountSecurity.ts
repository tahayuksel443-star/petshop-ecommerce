import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mail';
import { STORE_BRAND_NAME } from '@/lib/storefront';

type AuthAccountType = 'ADMIN' | 'CUSTOMER';

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const ADMIN_MFA_TTL_MS = 10 * 60 * 1000;

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export function hashSecretToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function generateToken(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function safeEquals(value: string, hashedValue: string) {
  const left = Buffer.from(hashSecretToken(value));
  const right = Buffer.from(hashedValue);

  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function getVerificationPath(authType: AuthAccountType) {
  return authType === 'ADMIN' ? '/admin/giris' : '/hesap/giris';
}

function getPasswordResetPath(authType: AuthAccountType, token: string) {
  return authType === 'ADMIN'
    ? `/admin/sifre-sifirla/yeni?token=${token}`
    : `/hesap/sifre-sifirla/yeni?token=${token}`;
}

async function getAccountDisplayName(email: string, authType: AuthAccountType) {
  if (authType === 'ADMIN') {
    const admin = await prisma.adminUser.findUnique({
      where: { email },
      select: { name: true },
    });
    return admin?.name || 'yonetici';
  }

  const customer = await prisma.customerUser.findUnique({
    where: { email },
    select: { name: true },
  });
  return customer?.name || 'musteri';
}

export async function createEmailVerification(email: string, authType: AuthAccountType) {
  const token = generateToken(24);
  const tokenHash = hashSecretToken(token);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await prisma.emailVerificationToken.deleteMany({
    where: { email, authType },
  });

  await prisma.emailVerificationToken.create({
    data: {
      email,
      authType,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

export async function createPasswordReset(email: string, authType: AuthAccountType) {
  const token = generateToken(24);
  const tokenHash = hashSecretToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await prisma.passwordResetToken.deleteMany({
    where: { email, authType },
  });

  await prisma.passwordResetToken.create({
    data: {
      email,
      authType,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

export async function issueAdminMfaCode(adminUserId: string, email: string) {
  const code = generateOtpCode();
  const codeHash = hashSecretToken(code);
  const expiresAt = new Date(Date.now() + ADMIN_MFA_TTL_MS);

  await prisma.adminMfaCode.deleteMany({
    where: { adminUserId },
  });

  await prisma.adminMfaCode.create({
    data: {
      adminUserId,
      codeHash,
      expiresAt,
    },
  });

  return code;
}

export async function verifyAdminMfaCode(adminUserId: string, code: string) {
  const record = await prisma.adminMfaCode.findFirst({
    where: {
      adminUserId,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!record) {
    return false;
  }

  if (!safeEquals(code, record.codeHash)) {
    return false;
  }

  await prisma.adminMfaCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });

  return true;
}

export async function sendEmailVerification(email: string, authType: AuthAccountType) {
  const token = await createEmailVerification(email, authType);
  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/api/auth/email-verification/verify?token=${token}`;
  const name = await getAccountDisplayName(email, authType);
  const target = getVerificationPath(authType);

  await sendMail({
    to: email,
    subject: `${STORE_BRAND_NAME} e-posta dogrulama`,
    text: [
      `Merhaba ${name},`,
      '',
      'E-posta adresinizi dogrulamak icin asagidaki baglantiyi kullanin:',
      verifyUrl,
      '',
      `Baglanti 24 saat boyunca gecerlidir. Baglanti calismazsa ${target} sayfasindan yeni bir dogrulama maili isteyebilirsiniz.`,
    ].join('\n'),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f2937">
        <h2>${STORE_BRAND_NAME} e-posta dogrulama</h2>
        <p>Merhaba ${escapeHtml(name)},</p>
        <p>E-posta adresinizi dogrulamak icin asagidaki butona tiklayin.</p>
        <p style="margin:24px 0">
          <a href="${verifyUrl}" style="background:#b91c1c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;display:inline-block">E-postami dogrula</a>
        </p>
        <p style="word-break:break-all">${verifyUrl}</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, authType: AuthAccountType) {
  const token = await createPasswordReset(email, authType);
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}${getPasswordResetPath(authType, token)}`;
  const name = await getAccountDisplayName(email, authType);

  await sendMail({
    to: email,
    subject: `${STORE_BRAND_NAME} sifre sifirlama`,
    text: [
      `Merhaba ${name},`,
      '',
      'Sifrenizi yenilemek icin asagidaki baglantiyi kullanin:',
      resetUrl,
      '',
      'Bu baglanti 1 saat boyunca gecerlidir.',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f2937">
        <h2>${STORE_BRAND_NAME} sifre sifirlama</h2>
        <p>Merhaba ${escapeHtml(name)},</p>
        <p>Sifrenizi yenilemek icin asagidaki butona tiklayin.</p>
        <p style="margin:24px 0">
          <a href="${resetUrl}" style="background:#111827;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;display:inline-block">Sifreyi yenile</a>
        </p>
        <p style="word-break:break-all">${resetUrl}</p>
      </div>
    `,
  });
}

export async function sendAdminMfaEmail(email: string, code: string) {
  await sendMail({
    to: email,
    subject: `${STORE_BRAND_NAME} admin giris dogrulama kodu`,
    text: [
      `${STORE_BRAND_NAME} admin paneline giris icin dogrulama kodunuz: ${code}`,
      '',
      'Bu kod 10 dakika boyunca gecerlidir.',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f2937">
        <h2>Admin giris dogrulama kodu</h2>
        <p>Admin panele giris icin kodunuz:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:8px">${code}</p>
        <p>Bu kod 10 dakika boyunca gecerlidir.</p>
      </div>
    `,
  });
}

export async function verifyEmailToken(token: string) {
  const tokenHash = hashSecretToken(token);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt <= new Date()) {
    return null;
  }

  if (record.authType === 'ADMIN') {
    await prisma.adminUser.updateMany({
      where: { email: record.email },
      data: { emailVerifiedAt: new Date() },
    });
  } else {
    await prisma.customerUser.updateMany({
      where: { email: record.email },
      data: { emailVerifiedAt: new Date() },
    });
  }

  await prisma.emailVerificationToken.deleteMany({
    where: { email: record.email, authType: record.authType },
  });

  return record.authType;
}

export async function consumePasswordResetToken(token: string, passwordHash: string) {
  const tokenHash = hashSecretToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt <= new Date()) {
    return null;
  }

  if (record.authType === 'ADMIN') {
    await prisma.adminUser.updateMany({
      where: { email: record.email },
      data: { password: passwordHash },
    });
  } else {
    await prisma.customerUser.updateMany({
      where: { email: record.email },
      data: { password: passwordHash },
    });
  }

  await prisma.passwordResetToken.deleteMany({
    where: { email: record.email, authType: record.authType },
  });

  return record.authType;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
