import { getActorSocials, SocialLinks } from "@/app/lib/getActorSocials";

interface SocialsPageProps {
  params: {
    id: string;
  };
}

export default async function SocialsPage({ params }: SocialsPageProps) {
  const socials: SocialLinks = await getActorSocials(params.id);

  const hasAnySocial =
    socials.instagram_id ||
    socials.twitter_id ||
    socials.facebook_id;

  return (
    <div>
      <h2 style={{ marginBottom: "15px" }}>Social Links</h2>

      {!hasAnySocial && (
        <p style={{ opacity: 0.8 }}>
          No social media profiles found for this actor.
        </p>
      )}

      {hasAnySocial && (
        <ul style={{ lineHeight: "2rem", fontSize: "1.05rem" }}>
          {socials.instagram_id && (
            <li>
              <a
                href={`https://instagram.com/${socials.instagram_id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#61dafb" }}
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
                rel="noopener noreferrer"
                style={{ color: "#61dafb" }}
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
                rel="noopener noreferrer"
                style={{ color: "#61dafb" }}
              >
                Facebook
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
