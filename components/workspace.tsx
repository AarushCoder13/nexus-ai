"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import JSZip from "jszip";
import {
  ArrowDownToLine,
  Boxes,
  Check,
  ChevronDown,
  Code2,
  ExternalLink,
  FolderTree,
  GitBranch,
  Globe,
  History,
  Loader2,
  MonitorPlay,
  PanelLeft,
  PanelRight,
  Plug2,
  Rocket,
  Sparkles,
  TerminalSquare,
  UploadCloud,
  Cpu,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { PreviewPanel } from "@/components/preview-panel";
import { CodePanel } from "@/components/code-panel";
import { FilesPanel } from "@/components/files-panel";
import { ConsolePanel } from "@/components/console-panel";
import { HistoryPanel } from "@/components/history-panel";
import { ComponentLibrary } from "@/components/component-library";
import { pushProjectToGitHub, deployProjectToVercel } from "@/lib/connectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthConnectModal } from "@/components/oauth-connect-modal";
import { NewProjectModal } from "@/components/new-project-modal";
import type { WorkspaceTab } from "@/lib/store";

const TABS: { id: WorkspaceTab; label: string; icon: React.ElementType }[] = [
  { id: "preview", label: "Preview", icon: MonitorPlay },
  { id: "code", label: "Code", icon: Code2 },
  { id: "files", label: "Files", icon: FolderTree },
  { id: "console", label: "Console", icon: TerminalSquare },
  { id: "history", label: "History", icon: History },
  { id: "components", label: "Blocks", icon: Boxes },
];

export function Workspace() {
  const leftOpen = useStore((s) => s.leftOpen);
  const toggleLeft = useStore((s) => s.toggleLeft);
  const rightOpen = useStore((s) => s.rightOpen);
  const toggleRight = useStore((s) => s.toggleRight);
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const generated = useStore((s) => s.generated);
  const connections = useStore((s) => s.connections ?? {});
  const connectedAccounts = useStore((s) => s.connectedAccounts ?? {});

  const [zipping, setZipping] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [pubError, setPubError] = useState<string | null>(null);

  // Deploy dropdown & modal states
  const [deployMenuOpen, setDeployMenuOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [oauthModalConnector, setOauthModalConnector] = useState<string | null>(null);
  const [repoName, setRepoName] = useState("");
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [isPushingGH, setIsPushingGH] = useState(false);
  const [isDeployingVercel, setIsDeployingVercel] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const publish = async () => {
    if (publishing || !generated) return;
    setPublishing(true);
    setPubError(null);
    const r = await useStore.getState().publishProject();
    setPublishing(false);
    if (!r) return;
    if (r.error) {
      setPubError(r.error);
      return;
    }
    const full = `${window.location.origin}${r.url}`;
    setLink(full);
    navigator.clipboard?.writeText(full).catch(() => {});
  };

  const downloadZip = async () => {
    if (!generated) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      generated.files.forEach((f) => zip.file(f.path, f.content));
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${generated.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "nexus-project"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setZipping(false);
    }
  };

  const hasGitHub = Boolean(connections["github_token"] || connectedAccounts["github"]);
  const hasVercel = Boolean(connections["vercel_token"] || connectedAccounts["vercel"]);

  const handleOpenGithubModal = () => {
    setDeployMenuOpen(false);
    if (!hasGitHub) {
      toast.info("Connecting with GitHub… Click Connect to link in 1-click!");
      setOauthModalConnector("github");
      return;
    }
    setRepoName(
      (generated?.name || "nexus-app").replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase(),
    );
    setGithubModalOpen(true);
  };

  const handlePushGitHub = async () => {
    if (!generated) return;
    const token = connections["github_token"] || connectedAccounts["github"]?.token || "oauth_demo_token";
    const username = connectedAccounts["github"]?.username;

    setIsPushingGH(true);
    try {
      const res = await pushProjectToGitHub({
        token,
        username,
        repoName: repoName || generated.name,
        isPrivate: isPrivateRepo,
        files: generated.files.map((f) => ({ path: f.path, content: f.content })),
      });

      if (res.ok && res.repoUrl) {
        toast.success("Repository created & pushed to GitHub!", {
          action: {
            label: "Open Repo",
            onClick: () => window.open(res.repoUrl, "_blank"),
          },
        });
        setLink(res.repoUrl);
        setGithubModalOpen(false);
      } else {
        toast.error(res.error || "Failed to push to GitHub.");
      }
    } catch {
      toast.error("Push error occurred.");
    } finally {
      setIsPushingGH(false);
    }
  };

  const handleDeployVercel = async () => {
    setDeployMenuOpen(false);
    if (!generated) return;
    if (!hasVercel) {
      toast.info("Connecting with Vercel… Click Connect to link in 1-click!");
      setOauthModalConnector("vercel");
      return;
    }

    const token = connections["vercel_token"] || connectedAccounts["vercel"]?.token || "oauth_demo_token";
    const teamId = connections["vercel_team_id"] || connectedAccounts["vercel"]?.team;

    setIsDeployingVercel(true);
    toast.info("Deploying to Vercel edge network…");
    try {
      const res = await deployProjectToVercel({
        token,
        teamId: teamId || undefined,
        projectName: generated.name,
        files: generated.files.map((f) => ({ path: f.path, content: f.content })),
      });

      if (res.ok && res.deploymentUrl) {
        toast.success("Deployed to Vercel live!", {
          action: {
            label: "Visit Site",
            onClick: () => window.open(res.deploymentUrl, "_blank"),
          },
        });
        setLink(res.deploymentUrl);
      } else {
        toast.error(res.error || "Vercel deployment failed.");
      }
    } catch {
      toast.error("Deployment error occurred.");
    } finally {
      setIsDeployingVercel(false);
    }
  };

  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(165);

  const startConsoleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = consoleHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const newHeight = Math.min(480, Math.max(70, startHeight + deltaY));
      setConsoleHeight(newHeight);
      if (consoleCollapsed && newHeight > 70) {
        setConsoleCollapsed(false);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="relative flex h-full w-full flex-1 flex-col gap-2 overflow-hidden bg-transparent select-none">
      {/* Top Card: Code Editor / Live Preview Container */}
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0b0b0e] shadow-2xl">
        {/* Top bar (matching screenshot) */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#0d0d11] px-3 gap-2">
          {/* Left: Title + Switcher */}
          <div className="flex items-center gap-3 min-w-0">
            {!leftOpen && (
              <button
                onClick={toggleLeft}
                title="Show sidebar"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors shrink-0"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            )}

            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-bold text-white tracking-wide">Code Editor</span>
              <span className="text-xs text-zinc-500 font-mono">({generated?.name || "main_nexus"})</span>
            </div>

            {/* Segmented Switcher: Code Editor vs Live Preview */}
            <div className="flex items-center rounded-xl bg-zinc-900/90 p-0.5 border border-zinc-800 shrink-0">
              <button
                onClick={() => setActiveTab("code")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all select-none",
                  activeTab === "code"
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60",
                )}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Code</span>
              </button>

              <button
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all select-none",
                  activeTab === "preview"
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60",
                )}
              >
                <MonitorPlay className="h-3.5 w-3.5" />
                <span>Live Preview</span>
              </button>
            </div>
          </div>

          {/* Right: Telemetry Badges (CPU 14% • RAM 2.9GB • API Latency 12ms) + Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {/* System Performance Badges (exact match from screenshot) */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono">
              <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-400">
                CPU <strong className="text-zinc-100">14%</strong>
              </span>
              <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-400">
                RAM <strong className="text-zinc-100">2.9GB</strong>
              </span>
              <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-400">
                API Latency <strong className="text-emerald-400">12ms</strong>
              </span>
            </div>

            {/* Deploy Hub */}
            <div className="relative">
              <button
                onClick={() => setDeployMenuOpen((o) => !o)}
                disabled={!generated || isDeployingVercel || publishing}
                className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-bold text-black hover:brightness-110 transition-all shadow-sm disabled:opacity-40"
                title="Deploy & Share options"
              >
                {isDeployingVercel || publishing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Rocket className="h-3.5 w-3.5" />
                )}
                <span>Deploy</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>

              {/* Dropdown Menu */}
              {deployMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDeployMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-2xl border border-zinc-800 bg-[#0d0d11] p-1.5 shadow-2xl backdrop-blur-md">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Deploy & Share
                    </div>

                    <button
                      onClick={() => {
                        setDeployMenuOpen(false);
                        publish();
                      }}
                      disabled={publishing}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      <Globe className="h-3.5 w-3.5 text-amber-400" />
                      <div className="flex-1">
                        <div>Publish Live URL</div>
                        <div className="text-[10px] text-zinc-500">{link ? "Active link" : "Generates public link"}</div>
                      </div>
                    </button>

                    <button
                      onClick={handleOpenGithubModal}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      <GitBranch className="h-3.5 w-3.5 text-emerald-400" />
                      <div className="flex-1">
                        <div>Push to GitHub</div>
                        <div className="text-[10px] text-zinc-500">{hasGitHub ? "Connected" : "1-click auth"}</div>
                      </div>
                    </button>

                    <button
                      onClick={handleDeployVercel}
                      disabled={isDeployingVercel}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      <UploadCloud className="h-3.5 w-3.5 text-sky-400" />
                      <div className="flex-1">
                        <div>Deploy to Vercel</div>
                        <div className="text-[10px] text-zinc-500">{hasVercel ? "Connected" : "1-click auth"}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setDeployMenuOpen(false);
                        downloadZip();
                      }}
                      disabled={zipping}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      <ArrowDownToLine className="h-3.5 w-3.5 text-amber-500" />
                      <div className="flex-1">
                        <div>Download ZIP</div>
                        <div className="text-[10px] text-zinc-500">Full source code</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Quick ZIP icon button */}
            <button
              onClick={downloadZip}
              disabled={!generated || zipping}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors disabled:opacity-40"
              title="Download project as ZIP"
            >
              <ArrowDownToLine className={cn("h-4 w-4", zipping && "animate-bounce text-amber-400")} />
            </button>

            {/* Assistant Toggle Button */}
            <Button
              variant={rightOpen ? "secondary" : "default"}
              size="sm"
              onClick={toggleRight}
              title={rightOpen ? "Collapse Assistant" : "Open Assistant"}
              className="gap-1.5 text-xs font-semibold rounded-xl h-8"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Assistant</span>
              <PanelRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Live Link Banner if published */}
        {link && (
          <div className="flex items-center gap-2 border-b border-zinc-800 bg-emerald-500/10 px-3 py-1.5 text-[12px]">
            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span className="truncate font-mono text-emerald-400">{link}</span>
            <button
              onClick={() => window.open(link, "_blank")}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Workspace Display Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "preview" ? (
            <PreviewPanel />
          ) : activeTab === "history" ? (
            <HistoryPanel />
          ) : (
            <CodePanel />
          )}
        </div>
      </div>

      {/* Adjustable Horizontal Splitter Handle between Code/Preview and Terminal */}
      {!consoleCollapsed && (
        <div
          onMouseDown={startConsoleResize}
          title="Drag to resize Terminal height"
          className="group relative -my-1 h-2.5 w-full cursor-row-resize flex items-center justify-center z-10 select-none"
        >
          <div className="h-1 w-14 rounded-full bg-zinc-800 transition-colors group-hover:bg-amber-500/80 group-active:bg-amber-400" />
        </div>
      )}

      {/* Bottom Card: Terminal / Console (matching screenshot layout) */}
      <div
        style={{ height: consoleCollapsed ? 38 : consoleHeight }}
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0b0b0e] shadow-2xl transition-all shrink-0",
        )}
      >
        <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#0d0d11] px-3">
          <div className="flex items-center gap-2">
            <TerminalSquare className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-zinc-300">Terminal/Console</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => useStore.getState().clearConsole()}
              title="Clear Console"
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-xs"
            >
              ···
            </button>
            <button
              onClick={() => setConsoleCollapsed(!consoleCollapsed)}
              title={consoleCollapsed ? "Expand Terminal" : "Collapse Terminal"}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {!consoleCollapsed && (
          <div className="flex-1 overflow-hidden">
            <ConsolePanel />
          </div>
        )}
      </div>

      {/* GitHub Push Modal */}
      {githubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-3 pb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GitBranch className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">Push to GitHub</h3>
                <p className="text-xs text-muted-foreground">Create repository and push current code files</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Repository Name</label>
                <Input
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="e.g. portfolio-website"
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3">
                <div>
                  <div className="text-xs font-medium text-foreground">Private Repository</div>
                  <div className="text-[11px] text-muted-foreground">Only you and collaborators can view</div>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivateRepo}
                  onChange={(e) => setIsPrivateRepo(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
              </div>

              <div className="rounded-xl border border-border/80 bg-secondary/50 p-3 text-xs text-muted-foreground">
                Pushing <span className="font-semibold text-foreground">{generated?.files.length ?? 0} files</span> from{" "}
                <span className="font-semibold text-foreground">"{generated?.name}"</span>.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isPushingGH}
                onClick={() => setGithubModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isPushingGH || !repoName.trim()}
                onClick={handlePushGitHub}
                className="gap-1.5"
              >
                {isPushingGH ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pushing...
                  </>
                ) : (
                  <>
                    <GitBranch className="h-3.5 w-3.5" /> Push Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}


      <OAuthConnectModal
        open={Boolean(oauthModalConnector)}
        connectorId={oauthModalConnector}
        onClose={() => setOauthModalConnector(null)}
      />

      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
      />
    </div>
  );
}
