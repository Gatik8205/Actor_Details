import { getSimilarActors } from "@/app/lib/getSimilarActors";
import Image from "next/image";

interface SimilarPageProps {
  params: {
    id: string;
  };
}

export default async function SimilarActorsPage({ params }: SimilarPageProps) {
  const similar = await getSimilarActors(params.id);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Similar Actors</h2>

      {similar.length === 0 && (
        <p className="text-gray-400">No similar actors found.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {similar.map((actor) => (
          <div key={actor.id} className="text-center">
            {actor.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                width={120}
                height={160}
                alt={actor.name}
                className="rounded-lg shadow"
              />
            ) : (
              <div className="w-[120px] h-[160px] bg-neutral-700 rounded" />
            )}

            <p className="mt-2 text-sm text-white">{actor.name}</p>
            <p className="text-xs text-gray-400">
              {actor.count} collaborations
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
