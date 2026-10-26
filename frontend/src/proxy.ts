import { NextResponse, type NextRequest } from "next/server";

/**
 * Locale routing without redirects by browser language (bad for SEO):
 *   /treks      -> served by app/[lang] with lang = "en"  (rewrite, URL unchanged)
 *   /fr/treks   -> French
 *   /en/treks   -> permanent redirect to /treks (one canonical URL per page)
 */
const PREFIXED = ["fr", "es", "de"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (first === "en") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(url, 308);
  }
  if (PREFIXED.includes(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // everything except API routes, Next internals and files with an extension (images, robots.txt, sitemap.xml...)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
