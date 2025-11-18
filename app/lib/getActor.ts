export async function getActor(id: string) {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB_API_KEY is missing from .env.local");
  }

  const url = `https://api.themoviedb.org/3/person/${id}?api_key=${apiKey}`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error("TMDB fetch error:", await res.text());
    throw new Error("Failed to fetch actor data");
  }

  return res.json();
}
