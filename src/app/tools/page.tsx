import type { Metadata } from "next";
import Link from "next/link";
import { categoryLabels, tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse all free UsefulKit tools for files, text, dates, converters, and health.",
  keywords: [
    "online tools",
    "free tools",
    "calculator tools",
    "file tools",
    "text tools",
    "usefulkit",
  ],
  alternates: {
    canonical: "https://usefulkit.io/tools",
  },
  openGraph: {
    title: "All Tools | UsefulKit",
    description: "Browse all free UsefulKit tools for files, text, dates, converters, and health.",
    url: "https://usefulkit.io/tools",
    siteName: "UsefulKit",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Tools | UsefulKit",
    description: "Browse all free UsefulKit tools for files, text, dates, converters, and health.",
  },
};

export default function ToolsPage() {
  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "UsefulKit All Tools",
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: `https://usefulkit.io/tools/${tool.slug}`,
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
        name: "All Tools",
        item: "https://usefulkit.io/tools",
      },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">All Tools</h1>
        <p className="mt-3 text-base text-muted sm:text-lg">
          Every UsefulKit utility in one place. Free to use, no signup needed.
        </p>
      </header>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="rounded-3xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              {categoryLabels[tool.category]}
            </p>
            <h2 className="mt-2 text-xl font-semibold">{tool.name}</h2>
            <p className="mt-2 text-sm text-muted">{tool.summary}</p>
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
