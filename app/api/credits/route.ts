import { NextResponse } from "next/server";
import { getActorCredits } from "@/app/lib/getActorCredits";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id")!;
  const page = Number(url.searchParams.get("page") || "1");

  const paginated = await getActorCredits(id, page);

  return NextResponse.json(paginated);
}
