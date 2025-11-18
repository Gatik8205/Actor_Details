// app/lib/getSimilarActors.ts

import type { MovieCredit } from "./getActorCredits";

/** Co-actor result structure */
export interface SimilarActor {
  id: number;
  name: string;
  profile_path: string | null;
  count: number; // number of movies together
}

/** Sleep helper to avoid TMDB rate limiting */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Safe fetch with automatic retry */
async function safeFetch(url: string, options: any) {
  try {
    return await fetch(url, options);
  } catch {
    await sleep(150);
    return await fetch(url, options);
  }
}

/**
 * Main function to fetch similar actors based on co-appearances
 */
export async function getSimilarActors(id: string): Promise<SimilarActor[]> {
  const token = process.env.TMDB_ACCESS_TOKEN;

  // 1. Fetch the actor's movie credits
  const creditsRes = await safeFetch(
    `https://api.themoviedb.org/3/person/${id}/movie_credits`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 },
    }
  );

  if (!creditsRes.ok) {
    console.error("Credits fetch failed:", await creditsRes.text());
    return [];
  }

  const creditsJson = await creditsRes.json();
  const credits: MovieCredit[] = creditsJson.cast ?? [];

  const actorsMap: Record<number, SimilarActor> = {};

  // 2. Loop through each movie and fetch its full cast
  for (const movie of credits) {
    await sleep(40); // TMDB safe request speed

    const castRes = await safeFetch(
      `https://api.themoviedb.org/3/movie/${movie.id}/credits`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!castRes.ok) continue;

    const castJson = await castRes.json();

    const castList: Array<{
      id: number;
      name: string;
      profile_path: string | null;
    }> = castJson.cast ?? [];

    // 3. Count co-stars
    castList.forEach((actor) => {
      if (actor.id === Number(id)) return; // skip main actor

      if (!actorsMap[actor.id]) {
        actorsMap[actor.id] = {
          id: actor.id,
          name: actor.name,
          profile_path: actor.profile_path,
          count: 1,
        };
      } else {
        actorsMap[actor.id].count += 1;
      }
    });
  }

  // 4. Sort by number of collaborations
  return Object.values(actorsMap).sort((a, b) => b.count - a.count);
}
