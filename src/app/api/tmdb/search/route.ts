import { NextResponse } from 'next/server';
import { z } from 'zod';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const searchParamsSchema = z.object({
  query: z.string().min(2),
  page: z.coerce.number().int().positive().default(1),
});

export async function GET(request: Request) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY is not configured' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = searchParamsSchema.safeParse({
    query: searchParams.get('query'),
    page: searchParams.get('page') ?? 1,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { query, page } = parsed.data;

  const url = new URL(`${TMDB_BASE_URL}/search/multi`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('language', 'ja-JP');
  url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));

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
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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
