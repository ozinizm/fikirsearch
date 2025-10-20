import Link from 'next/link';

import { auth } from '@/auth';
import { siteConfig } from '@/lib/config';

const kpis = [
  {
    label: 'Toplam Otomasyon',
    value: '128',
    trend: '+12% bu ay',
  },
  {
    label: 'Bugünkü Çalışmalar',
    value: '6',
    trend: '2 yeni senaryo tetiklendi',
  },
  {
    label: 'Son Hata',
    value: '12:45',
    trend: 'Webhook time-out — çözümlendi',
  },
];

const modules = [
  {
    title: 'Sektör Arama',
    description: 'Google üzerinden sektör & lokasyona göre yeni potansiyeller bulun.',
    href: '/search',
  },
  {
    title: 'Kayıtlı Leadler',
    description: 'Takımınızın kaydettiği en güncel lead kayıtlarını inceleyin.',
    href: '/leads',
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name ?? session?.user?.email ?? 'Ekip Üyesi';

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-wide text-white/50">Hoş geldin</p>
        <h1 className="text-3xl font-semibold">{name}</h1>
        <p className="max-w-2xl text-sm text-white/60">
          {siteConfig.description} Otomasyonlarınızı güçlendirmek ve müşteri adaylarını tek merkezden yönetmek için modülleri kullanın.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card space-y-3">
            <p className="text-xs uppercase tracking-wide text-white/50">{kpi.label}</p>
            <p className="text-3xl font-semibold">{kpi.value}</p>
            <p className="text-xs text-white/50">{kpi.trend}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {modules.map((module) => (
          <Link key={module.href} href={module.href} className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{module.title}</h2>
              <span className="pill">Modül</span>
            </div>
            <p className="text-sm text-white/60">{module.description}</p>
            <span className="text-sm font-semibold text-brand-red">Keşfet →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
