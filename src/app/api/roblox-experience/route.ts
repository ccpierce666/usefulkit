import { NextRequest, NextResponse } from "next/server";

type LookupMode = "universeId" | "placeId";

type RobloxUniverseResponse = {
  data?: Array<{
    id: number;
    rootPlaceId: number;
    name: string;
    description: string;
    creator: {
      id: number;
      name: string;
      type: string;
      isRNVAccount?: boolean;
      hasVerifiedBadge?: boolean;
    };
    price: number | null;
    allowedGearGenres?: string[];
    allowedGearCategories?: string[];
    isGenreEnforced?: boolean;
    copyingAllowed?: boolean;
    playing: number;
    visits: number;
    maxPlayers: number;
    created: string;
    updated: string;
    studioAccessToApisAllowed?: boolean;
    createVipServersAllowed?: boolean;
    universeAvatarType?: string;
    genre?: string;
    isAllGenre?: boolean;
    isFavoritedByUser?: boolean;
    favoritedCount: number;
  }>;
};

type RobloxPlaceDetails = {
  universeId: number;
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
    const searchParams = request.nextUrl.searchParams;
    const mode = (searchParams.get("mode") ?? "universeId") as LookupMode;
    const rawId = (searchParams.get("id") ?? "").trim();
    const parsedId = Number(rawId);

    if ((mode !== "universeId" && mode !== "placeId") || !Number.isInteger(parsedId) || parsedId <= 0) {
      return NextResponse.json({ error: "Please provide a valid Roblox universe ID or place ID." }, { status: 400 });
    }

    let universeId = parsedId;
    let resolvedPlaceId: number | null = null;

    if (mode === "placeId") {
      const place = await fetchJson<RobloxPlaceDetails>(
        `https://apis.roblox.com/universes/v1/places/${parsedId}/universe`,
      );
      universeId = place.universeId;
      resolvedPlaceId = parsedId;
    }

    const gameData = await fetchJson<RobloxUniverseResponse>(
      `https://games.roblox.com/v1/games?universeIds=${universeId}`,
    );
    const game = gameData.data?.[0];

    if (!game) {
      return NextResponse.json({ error: "Roblox experience not found." }, { status: 404 });
    }

    const iconRes = await Promise.allSettled([
      fetchJson<{ data?: Array<{ imageUrl?: string }> }>(
        `https://thumbnails.roblox.com/v1/games/icons?universeIds=${game.id}&size=512x512&format=Png&isCircular=false`,
      ),
    ]);
    const iconUrl = iconRes[0].status === "fulfilled" ? iconRes[0].value.data?.[0]?.imageUrl ?? null : null;

    return NextResponse.json({
      experience: {
        id: game.id,
        rootPlaceId: game.rootPlaceId,
        lookupPlaceId: resolvedPlaceId,
        name: game.name,
        description: game.description ?? "",
        creator: game.creator,
        price: game.price,
        playing: game.playing,
        visits: game.visits,
        maxPlayers: game.maxPlayers,
        created: game.created,
        updated: game.updated,
        genre: game.genre ?? "",
        favoritedCount: game.favoritedCount,
        copyingAllowed: game.copyingAllowed ?? false,
        createVipServersAllowed: game.createVipServersAllowed ?? false,
        universeAvatarType: game.universeAvatarType ?? "",
        iconUrl,
        experienceUrl: `https://www.roblox.com/games/${game.rootPlaceId}`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Roblox experience data. Please try again later." },
      { status: 502 },
    );
  }
}
