import { NextRequest, NextResponse } from "next/server";
import { getMatchSummary, listMatches } from "@/lib/match-service";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "all";
  const sport = url.searchParams.get("sport") ?? "all";
  const date = url.searchParams.get("date") ?? undefined;
  const dateFrom = url.searchParams.get("dateFrom") ?? undefined;
  const dateTo = url.searchParams.get("dateTo") ?? undefined;

  const baseQuery = {
    date,
    dateFrom,
    dateTo,
  };

  const [pool, items] = await Promise.all([
    listMatches(baseQuery),
    listMatches({
      ...baseQuery,
      status: status as "all" | "upcoming" | "live" | "ended",
      sport: sport as "all" | "basketball" | "football",
    }),
  ]);

  const summary = getMatchSummary(items);

  return NextResponse.json({
    success: true,
    filters: { status, sport, date: date ?? null, dateFrom: dateFrom ?? null, dateTo: dateTo ?? null },
    updatedAt: new Date().toISOString(),
    summary,
    facets: {
      sports: Array.from(new Set(pool.map((item) => item.sport))),
      dates: Array.from(new Set(pool.map((item) => item.matchDate))),
      leagues: Array.from(new Set(pool.map((item) => item.league))),
    },
    items,
  });
}
