import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { env } from '@/lib/env';

const requestSchema = z.object({
  keyword: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  pages: z.number().int().min(1).max(3),
  enrich: z.boolean().optional().default(false),
});

type GooglePlace = {
  place_id: string;
  name?: string;
  formatted_address?: string;
  rating?: number;
  formatted_phone_number?: string;
  website?: string;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
};

type NormalizedPlace = {
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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse({
    ...body,
    pages: typeof body?.pages === 'number' ? body.pages : Number(body?.pages ?? 1),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz istek', details: parsed.error.flatten() }, { status: 400 });
  }

  const { keyword, city, country, pages, enrich } = parsed.data;
  const apiKey = env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY tanımlı değil.' }, { status: 400 });
  }

  try {
    const rawResults: GooglePlace[] = [];
    let nextPageToken: string | undefined;

    for (let pageIndex = 0; pageIndex < pages; pageIndex += 1) {
      const params = new URLSearchParams({
        query: `${keyword} in ${city} ${country}`.trim(),
        region: 'tr',
        language: 'tr',
        key: apiKey,
      });

      if (pageIndex > 0) {
        if (!nextPageToken) {
          break;
        }
        await wait(2000);
        params.set('pagetoken', nextPageToken);
      }

      const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        const text = await response.text();
        return NextResponse.json({ error: 'Google Places API hatası', details: text }, { status: 502 });
      }

      const data = await response.json();

      if (data.status && !['OK', 'ZERO_RESULTS'].includes(data.status)) {
        return NextResponse.json({ error: `Google Places API durumu: ${data.status}` }, { status: 502 });
      }

      if (Array.isArray(data.results)) {
        rawResults.push(...(data.results as GooglePlace[]));
      }

      nextPageToken = data.next_page_token;

      if (!nextPageToken) {
        break;
      }
    }

    const deduped = new Map<string, NormalizedPlace>();

    for (const place of rawResults) {
      if (!place.place_id) continue;
      if (deduped.has(place.place_id)) continue;

      deduped.set(place.place_id, {
        placeId: place.place_id,
        name: place.name ?? 'Bilinmeyen İşletme',
        address: place.formatted_address,
        phone: place.formatted_phone_number ?? undefined,
        website: place.website ?? undefined,
        rating: typeof place.rating === 'number' ? place.rating : undefined,
        sector: keyword,
        city,
        country,
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
      });
    }

    let normalized = Array.from(deduped.values());

    if (enrich && normalized.length > 0) {
      const detailTargets = normalized.slice(0, 20);
      const enrichResults = await Promise.all(
        detailTargets.map(async (item) => {
          const params = new URLSearchParams({
            place_id: item.placeId,
            fields: 'formatted_phone_number,website,geometry',
            key: apiKey,
            language: 'tr',
          });

          try {
            const detailResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
              {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
              },
            );
            if (!detailResponse.ok) {
              return null;
            }
            const detailData = await detailResponse.json();
            if (detailData.status !== 'OK') {
              return null;
            }

            const detail = detailData.result ?? {};
            return {
              placeId: item.placeId,
              phone: detail.formatted_phone_number as string | undefined,
              website: detail.website as string | undefined,
              lat: detail.geometry?.location?.lat as number | undefined,
              lng: detail.geometry?.location?.lng as number | undefined,
            };
          } catch (error) {
            console.error('Place details error', error);
            return null;
          }
        }),
      );

      const detailMap = new Map<string, { phone?: string; website?: string; lat?: number; lng?: number }>();
      enrichResults.forEach((detail) => {
        if (!detail?.placeId) return;
        detailMap.set(detail.placeId, {
          phone: detail.phone,
          website: detail.website,
          lat: detail.lat,
          lng: detail.lng,
        });
      });

      normalized = normalized.map((item) => {
        const detail = detailMap.get(item.placeId);
        if (!detail) return item;
        return {
          ...item,
          phone: detail.phone ?? item.phone,
          website: detail.website ?? item.website,
          lat: detail.lat ?? item.lat,
          lng: detail.lng ?? item.lng,
        };
      });
    }

    return NextResponse.json({ items: normalized });
  } catch (error) {
    console.error('Search API error', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
