import Link from "next/link";
import "./actor.css";

export default function ActorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const id = params.id;

  const tabs = [
    { name: "Overview", path: `/actors/${id}` },
    { name: "Filmography", path: `/actors/${id}/filmography` },
    { name: "Awards", path: `/actors/${id}/awards` },
    { name: "Socials", path: `/actors/${id}/socials` },
    { name: "Similar", path: `/actors/${id}/similar` },
  ];

  return (
    <div className="actor-layout">
      <nav className="actor-tabs">
        {tabs.map((t) => (
          <Link key={t.name} href={t.path} className="tab-link">
            {t.name}
          </Link>
        ))}
      </nav>

      <div className="actor-content">{children}</div>
    </div>
  );
}
