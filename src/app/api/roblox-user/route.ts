import { NextRequest, NextResponse } from "next/server";

type RobloxUserSummary = {
  id: number;
  name: string;
  displayName: string;
};

type RobloxUserDetails = {
  id: number;
  name: string;
  displayName: string;
  description: string;
  created: string;
  isBanned: boolean;
  hasVerifiedBadge?: boolean;
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
  const payload = {
    usernames: [username],
    excludeBannedUsers: false,
  };
  const data = await fetchJson<{ data?: RobloxUserSummary[] }>(
    "https://users.roblox.com/v1/usernames/users",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  const first = data.data?.[0];
  return first ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const usernameInput = (searchParams.get("username") ?? "").trim();
    const userIdInput = (searchParams.get("userId") ?? "").trim();

    if (!usernameInput && !userIdInput) {
      return NextResponse.json(
        { error: "Please provide username or userId." },
        { status: 400 },
      );
    }

    let userId = 0;
    if (userIdInput) {
      const parsed = Number(userIdInput);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return NextResponse.json({ error: "Invalid userId." }, { status: 400 });
      }
      userId = parsed;
    } else {
      const cleanUsername = usernameInput.replace(/^@+/, "");
      const resolved = await resolveUserByUsername(cleanUsername);
      if (!resolved) {
        return NextResponse.json({ error: "Roblox user not found." }, { status: 404 });
      }
      userId = resolved.id;
    }

    const profile = await fetchJson<RobloxUserDetails>(`https://users.roblox.com/v1/users/${userId}`);

    const [friendsRes, followersRes, followingsRes, avatarRes] = await Promise.allSettled([
      fetchJson<{ count: number }>(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
      fetchJson<{ count: number }>(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
      fetchJson<{ count: number }>(`https://friends.roblox.com/v1/users/${userId}/followings/count`),
      fetchJson<{ data?: Array<{ imageUrl?: string }> }>(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=352x352&format=Png&isCircular=false`,
      ),
    ]);

    const friendsCount = friendsRes.status === "fulfilled" ? friendsRes.value.count : null;
    const followersCount = followersRes.status === "fulfilled" ? followersRes.value.count : null;
    const followingsCount = followingsRes.status === "fulfilled" ? followingsRes.value.count : null;
    const avatarUrl =
      avatarRes.status === "fulfilled" ? avatarRes.value.data?.[0]?.imageUrl ?? null : null;

    return NextResponse.json({
      user: {
        id: profile.id,
        username: profile.name,
        displayName: profile.displayName,
        description: profile.description ?? "",
        created: profile.created,
        isBanned: profile.isBanned,
        hasVerifiedBadge: profile.hasVerifiedBadge ?? false,
        avatarUrl,
        profileUrl: `https://www.roblox.com/users/${profile.id}/profile`,
      },
      stats: {
        friendsCount,
        followersCount,
        followingsCount,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Roblox profile data. Please try again later." },
      { status: 502 },
    );
  }
}

