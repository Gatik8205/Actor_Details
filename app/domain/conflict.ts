import { VectorClock, WatchlistItem } from "./watchlistTypes";

export function compareClocks(a: VectorClock, b: VectorClock) {
  let aGreater = false;
  let bGreater = false;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const k of keys) {
    const av = a[k] ?? 0;
    const bv = b[k] ?? 0;
    if (av > bv) aGreater = true;
    if (bv > av) bGreater = true;
  }
  if (!aGreater && !bGreater) return "equal";
  if (aGreater && !bGreater) return "a-newer";
  if (!aGreater && bGreater) return "b-newer";
  return "concurrent";
}

export function mergeItem(server: WatchlistItem, incoming: WatchlistItem) {
  const cmp = compareClocks(server.vectorClock, incoming.vectorClock);

  if (cmp === "b-newer") return incoming;
  if (cmp === "concurrent") {
    return incoming.updatedAt > server.updatedAt ? incoming : server;
  }
  return server;
}
