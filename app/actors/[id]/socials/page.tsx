import { getActorSocials } from "@/app/lib/getActorSocials";

interface SocialsPageProps {
  params: {
    id: string;
  };
}

export default async function SocialsPage({ params }: SocialsPageProps) {
  const socials = await getActorSocials(params.id);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Social Links</h2>

      <ul className="space-y-2">
        {socials.instagram_id && (
          <li>
            <a
              href={`https://instagram.com/${socials.instagram_id}`}
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              Instagram
            </a>
          </li>
        )}

        {socials.twitter_id && (
          <li>
            <a
              href={`https://x.com/${socials.twitter_id}`}
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              Twitter (X)
            </a>
          </li>
        )}

        {socials.facebook_id && (
          <li>
            <a
              href={`https://facebook.com/${socials.facebook_id}`}
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              Facebook
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
