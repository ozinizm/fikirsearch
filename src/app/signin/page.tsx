import Image from 'next/image';

import { signIn } from '@/auth';
import { siteConfig } from '@/lib/config';

export default function SignInPage() {
  async function handleGoogleSignIn() {
    'use server';
    await signIn('google', { redirectTo: '/dashboard' });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="card max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Image src="/logo.svg" alt="FikirCreative" width={64} height={64} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{siteConfig.name}</h1>
          <p className="text-sm text-white/70">
            Google hesabınızla giriş yapın. Sadece yetkilendirilmiş e-posta adresleri erişim sağlayabilir.
          </p>
        </div>
        <form action={handleGoogleSignIn} className="space-y-4">
          <button type="submit" className="btn w-full justify-center">
            Google ile giriş
          </button>
        </form>
        <p className="text-xs text-white/40">
          Sorun mu yaşıyorsunuz? Lütfen ekip yöneticinize e-posta adresinizi eklettirin.
        </p>
      </div>
    </div>
  );
}
