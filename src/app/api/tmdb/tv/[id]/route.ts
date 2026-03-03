import { NextResponse } from 'next/server';
import { z } from 'zod';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY is not configured' },
      { status: 500 },
    );
  }

  const resolvedParams = await params;
  const parsed = paramsSchema.safeParse({ id: resolvedParams.id });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid TV ID' }, { status: 400 });
  }

  const url = new URL(`${TMDB_BASE_URL}/tv/${parsed.data.id}`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('language', 'ja-JP');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.status_message ?? 'TMDb API error' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
