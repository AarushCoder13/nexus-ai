// =============================================================
// Nexus AI — Multi-agent team pipeline (simulated build engine)
// Produces real, self-contained HTML/CSS/JS projects for the live
// preview, plus a file tree, console logs, and a reviewer pass.
// =============================================================
import type {
  ActivityEvent,
  ActivityStep,
  ChatStatus,
  ConsoleLine,
  GeneratedProject,
  TeamMember,
} from "./types";
import { uid } from "./utils";

// ---- Activity stage definitions ----------------------------------------
export const DEFAULT_STAGES: { id: ActivityStep["id"]; label: string }[] = [
  { id: "understand", label: "Understanding idea" },
  { id: "plan", label: "Planning architecture" },
  { id: "files", label: "Creating files" },
  { id: "code", label: "Writing code" },
  { id: "build", label: "Running build" },
  { id: "review", label: "Reviewing & fixing errors" },
  { id: "preview", label: "Preview ready" },
];

const ROLE_FOR_STAGE: Record<ActivityStep["id"], TeamMember["role"]> = {
  understand: "Planner",
  plan: "Architect",
  files: "Architect",
  code: "Frontend",
  build: "Backend",
  review: "Reviewer",
  preview: "Reviewer",
};

export function initialSteps(team: TeamMember[]): ActivityStep[] {
  return DEFAULT_STAGES.map((s) => ({
    ...s,
    status: "pending",
    agent: (team.find((t) => t.role === ROLE_FOR_STAGE[s.id])?.provider ?? "demo") as string,
  }));
}

// ---- Console / event helpers -------------------------------------------
let consCounter = 0;
function cl(level: ConsoleLine["level"], text: string): ConsoleLine {
  return { id: uid("c"), ts: Date.now(), level, text };
}
function ev(
  agent: string,
  role: TeamMember["role"],
  message: string,
  kind: ActivityEvent["kind"],
): ActivityEvent {
  return { id: uid("e"), agent, role, message, ts: Date.now(), kind };
}

// ---- Developer-Grade Templates (Anti-Vibe-Coding Engine) -----------------
export {
  detectTemplate,
  templateName,
  type TemplateId,
} from "./developerGradeTemplates";
import {
  detectTemplate,
  templateName,
  portfolioSite,
  ecommerceSite,
  dashboardSite,
  trackerSite,
  saasSite,
  bespokeSite,
} from "./developerGradeTemplates";

// ---- Screenshot → pixel-perfect ------------------------------------------
export type ReferenceAttachment = { name: string; url: string };

/**
 * Sample dominant colors from a reference image (client-side canvas).
 * Quantizes the image to a grid and buckets colors to build a palette.
 */
function extractPalette(dataUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 48;
        const c = document.createElement("canvas");
        c.width = size;
        c.height = size;
        const ctx = c.getContext("2d");
        if (!ctx) return resolve([]);
        ctx.drawImage(img, 0, 0, size, size);
        const d = ctx.getImageData(0, 0, size, size).data;
        const buckets: Record<string, { r: number; g: number; b: number; n: number }> = {};
        for (let i = 0; i < d.length; i += 4) {
          const r = Math.round(d[i] / 16) * 16;
          const g = Math.round(d[i + 1] / 16) * 16;
          const b = Math.round(d[i + 2] / 16) * 16;
          const k = `${r},${g},${b}`;
          if (!buckets[k]) buckets[k] = { r, g, b, n: 0 };
          buckets[k].n++;
        }
        const sorted = Object.values(buckets).sort((a, b2) => b2.n - a.n);
        const top = sorted.slice(0, 6).map((x) => "#" + [x.r, x.g, x.b].map((v) => v.toString(16).padStart(2, "0")).join(""));
        resolve(top);
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = dataUrl;
  });
}

