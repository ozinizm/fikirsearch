import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { auth, signOut } from '@/auth';
import { siteConfig } from '@/lib/config';

import './globals.css';

type RootLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth();

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/signin' });
  }

  return (
    <html lang="tr">
      <body>
        <div className="layout-shell">
          {session ? (
            <header className="navbar">
              <Link href="/dashboard" className="navbar-logo">
                <Image src="/logo.svg" alt="FikirCreative" width={36} height={36} className="rounded-xl" />
                <span>{siteConfig.name}</span>
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <span className="pill">{session.user?.email ?? 'Anonim'}</span>
                <form action={handleSignOut}>
                  <button type="submit" className="btn-secondary">Çıkış</button>
                </form>
              </div>
            </header>
          ) : null}
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
