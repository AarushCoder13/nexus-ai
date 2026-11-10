// =============================================================
// Nexus AI — /api/chat
// Calls each provider's real endpoint using a key supplied by the
// client for that single request. Keys are never persisted server-side.
// Fallback: if a provider fails / rate-limits, the next configured
// provider on the team takes over the same role.
// =============================================================
import { NextResponse } from "next/server";
import type { AgentRole } from "@/lib/types";
import { runWithFallback, type TeamRequest } from "@/lib/providers";
import { clientIp, originBlocked, rateLimited } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  prompt: string;
  team: TeamRequest[];
  role?: AgentRole;
  context?: string;
};

export async function POST(req: Request) {
  if (originBlocked(req)) {
    return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  if (rateLimited(`chat:${clientIp(req)}`, 15, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }
  try {
    const body = (await req.json()) as Body;
    if (!body.prompt) {
      return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
    }

    const team: TeamRequest[] = Array.isArray(body.team) ? body.team : [];
    const real = team.filter((t) => t.provider !== "demo");

    if (real.length === 0) {
      return NextResponse.json({ demo: true, text: null });
    }

    const prompt = body.context ? `${body.context}\n\n---\n\n${body.prompt}` : body.prompt;
    const { text, provider, usedFallback } = await runWithFallback(real, prompt);
    return NextResponse.json({ text, provider, usedFallback });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Provider error." }, { status: 502 });
  }
}
