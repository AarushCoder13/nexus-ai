import { NextResponse } from "next/server";
import { listProjects } from "@/lib/publish";

export const runtime = "nodejs";

export async function GET() {
  const projects = listProjects().map((p) => ({
    slug: p.slug,
    name: p.name,
    files: Object.keys(p.files),
    publishedAt: undefined as string | undefined,
    url: `/p/${encodeURIComponent(p.slug)}`,
  }));
  return NextResponse.json({ projects });
}
