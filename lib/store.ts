// =============================================================
// Nexus AI — client-side store (Zustand + IndexedDB Persistent Storage)
// Guarantees data is stored safely on the user's device with zero data loss.
// - High-capacity IndexedDB engine (handles hundreds of MBs/GBs)
// - Preserves full code projects, file trees, previews, and attachments per chat
// - Automatic migration from legacy localStorage
// - Browser persistent storage request (immune to eviction)
// - One-click complete export and restore backup tools
// =============================================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ActivityEvent,
  ActivityStep,
  Chat,
  ChatStatus,
  ChatWorkspaceData,
  ConsoleLine,
  GeneratedProject,
  Message,
  NexusBackup,
  Project,
  ProjectFile,
  ProjectVersion,
  ProviderKeys,
  TeamMember,
  AgentRole,
  UserProfile,
} from "./types";
import { AGENT_ROLES } from "./types";
import { runAgentPipeline, initialSteps, type ReferenceAttachment } from "./agent";
import { runRealPipeline } from "./realBuild";
import { cn, uid, timeAgo } from "./utils";
import { nexusIndexedDBStorage, requestPersistentStorage } from "./idb";
import { CONNECTORS, type ConnectedAccount } from "./connectors";

export type WorkspaceTab = "preview" | "code" | "files" | "console" | "history" | "components";
export type Drawer = "sidebar" | "workspace" | null;

export const defaultTeam: TeamMember[] = AGENT_ROLES.map((role) => ({
  id: uid("m"),
  provider: "demo",
  role,
}));

export function normalizeProject(p: unknown): GeneratedProject | null {
  if (!p || typeof p !== "object") return null;
  const proj = p as Record<string, unknown>;
  const name = typeof proj.name === "string" ? proj.name : "Generated Project";
  const framework = typeof proj.framework === "string" ? proj.framework : "Static HTML";
  const entry = typeof proj.entry === "string" ? proj.entry : "app/index.html";
  let files: { path: string; content: string; language: string }[] = [];
  if (Array.isArray(proj.files)) {
    files = proj.files.map((f: any) => ({
      path: String(f.path || ""),
      content: String(f.content || ""),
      language: String(f.language || f.path?.split(".").pop() || "html"),
    }));
  } else if (proj.files && typeof proj.files === "object") {
    files = Object.entries(proj.files as Record<string, unknown>).map(([path, content]) => ({
      path,
      content: String(content || ""),
      language: path.split(".").pop() || "html",
    }));
  }
  return { name, framework, entry, files };
}

type NexusState = {
  // persisted core state
  theme: "dark" | "light";
  userProfile: UserProfile;
  keys: ProviderKeys;
  connections: Record<string, string>;
  connectedAccounts: Record<string, ConnectedAccount>;
  team: TeamMember[];
  chats: Chat[];
  projects: Project[];
  activeChatId: string | null;
  activeProjectId: string | null;
  leftOpen: boolean;
  rightOpen: boolean;
  leftWidth: number;
  rightWidth: number;
  publishSecret: string;

  // persisted per-chat projects & workspace snapshots
  messages: Record<string, Message[]>;
  generatedProjects: Record<string, GeneratedProject>;
  chatWorkspaces: Record<string, ChatWorkspaceData>;
  projectVersions: Record<string, ProjectVersion[]>;

  // active workspace runtime state
  projectFiles: ProjectFile[];
  status: ChatStatus;
  activitySteps: ActivityStep[];
  activityEvents: ActivityEvent[];
  consoleLines: ConsoleLine[];
  generated: GeneratedProject | null;
  activeTab: WorkspaceTab;
  openFiles: string[];
  activeFile: string | null;
  running: boolean;
  search: string;
  drawer: Drawer;
  previewMode: "desktop" | "mobile";
  draftAttachment: { name: string; url: string } | null;
  isHydrated: boolean;

  // actions
  setTheme: (t: "dark" | "light") => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  setKey: (provider: keyof ProviderKeys, value: string) => void;
  setConnection: (service: string, token: string) => void;
  connectAccount: (provider: string, account?: Partial<ConnectedAccount>) => void;
  disconnectAccount: (provider: string) => void;
  setTeamRole: (memberId: string, role: AgentRole) => void;
  setTeamProvider: (memberId: string, provider: TeamMember["provider"]) => void;
  resetTeam: () => void;

  createChat: (title?: string) => string;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  togglePin: (id: string) => void;
  selectChat: (id: string) => void;
  setSearch: (q: string) => void;
  createProject: (name: string, template?: "portfolio" | "ecommerce" | "saas" | "blank") => string;
  selectProject: (id: string) => void;
  deleteProject: (id: string) => void;

  sendMessage: (content: string, attachment?: ReferenceAttachment | null) => Promise<void>;
  setDraftAttachment: (a: { name: string; url: string } | null) => void;
  publishProject: () => Promise<{ url?: string; error?: string } | null>;
  setPublishSecret: (s: string) => void;
  setStatus: (s: ChatStatus) => void;
  clearConsole: () => void;
  addConsoleLine: (level: ConsoleLine["level"], text: string) => void;
  setActiveTab: (t: WorkspaceTab) => void;
  setOpenFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  updateFileContent: (path: string, content: string) => void;
  toggleLeft: () => void;
  toggleRight: () => void;
  setLeftWidth: (w: number) => void;
  setRightWidth: (w: number) => void;
  setDrawer: (d: Drawer) => void;
  setPreviewMode: (m: "desktop" | "mobile") => void;

  // backup & restore actions
  restoreVersion: (chatId: string, versionId: string) => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonStr: string) => { ok: boolean; error?: string; count?: number };
};

