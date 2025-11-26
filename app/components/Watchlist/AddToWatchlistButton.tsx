"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useWatchlistRepository } from "@/app/providers/useWatchlistRepository";
import { announce } from "@/app/providers/AccessibilityStatus";

interface Props {
  movieId: string;
  title: string;
  posterUrl?: string;
  initialInWatchlist?: boolean;
}

export default function AddToWatchlistButton({
  movieId,
  title,
  posterUrl,
  initialInWatchlist = false,
}: Props) {
  const repo = useWatchlistRepository();
  const [isInWatchlist, setIsInWatchlist] = useState(initialInWatchlist);
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<"add" | "remove" | null>(null);

  const disabled = loading || !repo;

  const handleToggle = async () => {
    if (!repo) return; // repo not ready yet
    setLoading(true);

    const optimisticNext = !isInWatchlist;
    setIsInWatchlist(optimisticNext);

    announce(
      optimisticNext
        ? `${title} added to your watchlist`
        : `${title} removed from your watchlist`
    );

    try {
      const updated = await repo.toggle(movieId, { title, posterUrl });
      setIsInWatchlist(updated.isInWatchlist);
      setLastAction(updated.isInWatchlist ? "add" : "remove");
    } catch (err) {
      console.error(err);
      setIsInWatchlist(!optimisticNext);
      announce(`Failed to update watchlist for ${title}`);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileTap={{ scale: disabled ? 1 : 0.92 }}
        animate={
          lastAction === "add"
            ? {
                scale: [1, 1.15, 1],
                transition: { type: "spring", stiffness: 300 },
              }
            : {}
        }
        onClick={handleToggle}
        disabled={disabled}
        aria-pressed={isInWatchlist}
        aria-label={
          isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
        }
        className="px-3 py-1 rounded-lg border bg-white dark:bg-neutral-900 dark:text-white text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isInWatchlist
          ? "✓ In Watchlist"
          : repo
          ? "+ Add to Watchlist"
          : "Loading..."}
      </motion.button>

      {lastAction && repo && (
        <button
          onClick={handleToggle}
          disabled={loading}
          className="text-xs underline text-blue-600 dark:text-blue-400 disabled:opacity-60"
        >
          Undo
        </button>
      )}
    </div>
  );
}
