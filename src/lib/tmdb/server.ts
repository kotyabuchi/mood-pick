const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

interface TmdbMovieResponse {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
}

interface TmdbTvResponse {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
}

export async function fetchTmdbMovieServer(
  movieId: number,
): Promise<TmdbMovieResponse | null> {
  if (!TMDB_API_KEY) return null;
  const res = await fetch(
    `${TMDB_BASE}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=ja-JP`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return null;
  return res.json();
}

export async function fetchTmdbTvServer(
  tvId: number,
): Promise<TmdbTvResponse | null> {
  if (!TMDB_API_KEY) return null;
  const res = await fetch(
    `${TMDB_BASE}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=ja-JP`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return null;
  return res.json();
}
