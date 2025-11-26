"use client";

import { useEffect } from "react";
import { useWatchlistRepository } from "./useWatchlistRepository";

export default function WatchlistSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const repo = useWatchlistRepository();

  useEffect(() => {
    const channel = new BroadcastChannel("watchlist");
    channel.onmessage = () => repo.getAll();
    return () => channel.close();
  }, [repo]);

  return <>{children}</>;
}
