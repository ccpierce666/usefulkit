import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryKeywordClusters } from "@/lib/seo-keywords";
import { categoryLabels, categoryOrder, getToolsByCategory, type ToolCategory } from "@/lib/tools";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return categoryOrder.map((category) => ({ category }));
}

function isToolCategory(value: string): value is ToolCategory {
  return categoryOrder.includes(value as ToolCategory);
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isToolCategory(category)) {
    return {};
  }

  const name = categoryLabels[category];
  const toolCount = getToolsByCategory(category).length;
  const description = `Browse ${toolCount} free ${name.toLowerCase()} from UsefulKit.`;
  return {
    title: `${name} Tools`,
    description,
    keywords: [
      `${name.toLowerCase()} tools`,
      `${name.toLowerCase()} online`,
      `free ${name.toLowerCase()} tools`,
      "usefulkit",
      ...categoryKeywordClusters[category],
    ],
    alternates: {
      canonical: `https://usefulkit.io/categories/${category}`,
    },
    openGraph: {
      title: `${name} Tools | UsefulKit`,
      description,
      url: `https://usefulkit.io/categories/${category}`,
      siteName: "UsefulKit",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} Tools | UsefulKit`,
      description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  if (!isToolCategory(category)) {
    notFound();
  }

  const list = getToolsByCategory(category);
  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${categoryLabels[category]} Tools`,
    itemListElement: list.map((tool, index) => ({
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
        name: categoryLabels[category],
        item: `https://usefulkit.io/categories/${category}`,
      },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{categoryLabels[category]}</h1>
        <p className="mt-3 text-base text-muted sm:text-lg">
          Free tools in this category, built for quick workflows.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="rounded-3xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand"
          >
            <h2 className="text-xl font-semibold">{tool.name}</h2>
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
