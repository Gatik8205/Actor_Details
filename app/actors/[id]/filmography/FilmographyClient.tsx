"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import {
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import type { PaginatedCredits } from "@/app/lib/getActorCredits";
import type { NormalizedFilm } from "@/app/lib/normalizeFilmography";
import { normalizeFilmography } from "@/app/lib/normalizeFilmography";

import MovieModal from "@/app/components/MovieModal";

interface FilmographyClientProps {
  actorId: string;
  initialPage: PaginatedCredits;
}

export default function FilmographyClient({
  actorId,
  initialPage,
}: FilmographyClientProps) {
  // ----------------------------------------------------
  // Modal State (typed)
  // ----------------------------------------------------
  const [selectedMovie, setSelectedMovie] = useState<NormalizedFilm | null>(
    null
  );

  // ----------------------------------------------------
  // Infinite Query (Pagination)
  // ----------------------------------------------------
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["actor-credits", actorId],
    initialPageParam: 1,
    // <-- typed pageParam to avoid implicit `any`
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const res = await fetch(`/api/credits?id=${actorId}&page=${pageParam}`);
      return res.json() as Promise<PaginatedCredits>;
    },
    getNextPageParam: (lastPage: PaginatedCredits) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialData: {
      pages: [initialPage],
      pageParams: [1],
    },
    staleTime: 1000 * 60 * 10, // 10-min caching
  });

  // Combine pages safely
  const allCredits = useMemo(
    () => data?.pages.flatMap((p) => p.results) ?? [],
    [data]
  );

  const films: NormalizedFilm[] = useMemo(
    () => normalizeFilmography(allCredits),
    [allCredits]
  );

  // ----------------------------------------------------
  // Filters + Sorting + Search
  // ----------------------------------------------------
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

  const allRoles = useMemo(
    () => ["Actor", "Producer", "Director", "Writer", "Crew"],
    []
  );

  const allYears = useMemo(
    () =>
      Array.from(new Set(films.map((f) => f.year).filter(Boolean))).sort(
        (a, b) => b! - a!
      ),
    [films]
  );

  // ----------------------------------------------------
  // Filter + Sort Logic
  // ----------------------------------------------------
  const filteredAndSorted = useMemo(() => {
    let result = [...films];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (film) =>
          film.title.toLowerCase().includes(q) ||
          film.roleType.toLowerCase().includes(q) ||
          film.genres.some((g) => g.toLowerCase().includes(q)) ||
          (film.year && film.year.toString().includes(q))
      );
    }

    if (selectedGenres.length > 0)
      result = result.filter((film) =>
        film.genres.some((g) => selectedGenres.includes(g))
      );

    if (selectedRoles.length > 0)
      result = result.filter((film) => selectedRoles.includes(film.roleType));

    if (selectedYear !== "all")
      result = result.filter((film) => film.year === selectedYear);

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

  // ----------------------------------------------------
  // Prefetch on Hover (typed)
  // ----------------------------------------------------
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
        staleTime: 1000 * 60 * 20, // 20 mins
      });
    },
    [queryClient]
  );

  // ----------------------------------------------------
  // Virtualized Rendering
  // ----------------------------------------------------
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredAndSorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 260, []),
    overscan: 8,
  });

  // ----------------------------------------------------
  // UI Rendering
  // ----------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Search */}
      <input
        type="text"
        placeholder="Search filmography..."
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchQuery(e.target.value)
        }
        className="
          w-full px-4 py-2 
          bg-black border border-gray-700 
          rounded text-white 
          placeholder-gray-500
          focus:border-yellow-600 focus:outline-none
          transition
        "
      />

      {/* Sorting */}
      <div className="flex gap-4 items-center">
        <label className="font-medium">Sort by:</label>
        <select
          className="border border-gray-700 bg-black text-white px-3 py-2 rounded"
          value={sortOption}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSortOption(e.target.value)
          }
        >
          <option value="year-desc">Year (Newest → Oldest)</option>
          <option value="year-asc">Year (Oldest → Newest)</option>
          <option value="title-asc">Title (A → Z)</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>

      {/* Genres */}
      <div>
        <h2 className="font-medium mb-2">Genres</h2>
        <div className="flex flex-wrap gap-2">
          {allGenres.map((genre) => (
            <button
              key={genre}
              className={`px-3 py-1 rounded-full border ${
                selectedGenres.includes(genre)
                  ? "bg-yellow-600 text-black border-yellow-600"
                  : "border-gray-700 text-gray-300"
              }`}
              onClick={() =>
                setSelectedGenres((prev) =>
                  prev.includes(genre)
                    ? prev.filter((g) => g !== genre)
                    : [...prev, genre]
                )
              }
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div>
        <h2 className="font-medium mb-2">Roles</h2>
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
                    ? prev.filter((r) => r !== role)
                    : [...prev, role]
                )
              }
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Year */}
      <div>
        <h2 className="font-medium mb-2">Year</h2>
        <select
          className="border border-gray-700 bg-black text-white px-3 py-2 rounded"
          value={selectedYear}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))
          }
        >
          <option value="all">All Years</option>
          {allYears.map((y) => (
            <option key={y} value={y!}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Reset */}
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

      {/* Virtualized List */}
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
          {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
            const film = filteredAndSorted[virtualRow.index] as NormalizedFilm | undefined;

            if (!film) return null;

            return (
              <div
                key={film.id}
                style={{
                  position: "absolute",
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="mb-4"
              >
                <div
                  onMouseEnter={() => prefetchFilm(film.id)}
                  onClick={() => setSelectedMovie(film)}
                  className="
                    group flex gap-4 items-start 
                    bg-[#111] p-4 rounded-xl cursor-pointer 
                    border border-neutral-800
                    transition-all duration-300
                    hover:shadow-[0_0_25px_rgba(255,200,0,0.35)]
                    hover:border-yellow-500/40
                    hover:scale-[1.015]
                  "
                >
                  {/* Poster */}
                  {film.poster ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${film.poster}`}
                      className="
                        w-[100px] h-[150px] object-cover rounded-lg 
                        transition-transform duration-300 group-hover:scale-105
                      "
                      loading="lazy"
                      alt={film.title}
                    />
                  ) : (
                    <div className="w-[100px] h-[150px] bg-neutral-700 rounded" />
                  )}

                  {/* Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition">
                      {film.title}
                    </h3>

                    {film.year && (
                      <p className="text-gray-500 text-sm mb-1">({film.year})</p>
                    )}

                    <span
                      className="
                        inline-block px-2 py-1 text-xs rounded-md 
                        bg-yellow-600/20 text-yellow-400 border border-yellow-600/40
                      "
                    >
                      {film.roleType}
                    </span>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {film.genres.map((g) => (
                        <span
                          key={g}
                          className="
                            px-2 py-1 text-xs rounded-full 
                            bg-neutral-800 border border-neutral-700
                            text-gray-300
                          "
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Load more */}
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

      {/* Modal */}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
