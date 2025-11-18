// app/lib/getActorCredits.ts
export interface PaginatedCredits {
  page: number;
  total_pages: number;
  results: MovieCredit[];
}

export async function getActorCredits(id: string, page: number = 1): Promise<PaginatedCredits> {
  const token = process.env.TMDB_ACCESS_TOKEN;

  const res = await fetch(
    `https://api.themoviedb.org/3/person/${id}/movie_credits?page=${page}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 },
    }
  );

  // TMDB movie_credits does NOT paginate normally.
  // So we fake pagination on client.
  const json = await res.json();

  const allCredits: MovieCredit[] = json.cast ?? [];

  const PER_PAGE = 40;

  const start = (page - 1) * PER_PAGE;
  const end = page * PER_PAGE;

  return {
    page,
    total_pages: Math.ceil(allCredits.length / PER_PAGE),
    results: allCredits.slice(start, end),
  };
}
