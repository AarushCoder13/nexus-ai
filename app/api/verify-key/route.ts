import { NextResponse } from "next/server";
import { verifySingleKey } from "@/lib/providers";
import { type ProviderId } from "@/lib/types";
import { clientIp, rateLimited } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (rateLimited(`verify:${clientIp(req)}`, 20, 60_000)) {
    return NextResponse.json({ ok: false, message: "Too many verification attempts. Please wait a minute." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const provider = body.provider as ProviderId;
    const key = typeof body.key === "string" ? body.key.trim() : "";

    if (!provider || provider === "demo") {
      return NextResponse.json({ ok: true, message: "Demo mode requires no API key." });
    }

    if (!key) {
      return NextResponse.json({ ok: false, message: "Please enter an API key to test." }, { status: 400 });
    }

    const res = await verifySingleKey(provider, key);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || "Verification failed." }, { status: 500 });
  }
}
