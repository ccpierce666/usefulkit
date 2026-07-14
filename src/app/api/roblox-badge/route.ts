import { NextRequest, NextResponse } from "next/server";

type RobloxBadgeDetails = {
  id: number;
  name: string;
  description: string;
  displayName?: string;
  displayDescription?: string;
  enabled: boolean;
  iconImageId?: number;
  displayIconImageId?: number;
  created: string;
  updated: string;
  statistics?: {
    pastDayAwardedCount?: number;
    awardedCount?: number;
    winRatePercentage?: number;
  };
  awardingUniverse?: {
    id: number;
    name: string;
    rootPlaceId: number;
  };
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function GET(request: NextRequest) {
  try {
    const badgeIdInput = (request.nextUrl.searchParams.get("badgeId") ?? "").trim();
    const badgeId = Number(badgeIdInput);

    if (!Number.isInteger(badgeId) || badgeId <= 0) {
      return NextResponse.json({ error: "Please provide a valid Roblox badge ID." }, { status: 400 });
    }

    const badge = await fetchJson<RobloxBadgeDetails>(`https://badges.roblox.com/v1/badges/${badgeId}`);

    const iconRes = await Promise.allSettled([
      fetchJson<{ data?: Array<{ imageUrl?: string }> }>(
        `https://thumbnails.roblox.com/v1/badges/icons?badgeIds=${badgeId}&size=150x150&format=Png&isCircular=false`,
      ),
    ]);
    const iconUrl = iconRes[0].status === "fulfilled" ? iconRes[0].value.data?.[0]?.imageUrl ?? null : null;

    return NextResponse.json({
      badge: {
        id: badge.id,
        name: badge.displayName || badge.name,
        rawName: badge.name,
        description: badge.displayDescription || badge.description || "",
        enabled: badge.enabled,
        iconImageId: badge.displayIconImageId ?? badge.iconImageId ?? null,
        iconUrl,
        created: badge.created,
        updated: badge.updated,
        awardingUniverse: badge.awardingUniverse ?? null,
        badgeUrl: `https://www.roblox.com/badges/${badge.id}`,
        experienceUrl: badge.awardingUniverse?.rootPlaceId
          ? `https://www.roblox.com/games/${badge.awardingUniverse.rootPlaceId}`
          : null,
      },
      stats: {
        awardedCount: badge.statistics?.awardedCount ?? null,
        pastDayAwardedCount: badge.statistics?.pastDayAwardedCount ?? null,
        winRatePercentage: badge.statistics?.winRatePercentage ?? null,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Roblox badge data. Please try again later." },
      { status: 502 },
    );
  }
}
