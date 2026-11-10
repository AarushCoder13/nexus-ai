import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Subdomain router — the "name.lovable.app" equivalent.
// Any request to <slug>.localhost (dev) or <slug>.nexusai.app (prod)
// is mapped to the published project with that slug.
export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const match = host.match(/^([a-z0-9-]+)\.(localhost|nexusai\.app)(:\d+)?$/i);
  if (match) {
    const slug = match[1];
    const url = new URL(`/p/${encodeURIComponent(slug)}`, req.url);
    return NextResponse.rewrite(url);
  }

  const { pathname } = req.nextUrl;

  // Allow static assets, API routes, public preview pages, and the login page
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/_next") ||
    pathname === "/login" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check auth cookie for protected workspace pages (/, /settings, /projects)
  const isAuth = req.cookies.get("nexus_auth")?.value;
  if (!isAuth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
