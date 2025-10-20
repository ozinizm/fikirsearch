import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

import { env } from './lib/env';
import { isEmailAllowed } from './lib/config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  debug: env.NODE_ENV === 'development',
  pages: {
    signIn: '/signin',
  },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return isEmailAllowed(user?.email);
    },
    async session({ session }) {
      if (session.user?.email) {
        session.user.email = session.user.email.toLowerCase();
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith('/signin')) {
        return true;
      }
      if (!auth?.user?.email) {
        return false;
      }
      return isEmailAllowed(auth.user.email);
    },
  },
});

export { GET, POST };