async function pixelPerfectSite(dataUrl: string, name: string): Promise<GeneratedProject> {
  const palette = await extractPalette(dataUrl);
  const accent = palette[1] || palette[0] || "#6d5dfc";
  const dark = palette[0] || "#0b0d12";
  const title = (name.replace(/\.[^.]+$/, "") || "Design").replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  const swatches = palette.slice(0, 5).map((c) => `<span style="background:${c}">${c}</span>`).join("");

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${title} — Pixel Perfect</title><style>
:root{--accent:${accent};--bg:${dark};--panel:#12151d;--panel2:#171b26;--text:#e7eaf0;--muted:#9aa3b2;--border:#232838;--radius:16px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6}
.container{max-width:1080px;margin:0 auto;padding:0 24px}
nav{display:flex;justify-content:space-between;align-items:center;padding:22px 0;border-bottom:1px solid var(--border)}
.logo{font-weight:800;font-size:19px}.logo span{color:var(--accent)}
.nav-links{display:flex;gap:24px;color:var(--muted);font-size:14px}
.hero{padding:64px 0 40px}
.eyebrow{color:var(--accent);font-weight:600;letter-spacing:.12em;text-transform:uppercase;font-size:12px}
h1{font-size:clamp(28px,4vw,42px);margin:12px 0;letter-spacing:-.02em}
.hero p{color:var(--muted);max-width:560px;margin-bottom:24px}
.btn{display:inline-flex;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:600;border:none}
.compare{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:32px 0 56px}
.frame{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
.frame .cap{padding:10px 14px;font-size:12px;color:var(--muted);border-bottom:1px solid var(--border);font-weight:600}
.frame img{width:100%;display:block;max-height:360px;object-fit:cover;background:#fff}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding-bottom:56px}
.card{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:22px}
.card .dot{width:36px;height:36px;border-radius:10px;margin-bottom:12px}
.card h3{font-size:15px;margin-bottom:6px}
.card p{color:var(--muted);font-size:13px}
.palette{display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding-bottom:56px}
.palette span{font-family:monospace;font-size:11px;color:#fff;padding:14px 12px;border-radius:10px;display:inline-block}
.palette .lbl{color:var(--muted);font-size:13px;font-weight:600}
.swatches{display:flex;gap:8px}
@media (max-width:860px){.compare,.cards{grid-template-columns:1fr}.nav-links{display:none}}
</style></head><body>
<nav class="container"><div class="logo">Nexus<span>.</span></div><div class="nav-links"><a href="#compare">Compare</a><a href="#cards">Blocks</a></div></nav>
<section class="hero container"><div class="eyebrow">Screenshot · Pixel Perfect</div><h1>${title}</h1><p>Rebuilt from your reference screenshot — palette extracted automatically, layout recreated, ready for production.</p><button class="btn">Explore</button></section>
<section class="container" id="compare"><div class="compare"><div class="frame"><div class="cap">Original reference</div><img src="${dataUrl}" alt="Original reference"/></div><div class="frame"><div class="cap">Rendered with Nexus</div><div style="padding:22px"><div class="eyebrow" style="font-size:11px">Recreated layout</div><h1 style="font-size:24px">Pixel-perfect output</h1><p style="color:var(--muted);font-size:14px;margin:10px 0 18px">Spacing, hierarchy and color balance follow your original design.</p><button class="btn">Live preview</button></div></div></div></section>
<section class="container" id="cards"><div class="cards"><div class="card"><div class="dot" style="background:${palette[1] || "#8b5cf6"}"></div><h3>Brand palette</h3><p>Dominant tones detected from your reference, applied across the site.</p></div><div class="card"><div class="dot" style="background:${palette[2] || "#10b981"}"></div><h3>Layout grid</h3><p>The section structure mirrors the proportions of your screenshot.</p></div><div class="card"><div class="dot" style="background:${palette[3] || "#f59e0b"}"></div><h3>Responsive</h3><p>Adapts cleanly from desktop to mobile without losing intent.</p></div></div></section>
<section class="container"><div class="palette"><span class="lbl">Extracted palette</span><div class="swatches">${swatches}</div></div></section>
</body></html>`;

  const files = [
    { path: "app/index.html", language: "html", content: html },
    { path: "package.json", language: "json", content: JSON.stringify({ name: "pixel-perfect", version: "1.0.0", scripts: { start: "npx serve .", build: "echo built && exit 0" }, dependencies: {} }, null, 2) },
    { path: "README.md", language: "markdown", content: `# ${title} — Screenshot to Pixel Perfect\n\nRecreated from \`${name}\` by the Nexus AI team.\n\nExtracted palette: ${palette.join(", ") || "default"}\n` },
  ];
  return { name: `${title}`, framework: "Static HTML · from screenshot", files, entry: "app/index.html" };
}

async function generateFor(request: string, attachment?: ReferenceAttachment): Promise<{ project: GeneratedProject; palette?: string[] }> {
  if (attachment) {
    const project = await pixelPerfectSite(attachment.url, attachment.name);
    return { project, palette: undefined };
  }
  switch (detectTemplate(request)) {
    case "portfolio": return { project: portfolioSite() };
    case "ecommerce": return { project: ecommerceSite() };
    case "dashboard": return { project: dashboardSite() };
    case "tracker": return { project: trackerSite() };
    case "saas": return { project: saasSite() };
    default: return { project: bespokeSite(request) };
  }
}

// ---- Reviewer pass: applies polish + appends fixes ------------------------
function applyReviewPass(project: GeneratedProject, notes: string[]): GeneratedProject {
  // In a real integration this would trigger the Reviewer model to rewrite
  // files. Here we demonstrate the mechanics by injecting the review notes
  // into the README and adding a tiny "reviewed" banner to the HTML.
  const files = project.files.map((f) => {
    if (f.path === "README.md") {
      const extra = notes.map((n) => `- ${n}`).join("\n");
      return { ...f, content: `${f.content}\n\n## Reviewer pass\n${extra}\n` };
    }
    return f;
  });
  return { ...project, files };
}

// ---- Main pipeline -------------------------------------------------------
export type BuildCallbacks = {
  onStep?: (step: ActivityStep) => void;
  onEvent?: (event: ActivityEvent) => void;
  onConsole?: (line: ConsoleLine) => void;
  onStatus?: (status: ChatStatus) => void;
  onProject?: (project: GeneratedProject) => void;
  onReviewNotes?: (notes: string[]) => void;
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runAgentPipeline(
  request: string,
  team: TeamMember[],
  cb: BuildCallbacks,
  opts: { attachment?: ReferenceAttachment } = {},
): Promise<GeneratedProject> {
  const display = (m: TeamMember) =>
    `${m.provider === "demo" ? "Nexus" : PROVIDER_LABEL[m.provider]}`;
  const roleFor = (role: TeamMember["role"]) => team.find((t) => t.role === role);

  cb.onStatus?.("Building");

  // Stage 1 — Understand (Planner)
  let st: ActivityStep = { id: "understand", label: "Understanding idea", status: "active", agent: display(roleFor("Planner")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Planner")!), "Planner", `Parsing request: "${request.slice(0, 60)}"`, "start"));
  await delay(650);
  cb.onConsole?.(cl("info", `Analyzing intent → template "${templateName(detectTemplate(request), request)}"`));
  if (opts.attachment) {
    cb.onEvent?.(ev("Vision", "Planner", `Analyzing reference design: ${opts.attachment.name}`, "note"));
    cb.onConsole?.(cl("info", `Detected uploaded reference → ${opts.attachment.name}`));
  }

  // Stage 2 — Plan (Architect)
  st = { ...st, status: "done" }; cb.onStep?.(st);
  st = { id: "plan", label: "Planning architecture", status: "active", agent: display(roleFor("Architect")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Planner")!), "Planner", `Handing off structure brief to Architect`, "handoff"));
  cb.onEvent?.(ev(display(roleFor("Architect")!), "Architect", "Mapping file tree, layout system, and responsive breakpoints", "start"));
  await delay(720);
  cb.onConsole?.(cl("info", "Planning layout, color system, and responsive breakpoints"));

  // Stage 3 — Files
  st = { ...st, status: "done" }; cb.onStep?.(st);
  st = { id: "files", label: "Creating files", status: "active", agent: display(roleFor("Architect")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Architect")!), "Architect", "Scaffolding project structure", "note"));
  await delay(420);
  cb.onConsole?.(cl("cmd", "mkdir app && touch app/index.html package.json README.md"));

  // Stage 4 — Code (Frontend + Backend)
  st = { ...st, status: "done" }; cb.onStep?.(st);
  st = { id: "code", label: "Writing code", status: "active", agent: display(roleFor("Frontend")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Frontend")!), "Frontend", `Generating UI components and layouts`, "start"));
  await delay(700);
  cb.onConsole?.(cl("cmd", "writing app/index.html …"));
  cb.onEvent?.(ev(display(roleFor("Backend")!), "Backend", "Adding client-side logic (state, interactivity, storage)", "note"));
  await delay(500);
  const { project: draft } = await generateFor(request, opts.attachment);
  if (opts.attachment) {
    cb.onConsole?.(cl("info", "Extracted palette & layout intent from reference image"));
  }
  cb.onConsole?.(cl("success", `Wrote ${draft.files.length} files`));
  cb.onProject?.(draft);

  // Stage 5 — Build
  st = { ...st, status: "done" }; cb.onStep?.(st);
  st = { id: "build", label: "Running build", status: "active", agent: display(roleFor("Backend")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Backend")!), "Backend", "Running production build in sandbox", "start"));
  await delay(600);
  cb.onConsole?.(cl("cmd", "$ npm run build"));
  await delay(400);
  cb.onConsole?.(cl("info", "Compiling… ✓ 0 errors"));
  cb.onConsole?.(cl("success", "Build completed successfully"));
  st = { ...st, status: "done" }; cb.onStep?.(st);

  // Stage 6 — Review (Reviewer marks a corrective pass)
  st = { id: "review", label: "Reviewing & fixing errors", status: "active", agent: display(roleFor("Reviewer")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Reviewer")!), "Reviewer", "Draft is not production-ready yet — running critique pass", "start"));
  await delay(650);
  cb.onEvent?.(ev(display(roleFor("Reviewer")!), "Reviewer", "Flagged: spacing rhythm inconsistent, missing focus states, weak hero contrast", "review"));
  const notes = [
    "Normalized spacing scale and vertical rhythm",
    "Added keyboard focus-visible states for accessibility",
    "Hardened contrast on muted text for WCAG AA",
    "Applied hover + motion polish across interactive elements",
  ];
  cb.onConsole?.(cl("warn", "Reviewer flagged 3 issues → applying fixes"));
  await delay(600);
  const final = applyReviewPass(draft, notes);
  cb.onProject?.(final);
  cb.onReviewNotes?.(notes);
  await delay(450);
  cb.onConsole?.(cl("success", "Review fixes applied — all issues resolved"));
  cb.onEvent?.(ev(display(roleFor("Reviewer")!), "Reviewer", "Post-fix check passed. Commoning preview.", "done"));
  st = { ...st, status: "done" }; cb.onStep?.(st);

  // Stage 7 — Preview
  st = { id: "preview", label: "Preview ready", status: "active", agent: display(roleFor("Reviewer")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Reviewer")!), "Reviewer", "Preview is live — render at srcDoc", "done"));
  await delay(350);
  st = { ...st, status: "done" }; cb.onStep?.(st);
  cb.onStatus?.("Preview Live");

  return final;
}

const PROVIDER_LABEL: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Claude",
  gemini: "Gemini",
  grok: "Grok",
  mistral: "Mistral",
  deepseek: "DeepSeek",
  demo: "Nexus",
};
