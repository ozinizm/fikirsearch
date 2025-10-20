'use client';

import { useState } from 'react';

type PlaceResult = {
  placeId: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  sector: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
};

type SearchResponse = {
  items: PlaceResult[];
  error?: string;
};

const defaultForm = {
  keyword: 'diş kliniği',
  city: 'İstanbul',
  country: 'Türkiye',
  pages: 1,
  enrich: false,
};

export default function SearchPage() {
  const [form, setForm] = useState(defaultForm);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalResults = results.length;

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: form.keyword,
          city: form.city,
          country: form.country,
          pages: Number(form.pages),
          enrich: form.enrich,
        }),
      });

      const data: SearchResponse = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Arama sırasında bir hata oluştu.');
      }
      setResults(data.items);
      setMessage(`${data.items.length} sonuç bulundu.`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Beklenmedik bir hata oluştu.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function downloadCsv() {
    if (results.length === 0) return;
    const headers = ['Name', 'Address', 'Phone', 'Website', 'Rating', 'City', 'Country'];
    const rows = results.map((result) => [
      result.name,
      result.address ?? '',
      result.phone ?? '',
      result.website ?? '',
      typeof result.rating === 'number' ? result.rating.toString() : '',
      result.city,
      result.country,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fikircreative_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleBulkSave() {
    if (results.length === 0) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/leads/bulk-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: results }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lead kaydetme sırasında bir hata oluştu.');
      }
      setMessage(`${data.count} kayıt başarıyla kaydedildi.`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Beklenmedik bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  }

  const disableActions = loading || saving;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Sektör Arama</h1>
        <p className="text-sm text-white/60">Sektör ve lokasyona göre Google üzerinden yeni potansiyel müşterileri keşfedin.</p>
      </header>

      <section className="card space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label htmlFor="keyword">Anahtar Kelime</label>
            <input
              id="keyword"
              value={form.keyword}
              onChange={(event) => setForm((prev) => ({ ...prev, keyword: event.target.value }))}
              placeholder="Örn. diş kliniği"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="city">Şehir</label>
            <input
              id="city"
              value={form.city}
              onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              placeholder="Örn. İstanbul"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="country">Ülke</label>
            <input
              id="country"
              value={form.country}
              onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
              placeholder="Örn. Türkiye"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="pages">Sayfa (1-3)</label>
            <input
              id="pages"
              type="number"
              min={1}
              max={3}
              value={form.pages}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, pages: Math.min(3, Math.max(1, Number(event.target.value))) }))
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="flex items-center gap-3 text-sm text-white/80">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-white/30"
              checked={form.enrich}
              onChange={(event) => setForm((prev) => ({ ...prev, enrich: event.target.checked }))}
            />
            İlk 20 sonucu web sitesi & telefon bilgisiyle zenginleştir
          </label>
          <button type="button" className="btn md:w-auto" disabled={disableActions} onClick={handleSearch}>
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="pill">{totalResults} sonuç</span>
          {message ? <span className="text-green-400">{message}</span> : null}
          {error ? <span className="text-red-400">{error}</span> : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn" onClick={downloadCsv} disabled={results.length === 0 || disableActions}>
            CSV indir
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleBulkSave}
            disabled={results.length === 0 || disableActions}
          >
            {saving ? 'Kaydediliyor...' : 'Hepsini Kaydet'}
          </button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Ad</th>
                <th>Adres</th>
                <th>Telefon</th>
                <th>Web</th>
                <th>Puan</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-white/50">
                    Henüz sonuç bulunmuyor. Arama kriterlerini belirleyip "Ara" butonuna tıklayın.
                  </td>
                </tr>
              ) : (
                results.map((item) => (
                  <tr key={item.placeId}>
                    <td className="font-medium text-white/90">{item.name}</td>
                    <td>{item.address ?? '-'}</td>
                    <td>{item.phone ?? '-'}</td>
                    <td>
                      {item.website ? (
                        <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-brand-red">
                          {item.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{typeof item.rating === 'number' ? item.rating.toFixed(1) : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
