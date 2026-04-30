import type { MatchItem } from "@/lib/types";

function toShanghaiDateTime(isoDate: string) {
  const date = new Date(isoDate);
  const matchDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const startAt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return { matchDate, startAt };
}

function mapFootballStatus(status: string): MatchItem["status"] {
  const s = status.toUpperCase();

  if (s === "IN_PLAY" || s === "PAUSED" || s === "LIVE") {
    return "live";
  }

  if (s === "FINISHED" || s === "AWARDED") {
    return "ended";
  }

  return "upcoming";
}

function getFootballPhaseLabel(status: string) {
  const s = status.toUpperCase();

  if (s === "PAUSED") {
    return "半场";
  }

  if (s === "IN_PLAY" || s === "LIVE") {
    return "进行中";
  }

  if (s === "FINISHED" || s === "AWARDED") {
    return "已结束";
  }

  return "待开赛";
}

function mapNbaStatus(status: string): MatchItem["status"] {
  const s = status.toLowerCase();

  if (s.includes("final")) {
    return "ended";
  }

  if (s.includes("qtr") || s.includes("halftime") || s.includes("ot") || s.includes("live")) {
    return "live";
  }

  return "upcoming";
}

function getNbaPhaseLabel(status: string) {
  const s = status.toLowerCase();

  if (s.includes("halftime")) {
    return "半场";
  }

  if (s.includes("qtr") || s.includes("ot") || s.includes("live")) {
    return "进行中";
  }

  if (s.includes("final")) {
    return "已结束";
  }

  return "待开赛";
}

function toDateRangeDays(dateFrom: string, dateTo: string) {
  const days: string[] = [];
  const cursor = new Date(`${dateFrom}T00:00:00Z`);
  const end = new Date(`${dateTo}T00:00:00Z`);

  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

type FootballDataMatch = {
  id: number;
  utcDate?: string;
  status?: string;
  venue?: string | null;
  stage?: string | null;
  competition?: {
    name?: string;
  };
  homeTeam?: {
    name?: string;
    tla?: string;
    crest?: string;
  };
  awayTeam?: {
    name?: string;
    tla?: string;
    crest?: string;
  };
  score?: {
    fullTime?: {
      home?: number | null;
      away?: number | null;
    };
    halfTime?: {
      home?: number | null;
      away?: number | null;
    };
  };
};

type FootballDataResponse = {
  matches?: FootballDataMatch[];
};

type BalldontlieGame = {
  id: number;
  date: string;
  status: string;
  postseason?: boolean;
  home_team_score?: number | null;
  visitor_team_score?: number | null;
  home_team?: {
    full_name?: string;
    name?: string;
    abbreviation?: string;
  };
  visitor_team?: {
    full_name?: string;
    name?: string;
    abbreviation?: string;
  };
};

type BalldontlieResponse = {
  data?: BalldontlieGame[];
};

export async function fetchFootballDataMatchesRange(dateFrom: string, dateTo: string): Promise<MatchItem[]> {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  if (!token) {
    return [];
  }

  const url = new URL("https://api.football-data.org/v4/matches");
  url.searchParams.set("dateFrom", dateFrom);
  url.searchParams.set("dateTo", dateTo);

  const res = await fetch(url.toString(), {
    headers: {
      "X-Auth-Token": token,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`football-data request failed: ${res.status}`);
  }

  const data = (await res.json()) as FootballDataResponse;
  const matches = data.matches ?? [];

  return matches.map((item) => {
    const dateTime = toShanghaiDateTime(item.utcDate ?? `${dateFrom}T00:00:00Z`);
    const home = item.homeTeam?.name ?? "Home";
    const away = item.awayTeam?.name ?? "Away";
    const rawStatus = item.status ?? "SCHEDULED";
    const homeScore = item.score?.fullTime?.home ?? item.score?.halfTime?.home ?? null;
    const awayScore = item.score?.fullTime?.away ?? item.score?.halfTime?.away ?? null;

    return {
      id: `fd-${item.id}`,
      externalId: String(item.id),
      sport: "football",
      league: item.competition?.name ?? "Football",
      matchDate: dateTime.matchDate,
      startAt: dateTime.startAt,
      home,
      away,
      homeCode: item.homeTeam?.tla,
      awayCode: item.awayTeam?.tla,
      homeLogoUrl: item.homeTeam?.crest,
      awayLogoUrl: item.awayTeam?.crest,
      venue: item.venue ?? "未知地点",
      status: mapFootballStatus(rawStatus),
      focusTag: item.stage ?? "Fixture",
      trend: `状态：${rawStatus}`,
      source: "football-data",
      analysisReady: true,
      homeScore,
      awayScore,
      phaseLabel: getFootballPhaseLabel(rawStatus),
      rawStatus,
    } satisfies MatchItem;
  });
}

export async function fetchNbaGamesRange(dateFrom: string, dateTo: string): Promise<MatchItem[]> {
  const key = process.env.BALLDONTLIE_API_KEY;
  if (!key) {
    return [];
  }

  const days = toDateRangeDays(dateFrom, dateTo);
  const requests = days.map(async (date) => {
    const url = new URL("https://api.balldontlie.io/v1/games");
    url.searchParams.set("dates[]", date);
    url.searchParams.set("per_page", "100");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: key,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`balldontlie request failed: ${res.status}`);
    }

    const data = (await res.json()) as BalldontlieResponse;
    const games = data.data ?? [];

    return games.map((item) => {
      const dateTime = toShanghaiDateTime(item.date);
      const home = item.home_team?.full_name ?? item.home_team?.name ?? "Home";
      const away = item.visitor_team?.full_name ?? item.visitor_team?.name ?? "Away";
      const status = item.status ?? "Scheduled";

      return {
        id: `nba-${item.id}`,
        externalId: String(item.id),
        sport: "basketball",
        league: item.postseason ? "NBA Playoffs" : "NBA",
        matchDate: dateTime.matchDate,
        startAt: dateTime.startAt,
        home,
        away,
        homeCode: item.home_team?.abbreviation,
        awayCode: item.visitor_team?.abbreviation,
        venue: "未知地点",
        status: mapNbaStatus(status),
        focusTag: item.postseason ? "Postseason" : "Regular Season",
        trend: `状态：${status}`,
        source: "balldontlie",
        analysisReady: true,
        homeScore: item.home_team_score ?? null,
        awayScore: item.visitor_team_score ?? null,
        phaseLabel: getNbaPhaseLabel(status),
        rawStatus: status,
      } satisfies MatchItem;
    });
  });

  const chunks = await Promise.all(requests);
  return chunks.flat();
}

export async function fetchLiveMatchesRange(dateFrom: string, dateTo: string): Promise<MatchItem[]> {
  const tasks = [fetchFootballDataMatchesRange(dateFrom, dateTo), fetchNbaGamesRange(dateFrom, dateTo)] as const;

  const results = await Promise.allSettled(tasks);

  const merged: MatchItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      merged.push(...result.value);
    }
  }

  return merged;
}
