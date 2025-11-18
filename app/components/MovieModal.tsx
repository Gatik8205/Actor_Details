"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface Genre {
  id: number;
  name: string;
}

export interface MovieData {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
  overview?: string;
  genres?: Genre[];
}

interface MovieModalProps {
  movie: MovieData;
  onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null);

  // ESC key closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Click outside modal closes it
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="
        fixed inset-0 bg-black/60 backdrop-blur-sm 
        flex justify-center items-center z-50
        animate-fadeIn
      "
    >
      <div
        className="
          bg-[#111] p-6 rounded-xl w-[90%] max-w-3xl relative
          border border-neutral-800 shadow-2xl
          animate-scaleIn
        "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="flex gap-6 mt-4">

          {/* Poster */}
          {movie.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              width={180}
              height={270}
              alt={movie.title}
              className="rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-[180px] h-[270px] rounded-lg bg-neutral-700" />
          )}

          {/* Details */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1 text-white">
              {movie.title}
            </h2>

            {movie.release_date && (
              <p className="text-gray-400 mb-2">
                {movie.release_date.split("-")[0]}
              </p>
            )}

            {movie.vote_average !== undefined && (
              <p className="text-yellow-400 font-medium text-lg mb-3">
                ⭐ {movie.vote_average.toFixed(1)}
              </p>
            )}

            {/* Genres */}
            {movie.genres && (
              <div className="flex gap-2 flex-wrap mb-3">
                {movie.genres.map((g) => (
                  <span
                    key={g.id}
                    className="
                      px-3 py-1 text-xs rounded-full 
                      bg-neutral-800 border border-neutral-700 text-gray-300
                    "
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <p className="text-gray-300 leading-relaxed">
                {movie.overview}
              </p>
            )}

            {/* Trailer Button */}
            <a
              href={`https://www.youtube.com/results?search_query=${movie.title}+trailer`}
              target="_blank"
              className="
                inline-block mt-4 px-4 py-2 
                bg-red-600 text-white rounded 
                hover:bg-red-700 transition
              "
            >
              Watch Trailer →
            </a>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
}
