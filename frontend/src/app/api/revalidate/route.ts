import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Called by Laravel after content changes: POST { tag: "tours" } with
// header "x-revalidate-secret".
export async function POST(req: NextRequest) {
  if (
    !process.env.REVALIDATE_SECRET ||
    req.headers.get("x-revalidate-secret") !== process.env.REVALIDATE_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { tag } = (await req.json()) as { tag?: string };
  if (!tag) return NextResponse.json({ error: "Missing tag" }, { status: 400 });
  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true, tag });
}
