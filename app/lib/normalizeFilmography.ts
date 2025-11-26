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

export function normalizeFilmography(
  credits: MovieCredit[] | null | undefined
): NormalizedFilm[] {
  if (!credits || !Array.isArray(credits)) return [];

  return credits
    .filter((c): c is MovieCredit => !!c && typeof c === "object")
    .map((c) => {
      const title =
        (c as any).title ||
        (c as any).name || 
        "Untitled";

      const date =
        (c as any).release_date ||
        (c as any).first_air_date ||
        null;

      const year = date ? Number(String(date).slice(0, 4)) : null;

      return {
        id: c.id,
        title,
        year,
        poster: (c as any).poster_path
          ? `https://image.tmdb.org/t/p/w342${(c as any).poster_path}`
          : null,

        character: (c as any).character || null,

        // Role inference
        roleType:
          (c as any).job === "Director"
            ? "Director"
            : (c as any).job === "Producer"
            ? "Producer"
            : (c as any).job === "Writer"
            ? "Writer"
            : (c as any).character
            ? "Actor"
            : "Crew",

        // Genres come as numbers — keep empty array for now
        genres: [],

        media_type: (c as any).media_type || "movie",

        popularity: (c as any).popularity ?? 0,
      };
    });
}
