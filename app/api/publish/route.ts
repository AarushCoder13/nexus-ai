import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getConfiguredSecret, saveProject, validatePublish } from "@/lib/publish";
import { clientIp, originBlocked, rateLimited } from "@/lib/ratelimit";

export const runtime = "nodejs";

// Publishing is disabled unless an operator sets NEXUS_PUBLISH_SECRET.
// Requests must then present `Authorization: Bearer <secret>`.
function authorize(req: Request): { ok: boolean; reason?: string } {
  const secret = getConfiguredSecret();
  if (!secret) {
    return { ok: false, reason: "Publishing is disabled. Set NEXUS_PUBLISH_SECRET (or data/publish-secret.txt) to enable share links." };
  }
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return { ok: false, reason: "Missing authorization token." };
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(secret);
    if (a.length !== b.length) return { ok: false, reason: "Invalid token." };
    return { ok: timingSafeEqual(a, b) };
  } catch {
    return { ok: false, reason: "Invalid token." };
  }
}

export async function POST(req: Request) {
  // 1. Origin + rate limits.
  if (originBlocked(req)) {
    return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  if (rateLimited(`publish:${clientIp(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many publish requests. Try again shortly." }, { status: 429 });
  }

  // 2. Authorization (rejects anonymous injection).
  const auth = authorize(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason ?? "Unauthorized." }, { status: auth.reason ? 403 : 401 });
  }

  // 3. Early body-size guard.
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > 900_000) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  // 4. Parse (bounded by content-length + JSON.stringify below).
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // 5. Validate slug / entry / file paths / sizes / counts.
  const result = validatePublish(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // 6. Persist (throws on failure → 500).
  try {
    await saveProject(result.project);
  } catch (err) {
    console.error("publish: persistence failed", err);
    return NextResponse.json({ error: "Failed to save project." }, { status: 500 });
  }

  return NextResponse.json(
    {
      path: `/p/${encodeURIComponent(result.project.slug)}`,
      sub: `${result.project.slug}.localhost:3000`,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
