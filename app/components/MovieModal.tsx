"use client";

import Link from "next/link";
import AddToWatchlistButton from "@/app/components/Watchlist/AddToWatchlistButton";
//import AddToWatchlistButton from "./Watchlist/AddToWatchlistButton";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  year?: number;
}

export default function MovieCard({ id, title, posterPath, year }: MovieCardProps) {
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w342${posterPath}`
    : undefined;

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-neutral-900 p-3">
      <Link href={`/movies/${id}`}>
        <div className="aspect-2/3 w-full bg-neutral-800 rounded-lg overflow-hidden">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm text-neutral-500">
              No image
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1">
        <Link href={`/movies/${id}`}>
          <h3 className="text-sm font-semibold line-clamp-2">{title}</h3>
        </Link>
        {year && <p className="text-xs text-neutral-400">{year}</p>}

        <AddToWatchlistButton
          movieId={String(id)}
          title={title}
          posterUrl={posterUrl}
        />
      </div>
    </div>
  );
}
