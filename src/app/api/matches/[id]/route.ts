import { NextResponse } from "next/server";
import { getMatchById } from "@/lib/match-service";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? undefined;

  const item = await getMatchById(id, date);

  if (!item) {
    return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    updatedAt: new Date().toISOString(),
    item,
  });
}
