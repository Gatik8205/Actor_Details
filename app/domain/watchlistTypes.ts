export type DeviceId = string;

export interface VectorClock {
  [deviceId: string]: number;
}

export interface WatchlistItem {
  id: string;
  title: string;
  posterUrl?: string;
  createdAt: string;
  updatedAt: string;
  isInWatchlist: boolean;
  vectorClock: VectorClock;
  lastUpdatedBy: DeviceId;
}
