import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { applyRateLimit } from './security';
import { issueAdminMfaCode, sendAdminMfaEmail, verifyAdminMfaCode } from './accountSecurity';

function readHeaderValue(headers: unknown, key: string) {
  if (!headers || typeof headers !== 'object') return null;

  if (typeof (headers as { get?: unknown }).get === 'function') {
    const value = (headers as { get: (name: string) => string | null }).get(key);
    return typeof value === 'string' ? value : null;
  }

  const normalizedKey = key.toLowerCase();
  const plainHeaders = headers as Record<string, unknown>;

  const directValue = plainHeaders[normalizedKey] ?? plainHeaders[key];
  if (typeof directValue === 'string') return directValue;
  if (Array.isArray(directValue) && typeof directValue[0] === 'string') return directValue[0];

  return null;
}

function getRequestIp(req: unknown) {
  if (!req || typeof req !== 'object' || !('headers' in req)) return 'unknown';

  const headers = (req as { headers?: unknown }).headers;
  if (!headers) return 'unknown';

  const forwarded = readHeaderValue(headers, 'x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return readHeaderValue(headers, 'x-real-ip') || 'unknown';
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'admin-credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Sifre', type: 'password' },
        otp: { label: 'Dogrulama Kodu', type: 'text' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Giris bilgileri gecersiz');
        }

        const email = String(credentials.email).trim().toLowerCase();
        const ip = getRequestIp(req);
        const limiter = await applyRateLimit(
          `admin-login:${String(credentials.email).toLowerCase()}`,
          5,
          15 * 60 * 1000
        );
        const ipLimiter = await applyRateLimit(`admin-login-ip:${ip}`, 20, 15 * 60 * 1000);

        if (!limiter.allowed || !ipLimiter.allowed) {
          throw new Error('Cok fazla hatali giris denemesi. Lutfen daha sonra tekrar deneyin');
        }

        const { prisma } = await import('./prisma');
        const user = await prisma.adminUser.findUnique({
          where: { email },
        });

        if (!user) throw new Error('Giris bilgileri gecersiz');
        if (!user.emailVerifiedAt) throw new Error('EMAIL_NOT_VERIFIED');

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error('Giris bilgileri gecersiz');

        if (user.mfaEnabled) {
          const otp = String(credentials.otp || '').trim();

          if (!otp) {
            const code = await issueAdminMfaCode(user.id, user.email);
            await sendAdminMfaEmail(user.email, code);
            throw new Error('MFA_REQUIRED');
          }

          const isValidOtp = await verifyAdminMfaCode(user.id, otp);
          if (!isValidOtp) {
            throw new Error('MFA_INVALID');
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          authType: 'admin',
        };
      },
    }),
    CredentialsProvider({
      id: 'customer-credentials',
      name: 'customer-credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Sifre', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Giris bilgileri gecersiz');
        }

        const email = String(credentials.email).trim().toLowerCase();
        const ip = getRequestIp(req);
        const limiter = await applyRateLimit(
          `customer-login:${String(credentials.email).toLowerCase()}`,
          8,
          15 * 60 * 1000
        );
        const ipLimiter = await applyRateLimit(`customer-login-ip:${ip}`, 30, 15 * 60 * 1000);

        if (!limiter.allowed || !ipLimiter.allowed) {
          throw new Error('Cok fazla hatali giris denemesi. Lutfen daha sonra tekrar deneyin');
        }

        const { prisma } = await import('./prisma');
        const user = await prisma.customerUser.findUnique({
          where: { email },
        });

        if (!user) throw new Error('Giris bilgileri gecersiz');
        if (!user.emailVerifiedAt) throw new Error('EMAIL_NOT_VERIFIED');

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error('Giris bilgileri gecersiz');

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'CUSTOMER',
          authType: 'customer',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.authType = (user as any).authType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).authType = token.authType;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/giris',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};
