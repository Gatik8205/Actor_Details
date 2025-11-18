import { getActor } from "@/app/lib/getActor";
import { getActorCredits } from "@/app/lib/getActorCredits";
import Filmography from "./actors/[id]/Filmography";

export default async function ActorPage(props: PageProps) {
  const { id } = await props.params;

  const actor = await getActor(id);
  const credits = await getActorCredits(id);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "4rem" }}>
      {/* Actor Info */}
      ...

      <h2 style={{ marginTop: "40px", marginBottom: "20px" }}>Filmography</h2>

      <Filmography credits={credits} />
    </div>
  );
}
