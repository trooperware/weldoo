import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getFeedPage } from "@/lib/feed/queries";

function parsePage(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const page = parsePage(requestUrl.searchParams.get("page"));
    const user = await getCurrentUser();
    const feed = await getFeedPage(page, user?.id);

    return NextResponse.json(feed);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not load feed posts.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
