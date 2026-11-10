// =============================================================
// Nexus AI — /api/build
// Real multi-agent orchestration:
//   Architect + Frontend -> LLM generates a complete single-file page
//   Reviewer             -> LLM critiques it (strict JSON)
//   Fix pass             -> LLM regenerates with the issues applied
// Falls back to the simulated client pipeline when no real key exists.
// =============================================================
import { NextResponse } from "next/server";
import { runWithFallback, type TeamRequest } from "@/lib/providers";
import { clientIp, originBlocked, rateLimited } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractHtml(text: string): string {
  const fence = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  const start = text.search(/<(!DOCTYPE|html)/i);
  if (start >= 0) {
    let html = text.slice(start);
    const end = html.lastIndexOf("</html>");
    if (end >= 0) html = html.slice(0, end + "</html>".length);
    return html.trim();
  }
  return text.trim();
}

function parseIssues(raw: string): string[] {
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j?.issues)) return j.issues.filter((x: unknown) => typeof x === "string");
  } catch {
    /* not strict JSON */
  }
  const m = raw.match(/\[[\s\S]*\]/);
  if (m) {
    try {
      const a = JSON.parse(m[0]);
      if (Array.isArray(a)) return a.filter((x: unknown) => typeof x === "string");
    } catch {
      /* ignore */
    }
  }
  if (/ok|no issues|looks good|none/i.test(raw)) return [];
  return [];
}

function titleFromPrompt(prompt: string): string {
  const words = prompt.split(/\s+/).filter(Boolean).slice(0, 5);
  const t = words.join(" ");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Generated Project";
}

export async function POST(req: Request) {
  if (originBlocked(req)) {
    return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  if (rateLimited(`build:${clientIp(req)}`, 8, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }
  try {
    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) return NextResponse.json({ error: "Missing prompt." }, { status: 400 });

    const team: TeamRequest[] = Array.isArray(body.team) ? body.team : [];
    const real = team.filter((t) => t.provider !== "demo" && !!t.key);
    if (real.length === 0) return NextResponse.json({ demo: true, project: null });

    const codePrompt = `You are a senior frontend engineer building a complete, production-quality single-file webpage.\nRequest: "${prompt}"\nDeliverable: the ENTIRE page as ONE HTML file with inline <style> (responsive, modern, visually polished). You may use a small amount of inline <script> for interactivity. Do NOT reference any external files. Output ONLY the raw HTML — no explanations, no markdown fences.\n`;

    const gen = await runWithFallback(real, codePrompt);
    const html = extractHtml(gen.text);
    if (!html) throw new Error("Provider returned an empty page.");

    // --- Reviewer pass (LLM critique) ---
    let issues: string[] = [];
    try {
      const reviewPrompt = `You are a strict code reviewer. Review the following HTML for correctness, accessibility, responsive layout, and broken markup. Respond with STRICT JSON only: {"issues":["...","..."]} — an empty array if the code is good.\n\nHTML:\n${html}`;
      const rev = await runWithFallback(real, reviewPrompt);
      issues = parseIssues(rev.text);
    } catch {
      issues = [];
    }

    // --- Fix pass ---
    let finalHtml = html;
    let fixesApplied = 0;
    if (issues.length > 0) {
      try {
        const fixPrompt = `A reviewer found these issues:\n- ${issues.join("\n- ")}\n\nFix them and output the COMPLETE revised single-file HTML. Output ONLY raw HTML, no fences.\n\nOriginal:\n${html}`;
        const fixed = await runWithFallback(real, fixPrompt);
        const fixedHtml = extractHtml(fixed.text);
        if (fixedHtml) {
          finalHtml = fixedHtml;
          fixesApplied = issues.length;
        }
      } catch {
        /* keep the original */
      }
    }

    const project = {
      name: titleFromPrompt(prompt),
      framework: `LLM · ${gen.provider}`,
      entry: "app/index.html",
      files: [
        { path: "app/index.html", content: finalHtml, language: "html" },
        { path: "README.md", content: `# ${titleFromPrompt(prompt)}\n\nGenerated with Nexus AI using ${gen.provider}.\n`, language: "markdown" },
        { path: "package.json", content: JSON.stringify({ name: titleFromPrompt(prompt).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "nexus-project", version: "1.0.0", scripts: { start: "npx serve ." } }, null, 2), language: "json" },
      ],
    };

    return NextResponse.json({
      demo: false,
      project,
      provider: gen.provider,
      usedFallback: gen.usedFallback,
      reviewer: { issues, fixesApplied },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Provider error." }, { status: 502 });
  }
}
