// =============================================================
// Nexus AI — Core TypeScript models
// Shaped to be Supabase-ready (RLS-friendly ids + user foreign keys)
// =============================================================

export type ProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "grok"
  | "mistral"
  | "deepseek"
  | "demo";

export const PROVIDERS: {
  id: ProviderId;
  name: string;
  model: string;
  color: string;
}[] = [
  { id: "openai", name: "OpenAI", model: "gpt-4o-mini", color: "#10a37f" },
  { id: "anthropic", name: "Anthropic Claude", model: "claude-3-5-sonnet-latest", color: "#d97757" },
  { id: "gemini", name: "Google Gemini", model: "gemini-1.5-flash", color: "#4285f4" },
  { id: "grok", name: "xAI Grok", model: "grok-beta", color: "#ffffff" },
  { id: "mistral", name: "Mistral", model: "mistral-large-latest", color: "#ff7000" },
  { id: "deepseek", name: "DeepSeek", model: "deepseek-chat", color: "#4d6bfe" },
  { id: "demo", name: "Demo (no key)", model: "simulated", color: "#a78bfa" },
];

// --- Agent roles -----------------------------------------------------------
export type AgentRole = "Planner" | "Architect" | "Frontend" | "Backend" | "Reviewer";

export const AGENT_ROLES: AgentRole[] = [
  "Planner",
  "Architect",
  "Frontend",
  "Backend",
  "Reviewer",
];

export type TeamMember = {
  id: string;
  provider: ProviderId;
  role: AgentRole;
};

// --- Core entities ---------------------------------------------------------
export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: number;
};

export type UserProfile = {
  name: string;
  email: string;
  profession: string;
  workspaceType: "solo" | "company";
  companyName?: string;
  avatarUrl?: string;
  onboarded: boolean;
};

export type Project = {
  id: string;
  userId: string;
  name: string;
  description: string;
  framework: string;
  createdAt: number;
  updatedAt: number;
};

export type Chat = {
  id: string;
  projectId?: string;
  title: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export type MessageRole = "user" | "assistant" | "agent";

export type Message = {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  agentRole?: AgentRole; // set when role === "agent"
  attachments?: { id: string; name: string; url: string }[];
};

export type ProjectFile = {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  updatedAt: number;
};

export type AgentRun = {
  id: string;
  userId: string;
  projectId: string;
  status: "running" | "succeeded" | "failed";
  startedAt: number;
  finishedAt?: number;
};

export type Deployment = {
  id: string;
  projectId: string;
  provider: "vercel" | "github" | "local";
  status: "pending" | "live" | "failed";
  url?: string;
  createdAt: number;
};

// --- Chat / workspace state -------------------------------------------------
export type ChatStatus = "Ready" | "Building" | "Preview Live";

export type ActivityStepId =
  | "understand"
  | "plan"
  | "files"
  | "code"
  | "build"
  | "review"
  | "preview";

export type ActivityStep = {
  id: ActivityStepId;
  label: string;
  status: "pending" | "active" | "done";
  agent?: string; // agent display name that is doing this
};

export type ActivityEvent = {
  id: string;
  agent: string;
  role: AgentRole;
  message: string;
  ts: number;
  kind: "start" | "note" | "handoff" | "review" | "fix" | "done";
};

export type ConsoleLine = {
  id: string;
  ts: number;
  level: "info" | "cmd" | "success" | "warn" | "error";
  text: string;
};

// --- Generated project (files for preview / code tabs / zip) ---------------
export type GeneratedProject = {
  name: string;
  framework: string;
  files: { path: string; content: string; language: string }[];
  entry: string; // html entry path for preview
};

// --- Per-chat workspace runtime snapshots for on-device persistence -------
export type ChatWorkspaceData = {
  status: ChatStatus;
  consoleLines: ConsoleLine[];
  activitySteps: ActivityStep[];
  activityEvents: ActivityEvent[];
  openFiles: string[];
  activeFile: string | null;
};

// --- Project version history snapshots -------------------------------------
export type ProjectVersion = {
  id: string;
  versionNumber: number;
  timestamp: number;
  prompt: string;
  files: { path: string; content: string; language: string }[];
  summary?: string;
};

// --- Complete on-device backup package -------------------------------------
export type NexusBackup = {
  version: number;
  exportedAt: number;
  theme: "dark" | "light";
  keys: ProviderKeys;
  team: TeamMember[];
  chats: Chat[];
  projects: Project[];
  activeChatId: string | null;
  activeProjectId: string | null;
  publishSecret: string;
  messages: Record<string, Message[]>;
  generatedProjects: Record<string, GeneratedProject>;
  chatWorkspaces: Record<string, ChatWorkspaceData>;
  projectVersions?: Record<string, ProjectVersion[]>;
};

// --- API key storage (client-side only) ------------------------------------
export type ProviderKeys = Partial<Record<ProviderId, string>>;

// =============================================================
// Agent tool interfaces (typed placeholders)
// Secure backend integration is stubbed here — see comments.
// =============================================================
export interface AgentTool {
  name: string;
  description: string;
  call(input: unknown): Promise<unknown>;
}

/**
 * read_files — list/read generated project files.
 * Backend note: in production, read from your sandbox/project store,
 * applying RLS scoping to the current user+project.
 */
export const toolReadFiles: AgentTool = {
  name: "read_files",
  description: "List or read generated project files.",
  call: async () => [],
};

/**
 * create_file / update_file — write into the project workspace.
 * Backend note: validate path traversal (no ".."), enforce size caps,
 * and persist to the ProjectFile table via the API route.
 */
export const toolWriteFile: AgentTool = {
  name: "create_file",
  description: "Create or update a file in the project.",
  call: async () => ({}),
};

/**
 * run_build — run `npm run build` (or similar) inside an isolated sandbox.
 * Backend note: spawn in a container with no network egress.
 */
export const toolRunBuild: AgentTool = {
  name: "run_build",
  description: "Run the build in a sandbox and return the log.",
  call: async () => ({ ok: true, log: "" }),
};

/**
 * read_build_errors — parse build output for actionable errors.
 */
export const toolReadBuildErrors: AgentTool = {
  name: "read_build_errors",
  description: "Extract errors from the latest build log.",
  call: async () => [] as string[],
};

/**
 * generate_preview — assemble the iframe srcDoc from generated files.
 */
export const toolGeneratePreview: AgentTool = {
  name: "generate_preview",
  description: "Build the preview document from project files.",
  call: async () => "",
};

/**
 * export_zip — package all files into a downloadable archive.
 */
export const toolExportZip: AgentTool = {
  name: "export_zip",
  description: "Package project files into a .zip.",
  call: async () => new Blob(),
};

/**
 * deploy — push to Vercel/GitHub.
 * Backend note: uses OAuth tokens stored server-side; never on the client.
 */
export const toolDeploy: AgentTool = {
  name: "deploy",
  description: "Deploy the project to Vercel or GitHub.",
  call: async () => ({ url: "" }),
};
