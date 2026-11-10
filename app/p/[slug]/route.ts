import { NextResponse } from "next/server";
import { getProject } from "@/lib/publish";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const project = getProject(decodeURIComponent(slug));
  if (!project) {
    return new NextResponse("Not found", { status: 404 });
  }
  const html = project.files[project.entry] ?? "";
  // Serve the generated site with conservative, hardening headers.
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      "Content-Security-Policy": [
        "default-src 'none'",
        "style-src 'unsafe-inline'",
        "script-src 'none'",
        "connect-src 'none'",
        "img-src data: blob:",
        "font-src data:",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
        "frame-ancestors 'self'",
      ].join("; "),
    },
  });
}
