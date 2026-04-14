import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Sifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email ve sifre gereklidir');
        }

        const { prisma } = await import('./prisma');
        const user = await prisma.adminUser.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('Kullanici bulunamadi');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Hatali sifre');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
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
};
