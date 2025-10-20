import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const leadSchema = z.object({
  placeId: z.string().min(1),
  name: z.string().min(1),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  rating: z.number().optional().nullable(),
  sector: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

const requestSchema = z.object({
  items: z.array(leadSchema).min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz veri', details: parsed.error.flatten() }, { status: 400 });
  }

  const { items } = parsed.data;

  try {
    const result = await prisma.lead.createMany({
      data: items.map((item) => ({
        placeId: item.placeId,
        name: item.name,
        address: item.address ?? null,
        phone: item.phone ?? null,
        website: item.website ?? null,
        rating: item.rating ?? null,
        sector: item.sector,
        city: item.city,
        country: item.country,
        lat: item.lat ?? null,
        lng: item.lng ?? null,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ count: result.count });
  } catch (error) {
    console.error('Bulk save error', error);
    return NextResponse.json({ error: 'Kayıt sırasında bir hata oluştu.' }, { status: 500 });
  }
}
