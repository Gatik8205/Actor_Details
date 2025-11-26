import { z } from "zod";

export const vectorClockSchema = z.record(z.string(), z.number());

export const watchlistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  posterUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isInWatchlist: z.boolean(),
  vectorClock: vectorClockSchema,
  lastUpdatedBy: z.string(),
});

export type WatchlistItemDTO = z.infer<typeof watchlistItemSchema>;
