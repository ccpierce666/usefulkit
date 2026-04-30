import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchAnalysisTabs } from "@/components/match-analysis-tabs";
import { getMatchById } from "@/lib/match-service";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Match Analysis ${id} | UsefulKit`,
    description: "MVP match analysis detail page.",
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5">
        <Link href="/match-center" className="text-sm font-semibold text-brand transition hover:underline">
          ← 返回赛事列表
        </Link>
      </div>

      <header className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Match Analysis</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {match.home} vs {match.away}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">
          先看比分详情，再看 AI 方案、指数分析、焦点情报、爆冷缝隙和前瞻分析。
        </p>
      </header>

      <div className="mt-6">
        <MatchAnalysisTabs match={match} />
      </div>
    </main>
  );
}
