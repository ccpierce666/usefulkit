import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RobloxGameCalculator } from "@/components/roblox-game-calculator";
import { getRobloxGameBySlug, robloxGames } from "@/lib/roblox-hub";

type RobloxGamePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return robloxGames.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: RobloxGamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = getRobloxGameBySlug(slug);
  if (!game) {
    return {};
  }

  const title = `${game.name} Guide, Codes, Tools, and Game Details`;
  const description = `${game.name} guide on UsefulKit: ${game.tagline} Find starter tips, planned tools, FAQ, and SEO page ideas.`;

  return {
    title,
    description,
    keywords: [
      game.name.toLowerCase(),
      `${game.name.toLowerCase()} guide`,
      `${game.name.toLowerCase()} codes`,
      `${game.name.toLowerCase()} value list`,
      `${game.name.toLowerCase()} calculator`,
      "roblox game guide",
      "usefulkit roblox",
    ],
    alternates: {
      canonical: `https://usefulkit.io/roblox/games/${game.slug}`,
    },
    openGraph: {
      title: `${title} | UsefulKit`,
      description,
      url: `https://usefulkit.io/roblox/games/${game.slug}`,
      siteName: "UsefulKit",
      type: "article",
      locale: "en_US",
      images: [
        {
          url: game.imageUrl,
          width: 768,
          height: 432,
          alt: `${game.name} Roblox thumbnail`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | UsefulKit`,
      description,
      images: [game.imageUrl],
    },
  };
}

export default async function RobloxGamePage({ params }: RobloxGamePageProps) {
  const { slug } = await params;
  const game = getRobloxGameBySlug(slug);
  if (!game) {
    notFound();
  }

  const relatedGames = robloxGames.filter((item) => item.slug !== game.slug).slice(0, 3);
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: game.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${game.name} Guide, Tools, and Content Plan`,
    description: game.summary,
    image: game.imageUrl,
    author: {
      "@type": "Organization",
      name: "UsefulKit",
    },
    publisher: {
      "@type": "Organization",
      name: "UsefulKit",
    },
    mainEntityOfPage: `https://usefulkit.io/roblox/games/${game.slug}`,
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
      {
        "@type": "ListItem",
        position: 4,
        name: game.name,
        item: `https://usefulkit.io/roblox/games/${game.slug}`,
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
          <li>
            <Link href="/roblox/games" className="transition hover:text-brand">
              Games
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-foreground">{game.name}</li>
        </ol>
      </nav>

      <header className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="grid lg:grid-cols-[1fr_420px]">
          <div className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">
              {game.category}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              {game.name} guide, tools, and content plan
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg">
              {game.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {game.playStyles.map((style) => (
                <span
                  key={style}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
          <div className="relative min-h-64 bg-white sm:min-h-80 lg:min-h-full">
            <div
              aria-label={`${game.name} Roblox thumbnail`}
              className="absolute inset-0 bg-[#dbe4ef] bg-cover bg-center"
              style={{ backgroundImage: `url(${game.imageUrl})` }}
            />
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Difficulty", game.difficulty],
          ["Spending", game.spending],
          ["Multiplayer", game.multiplayer],
          ["Codes", game.hasCodes ? "Yes" : "Not primary"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
            <p className="mt-2 text-lg font-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight">Quick Take</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">{game.summary}</p>
        <div className="mt-5 rounded-2xl border border-line bg-white p-4">
          <p className="text-sm leading-6 text-muted">
            <span className="font-semibold text-foreground">Best for:</span> {game.bestFor}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            <span className="font-semibold text-foreground">Update signal:</span>{" "}
            {game.updateSignal}
          </p>
        </div>
      </section>

      <RobloxGameCalculator gameSlug={game.slug} gameName={game.name} />

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">UsefulKit Tool Roadmap</h2>
          <div className="mt-4 grid gap-3">
            {game.tools.map((tool) => (
              <div key={tool} className="rounded-2xl border border-line bg-white p-4">
                <h3 className="font-semibold">{tool}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Build this as a focused helper for players who already chose {game.name} and need
                  a quick decision while playing.
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Guide Page Ideas</h2>
          <div className="mt-4 grid gap-3">
            {game.guideIdeas.map((guide) => (
              <div key={guide} className="rounded-2xl border border-line bg-white p-4">
                <h3 className="font-semibold">{guide}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Use a clear update date, short answer block, comparison table, and internal links
                  to tools where useful.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight">Starter Tips</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-muted sm:text-base">
          {game.starterTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ol>
      </section>

      <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight">FAQ</h2>
        <div className="mt-4 space-y-3">
          {game.faq.map((item) => (
            <article key={item.question} className="rounded-2xl border border-line bg-white p-4">
              <h3 className="font-semibold">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight">Related Roblox Games</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {relatedGames.map((related) => (
            <Link
              key={related.slug}
              href={`/roblox/games/${related.slug}`}
              className="rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                {related.category}
              </p>
              <h3 className="mt-2 font-semibold">{related.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{related.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </main>
  );
}
