export async function getActorCredits(id: string, page: number) {
  const token = process.env.TMDB_ACCESS_TOKEN;

  if (!token) {
    console.error("Missing TMDB_ACCESS_TOKEN");
    return { cast: [], total: 0, page: 1 };
  }

  // ONLY CORRECT PATH:
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/tmdb-proxy?path=person/${id}/movie_credits`;

  let res: Response;

  try {
    res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });
  } catch (err) {
    console.error("Network error calling TMDB Proxy:", err);
    return { cast: [], total: 0, page: 1 };
  }

  if (!res.ok) {
    console.error("TMDB Proxy Error:", res.status, await res.text());
    return { cast: [], total: 0, page: 1 };
  }

  const data = await res.json();
  const castArray = Array.isArray(data.cast) ? data.cast : [];

  const itemsPerPage = 20;
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  const paginated = castArray.slice(start, end);

  return {
    cast: paginated,
    total: castArray.length,
    page,
  };
}
