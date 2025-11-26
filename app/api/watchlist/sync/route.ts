import { NextResponse } from "next/server";
import { watchlistItemSchema } from "@/app/domain/watchlistSchema";
import { mergeItem } from "@/app/domain/conflict";
import type { WatchlistItem } from "@/app/domain/watchlistTypes";

// In-memory server store (you can replace with MongoDB or Firebase later)
const serverItems: Record<string, WatchlistItem> = {};

export async function POST(req: Request) {
  try {
    const { operations } = await req.json();

    if (!Array.isArray(operations)) {
      return NextResponse.json(
        { error: "operations must be an array" },
        { status: 400 }
      );
    }

    for (const op of operations) {
      if (op.type === "toggle") {
        const incoming = watchlistItemSchema.parse(op.payload.item);

        const existing = serverItems[incoming.id];

        if (!existing) {
          serverItems[incoming.id] = incoming;
        } else {
          serverItems[incoming.id] = mergeItem(existing, incoming);
        }
      }
    }

    return NextResponse.json({
      mergedItems: Object.values(serverItems),
    });
  } catch (err) {
    console.error("Sync API error:", err);

    return NextResponse.json(
      { error: "Failed to sync watchlist" },
      { status: 500 }
    );
  }
}
