import type { Metadata } from "next";
import Link from "next/link";
import { homeKeywordClusters } from "@/lib/seo-keywords";
import { robloxGames, robloxToolIdeas } from "@/lib/roblox-hub";
import { categoryLabels, categoryOrder, getToolsByCategory, tools } from "@/lib/tools";

const featuredSlugs = [
  "image-compressor",
  "image-converter",
  "pdf-to-jpg",
  "word-counter",
  "age-calculator",
  "unit-converter",
  "time-zone-converter",
];

export const metadata: Metadata = {
  title: "UsefulKit - Free Online Tools That Just Work",
  description:
    "UsefulKit offers fast, free online tools for files, text, dates, calculators, and daily workflows.",
  keywords: [
    "free online tools",
    "useful tools website",
    "file converter",
    "text tools",
    "online calculators",
    "usefulkit",
    ...homeKeywordClusters,
  ],
  alternates: {
    canonical: "https://usefulkit.io",
  },
};

export default function Home() {
  const featuredTools = tools.filter((tool) => featuredSlugs.includes(tool.slug));
  const featuredRobloxGames = robloxGames.slice(0, 3);
  const featuredRobloxTools = robloxToolIdeas.slice(0, 4);
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "UsefulKit",
    url: "https://usefulkit.io",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://usefulkit.io/tools?query={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "UsefulKit Featured Tools",
    itemListElement: featuredTools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: `https://usefulkit.io/tools/${tool.slug}`,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">UsefulKit</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Free Online Tools That Just Work
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Fast, accurate, and privacy-friendly tools for files, text, dates, converters, and
          health calculations.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/tools"
            className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
          >
            Browse All Tools
          </Link>
          <Link
            href="/roblox"
            className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            Explore Roblox Hub
          </Link>
        </div>
      </header>

      <section className="mt-12 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">
              Roblox Games & Tools
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Game discovery, codes, value lists, and calculators.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">
              UsefulKit now has a Roblox channel for players who need quick game picks, beginner
              routes, lookup tools, and practical game guides.
            </p>
          </div>
          <Link href="/roblox" className="text-sm font-semibold text-brand hover:text-brand-strong">
            Open Roblox hub
          </Link>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-3 sm:grid-cols-3">
            {featuredRobloxGames.map((game) => (
              <Link
                key={game.slug}
                href={`/roblox/games/${game.slug}`}
                className="rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  {game.category}
                </p>
                <h3 className="mt-2 font-semibold">{game.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{game.tagline}</p>
              </Link>
            ))}
          </div>
          <div className="rounded-2xl border border-line bg-white p-4">
            <h3 className="font-semibold">Tool roadmap</h3>
            <div className="mt-3 grid gap-2">
              {featuredRobloxTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={tool.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-sm transition hover:border-brand hover:text-brand"
                >
                  <span className="font-semibold">{tool.name}</span>
                  <span className="shrink-0 text-xs text-muted">{tool.status}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">Popular Tools</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="rounded-3xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                {categoryLabels[tool.category]}
              </p>
              <h3 className="mt-2 text-lg font-semibold sm:text-xl">{tool.name}</h3>
              <p className="mt-2 text-sm text-muted">{tool.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight">Browse By Category</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryOrder.map((category) => {
            const list = getToolsByCategory(category);
            return (
              <Link
                key={category}
                href={`/categories/${category}`}
                className="rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <h3 className="text-lg font-semibold">{categoryLabels[category]}</h3>
                <p className="mt-2 text-sm text-muted">{list.length} tools available</p>
              </Link>
            );
          })}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListData) }}
      />
    </main>
  );
}
