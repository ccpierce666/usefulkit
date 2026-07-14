import { NextRequest, NextResponse } from "next/server";

type RobloxUserSummary = {
  id: number;
  name: string;
  displayName: string;
};

type RobloxUserGroupRole = {
  group: {
    id: number;
    name: string;
    memberCount: number;
    hasVerifiedBadge?: boolean;
  };
  role: {
    id: number;
    name: string;
    rank: number;
  };
  isPrimaryGroup?: boolean;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

async function resolveUserByUsername(username: string): Promise<RobloxUserSummary | null> {
  const data = await fetchJson<{ data?: RobloxUserSummary[] }>(
    "https://users.roblox.com/v1/usernames/users",
    {
      method: "POST",
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false,
      }),
    },
  );
  return data.data?.[0] ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const usernameInput = (searchParams.get("username") ?? "").trim();
    const userIdInput = (searchParams.get("userId") ?? "").trim();

    if (!usernameInput && !userIdInput) {
      return NextResponse.json({ error: "Please provide username or userId." }, { status: 400 });
    }

    let userId = 0;
    let username = "";
    let displayName = "";

    if (userIdInput) {
      const parsed = Number(userIdInput);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return NextResponse.json({ error: "Invalid userId." }, { status: 400 });
      }
      userId = parsed;
      const user = await fetchJson<{ id: number; name: string; displayName: string }>(
        `https://users.roblox.com/v1/users/${userId}`,
      );
      username = user.name;
      displayName = user.displayName;
    } else {
      const resolved = await resolveUserByUsername(usernameInput.replace(/^@+/, ""));
      if (!resolved) {
        return NextResponse.json({ error: "Roblox user not found." }, { status: 404 });
      }
      userId = resolved.id;
      username = resolved.name;
      displayName = resolved.displayName;
    }

    const groups = await fetchJson<{ data?: RobloxUserGroupRole[] }>(
      `https://groups.roblox.com/v2/users/${userId}/groups/roles`,
    );

    const sortedGroups = (groups.data ?? [])
      .sort((a, b) => {
        if ((b.isPrimaryGroup ? 1 : 0) !== (a.isPrimaryGroup ? 1 : 0)) {
          return (b.isPrimaryGroup ? 1 : 0) - (a.isPrimaryGroup ? 1 : 0);
        }
        return b.group.memberCount - a.group.memberCount;
      })
      .slice(0, 25)
      .map((item) => ({
        groupId: item.group.id,
        groupName: item.group.name,
        memberCount: item.group.memberCount,
        hasVerifiedBadge: item.group.hasVerifiedBadge ?? false,
        roleId: item.role.id,
        roleName: item.role.name,
        rank: item.role.rank,
        isPrimaryGroup: item.isPrimaryGroup ?? false,
        groupUrl: `https://www.roblox.com/groups/${item.group.id}`,
      }));

    return NextResponse.json({
      user: {
        id: userId,
        username,
        displayName,
        profileUrl: `https://www.roblox.com/users/${userId}/profile`,
      },
      groups: sortedGroups,
      totalShown: sortedGroups.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Roblox user groups. Please try again later." },
      { status: 502 },
    );
  }
}
