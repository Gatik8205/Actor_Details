export interface ActorSocials {
  instagram_id: string | null;
  twitter_id: string | null;
  facebook_id: string | null;
}

interface TMDBSocialsResponse {
  instagram_id: string | null;
  twitter_id: string | null;
  facebook_id: string | null;
}

export async function getActorSocials(id: string): Promise<ActorSocials> {
  const apiKey = process.env.TMDB_API_KEY;

  const url = `https://api.themoviedb.org/3/person/${id}/external_ids?api_key=${apiKey}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error("Socials fetch error:", await res.text());
    return {
      instagram_id: null,
      twitter_id: null,
      facebook_id: null,
    };
  }

  const data = (await res.json()) as TMDBSocialsResponse;

  return {
    instagram_id: data.instagram_id,
    twitter_id: data.twitter_id,
    facebook_id: data.facebook_id,
  };
}
