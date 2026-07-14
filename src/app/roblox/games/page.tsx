import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { robloxCategoryLinks, robloxGames } from "@/lib/roblox-hub";

export const metadata: Metadata = {
  title: "Best Roblox Games to Play",
  description:
    "Browse Roblox games by category, difficulty, spending level, codes, trading, and UsefulKit guide potential.",
  keywords: [
    "best roblox games",
    "roblox games to play",
    "roblox games with codes",
    "roblox trading games",
    "roblox beginner games",
    "roblox game guides",
  ],
  alternates: {
    canonical: "https://usefulkit.io/roblox/games",
  },
  openGraph: {
    title: "Best Roblox Games to Play | UsefulKit",
    description:
      "Browse Roblox games by category, difficulty, spending level, codes, trading, and guide potential.",
    url: "https://usefulkit.io/roblox/games",
    siteName: "UsefulKit",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Roblox Games to Play | UsefulKit",
    description:
      "Browse Roblox games by category, difficulty, spending level, codes, trading, and guide potential.",
  },
};

export default function RobloxGamesPage() {
  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Roblox Games on UsefulKit",
    itemListElement: robloxGames.map((game, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: game.name,
      url: `https://usefulkit.io/roblox/games/${game.slug}`,
    })),
  };
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://usefulkit.io",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Roblox",
        item: "https://usefulkit.io/roblox",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Games",
        item: "https://usefulkit.io/roblox/games",
      },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition hover:text-brand">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/roblox" className="transition hover:text-brand">
              Roblox
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-foreground">Games</li>
        </ol>
      </nav>

      <header className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Roblox Games</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Best Roblox games by play style, codes, and tool potential.
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted sm:text-lg">
          Use this page as the game discovery layer for UsefulKit. Each game links to a hub page with
          starter advice, guide ideas, and the most useful calculators or lookup tools to build.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {robloxCategoryLinks.map((label) => (
            <span
              key={label}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted"
            >
              {label}
            </span>
          ))}
        </div>
      </header>

      <section className="mt-8 grid gap-5">
        {robloxGames.map((game) => (
          <Link
            key={game.slug}
            href={`/roblox/games/${game.slug}`}
            className="grid overflow-hidden rounded-3xl border border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-brand lg:grid-cols-[320px_1fr]"
          >
            <div className="relative aspect-[16/9] bg-white lg:aspect-auto lg:min-h-64">
              <Image
                src={game.imageUrl}
                alt={`${game.name} Roblox thumbnail`}
                fill
                sizes="(min-width: 1024px) 320px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  {game.category}
                </span>
                {game.hasCodes ? (
                  <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted">
                    Codes
                  </span>
                ) : null}
                {game.hasTrading ? (
                  <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted">
                    Trading
                  </span>
                ) : null}
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">{game.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted sm:text-base">{game.summary}</p>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Difficulty
                  </p>
                  <p className="mt-1 font-semibold">{game.difficulty}</p>
                </div>
                <div className="rounded-2xl border border-line bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Spending
                  </p>
                  <p className="mt-1 font-semibold">{game.spending}</p>
                </div>
                <div className="rounded-2xl border border-line bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Multiplayer
                  </p>
                  <p className="mt-1 font-semibold">{game.multiplayer}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                <span className="font-semibold text-foreground">Best for:</span> {game.bestFor}
              </p>
            </div>
          </Link>
        ))}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </main>
  );
}
