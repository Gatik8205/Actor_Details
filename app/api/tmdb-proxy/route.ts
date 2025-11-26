import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  let path = url.searchParams.get("path"); // e.g. person/500/movie_credits

  const token = process.env.TMDB_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "Missing TMDB_ACCESS_TOKEN" },
      { status: 500 }
    );
  }

  if (!path) {
    return NextResponse.json(
      { error: "Missing required query parameter: path" },
      { status: 400 }
    );
  }

  // ⭐ IMPORTANT FIX: Convert “actors/” to TMDB’s required “person/”
  if (path.startsWith("actors/")) {
    path = path.replace("actors/", "person/");
  }

  const tmdbUrl = `https://api.themoviedb.org/3/${encodeURI(path)}`;

  try {
    const res = await fetch(tmdbUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    // TMDB returns “ok” even if API key is invalid — must check manually
    const data = await res.json();

    if (data && data.status_code === 7) {
      console.error("TMDB Key error:", data.status_message);
      return NextResponse.json({ cast: [], crew: [] });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("TMDB Proxy Error:", err);
    return NextResponse.json(
      { error: "TMDB Proxy failed to fetch" },
      { status: 500 }
    );
  }
}
