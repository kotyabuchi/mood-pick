import { DetailClient } from './detail-client';

import { fetchTmdbMovieServer, fetchTmdbTvServer } from '@/lib/tmdb/server';

import type { Metadata } from 'next';

interface DetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: DetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const { type } = await searchParams;
  const tmdbId = Number(id);
  const contentType = type === 'tv' ? 'tv' : 'movie';

  const data =
    contentType === 'movie'
      ? await fetchTmdbMovieServer(tmdbId)
      : await fetchTmdbTvServer(tmdbId);

  if (!data) {
    return { title: 'MoodPick' };
  }

  const title = 'title' in data ? data.title : data.name;
  const posterPath = data.poster_path
    ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
    : undefined;

  return {
    title: `${title} | MoodPick`,
    description: data.overview,
    openGraph: {
      title,
      description: data.overview,
      images: posterPath ? [posterPath] : [],
    },
  };
}

export default async function DetailPage({
  params,
  searchParams,
}: DetailPageProps) {
  const { id } = await params;
  const { type } = await searchParams;
  const contentType = (type as 'movie' | 'tv') ?? 'movie';

  return <DetailClient tmdbId={Number(id)} contentType={contentType} />;
}
