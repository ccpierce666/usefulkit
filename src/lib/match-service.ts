import { mockMatches } from "@/lib/mock-data";
import { fetchLiveMatchesRange } from "@/lib/live-match-providers";
import type { MatchItem } from "@/lib/types";

export type MatchStatusFilter = "all" | MatchItem["status"];
export type MatchSportFilter = "all" | MatchItem["sport"];
export type MatchDataMode = "mock" | "live" | "hybrid";

export type MatchQuery = {
  status?: MatchStatusFilter;
  sport?: MatchSportFilter;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
};

type MatchCache = {
  timestamp: number;
  items: MatchItem[];
};

const CACHE_TTL_MS = 60_000;
const liveCache = new Map<string, MatchCache>();

function todayInShanghai() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function daysOffsetInShanghai(offsetDays: number) {
  const now = new Date();
  const target = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(target);
}

function normalizeDateRange(query: MatchQuery) {
  if (query.date) {
    return { dateFrom: query.date, dateTo: query.date };
  }

  if (query.dateFrom || query.dateTo) {
    const fallback = todayInShanghai();
    const dateFrom = query.dateFrom ?? query.dateTo ?? fallback;
    const dateTo = query.dateTo ?? query.dateFrom ?? fallback;
    return dateFrom <= dateTo ? { dateFrom, dateTo } : { dateFrom: dateTo, dateTo: dateFrom };
  }

  // default: current week window (today and next 6 days)
  return {
    dateFrom: todayInShanghai(),
    dateTo: daysOffsetInShanghai(6),
  };
}

function getMode(): MatchDataMode {
  const raw = process.env.MATCH_DATA_MODE?.toLowerCase();
  if (raw === "mock" || raw === "live" || raw === "hybrid") {
    return raw;
  }

  return "hybrid";
}

function applyFilters(items: MatchItem[], query: MatchQuery) {
  const { status = "all", sport = "all", date } = query;
  const range = normalizeDateRange(query);

  return items
    .filter((item) => (status === "all" ? true : item.status === status))
    .filter((item) => (sport === "all" ? true : item.sport === sport))
    .filter((item) => {
      if (date) {
        return item.matchDate === date;
      }

      return item.matchDate >= range.dateFrom && item.matchDate <= range.dateTo;
    })
    .sort((a, b) => `${a.matchDate} ${a.startAt}`.localeCompare(`${b.matchDate} ${b.startAt}`));
}

async function getLiveMatchesForRange(dateFrom: string, dateTo: string) {
  const cacheKey = `${dateFrom}|${dateTo}`;
  const cached = liveCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.items;
  }

  const items = await fetchLiveMatchesRange(dateFrom, dateTo);
  liveCache.set(cacheKey, { timestamp: Date.now(), items });
  return items;
}

export async function listMatches(query: MatchQuery = {}) {
  const mode = getMode();
  const range = normalizeDateRange(query);

  let liveItems: MatchItem[] = [];
  if (mode !== "mock") {
    try {
      liveItems = await getLiveMatchesForRange(range.dateFrom, range.dateTo);
    } catch {
      liveItems = [];
    }
  }

  const hasLive = liveItems.length > 0;

  let pool: MatchItem[] = [];
  if (mode === "live") {
    pool = hasLive ? liveItems : [];
  }

  if (mode === "hybrid") {
    pool = hasLive ? [...liveItems, ...mockMatches] : [...mockMatches];
  }

  if (mode === "mock") {
    pool = [...mockMatches];
  }

  return applyFilters(pool, query);
}

export async function getMatchById(id: string, date?: string) {
  const items = await listMatches(date ? { date } : {});

  const direct = items.find((item) => item.id === id);
  if (direct) {
    return direct;
  }

  if (getMode() === "live") {
    return null;
  }

  return mockMatches.find((item) => item.id === id) ?? null;
}

export function getMatchSummary(items: MatchItem[]) {
  const summary = {
    total: items.length,
    live: 0,
    upcoming: 0,
    ended: 0,
    analysisReady: 0,
  };

  for (const item of items) {
    summary[item.status] += 1;
    if (item.analysisReady) {
      summary.analysisReady += 1;
    }
  }

  return summary;
}
