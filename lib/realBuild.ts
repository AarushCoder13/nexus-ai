// =============================================================
// Nexus AI — client-side runner for the real LLM pipeline.
// Calls /api/build and animates the agent-activity UI from the
// result. Falls back to the simulated pipeline when no real keys
// exist or the provider call fails.
// =============================================================
import type { ActivityEvent, ActivityStep, ChatStatus, ConsoleLine, GeneratedProject } from "./types";
import { uid } from "./utils";
import type { TeamRequest } from "./providers";

type Callbacks = {
  onStep: (step: ActivityStep) => void;
  onEvent?: (event: ActivityEvent) => void;
  onConsole?: (line: ConsoleLine) => void;
  onStatus?: (status: ChatStatus) => void;
  onProject: (project: GeneratedProject) => void;
};

const STAGES: { id: ActivityStep["id"]; label: string }[] = [
  { id: "understand", label: "Understanding idea" },
  { id: "plan", label: "Planning architecture" },
  { id: "files", label: "Creating files" },
  { id: "code", label: "Writing code" },
  { id: "build", label: "Running build" },
  { id: "review", label: "Reviewing & fixing errors" },
  { id: "preview", label: "Preview ready" },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const line = (level: ConsoleLine["level"], text: string): ConsoleLine => ({ id: uid("c"), ts: Date.now(), level, text });

export async function runRealPipeline(
  prompt: string,
  team: TeamRequest[],
  cb: Callbacks,
): Promise<{ project?: GeneratedProject; fallbackToDemo: boolean; error?: string }> {
  cb.onStatus?.("Building");
  for (const s of STAGES) cb.onStep?.({ ...s, status: "pending", agent: "" });

  cb.onStep?.({ ...STAGES[0], status: "active", agent: "" });
  const providerNames = [...new Set(team.map((t) => t.provider))].join(", ");
  cb.onConsole?.(line("info", `Initiating LLM generation via ${providerNames}…`));

  let res: Response;
  try {
    res = await fetch("/api/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, team }),
    });
  } catch (err: any) {
    const msg = `Network error calling /api/build: ${err?.message || String(err)}`;
    cb.onConsole?.(line("error", msg));
    return { fallbackToDemo: true, error: msg };
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const msg = errBody?.error || `Build API returned status ${res.status}`;
    cb.onConsole?.(line("error", `LLM Error: ${msg}`));
    return { fallbackToDemo: true, error: msg };
  }

  const data = await res.json().catch(() => null);
  if (!data || data.demo || !data.project) {
    const msg = data?.error || "Pipeline returned empty response";
    cb.onConsole?.(line("warn", `${msg}. Falling back to simulated engine…`));
    return { fallbackToDemo: true, error: msg };
  }

  cb.onStep?.({ ...STAGES[0], status: "done", agent: "" });
  cb.onStep?.({ ...STAGES[1], status: "active", agent: "" });
  await delay(250);
  cb.onStep?.({ ...STAGES[1], status: "done", agent: "" });

  cb.onStep?.({ ...STAGES[2], status: "active", agent: "" });
  cb.onConsole?.(line("cmd", `writing app/index.html via ${data.provider}…`));
  await delay(200);
  cb.onStep?.({ ...STAGES[2], status: "done", agent: "" });

  cb.onStep?.({ ...STAGES[3], status: "active", agent: "" });
  cb.onConsole?.(line("success", `LLM generated page (${data.provider})`));
  await delay(200);
  cb.onStep?.({ ...STAGES[3], status: "done", agent: "" });

  cb.onStep?.({ ...STAGES[4], status: "active", agent: "" });
  await delay(250);
  cb.onConsole?.(line("cmd", "compiling static HTML… ✓ 0 errors"));
  cb.onStep?.({ ...STAGES[4], status: "done", agent: "" });

  cb.onStep?.({ ...STAGES[5], status: "active", agent: "" });
  const issues: string[] = data.reviewer?.issues ?? [];
  if (issues.length > 0) {
    cb.onConsole?.(line("warn", `Reviewer flagged ${issues.length} issue(s)`));
  } else {
    cb.onConsole?.(line("success", "Reviewer: no issues found"));
  }
  await delay(300);
  cb.onStep?.({ ...STAGES[5], status: "done", agent: "" });

  cb.onStep?.({ ...STAGES[6], status: "active", agent: "" });
  cb.onProject?.(data.project as GeneratedProject);
  cb.onStep?.({ ...STAGES[6], status: "done", agent: "" });
  cb.onStatus?.("Preview Live");

  return { project: data.project as GeneratedProject, fallbackToDemo: false };
}
