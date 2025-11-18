import { getActorCredits } from "@/app/lib/getActorCredits";
import { normalizeFilmography } from "@/app/lib/normalizeFilmography";
import FilmographyClient from "./FilmographyClient";

export default async function FilmographyPage({ params }: { params: { id: string } }) {
  const firstPage = await getActorCredits(params.id, 1);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Filmography</h1>

      <FilmographyClient
        actorId={params.id}
        initialPage={firstPage}
      />
    </div>
  );
}
