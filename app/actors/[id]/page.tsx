import Image from "next/image";
import { getActor } from "@/app/lib/getActor";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// PAGE
export default async function ActorPage(props: PageProps) {
  const { id } = await props.params;   // 🟢 FIXED: await params

  const actor = await getActor(id);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem" }}>{actor.name}</h1>

      {actor.profile_path && (
        <Image
          src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
          alt={actor.name}
          width={350}
          height={500}
        />
      )}

      <p style={{ marginTop: "1rem" }}>
        {actor.biography || "Biography not available."}
      </p>
    </div>
  );
}

// METADATA
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;   // 🟢 FIXED AGAIN

  const actor = await getActor(id);

  return {
    title: actor.name,
    description: actor.biography?.slice(0, 150),
  };
}
