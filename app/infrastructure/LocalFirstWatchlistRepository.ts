"use client";

import { openDB } from "idb";
import {
  WatchlistItemDTO,
  watchlistItemSchema,
} from "../domain/watchlistSchema";
import { mergeItem } from "../domain/conflict";

const DB_NAME = "watchlist-db";
const STORE_ITEMS = "items";
const STORE_PENDING = "pendingOps";

export class LocalFirstWatchlistRepository {
  private subscribers = new Set<(x: WatchlistItemDTO[]) => void>();
  private deviceId: string;

  constructor(deviceId: string) {
    this.deviceId = deviceId;
  }

  private async db() {
    return openDB(DB_NAME, 3, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_ITEMS)) {
          db.createObjectStore(STORE_ITEMS, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_PENDING)) {
          db.createObjectStore(STORE_PENDING, { keyPath: "id" });
        }
      },
    });
  }

  // -----------------------
  // GET ALL ITEMS
  // -----------------------
  async getAll() {
    const db = await this.db();
    const items = await db.getAll(STORE_ITEMS);
    return items.map((x) => watchlistItemSchema.parse(x));
  }

  // -----------------------
  // GET ITEM BY ID
  // -----------------------
  async getById(id: string) {
    const db = await this.db();
    const item = await db.get(STORE_ITEMS, id);
    return item ? watchlistItemSchema.parse(item) : null;
  }

  // -----------------------
  // MAIN TOGGLE FUNCTION
  // -----------------------
  async toggle(
    id: string,
    meta: { title: string; posterUrl?: string }
  ): Promise<WatchlistItemDTO> {
    const db = await this.db();
    const tx = db.transaction([STORE_ITEMS, STORE_PENDING], "readwrite");
    const store = tx.objectStore(STORE_ITEMS);

    const existing = await store.get(id);

    const now = new Date().toISOString();

    const baseItem: WatchlistItemDTO =
      existing ??
      watchlistItemSchema.parse({
        id,
        title: meta.title,
        posterUrl: meta.posterUrl,
        createdAt: now,
        updatedAt: now,
        isInWatchlist: false,
        vectorClock: { [this.deviceId]: 0 },
        lastUpdatedBy: this.deviceId,
      });

    const updatedClock = {
      ...baseItem.vectorClock,
      [this.deviceId]: (baseItem.vectorClock[this.deviceId] || 0) + 1,
    };

    const updated: WatchlistItemDTO = {
      ...baseItem,
      updatedAt: now,
      isInWatchlist: !baseItem.isInWatchlist,
      lastUpdatedBy: this.deviceId,
      vectorClock: updatedClock,
    };

    await store.put(updated);

    await tx.objectStore(STORE_PENDING).put({
      id: `${id}-${now}-${this.deviceId}`,
      type: "toggle",
      payload: { item: updated },
    });

    await tx.done;

    this.notifySubscribers();
    this.broadcast();
    this.trySync();

    return updated;
  }

  // -----------------------
  // SYNC WITH SERVER
  // -----------------------
  async trySync() {
    if (!navigator.onLine) return;

    const db = await this.db();
    const pending = await db.getAll(STORE_PENDING);
    if (!pending.length) return;

    try {
      const res = await fetch("/api/watchlist/sync", {
        method: "POST",
        body: JSON.stringify({ operations: pending }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Sync failed");

      const { mergedItems } = await res.json();

      const tx = db.transaction([STORE_ITEMS, STORE_PENDING], "readwrite");
      const itemsStore = tx.objectStore(STORE_ITEMS);

      for (const item of mergedItems) {
        const valid = watchlistItemSchema.parse(item);
        await itemsStore.put(valid);
      }

      await tx.objectStore(STORE_PENDING).clear();
      await tx.done;

      this.notifySubscribers();
      this.broadcast();
    } catch (err) {
      console.error("sync error - will retry later", err);
    }
  }

  // -----------------------
  // SUBSCRIBERS
  // -----------------------
  subscribe(cb: (items: WatchlistItemDTO[]) => void) {
    this.subscribers.add(cb);
    this.getAll().then(cb);
    return () => this.subscribers.delete(cb);
  }

  private async notifySubscribers() {
    const items = await this.getAll();
    this.subscribers.forEach((cb) => cb(items));
  }

  // -----------------------
  // CROSS TAB SYNC
  // -----------------------
  private broadcast() {
    const ch = new BroadcastChannel("watchlist");
    ch.postMessage({ updated: true });
    ch.close();
  }
}
