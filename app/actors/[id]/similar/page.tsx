import { getSimilarActors, MovieCast } from "@/app/lib/getSimilarActors";
import Image from "next/image";

interface SimilarPageProps {
  params: {
    id: string;
  };
}

export default async function SimilarActorsPage({ params }: SimilarPageProps) {
  const similar: MovieCast[] = await getSimilarActors(params.id);

  return (
    <div>
      <h2 style={{ marginBottom: "15px" }}>Similar Actors</h2>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          paddingTop: "10px",
        }}
      >
        {similar.length === 0 && (
          <p style={{ opacity: 0.8 }}>No similar actors found.</p>
        )}

        {similar.map((actor) => (
          <div key={actor.id} style={{ width: "120px", textAlign: "center" }}>
            {actor.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                width={100}
                height={150}
                alt={actor.name}
                style={{ borderRadius: "6px" }}
              />
            ) : (
              <div
                style={{
                  width: "100px",
                  height: "150px",
                  background: "#333",
                  borderRadius: "6px",
                }}
              />
            )}

            <p style={{ marginTop: "8px", fontSize: "0.9rem" }}>{actor.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
