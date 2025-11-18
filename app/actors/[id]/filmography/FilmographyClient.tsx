"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import {useQueryClient,useInfiniteQuery,} from "@tanstack/react-query";

import type { PaginatedCredits } from "@/app/lib/getActorCredits";
import type { NormalizedFilm } from "@/app/lib/normalizeFilmography";
import { normalizeFilmography } from "@/app/lib/normalizeFilmography";

import MovieModal from "@/app/components/MovieModal";

interface FilmographyClientProps {actorId: string;initialPage: PaginatedCredits;}

export default function FilmographyClient({actorId,initialPage,}: FilmographyClientProps) {

  const [selectedMovie, setSelectedMovie] = useState<NormalizedFilm | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["actor-credits", actorId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const res = await fetch(`/api/credits?id=${actorId}&page=${pageParam}`);
      return (await res.json()) as PaginatedCredits;
    },
    getNextPageParam: (lastPage: PaginatedCredits) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialData: {
      pages: [initialPage],
      pageParams: [1],
    },
    staleTime: 1000 * 60 * 10,
  });

  const allCredits = useMemo(() => {
    return data?.pages.flatMap((p) => p.results) ?? [];
  }, [data]);

  const films: NormalizedFilm[] = useMemo(() => {
    return normalizeFilmography(allCredits);
  }, [allCredits]);

  const [sortOption, setSortOption] = useState("year-desc");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allGenres = useMemo(
    () =>
      Array.from(
        new Set(films.flatMap((f) => f.genres.filter((g) => g !== "Unknown")))
      ),
    [films]
  );

  const allRoles = ["Actor", "Producer", "Director", "Writer", "Crew"];

  const allYears = useMemo(
    () =>
      Array.from(new Set(films.map((f) => f.year).filter(Boolean))).sort(
        (a, b) => b! - a!
      ),
    [films]
  );

  const filteredAndSorted = useMemo(() => {
    let result = [...films];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((film) =>
        film.title.toLowerCase().includes(q) ||
        film.roleType.toLowerCase().includes(q) ||
        film.genres.some((g) => g.toLowerCase().includes(q)) ||
        (film.year && film.year.toString().includes(q))
      );
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      result = result.filter((f) =>
        f.genres.some((g) => selectedGenres.includes(g))
      );
    }

    // Role filter
    if (selectedRoles.length > 0) {
      result = result.filter((f) => selectedRoles.includes(f.roleType));
    }

    // Year filter
    if (selectedYear !== "all") {
      result = result.filter((f) => f.year === selectedYear);
    }

    // Sorting
    switch (sortOption) {
      case "year-desc":
        result.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        break;
      case "year-asc":
        result.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
        break;
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "popularity":
        result.sort((a, b) => b.popularity - a.popularity);
        break;
    }

    return result;
  }, [
    films,
    searchQuery,
    selectedGenres,
    selectedRoles,
    selectedYear,
    sortOption,
  ]);

  const queryClient = useQueryClient();

  const prefetchFilm = useCallback(
    async (id: number) => {
      await queryClient.prefetchQuery({
        queryKey: ["film", id],
        queryFn: async () => {
          const res = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}`
          );
          return res.json();
        },
        staleTime: 1000 * 60 * 20,
      });
    },
    [queryClient]
  );

  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredAndSorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 260,
    overscan: 8,
  });

  return (
    <div className="space-y-6">

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search filmography..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white"
      />

      {/* SORT */}
      <div className="flex gap-4 items-center">
        <label>Sort by:</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-gray-700 bg-black text-white px-3 py-2 rounded"
        >
          <option value="year-desc">Year (Newest → Oldest)</option>
          <option value="year-asc">Year (Oldest → Newest)</option>
          <option value="title-asc">Title (A → Z)</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>

      {/* GENRES */}
      <h2 className="font-medium">Genres</h2>
      <div className="flex flex-wrap gap-2">
        {allGenres.map((g) => (
          <button
            key={g}
            className={`px-3 py-1 rounded-full border ${
              selectedGenres.includes(g)
                ? "bg-yellow-600 border-yellow-600 text-black"
                : "border-gray-700 text-gray-300"
            }`}
            onClick={() =>
              setSelectedGenres((prev) =>
                prev.includes(g)
                  ? prev.filter((x) => x !== g)
                  : [...prev, g]
              )
            }
          >
            {g}
          </button>
        ))}
      </div>

      {/* ROLES */}
      <h2 className="font-medium">Roles</h2>
      <div className="flex flex-wrap gap-2">
        {allRoles.map((role) => (
          <button
            key={role}
            className={`px-3 py-1 rounded-full border ${
              selectedRoles.includes(role)
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-700 text-gray-300"
            }`}
            onClick={() =>
              setSelectedRoles((prev) =>
                prev.includes(role)
                  ? prev.filter((x) => x !== role)
                  : [...prev, role]
              )
            }
          >
            {role}
          </button>
        ))}
      </div>

      {/* YEAR */}
      <h2 className="font-medium">Year</h2>
      <select
        value={selectedYear}
        onChange={(e) =>
          setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))
        }
        className="border border-gray-700 bg-black text-white px-3 py-2 rounded"
      >
        <option value="all">All Years</option>
        {allYears.map((y) => (
          <option key={y} value={y!}>
            {y}
          </option>
        ))}
      </select>

      {/* RESET */}
      <button
        onClick={() => {
          setSelectedGenres([]);
          setSelectedRoles([]);
          setSelectedYear("all");
          setSearchQuery("");
        }}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Reset Filters
      </button>

      {/* VIRTUALIZED LIST */}
      <div
        ref={parentRef}
        className="h-[80vh] overflow-auto border border-neutral-800 rounded-lg p-4"
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map(
            (virtualRow: VirtualItem) => {
              const film = filteredAndSorted[virtualRow.index];
              if (!film) return null;

              return (
                <div
                  key={film.id}
                  style={{
                    position: "absolute",
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div
                    onMouseEnter={() => prefetchFilm(film.id)}
                    onClick={() => setSelectedMovie(film)}
                    className="group flex gap-4 bg-[#111] p-4 rounded-xl cursor-pointer border border-neutral-800 hover:border-yellow-500/40 hover:scale-[1.01]"
                  >
                    {/* Poster */}
                    {film.poster ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${film.poster}`}
                        className="w-[100px] h-[150px] object-cover rounded-md group-hover:scale-105 transition"
                        loading="lazy"
                        alt={film.title}
                      />
                    ) : (
                      <div className="w-[100px] h-[150px] bg-neutral-800 rounded" />
                    )}

                    {/* Text */}
                    <div>
                      <h3 className="text-white text-lg group-hover:text-yellow-400">
                        {film.title}
                      </h3>

                      {film.year && (
                        <p className="text-gray-400 text-sm">({film.year})</p>
                      )}

                      <span className="inline-block px-2 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600/40 text-xs rounded">
                        {film.roleType}
                      </span>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {film.genres.map((g) => (
                          <span
                            key={g}
                            className="px-2 py-1 text-xs bg-neutral-900 border border-neutral-700 text-gray-300 rounded"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* LOAD MORE */}
      {hasNextPage && (
        <div className="text-center mt-4">
          <button
            onClick={() => fetchNextPage()}
            className="px-4 py-2 bg-yellow-600 text-black rounded"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* MODAL */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
