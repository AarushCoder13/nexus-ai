// =============================================================
// Nexus AI — project publishing store (server-side)
// Generated projects are saved here and served at a live URL,
// mirroring the Lovable "name.lovable.app" flow.
// =============================================================
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sanitizeMarkup } from "./sanitize";

export type PublishedProject = {
  slug: string;
  name: string;
  entry: string;
  files: Record<string, string>;
};

export const PUBLISH_LIMITS = {
  maxSlugLength: 64,
  maxNameLength: 120,
  maxFiles: 60,
  maxFileBytes: 200_000, // per-file content cap
  maxTotalBytes: 600_000, // sum of all file content
  allowedExtensions: ["html", "css", "js", "json", "md", "svg", "png"],
} as const;

const SLUG_RE = /^[a-z0-9-]+$/;
const SAFE_REL_PATH_RE = /^[\w./-]+$/;

/** Validate a single file path is a safe, relative path. */
function isSafeRelPath(p: unknown): p is string {
  if (typeof p !== "string") return false;
  if (p.length === 0 || p.length > 120) return false;
  if (p.startsWith("/")) return false;
  if (p.includes("..")) return false;
  if (/[\\\0]/.test(p)) return false;
  if (!SAFE_REL_PATH_RE.test(p)) return false;
  const ext = p.split(".").pop() ?? "";
  return (PUBLISH_LIMITS.allowedExtensions as readonly string[]).includes(ext);
}

export type PublishValidation = { ok: true; project: PublishedProject } | { ok: false; error: string };

/** Validate an incoming publish payload. Coerces safe values, rejects the rest. */
export function validatePublish(body: unknown): PublishValidation {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid payload." };
  const b = body as Record<string, unknown>;

  const slugRaw = b.slug;
  if (typeof slugRaw !== "string" || !SLUG_RE.test(slugRaw) || slugRaw.length > PUBLISH_LIMITS.maxSlugLength) {
    return { ok: false, error: "Slug must be lowercase alphanumeric + hyphens (max 64 chars)." };
  }

  const name = typeof b.name === "string" ? b.name.slice(0, PUBLISH_LIMITS.maxNameLength) : slugRaw;
  const entryRaw = b.entry;
  if (typeof entryRaw !== "string" || !isSafeRelPath(entryRaw)) {
    return { ok: false, error: "Entry must be a safe relative file path." };
  }

  const filesRaw = b.files;
  if (!filesRaw || typeof filesRaw !== "object" || Array.isArray(filesRaw)) {
    return { ok: false, error: "files must be an object of path → content." };
  }
  const entries = Object.entries(filesRaw as Record<string, unknown>);
  if (entries.length === 0 || entries.length > PUBLISH_LIMITS.maxFiles) {
    return { ok: false, error: `File count must be between 1 and ${PUBLISH_LIMITS.maxFiles}.` };
  }

  const files: Record<string, string> = {};
  let total = 0;
  for (const [path, content] of entries) {
    if (!isSafeRelPath(path)) return { ok: false, error: `Unsafe file path: ${path}.` };
    if (typeof content !== "string") return { ok: false, error: `File ${path} content must be a string.` };
    if (content.length > PUBLISH_LIMITS.maxFileBytes) {
      return { ok: false, error: `File ${path} exceeds size limit.` };
    }
    total += content.length;
    if (total > PUBLISH_LIMITS.maxTotalBytes) {
      return { ok: false, error: "Total published size exceeds limit." };
    }
    const ext = path.split(".").pop() ?? "";
    // Sanitize HTML/SVG before persisting (stored-XSS prevention).
    files[path] = ext === "html" || ext === "svg" ? sanitizeMarkup(content) : content;
  }

  if (!(entryRaw in files)) {
    return { ok: false, error: "Entry file must exist in the files map." };
  }

  return { ok: true, project: { slug: slugRaw, name, entry: entryRaw, files } };
}

const store = new Map<string, PublishedProject>();
let loaded = false;

function dataFile() {
  return join(process.cwd(), "data", "published.json");
}

function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    if (existsSync(dataFile())) {
      const arr = JSON.parse(readFileSync(dataFile(), "utf8")) as PublishedProject[];
      for (const p of arr) store.set(p.slug, p);
    }
  } catch {
    /* ignore corrupt/missing file */
  }
}

const dataDir = () => join(process.cwd(), "data");

// Serialize all writes so concurrent publishes never interleave or corrupt the file.
let writeQueue: Promise<void> = Promise.resolve();

/** Write the full project set to disk atomically (temp file + rename). */
function writeAtomically(projects: PublishedProject[]): void {
  mkdirSync(dataDir(), { recursive: true });
  const tmp = dataFile() + ".tmp";
  writeFileSync(tmp, JSON.stringify(projects, null, 2));
  renameSync(tmp, dataFile());
}

/**
 * Persist a project. Throws if the write fails — callers must treat that as
 * a server error (500). Writes are serialized and atomic.
 */
export async function saveProject(p: PublishedProject): Promise<void> {
  ensureLoaded();
  store.set(p.slug, p);
  const snapshot = [...store.values()];
  const task = writeQueue.then(() => writeAtomically(snapshot));
  // Keep the queue alive even if this write fails; callers still observe the error.
  writeQueue = task.then(
    () => undefined,
    () => undefined,
  );
  await task;
}

export function getProject(slug: string): PublishedProject | undefined {
  ensureLoaded();
  return store.get(slug);
}

export function listProjects(): PublishedProject[] {
  ensureLoaded();
  return [...store.values()];
}

/**
 * The publish secret is taken from the NEXUS_PUBLISH_SECRET environment
 * variable, or — for local/self-hosted setups — from data/publish-secret.txt.
 * Empty string means publishing is disabled.
 */
export function getConfiguredSecret(): string {
  const env = process.env.NEXUS_PUBLISH_SECRET;
  if (env && env.trim()) return env;
  try {
    const f = join(process.cwd(), "data", "publish-secret.txt");
    if (existsSync(f)) {
      const v = readFileSync(f, "utf8").trim();
      if (v) return v;
    }
  } catch {
    /* ignore */
  }
  return "";
}
