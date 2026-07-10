import type { Metadata } from "next";
import Link from "next/link";
import {
  getRobloxGamesWithCodes,
  getRobloxGamesWithTrading,
  robloxCategoryLinks,
  robloxGames,
  robloxToolIdeas,
} from "@/lib/roblox-hub";

export const metadata: Metadata = {
  title: "Roblox Games, Codes, Guides, and Tools",
  description:
    "Discover Roblox games, codes, value lists, calculators, and beginner-friendly guides on UsefulKit.",
  keywords: [
    "roblox games",
    "roblox codes",
    "roblox tools",
    "roblox value list",
    "grow a garden calculator",
    "steal a brainrot value list",
    "fisch fish locations",
    "blox fruits stock",
  ],
  alternates: {
    canonical: "https://usefulkit.io/roblox",
  },
  openGraph: {
    title: "Roblox Games, Codes, Guides, and Tools | UsefulKit",
    description:
      "Find Roblox games to play, then use guides, value lists, and calculators to progress faster.",
    url: "https://usefulkit.io/roblox",
    siteName: "UsefulKit",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roblox Games, Codes, Guides, and Tools | UsefulKit",
    description:
      "Find Roblox games to play, then use guides, value lists, and calculators to progress faster.",
  },
};

export default function RobloxHubPage() {
  const tradingGames = getRobloxGamesWithTrading();
  const codeGames = getRobloxGamesWithCodes();
  const plannedTools = robloxToolIdeas.filter((tool) => tool.status === "Planned");
  const liveTools = robloxToolIdeas.filter((tool) => tool.status === "Live");
  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "UsefulKit Roblox Game Guides",
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
          <li className="font-semibold text-foreground">Roblox</li>
        </ol>
      </nav>

      <header className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">
              UsefulKit Roblox
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Find Roblox games, then use the right guide or tool.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              A focused Roblox channel for game discovery, codes, value lists, calculators, and
              beginner routes. Start with the games people search for every day, then go deeper
              with practical tools.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/roblox/games"
                className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
              >
                Browse Roblox Games
              </Link>
              <Link
                href="/tools/roblox-game-lookup"
                className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
              >
                Open Experience Lookup
              </Link>
            </div>
          </div>
          <div className="grid min-h-72 grid-cols-2 gap-2 bg-[#eef5f8] p-3 sm:min-h-96">
            {robloxGames.slice(0, 4).map((game) => (
              <Link
                key={game.slug}
                href={`/roblox/games/${game.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm"
              >
                <div
                  aria-label={`${game.name} Roblox experience thumbnail`}
                  className="absolute inset-0 bg-[#dbe4ef] bg-cover bg-center transition duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${game.imageUrl})` }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3">
                  <p className="text-sm font-semibold text-white">{game.name}</p>
                  <p className="mt-0.5 text-xs text-white/80">{game.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-3xl font-bold">{robloxGames.length}</p>
          <p className="mt-1 text-sm font-semibold text-muted">Launch game hubs</p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-3xl font-bold">{tradingGames.length}</p>
          <p className="mt-1 text-sm font-semibold text-muted">Trading/value opportunities</p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-3xl font-bold">{plannedTools.length + liveTools.length}</p>
          <p className="mt-1 text-sm font-semibold text-muted">Tool and calculator paths</p>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured Roblox Games</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Pick a game by play style, learning curve, code support, and tool potential.
            </p>
          </div>
          <Link href="/roblox/games" className="text-sm font-semibold text-brand hover:text-brand-strong">
            View all games
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {robloxGames.slice(0, 3).map((game) => (
            <Link
              key={game.slug}
              href={`/roblox/games/${game.slug}`}
              className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-brand"
            >
              <div className="relative aspect-[16/9] bg-white">
                <div
                  aria-label={`${game.name} Roblox thumbnail`}
                  className="absolute inset-0 bg-[#dbe4ef] bg-cover bg-center"
                  style={{ backgroundImage: `url(${game.imageUrl})` }}
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  {game.category}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{game.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{game.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted">
                    {game.difficulty}
                  </span>
                  <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted">
                    {game.spending} spend
                  </span>
                  {game.hasCodes ? (
                    <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                      Codes
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Discovery Angles</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            These are the filters UsefulKit should own before expanding into more Roblox games.
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
          <div className="mt-6 rounded-2xl border border-line bg-white p-4">
            <h3 className="text-sm font-semibold">Games with codes</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {codeGames.map((game) => game.name).join(", ")} are good candidates for code pages,
              but codes should link back into deeper guides and tools.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Tool Roadmap</h2>
          <div className="mt-5 grid gap-3">
            {robloxToolIdeas.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{tool.name}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      tool.status === "Live"
                        ? "bg-brand/10 text-brand"
                        : "bg-[#eef5f8] text-muted"
                    }`}
                  >
                    {tool.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{tool.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight">MVP Content Plan</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Discover",
              text: "Use the Roblox channel and games page to recommend what to play by genre, difficulty, spending, and multiplayer fit.",
            },
            {
              title: "Guide",
              text: "Give each priority game a dedicated hub page with starter tips, tool ideas, update-sensitive notes, and FAQ schema.",
            },
            {
              title: "Tool",
              text: "Turn the highest-intent pages into calculators, finders, value lists, stock pages, and checklists.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
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
