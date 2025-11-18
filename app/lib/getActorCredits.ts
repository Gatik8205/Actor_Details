// app/lib/getActorCredits.ts

export interface MovieCredit {
  id: number;
  title: string;
  character?: string;
  job?: string;
  media_type?: string;
  poster_path: string | null;
  release_date?: string;
  popularity: number;
  genre_ids?: number[];
}

export interface PaginatedCredits {
  page: number;
  total_pages: number;
  results: MovieCredit[];
}

export async function getActorCredits(
  id: string,
  page: number = 1
): Promise<PaginatedCredits> {
  const token = process.env.TMDB_ACCESS_TOKEN;

  const res = await fetch(
    `https://api.themoviedb.org/3/person/${id}/movie_credits`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("Failed to load credits:", await res.text());
    return {
      page: 1,
      total_pages: 1,
      results: [],
    };
  }

  const data = await res.json();

  return {
    page,
    total_pages: 1, // TMDB movie_credits returns all in one response
    results: data.cast as MovieCredit[],
  };
}
