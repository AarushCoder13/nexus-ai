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

    const codePrompt = `You are a Principal Software Engineer and Staff Design Engineer building a production-grade, bespoke web application.

CRITICAL MANDATE — NO "VIBE CODING":
Never generate a generic, shallow AI mockup. Specifically, AVOID these vibe-coding clichés:
- DO NOT use the tired "3 generic feature cards with emojis" (Fast, Secure, Scalable).
- DO NOT use generic purple-gradient marketing text or empty buzzwords like "Transform your workflow with Next-Gen AI".
- DO NOT include dead buttons, fake links, or non-functional placeholders.
- DO NOT use raw text emojis as primary interface icons; use clean, crisp inline SVGs.

Instead, build an authentic, deeply thoughtful product that feels like it was crafted by an elite engineering team (inspired by Stripe, Linear, Supabase, Vercel, Apple, or Raycast).

USER SPECIFICATION:
"${prompt}"

CORE ENGINEERING & CRAFTSMANSHIP RULES:
1. FULL INTERACTIVE FUNCTIONALITY:
   - Every single interactive control (buttons, search filters, category tabs, sort dropdowns, modal triggers, drawers, forms) MUST HAVE fully implemented, bug-free JavaScript.
   - Search & Filters: Typing in search inputs or clicking filter tags MUST immediately update the visible items in real-time.
   - Working Dialogs & Drawers: Clicking detail cards, "Create", "Add to Cart", "Book", or "Inspect" MUST open an interactive modal dialog with backdrop dismiss and escape-key handling.
   - Live State Mutations: Users can add items, toggle statuses, delete entries, or modify counters. Display smooth floating toast notifications for user actions.
   - LocalStorage Persistence: Persist state changes to localStorage so user modifications survive refreshes.

2. DOMAIN-SPECIFIC DEPTH & AUTHENTIC CONTENT:
   - Provide realistic, rich, domain-specific data (at least 6-12 realistic items with authentic names, categories, statuses, timestamps, and realistic metrics).
   - Write realistic, compelling copy tailored strictly to the user's specific request.

3. POLISHED DESIGN SYSTEM & RESPONSIVENESS:
   - Typography: Clean Inter/system-ui hierarchy, thoughtful letter-spacing, balanced line-heights, tabular numbers for metrics.
   - Elevation & Depth: Rich dark or crisp light palette, subtle 1px border lines (e.g. rgba(255,255,255,0.08)), subtle backdrop-blur (glassmorphism), and tasteful accent glows.
   - Crisp Inline SVGs: Use feather/lucide-style SVG icons (stroke-width 2, linecap round) for all UI actions.
   - Responsive Layout: Fluid grid and flexbox that adapt perfectly down to 360px mobile viewports.

DELIVERABLE:
- The ENTIRE application as ONE single, self-contained HTML file with inline <style> and inline <script>.
- Zero external broken assets or libraries (do not rely on external scripts that may fail to load).
- Output ONLY the raw HTML code starting with <!DOCTYPE html> — NO explanations, NO markdown fences.`;

    const gen = await runWithFallback(real, codePrompt);
    const html = extractHtml(gen.text);
    if (!html) throw new Error("Provider returned an empty page.");

    // --- Reviewer pass (LLM critique) ---
    let issues: string[] = [];
    try {
      const reviewPrompt = `You are a strict Principal Code Auditor. Review the following HTML code:
1. Check that it DOES NOT look like a generic vibe-coded template (ensure all buttons have working event handlers, search/filter works, modals work).
2. Check for syntax errors, broken layout, contrast issues, or missing mobile styles.
3. Check that it uses inline SVGs instead of cheesy emojis as icons.

Respond with STRICT JSON only: {"issues":["..."]} — return an empty array [] if it passes senior developer standards.

HTML:
${html}`;
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
        const fixPrompt = `A senior code auditor found these issues in the application:\n- ${issues.join("\n- ")}\n\nFix them completely. Make sure all interactive elements work seamlessly and adhere to developer-grade polish. Output ONLY the raw complete HTML starting with <!DOCTYPE html>, no markdown fences.\n\nOriginal HTML:\n${html}`;
        const fixed = await runWithFallback(real, fixPrompt);
        const fixedHtml = extractHtml(fixed.text);
        if (fixedHtml) {
          finalHtml = fixedHtml;
          fixesApplied = issues.length;
        }
      } catch {
        /* keep original */
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
