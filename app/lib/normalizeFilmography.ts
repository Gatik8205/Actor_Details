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

// Map of TMDB genre IDs → names
const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export function normalizeFilmography(credits: MovieCredit[]): NormalizedFilm[] {
  return credits.map((c) => {
    const title = c.title || c.name || "Untitled";
    const date = c.release_date || c.first_air_date || null;
    const year = date ? Number(date.slice(0, 4)) : null;

    // Determine role type
    let roleType: NormalizedFilm["roleType"] = "Actor";

    if (c.job?.includes("Producer")) roleType = "Producer";
    if (c.job?.includes("Director")) roleType = "Director";
    if (c.job?.includes("Writer")) roleType = "Writer";
    if (!c.character && c.department) roleType = "Crew";

    return {
      id: c.id,
      title,
      poster: c.poster_path,
      year,
      character: c.character || c.job || null,
      roleType,
      genres: (c.genre_ids || []).map((g) => GENRE_MAP[g] || "Unknown"),
      media_type: c.media_type || "movie",
      popularity: c.popularity || 0,
    };
  });
}
