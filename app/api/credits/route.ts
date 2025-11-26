import { NextResponse } from "next/server";
import { getActorCredits } from "@/app/lib/getActorCredits";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Actor ID is required." },
        { status: 400 }
      );
    }

    const page = Number(searchParams.get("page") ?? "1");

    const paginated = await getActorCredits(id, page);

    return NextResponse.json(paginated);
  } catch (error) {
    console.error("Error fetching actor credits:", error);

    return NextResponse.json(
      { error: "Failed to fetch actor credits." },
      { status: 500 }
    );
  }
}
