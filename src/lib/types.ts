export type MatchItem = {
  id: string;
  externalId?: string;
  sport: "basketball" | "football";
  league: string;
  matchDate: string;
  startAt: string;
  home: string;
  away: string;
  homeCode?: string;
  awayCode?: string;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
  venue: string;
  status: "upcoming" | "live" | "ended";
  focusTag: string;
  trend: string;
  source: "mock-feed-a" | "mock-feed-b" | "football-data" | "balldontlie";
  analysisReady: boolean;
  homeScore?: number | null;
  awayScore?: number | null;
  phaseLabel?: string;
  rawStatus?: string;
};

export type ModelItem = {
  id: string;
  name: string;
  metric: string;
  updateAt: string;
  confidence: number;
  detail: string;
};

export type ToolApiItem = {
  id: string;
  title: string;
  description: string;
  value: string;
  category: "pre" | "live" | "post";
};
