"use client";

import { useEffect, useState } from "react";
import { LocalFirstWatchlistRepository } from "../infrastructure/LocalFirstWatchlistRepository";

export function useWatchlistRepository() {
  const [repo, setRepo] = useState<LocalFirstWatchlistRepository | null>(null);

  useEffect(() => {
    let deviceId = null;

    if (typeof window !== "undefined") {
      deviceId = window.localStorage.getItem("deviceId");
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        window.localStorage.setItem("deviceId", deviceId);
      }
    }

    if (deviceId) {
      const instance = new LocalFirstWatchlistRepository(deviceId);
      setRepo(instance);
    }
  }, []);

  return repo;
}