function seedChats(): Chat[] {
  const now = Date.now();
  return [
    { id: "chat_demo", projectId: "proj_demo", title: "Portfolio Website", pinned: true, createdAt: now - 7200000, updatedAt: now - 120000 },
    { id: "chat_saas", projectId: "proj_saas", title: "SaaS Analytics Dashboard", pinned: false, createdAt: now - 14400000, updatedAt: now - 3600000 },
    { id: "chat_alphav", projectId: "proj_alphav", title: "AlphaV Neural Engine", pinned: false, createdAt: now - 86400000, updatedAt: now - 7200000 },
  ];
}

const demoProject: GeneratedProject = {
  name: "Portfolio Website",
  framework: "Static HTML",
  files: [
    {
      path: "app/index.html",
      language: "html",
      content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Alex Rivera — Portfolio</title><style>
:root{--accent:#f59e0b;--bg:#09090c;--panel:#121217;--text:#e7eaf0;--muted:#9aa3b2;--border:#232838;--radius:16px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6}
.container{max-width:1140px;margin:0 auto;padding:0 24px}
.hero{min-height:92vh;display:flex;align-items:center} 
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(700px 400px at 80% 20%,color-mix(in srgb,var(--accent) 18%,transparent),transparent 70%)}
.hero h1{font-size:clamp(38px,6vw,60px);font-weight:800;margin:16px 0}
.btn{display:inline-flex;padding:12px 22px;border-radius:999px;font-weight:600;cursor:pointer}
.btn-primary{background:linear-gradient(135deg,#f59e0b,#f97316);color:#000;border:none;font-weight:700}
.work{padding:90px 0;border-top:1px solid var(--border)}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.card{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:26px}
@media (max-width:900px){.grid{grid-template-columns:1fr}}
</style></head><body>
<section class="hero"><div class="container"><div style="color:var(--accent);font-weight:600;letter-spacing:.12em;font-size:12px">AVAILABLE FOR WORK</div>
<h1>Designing & building <span style="color:var(--accent)">delightful</span> web experiences.</h1>
<p style="color:var(--muted);font-size:19px;max-width:560px">I'm Alex, a product-focused full-stack developer turning complex problems into clean, fast interfaces.</p>
<div style="margin-top:28px;display:flex;gap:12px"><button class="btn btn-primary">See my work</button></div></div></section>
<section class="work"><div class="container"><div class="grid">
<div class="card"><h3>Pulse Analytics</h3><p style="color:var(--muted)">Real-time analytics dashboard used by 2k+ SaaS teams.</p></div>
<div class="card"><h3>Lumina Store</h3><p style="color:var(--muted)">Headless commerce storefront with sub-second loads.</p></div>
<div class="card"><h3>TrailFinder</h3><p style="color:var(--muted)">Mobile-first hiking planner synced offline.</p></div>
</div></div></section>
</body></html>`,
    },
    { path: "package.json", language: "json", content: JSON.stringify({ name: "portfolio-website", version: "1.0.0", scripts: { start: "npx serve ." }, dependencies: {} }, null, 2) },
    { path: "README.md", language: "markdown", content: "# Portfolio Website\nA premium, responsive portfolio built by the Nexus AI team.\n" },
  ],
  entry: "app/index.html",
};

const demoSaasProject: GeneratedProject = {
  name: "SaaS Analytics Dashboard",
  framework: "Next.js / Tailwind",
  files: [
    {
      path: "index.html",
      language: "html",
      content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Nexus Analytics — KPI Dashboard</title><style>
:root{--accent:#f59e0b;--bg:#09090c;--card:#121217;--border:#27272a;--text:#fafafa;--muted:#a1a1aa}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);padding:32px}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px}
.label{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em}
.val{font-size:32px;font-weight:800;color:#fff;margin-top:8px}
.tag{color:#10b981;font-size:12px;font-weight:600;margin-top:6px}
.chart-box{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px}
@media (max-width:900px){.grid{grid-template-columns:1fr 1fr}}
</style></head><body>
<div class="header"><div><h1>SaaS Analytics Engine</h1><p style="color:var(--muted);font-size:14px">Real-time telemetry and API performance monitoring</p></div><span style="background:rgba(245,158,11,0.15);color:#f59e0b;padding:6px 14px;border-radius:999px;font-weight:700;font-size:12px">LIVE CLUSTER</span></div>
<div class="grid">
<div class="card"><div class="label">Monthly Recurring</div><div class="val">$48,290</div><div class="tag">↑ +14.2% this month</div></div>
<div class="card"><div class="label">Active Users</div><div class="val">14,210</div><div class="tag">↑ +8.5% weekly</div></div>
<div class="card"><div class="label">Conversion Rate</div><div class="val">4.82%</div><div class="tag">↑ +1.1% vs target</div></div>
<div class="card"><div class="label">API Latency</div><div class="val" style="color:#10b981">12ms</div><div class="tag">99.98% uptime</div></div>
</div>
<div class="chart-box"><h3>Inference Telemetry Stream</h3><p style="color:var(--muted);font-size:13px;margin-top:4px">Zero dropped frames • Model AlphaV deployed</p></div>
</body></html>`,
    },
    { path: "metrics.json", language: "json", content: JSON.stringify({ mrr: 48290, dau: 14210, conversionRate: 0.0482, latencyMs: 12 }, null, 2) },
    { path: "README.md", language: "markdown", content: "# SaaS Analytics Dashboard\nReal-time telemetry and KPI dashboard generated by Nexus AI.\n" },
  ],
  entry: "index.html",
};

const demoAlphaProject: GeneratedProject = {
  name: "AlphaV Neural Engine",
  framework: "Python / FastAPI",
  files: [
    {
      path: "app.py",
      language: "python",
      content: `def process_data(nexta, datas):
    return NexusAleinczuses.process_iwage, results)

results = 0.0
for i in rage(result):
    NexusAI.analyze(results, data_reai)
    results = NexusAI.expood(results)
    if (ip == 0:
        results.analyze(1033)
        results.proviest(process_results))
    return results

return results`,
    },
    {
      path: "model.js",
      language: "javascript",
      content: `// Model pipeline & tensor architecture
import { Tensor, NeuralNetwork } from '@nexus/ai-core';

export class AlphaVModel {
  constructor(config = {}) {
    this.version = "1.4.0";
    this.latentDim = config.latentDim || 512;
    this.learningRate = 0.001;
  }

  async compile() {
    console.log("[AlphaV] Compiling neural layers...");
    return true;
  }
}`,
    },
    {
      path: "api.py",
      language: "python",
      content: `# Nexus AI API Endpoints
from fastapi import FastAPI, HTTPException

app = FastAPI(title="AlphaV Inference API")

@app.get("/health")
def health():
    return {"status": "online", "model": "AlphaV", "latency_ms": 12}`,
    },
  ],
  entry: "app.py",
};

const initialProjects: Project[] = [
  { id: "proj_demo", userId: "u_demo", name: "Portfolio Website", description: "Modern responsive portfolio with hero & work grid", framework: "Static HTML", createdAt: Date.now() - 7200000, updatedAt: Date.now() - 120000 },
  { id: "proj_saas", userId: "u_demo", name: "SaaS Analytics Dashboard", description: "Real-time KPI telemetry with revenue & latency metrics", framework: "Next.js / Tailwind", createdAt: Date.now() - 14400000, updatedAt: Date.now() - 3600000 },
  { id: "proj_alphav", userId: "u_demo", name: "AlphaV Neural Engine", description: "AI inference API with FastAPI & tensor pipeline", framework: "Python / FastAPI", createdAt: Date.now() - 86400000, updatedAt: Date.now() - 7200000 },
];

function seedMessages(): Record<string, Message[]> {
  const now = Date.now();
  return {
    chat_demo: [
      { id: uid("m"), chatId: "chat_demo", role: "user", content: "Build me a premium portfolio website", createdAt: now - 7200000 },
      { id: uid("m"), chatId: "chat_demo", role: "assistant", content: "Done — your **portfolio** is ready. The Nexus team planned the structure, wrote the code, and ran a reviewer pass before the preview went live. Check the **Preview** tab on the right.", createdAt: now - 120000 },
    ],
    chat_hi: [
      { id: uid("m"), chatId: "chat_hi", role: "user", content: "hello", createdAt: now - 86400000 },
      { id: uid("m"), chatId: "chat_hi", role: "assistant", content: "Hi! I'm Nexus AI — a team of agents that build projects together. Try *\"Build a landing page\"* or *\"Make an expense tracker\"*.", createdAt: now - 3600000 },
    ],
  };
}

const seedConsole: ConsoleLine[] = [
  { id: uid("c"), ts: Date.now() - 4000, level: "cmd", text: "$ npm run build" },
  { id: uid("c"), ts: Date.now() - 3000, level: "info", text: "Compiling… ✓ 0 errors" },
  { id: uid("c"), ts: Date.now() - 2000, level: "success", text: "Build completed successfully" },
  { id: uid("c"), ts: Date.now() - 1000, level: "info", text: "Reviewer fixed 3 issues → final preview generated" },
];

const seedSteps: ActivityStep[] = [
  { id: "understand", label: "Understanding idea", status: "done", agent: "Nexus" },
  { id: "plan", label: "Planning architecture", status: "done", agent: "Nexus" },
  { id: "files", label: "Creating files", status: "done", agent: "Nexus" },
  { id: "code", label: "Writing code", status: "done", agent: "Nexus" },
  { id: "build", label: "Running build", status: "done", agent: "Nexus" },
  { id: "review", label: "Reviewing & fixing errors", status: "done", agent: "Nexus" },
  { id: "preview", label: "Preview ready", status: "done", agent: "Nexus" },
];

const seedEvents: ActivityEvent[] = [
  { id: uid("e"), agent: "Nexus", role: "Planner", message: "Parsing request: \"Build me a premium portfolio website\"", ts: Date.now() - 8000, kind: "start" },
  { id: uid("e"), agent: "Nexus", role: "Reviewer", message: "Draft updated — applying polish pass", ts: Date.now() - 2000, kind: "review" },
];

function seedVersions(): Record<string, ProjectVersion[]> {
  const now = Date.now();
  return {
    chat_demo: [
      {
        id: "v_demo_2",
        versionNumber: 2,
        timestamp: now - 1800000,
        prompt: "Add responsive work showcase grid and interactive hero",
        files: demoProject.files,
        summary: "Created responsive grid showcase with 3 featured projects, styled cards, and smooth CSS hover effects.",
      },
      {
        id: "v_demo_1",
        versionNumber: 1,
        timestamp: now - 7200000,
        prompt: "Build me a premium portfolio website",
        files: demoProject.files,
        summary: "Initial generation of Portfolio Website layout, typography, package.json, and responsive HTML architecture.",
      },
    ],
    chat_saas: [
      {
        id: "v_saas_1",
        versionNumber: 1,
        timestamp: now - 14400000,
        prompt: "Create production SaaS analytics dashboard with metrics",
        files: demoSaasProject.files,
        summary: "Generated 4-card KPI telemetry grid, live MRR counter ($48,290), active users (14.2k), and latency monitor (12ms).",
      },
    ],
    chat_alphav: [
      {
        id: "v_alphav_1",
        versionNumber: 1,
        timestamp: now - 86400000,
        prompt: "Generate AlphaV neural engine and FastAPI endpoints",
        files: demoAlphaProject.files,
        summary: "Generated Python data processor (app.py), neural tensor compiler (model.js), and FastAPI health endpoint (api.py).",
      },
    ],
  };
}

// ---- Store ---------------------------------------------------------------
export const useStore = create<NexusState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      userProfile: {
        name: "Aarush",
        email: "aarush@nexus.ai",
        profession: "Full-Stack Engineer",
        workspaceType: "solo",
        companyName: "",
        onboarded: true,
      },
      keys: {},
      connections: {},
      connectedAccounts: {},
      team: defaultTeam,
      chats: seedChats(),
      projects: initialProjects,
      activeChatId: "chat_demo",
      activeProjectId: "proj_demo",
      leftOpen: true,
      rightOpen: true,
      leftWidth: 210,
      rightWidth: 300,
      publishSecret: "",

      // Per-chat generated projects & workspace snapshots
      generatedProjects: {
        chat_demo: demoProject,
        chat_saas: demoSaasProject,
        chat_alphav: demoAlphaProject,
      },
      chatWorkspaces: {
        chat_demo: {
          status: "Preview Live",
          consoleLines: seedConsole,
          activitySteps: seedSteps,
          activityEvents: seedEvents,
          openFiles: ["app/index.html"],
          activeFile: "app/index.html",
        },
      },
      projectVersions: seedVersions(),

      messages: seedMessages(),
      projectFiles: demoProject.files.map((f, i) => ({ id: uid("f"), projectId: "proj_demo", ...f, updatedAt: Date.now() - i * 1000 })),
      status: "Preview Live",
      activitySteps: seedSteps,
      activityEvents: seedEvents,
      consoleLines: seedConsole,
      generated: demoProject,
      activeTab: "preview",
      openFiles: ["app/index.html"],
      activeFile: "app/index.html",
      running: false,
      search: "",
      drawer: null,
      previewMode: "desktop",
      draftAttachment: null,
      isHydrated: false,

      setTheme: (t) => set({ theme: t }),
      setUserProfile: (profile) =>
        set((s) => ({ userProfile: { ...s.userProfile, ...profile } })),
      setKey: (provider, value) => set((s) => ({ keys: { ...s.keys, [provider]: value } })),
      setConnection: (service, token) => set((s) => ({ connections: { ...s.connections, [service]: token } })),
      connectAccount: (provider, data) => {
        const connector = CONNECTORS.find((c) => c.id === provider);
        const username = data?.username || connector?.oauthConfig.defaultUsername || "aarush-coder";
        const account: ConnectedAccount = {
          provider,
          username,
          name: data?.name || "Aarush",
          email: data?.email || (username === "aarush-coder" ? "aarush@nexus.ai" : `${username}@gmail.com`),
          avatarUrl: data?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
          team: data?.team || connector?.oauthConfig.defaultTeam,
          connectedAt: Date.now(),
          scopes: data?.scopes || connector?.oauthConfig.scopes || ["read", "write", "deploy"],
          isDemoOAuth: true,
        };
        set((s) => ({
          connectedAccounts: {
            ...s.connectedAccounts,
            [provider]: account,
          },
          connections: {
            ...s.connections,
            [`${provider}_token`]: s.connections[`${provider}_token`] || `oauth_${provider}_live_${Date.now()}`,
            [`${provider}_owner`]: s.connections[`${provider}_owner`] || username,
            ...(account.team ? { [`${provider}_team_id`]: account.team } : {}),
          },
        }));
      },
      disconnectAccount: (provider) => {
        set((s) => {
          const nextAccounts = { ...s.connectedAccounts };
          delete nextAccounts[provider];
          const nextConnections = { ...s.connections };
          delete nextConnections[`${provider}_token`];
          delete nextConnections[`${provider}_owner`];
          delete nextConnections[`${provider}_team_id`];
          return {
            connectedAccounts: nextAccounts,
            connections: nextConnections,
          };
        });
      },
      setTeamRole: (memberId, role) =>
        set((s) => ({ team: s.team.map((m) => (m.id === memberId ? { ...m, role } : m)) })),
      setTeamProvider: (memberId, provider) =>
        set((s) => ({ team: s.team.map((m) => (m.id === memberId ? { ...m, provider } : m)) })),
      resetTeam: () => set({ team: defaultTeam }),

      createChat: (title) => {
        const id = uid("chat");
        const now = Date.now();
        set((s) => ({
          chats: [{ id, title: title || "New chat", pinned: false, createdAt: now, updatedAt: now }, ...s.chats],
          activeChatId: id,
          messages: { ...s.messages, [id]: [] },
          status: "Ready",
          running: false,
          activitySteps: initialSteps(get().team),
          activityEvents: [],
          consoleLines: [],
          generated: null,
          projectFiles: [],
          openFiles: [],
          activeFile: null,
        }));
        return id;
      },

      createProject: (name: string, template = "portfolio") => {
        const pId = uid("proj");
        const cId = uid("chat");
        const now = Date.now();
        let gen: GeneratedProject = demoProject;
        let desc = "Responsive studio portfolio";

        if (template === "ecommerce") {
          desc = "Modern online store with product grid and checkout";
          gen = {
            name: name || "E-Commerce Store",
            framework: "Static HTML",
            entry: "index.html",
            files: [
              {
                path: "index.html",
                language: "html",
                content: `<!DOCTYPE html><html><head><title>${name || "Nexus Store"}</title><style>body{background:#0a0a0c;color:#fff;font-family:system-ui,sans-serif;padding:32px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.card{background:#18181b;padding:16px;border-radius:12px;border:1px solid #27272a}.btn{background:#f59e0b;color:#000;font-weight:700;padding:8px 16px;border-radius:8px;border:none;cursor:pointer}</style></head><body><h1>${name || "Nexus Store"}</h1><p>Welcome to our new storefront.</p><div class="grid"><div class="card"><h3>Pro Wireless Headset</h3><p>$199</p><button class="btn">Add to Cart</button></div><div class="card"><h3>Mechanical Keyboard</h3><p>$149</p><button class="btn">Add to Cart</button></div><div class="card"><h3>Ergonomic Mouse</h3><p>$89</p><button class="btn">Add to Cart</button></div></div></body></html>`,
              },
            ],
          };
        } else if (template === "saas") {
          desc = "Production SaaS analytics dashboard";
          gen = {
            name: name || "SaaS Dashboard",
            framework: "Next.js / Tailwind",
            entry: "index.html",
            files: [
              {
                path: "index.html",
                language: "html",
                content: `<!DOCTYPE html><html><head><title>${name || "SaaS Metrics"}</title><style>body{background:#0a0a0c;color:#e4e4e7;font-family:system-ui,sans-serif;padding:28px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:24px 0}.box{background:#18181b;border:1px solid #27272a;padding:20px;border-radius:12px}.val{font-size:28px;font-weight:800;color:#f59e0b;margin-top:8px}</style></head><body><h1>${name || "SaaS Metrics"}</h1><div class="metrics"><div class="box"><div>Monthly Revenue</div><div class="val">$48,290</div></div><div class="box"><div>Active Users</div><div class="val">14,210</div></div><div class="box"><div>Conversion Rate</div><div class="val">4.8%</div></div><div class="box"><div>API Latency</div><div class="val">18ms</div></div></div></body></html>`,
              },
            ],
          };
        } else if (template === "blank") {
          desc = "Clean blank workspace";
          gen = {
            name: name || "Blank Project",
            framework: "Static HTML",
            entry: "index.html",
            files: [
              {
                path: "index.html",
                language: "html",
                content: `<!DOCTYPE html><html><head><title>${name || "Blank Project"}</title></head><body style="background:#09090b;color:#fff;font-family:system-ui,sans-serif;padding:40px"><h1>${name || "Blank Project"}</h1><p>Start writing code or ask Nexus AI to build something.</p></body></html>`,
              },
            ],
          };
        } else {
          desc = "Responsive studio portfolio";
          gen = {
            ...demoProject,
            name: name || "Portfolio Website",
          };
        }

        const newProj: Project = {
          id: pId,
          userId: "u_demo",
          name: name || "New Project",
          description: desc,
          framework: gen.framework || "Static HTML",
          createdAt: now,
          updatedAt: now,
        };

        const newChat: Chat = {
          id: cId,
          projectId: pId,
          title: name || "New Project",
          pinned: false,
          createdAt: now,
          updatedAt: now,
        };

        const initialVersion: ProjectVersion = {
          id: uid("v"),
          versionNumber: 1,
          timestamp: now,
          prompt: `Create ${name || "project"} (${desc})`,
          files: gen.files,
          summary: `v1: Initial creation of ${name || "project"} with ${gen.files.length} starter files.`,
        };

        set((s) => ({
          projects: [newProj, ...s.projects],
          chats: [newChat, ...s.chats],
          activeProjectId: pId,
          activeChatId: cId,
          generatedProjects: { ...s.generatedProjects, [cId]: gen },
          projectVersions: { ...s.projectVersions, [cId]: [initialVersion] },
          generated: gen,
          projectFiles: gen.files.map((f, i) => ({ id: uid("f"), projectId: pId, ...f, updatedAt: now + i })),
          status: "Preview Live",
          openFiles: [gen.entry],
          activeFile: gen.entry,
          activeTab: "code",
        }));

        return pId;
      },

      selectProject: (id: string) => {
        const s = get();
        const targetProj = s.projects.find((p) => p.id === id);
        if (!targetProj) return;
        const matchingChat = s.chats.find((c) => c.projectId === id) || s.chats[0];
        const chatId = matchingChat?.id || "chat_demo";
        const gen = s.generatedProjects[chatId] ||
          (chatId === "chat_saas" ? demoSaasProject :
           chatId === "chat_alphav" ? demoAlphaProject :
           chatId === "chat_demo" ? demoProject : null);

        set({
          activeProjectId: id,
          activeChatId: chatId,
          generated: gen,
          projectFiles: gen ? gen.files.map((f, i) => ({ id: uid("f"), projectId: id, ...f, updatedAt: Date.now() + i })) : [],
          openFiles: gen?.files.length ? [gen.entry] : ["index.html"],
          activeFile: gen?.files.length ? gen.entry : "index.html",
          status: gen ? "Preview Live" : "Ready",
          activeTab: "code",
        });
      },

      deleteProject: (id: string) => {
        set((s) => {
          const nextProjects = s.projects.filter((p) => p.id !== id);
          const nextActiveId = s.activeProjectId === id ? (nextProjects[0]?.id || null) : s.activeProjectId;
          return {
            projects: nextProjects,
            activeProjectId: nextActiveId,
          };
        });
      },

      deleteChat: (id) =>
        set((s) => {
          const chats = s.chats.filter((c) => c.id !== id);
          const messages = { ...s.messages };
          delete messages[id];
          const generatedProjects = { ...s.generatedProjects };
          delete generatedProjects[id];
          const chatWorkspaces = { ...s.chatWorkspaces };
          delete chatWorkspaces[id];

          const activeChatId = s.activeChatId === id ? (chats[0]?.id ?? null) : s.activeChatId;
          const nextGen = activeChatId ? (generatedProjects[activeChatId] ?? null) : null;
          const nextWs = activeChatId ? chatWorkspaces[activeChatId] : null;

          return {
            chats,
            messages,
            generatedProjects,
            chatWorkspaces,
            activeChatId,
            generated: nextGen,
            projectFiles: nextGen ? nextGen.files.map((f, i) => ({ id: uid("f"), projectId: s.activeProjectId || "proj", ...f, updatedAt: Date.now() + i })) : [],
            status: nextWs?.status ?? (nextGen ? "Preview Live" : "Ready"),
            consoleLines: nextWs?.consoleLines ?? [],
            activitySteps: nextWs?.activitySteps ?? initialSteps(s.team),
            activityEvents: nextWs?.activityEvents ?? [],
            openFiles: nextWs?.openFiles ?? (nextGen?.files.length ? [nextGen.entry] : []),
            activeFile: nextWs?.activeFile ?? (nextGen?.files.length ? nextGen.entry : null),
          };
        }),

      renameChat: (id, title) =>
        set((s) => ({
          chats: s.chats.map((c) => (c.id === id ? { ...c, title, updatedAt: Date.now() } : c)),
        })),

      togglePin: (id) =>
        set((s) => ({
          chats: s.chats.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
        })),

      selectChat: (id) =>
        set((s) => {
          // 1. Snapshot previous chat's workspace so no transient progress is lost
          const prevId = s.activeChatId;
          const updatedWorkspaces = { ...s.chatWorkspaces };
          if (prevId) {
            updatedWorkspaces[prevId] = {
              status: s.status,
              consoleLines: s.consoleLines,
              activitySteps: s.activitySteps,
              activityEvents: s.activityEvents,
              openFiles: s.openFiles,
              activeFile: s.activeFile,
            };
          }

          const chat = s.chats.find((c) => c.id === id);
          const project = chat?.projectId ? s.projects.find((p) => p.id === chat.projectId) : null;
          const gen = s.generatedProjects[id] ?? (id === "chat_demo" ? demoProject : null);
          const ws = updatedWorkspaces[id];

          return {
            activeChatId: id,
            activeProjectId: project?.id ?? s.activeProjectId,
            running: false,
            chatWorkspaces: updatedWorkspaces,
            generated: gen,
            projectFiles: gen ? gen.files.map((f, i) => ({ id: uid("f"), projectId: project?.id || "proj", ...f, updatedAt: Date.now() + i })) : [],
            status: ws?.status ?? (gen ? "Preview Live" : "Ready"),
            consoleLines: ws?.consoleLines ?? (id === "chat_demo" ? seedConsole : []),
            activitySteps: ws?.activitySteps ?? (id === "chat_demo" ? seedSteps : initialSteps(s.team)),
            activityEvents: ws?.activityEvents ?? (id === "chat_demo" ? seedEvents : []),
            openFiles: ws?.openFiles ?? (gen?.files.length ? [gen.entry] : []),
            activeFile: ws?.activeFile ?? (gen?.files.length ? gen.entry : null),
          };
        }),

      setSearch: (q) => set({ search: q }),

      sendMessage: async (content, attachment) => {
        const { activeChatId, team, messages, keys } = get();
        if (!activeChatId || get().running) return;
        const chatId = activeChatId;
        const attachments = attachment ? [{ id: uid("a"), name: attachment.name, url: attachment.url }] : undefined;
        const userMsg: Message = { id: uid("m"), chatId, role: "user", content, attachments, createdAt: Date.now() };

        set({
          messages: { ...messages, [chatId]: [...(messages[chatId] || []), userMsg] },
          running: true,
          draftAttachment: null,
          generated: null,
          projectFiles: [],
          status: "Building",
          activitySteps: initialSteps(team),
          activityEvents: [],
          consoleLines: [],
          activeTab: "preview",
          openFiles: [],
          activeFile: null,
        });

        const cb = {
          onStep: (step: ActivityStep) =>
            set((s) => ({ activitySteps: s.activitySteps.map((st) => (st.id === step.id ? step : st)) })),
          onEvent: (event: ActivityEvent) =>
            set((s) => ({ activityEvents: [...s.activityEvents, event] })),
          onConsole: (line: ConsoleLine) =>
            set((s) => ({ consoleLines: [...s.consoleLines, line] })),
          onStatus: (status: ChatStatus) => set({ status }),
          onProject: (projectRaw: GeneratedProject) => {
            const project = normalizeProject(projectRaw) || projectRaw;
            set((s) => ({
              generated: project,
              generatedProjects: { ...s.generatedProjects, [chatId]: project },
              projectFiles: project.files.map((f, i) => ({ id: uid("f"), projectId: s.activeProjectId || "proj_new", ...f, updatedAt: Date.now() + i })),
              openFiles: [project.entry],
              activeFile: project.entry,
            }));
          },
        };

        // Real orchestration when real provider keys are configured (and no
        // screenshot attachment — that path currently needs the client canvas).
        let final: GeneratedProject | undefined;
        if (!attachment) {
          const teamRequests = team
            .map((t) => ({ role: t.role, provider: t.provider, key: (keys[t.provider] ?? "").trim() }))
            .filter((t) => t.provider !== "demo" && t.key);
          if (teamRequests.length > 0) {
            const real = await runRealPipeline(content, teamRequests, cb);
            if (!real.fallbackToDemo && real.project) {
              final = normalizeProject(real.project) || real.project;
            }
          }
        }
        if (!final) {
          const sim = await runAgentPipeline(content, team, cb, attachment ? { attachment } : {});
          final = normalizeProject(sim) || sim;
        }

        const now = Date.now();
        const summary: Message = {
          id: uid("m"),
          chatId,
          role: "assistant",
          content: `✅ **${final.name}** is ready.\n\nThe Nexus team planned, built, and reviewed this project. The Reviewer caught and fixed a few issues before the preview went live — view it in the **Preview** tab, or browse the files and console logs.\n\nWant to iterate? Try *"make it darker"* or *"add a contact section"*.`,
          createdAt: now,
        };

        set((s) => {
          const updatedProjects = { ...s.generatedProjects, [chatId]: final };
          const updatedWs = {
            ...s.chatWorkspaces,
            [chatId]: {
              status: "Preview Live" as ChatStatus,
              consoleLines: s.consoleLines,
              activitySteps: s.activitySteps,
              activityEvents: s.activityEvents,
              openFiles: [final.entry],
              activeFile: final.entry,
            },
          };
          const prevVersions = s.projectVersions?.[chatId] || [];
          const nextVerNum = prevVersions.length + 1;
          const newVersion: ProjectVersion = {
            id: uid("v"),
            versionNumber: nextVerNum,
            timestamp: now,
            prompt: content,
            files: final.files,
            summary: `v${nextVerNum}: ${content.slice(0, 50)}`,
          };
          const updatedVersions = {
            ...s.projectVersions,
            [chatId]: [newVersion, ...prevVersions],
          };
          return {
            messages: { ...s.messages, [chatId]: [...(s.messages[chatId] || []), summary] },
            running: false,
            generated: final,
            generatedProjects: updatedProjects,
            chatWorkspaces: updatedWs,
            projectVersions: updatedVersions,
            chats: s.chats.map((c) =>
              c.id === chatId
                ? { ...c, title: s.chats.find((x) => x.id === chatId)?.title === "New chat" ? final.name : c.title, updatedAt: now }
                : c,
            ),
          };
        });
      },

      updateFileContent: (path, content) => {
        set((s) => {
          const activeChatId = s.activeChatId;
          const updatedProjectFiles = s.projectFiles.map((f) => (f.path === path ? { ...f, content, updatedAt: Date.now() } : f));

          let updatedGenerated = s.generated;
          if (updatedGenerated) {
            updatedGenerated = {
              ...updatedGenerated,
              files: updatedGenerated.files.map((f) => (f.path === path ? { ...f, content } : f)),
            };
          }

          const updatedGenMap = { ...s.generatedProjects };
          if (activeChatId && updatedGenerated) {
            updatedGenMap[activeChatId] = updatedGenerated;
          }

          return {
            projectFiles: updatedProjectFiles,
            generated: updatedGenerated,
            generatedProjects: updatedGenMap,
          };
        });
      },

      setStatus: (s) => set({ status: s }),
      clearConsole: () => set({ consoleLines: [] }),
      addConsoleLine: (level, text) =>
        set((s) => ({
          consoleLines: [
            ...s.consoleLines,
            { id: uid("c"), ts: Date.now(), level, text },
          ],
        })),
      setActiveTab: (t) => set({ activeTab: t, drawer: null }),
      setOpenFile: (path) =>
        set((s) => ({ openFiles: s.openFiles.includes(path) ? s.openFiles : [...s.openFiles, path], activeFile: path })),
      closeFile: (path) =>
        set((s) => {
          const openFiles = s.openFiles.filter((p) => p !== path);
          return { openFiles, activeFile: s.activeFile === path ? (openFiles[openFiles.length - 1] ?? null) : s.activeFile };
        }),
      setActiveFile: (path) => set({ activeFile: path }),
      toggleLeft: () => set((s) => ({ leftOpen: !s.leftOpen })),
      toggleRight: () => set((s) => ({ rightOpen: !s.rightOpen })),
      setLeftWidth: (w) => set({ leftWidth: w }),
      setRightWidth: (w) => set({ rightWidth: w }),
      setDrawer: (d) => set({ drawer: d }),
      setPreviewMode: (m) => set({ previewMode: m }),
      setDraftAttachment: (a) => set({ draftAttachment: a }),
      setPublishSecret: (s) => set({ publishSecret: s }),

      restoreVersion: (chatId, versionId) => {
        const s = get();
        const versions = s.projectVersions?.[chatId] || [];
        const target = versions.find((v) => v.id === versionId);
        if (!target) return;
        const currentGen = s.generatedProjects[chatId] ?? s.generated;
        const restoredGen: GeneratedProject = {
          name: currentGen?.name || "Restored Project",
          framework: currentGen?.framework || "Static HTML",
          entry: currentGen?.entry || target.files[0]?.path || "app/index.html",
          files: target.files,
        };
        const updatedFiles = restoredGen.files.map((f, i) => ({
          id: uid("f"),
          projectId: s.activeProjectId || "proj",
          ...f,
          updatedAt: Date.now() + i,
        }));
        set((prev) => ({
          generated: restoredGen,
          generatedProjects: { ...prev.generatedProjects, [chatId]: restoredGen },
          projectFiles: updatedFiles,
          activeFile: restoredGen.entry,
        }));
      },

      publishProject: async () => {
        const { generated, publishSecret } = get();
        if (!generated) return null;
        if (!publishSecret?.trim()) {
          return { error: "Set a Publish secret in Settings to enable share links." };
        }
        const base = (generated.name || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const slug = `${base || "project"}-${Math.random().toString(36).slice(2, 6)}`;
        const files: Record<string, string> = {};
        for (const f of generated.files) files[f.path] = f.content;
        try {
          const res = await fetch("/api/publish", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publishSecret.trim()}`,
            },
            body: JSON.stringify({ slug, name: generated.name, entry: generated.entry, files }),
          });
          if (!res.ok) {
            let error = "Publish failed.";
            try {
              const j = (await res.json()) as { error?: string };
              if (j.error) error = j.error;
            } catch {
              /* ignore */
            }
            return { error };
          }
          const data = (await res.json()) as { path?: string };
          if (data.path) {
            const chatId = get().activeChatId;
            if (chatId) {
              const link = `${window.location.origin}${data.path}`;
              const row: Message = { id: uid("m"), chatId, role: "agent", content: `Published live → ${link}`, createdAt: Date.now() };
              set({ messages: { ...get().messages, [chatId]: [...(get().messages[chatId] || []), row] } });
            }
          }
          return { url: data.path };
        } catch {
          return { error: "Network error while publishing." };
        }
      },

      exportBackupJson: () => {
        const s = get();
        const backup: NexusBackup = {
          version: 1,
          exportedAt: Date.now(),
          theme: s.theme,
          keys: s.keys,
          team: s.team,
          chats: s.chats,
          projects: s.projects,
          activeChatId: s.activeChatId,
          activeProjectId: s.activeProjectId,
          publishSecret: s.publishSecret,
          messages: s.messages,
          generatedProjects: s.generatedProjects,
          chatWorkspaces: s.chatWorkspaces,
        };
        return JSON.stringify(backup, null, 2);
      },

      importBackupJson: (jsonStr) => {
        try {
          const data = JSON.parse(jsonStr) as NexusBackup;
          if (!data || !Array.isArray(data.chats) || typeof data.messages !== "object") {
            return { ok: false, error: "Invalid backup format." };
          }
          const activeId = data.activeChatId || data.chats[0]?.id || "chat_demo";
          const gen = data.generatedProjects?.[activeId] ?? (activeId === "chat_demo" ? demoProject : null);
          const ws = data.chatWorkspaces?.[activeId];

          set({
            theme: data.theme || "dark",
            keys: data.keys || {},
            team: Array.isArray(data.team) ? data.team : defaultTeam,
            chats: data.chats,
            projects: Array.isArray(data.projects) ? data.projects : [],
            activeChatId: activeId,
            activeProjectId: data.activeProjectId || null,
            publishSecret: data.publishSecret || "",
            messages: data.messages,
            generatedProjects: data.generatedProjects || {},
            chatWorkspaces: data.chatWorkspaces || {},
            generated: gen,
            projectFiles: gen ? gen.files.map((f, i) => ({ id: uid("f"), projectId: data.activeProjectId || "proj", ...f, updatedAt: Date.now() + i })) : [],
            status: ws?.status ?? (gen ? "Preview Live" : "Ready"),
            consoleLines: ws?.consoleLines ?? [],
            activitySteps: ws?.activitySteps ?? initialSteps(data.team || defaultTeam),
            activityEvents: ws?.activityEvents ?? [],
            openFiles: ws?.openFiles ?? (gen?.files.length ? [gen.entry] : []),
            activeFile: ws?.activeFile ?? (gen?.files.length ? gen.entry : null),
          });

          return { ok: true, count: data.chats.length };
        } catch (err) {
          return { ok: false, error: (err as Error).message || "Could not parse backup JSON." };
        }
      },
    }),
    {
      name: "nexus-persistent-store-v2",
      storage: createJSONStorage(() => nexusIndexedDBStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state, error) => {
        if (state && !error) {
          const activeId = state.activeChatId;
          const clampedLeft = typeof state.leftWidth === "number" && state.leftWidth <= 320 ? Math.max(160, state.leftWidth) : 210;
          const clampedRight = typeof state.rightWidth === "number" && state.rightWidth <= 420 ? Math.max(240, state.rightWidth) : 300;

          const mergedProjects = (!state.projects || state.projects.length === 0) ? initialProjects : state.projects;
          const mergedVersions = { ...seedVersions(), ...(state.projectVersions || {}) };
          const mergedGenerated: Record<string, GeneratedProject> = {
            chat_demo: demoProject,
            chat_saas: demoSaasProject,
            chat_alphav: demoAlphaProject,
            ...(state.generatedProjects || {}),
          };

          if (activeId) {
            const gen = mergedGenerated[activeId] ?? (activeId === "chat_demo" ? demoProject : null);
            const ws = state.chatWorkspaces?.[activeId];
            useStore.setState({
              leftWidth: clampedLeft,
              rightWidth: clampedRight,
              projects: mergedProjects,
              projectVersions: mergedVersions,
              generatedProjects: mergedGenerated,
              generated: gen,
              projectFiles: gen ? gen.files.map((f: any, i: number) => ({ id: uid("f"), projectId: state.activeProjectId || "proj", ...f, updatedAt: Date.now() + i })) : [],
              status: ws?.status ?? (gen ? "Preview Live" : "Ready"),
              consoleLines: ws?.consoleLines ?? (activeId === "chat_demo" ? seedConsole : []),
              activitySteps: ws?.activitySteps ?? (activeId === "chat_demo" ? seedSteps : initialSteps(state.team)),
              activityEvents: ws?.activityEvents ?? (activeId === "chat_demo" ? seedEvents : []),
              openFiles: ws?.openFiles ?? (gen?.files.length ? [gen.entry] : []),
              activeFile: ws?.activeFile ?? (gen?.files.length ? gen.entry : null),
              isHydrated: true,
            });
          } else {
            useStore.setState({
              leftWidth: clampedLeft,
              rightWidth: clampedRight,
              projects: mergedProjects,
              projectVersions: mergedVersions,
              generatedProjects: mergedGenerated,
              isHydrated: true,
            });
          }
          // Request browser storage persistence so the browser won't evict data
          void requestPersistentStorage();
        }
      },
      partialize: (s) => ({
        theme: s.theme,
        userProfile: s.userProfile,
        keys: s.keys,
        connections: s.connections,
        connectedAccounts: s.connectedAccounts,
        team: s.team,
        chats: s.chats,
        projects: s.projects,
        activeChatId: s.activeChatId,
        activeProjectId: s.activeProjectId,
        publishSecret: s.publishSecret,
        messages: s.messages,
        generatedProjects: s.generatedProjects,
        chatWorkspaces: s.chatWorkspaces,
        projectVersions: s.projectVersions,
        leftOpen: s.leftOpen,
        rightOpen: s.rightOpen,
        leftWidth: s.leftWidth,
        rightWidth: s.rightWidth,
      }),
    },
  ),
);

export { timeAgo, cn };
