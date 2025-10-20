import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Kayıtlı Leadler</h1>
        <p className="text-sm text-white/60">Son kaydedilen 200 potansiyel müşteri kaydını görüntülüyorsunuz.</p>
      </header>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Ad</th>
              <th>Adres</th>
              <th>Telefon</th>
              <th>Web</th>
              <th>Puan</th>
              <th>Şehir</th>
              <th>Ülke</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-white/50">
                  Henüz kayıtlı lead bulunmuyor.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="font-medium text-white/90">{lead.name}</td>
                  <td>{lead.address ?? '-'}</td>
                  <td>{lead.phone ?? '-'}</td>
                  <td>
                    {lead.website ? (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-brand-red">
                        {lead.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{lead.rating?.toFixed(1) ?? '-'}</td>
                  <td>{lead.city}</td>
                  <td>{lead.country}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
