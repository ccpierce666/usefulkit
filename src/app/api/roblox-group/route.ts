import { NextRequest, NextResponse } from "next/server";

type RobloxGroupDetails = {
  id: number;
  name: string;
  description: string;
  owner: {
    userId: number;
    username: string;
    displayName: string;
  } | null;
  memberCount: number;
  isBuildersClubOnly: boolean;
  publicEntryAllowed: boolean;
  hasVerifiedBadge?: boolean;
};

type RobloxGroupRole = {
  id: number;
  name: string;
  rank: number;
  memberCount: number;
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
    const groupIdInput = (request.nextUrl.searchParams.get("groupId") ?? "").trim();
    const groupId = Number(groupIdInput);

    if (!Number.isInteger(groupId) || groupId <= 0) {
      return NextResponse.json({ error: "Please provide a valid Roblox group ID." }, { status: 400 });
    }

    const group = await fetchJson<RobloxGroupDetails>(`https://groups.roblox.com/v1/groups/${groupId}`);

    const [rolesRes, iconRes] = await Promise.allSettled([
      fetchJson<{ roles?: RobloxGroupRole[] }>(`https://groups.roblox.com/v1/groups/${groupId}/roles`),
      fetchJson<{ data?: Array<{ imageUrl?: string }> }>(
        `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupId}&size=420x420&format=Png&isCircular=false`,
      ),
    ]);

    const roles =
      rolesRes.status === "fulfilled"
        ? (rolesRes.value.roles ?? []).sort((a, b) => b.rank - a.rank).slice(0, 8)
        : [];
    const iconUrl = iconRes.status === "fulfilled" ? iconRes.value.data?.[0]?.imageUrl ?? null : null;

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description ?? "",
        owner: group.owner,
        memberCount: group.memberCount,
        isBuildersClubOnly: group.isBuildersClubOnly,
        publicEntryAllowed: group.publicEntryAllowed,
        hasVerifiedBadge: group.hasVerifiedBadge ?? false,
        iconUrl,
        groupUrl: `https://www.roblox.com/groups/${group.id}`,
      },
      roles,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Roblox group data. Please try again later." },
      { status: 502 },
    );
  }
}
