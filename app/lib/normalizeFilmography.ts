// app/lib/normalizeFilmography.ts

import type { MovieCredit } from "./getActorCredits";

export interface NormalizedFilm {
  id: number;
  title: string;
  poster: string | null;
  year: number | null;
  character: string | null;
  roleType: "Actor" | "Producer" | "Director" | "Writer" | "Crew";
  genres: string[];
  media_type: "movie" | "tv";
  popularity: number;
}

export function normalizeFilmography(credits: MovieCredit[]): NormalizedFilm[] {
  return credits.map((c) => {
    const title = c.title || (c as any).name || "Untitled";
    const date = c.release_date || (c as any).first_air_date || null;
    const year = date ? Number(date.slice(0, 4)) : null;

    // Fix media_type safely
    const mediaType: "movie" | "tv" =
      c.media_type === "tv" ? "tv" : "movie";

    // Prevent undefined genre arrays
    const genres = c.genre_ids ? c.genre_ids.map((_) => "Unknown") : [];

    // Determine role type
    let roleType: NormalizedFilm["roleType"] = "Actor";

    if (c.job) {
      if (c.job === "Director") roleType = "Director";
      else if (c.job === "Producer") roleType = "Producer";
      else if (c.job === "Writer") roleType = "Writer";
      else roleType = "Crew";
    }

    return {
      id: c.id,
      title,
      poster: c.poster_path,
      year,
      character: c.character || null,
      roleType,
      genres,
      media_type: mediaType,
      popularity: c.popularity ?? 0,
    };
  });
}
