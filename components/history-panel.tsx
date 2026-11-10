"use client";

import React, { useState } from "react";
import {
  Boxes,
  Check,
  Clock,
  Code2,
  ExternalLink,
  FileCode,
  Folder,
  FolderKanban,
  GitCommit,
  History,
  Laptop,
  MonitorPlay,
  Plus,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useStore, timeAgo } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NewProjectModal } from "@/components/new-project-modal";
import type { ProjectVersion } from "@/lib/types";

export function HistoryPanel() {
  const activeChatId = useStore((s) => s.activeChatId);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const projects = useStore((s) => s.projects);
  const selectProject = useStore((s) => s.selectProject);
  const projectVersions = useStore((s) => s.projectVersions ?? {});
  const restoreVersion = useStore((s) => s.restoreVersion);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const [viewMode, setViewMode] = useState<"projects" | "checkpoints">("projects");
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const versions: ProjectVersion[] = activeChatId ? projectVersions[activeChatId] ?? [] : [];

  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    versions[0]?.id ?? null,
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const activeVersion =
    versions.find((v) => v.id === selectedVersionId) ?? versions[0] ?? null;

  const currentEntry =
    activeVersion?.files.find((f) => f.path === selectedFile) ??
    activeVersion?.files[0] ??
    null;

  const handleRestore = (versionId: string) => {
    if (!activeChatId) return;
    restoreVersion(activeChatId, versionId);
    toast.success("Project restored to this checkpoint!");
  };

  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  return (
    <div className="flex h-full flex-col bg-[#0b0b0e] overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#0d0d12] px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <History className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">Project History</span>
          </div>

          {/* Sub-tab Switcher: Generated Projects vs Version Checkpoints */}
          <div className="flex items-center rounded-xl bg-zinc-900/90 p-0.5 border border-zinc-800/80">
            <button
              onClick={() => setViewMode("projects")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all select-none",
                viewMode === "projects"
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50",
              )}
            >
              <FolderKanban className="h-3.5 w-3.5" />
              <span>Created Projects ({projects.length})</span>
            </button>

            <button
              onClick={() => setViewMode("checkpoints")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all select-none",
                viewMode === "checkpoints"
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50",
              )}
            >
              <GitCommit className="h-3.5 w-3.5" />
              <span>Version Checkpoints ({versions.length})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("code")}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all shadow-sm"
          >
            <Code2 className="h-3.5 w-3.5 text-amber-400" />
            <span>Back to Editor</span>
          </button>

          <button
            onClick={() => setNewProjectOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400 hover:bg-amber-500/25 transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>+ New Project</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "projects" ? (
        /* ================= Generated Projects Showcase ================= */
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white tracking-wide">
              Generated Projects & Creation History
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Everything built by Nexus AI — explore what was created, inspect starter files, or jump straight into the editor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const isActive = activeProjectId === proj.id;
              const isDemo = proj.id === "proj_demo";
              const isSaas = proj.id === "proj_saas";
              const isAlpha = proj.id === "proj_alphav";

              // Detailed generation descriptions matching user request
              const whatWasCreated = isDemo
                ? "Generated full responsive developer portfolio with dark luxury aesthetic, Hero header with CTA, 3-card project showcase grid (Pulse Analytics, Lumina Store, TrailFinder), package.json, and responsive CSS."
                : isSaas
                ? "Generated production SaaS metrics engine with 4 KPI cards (MRR $48,290, 14.2k Active Users, 4.82% Conversion, 12ms API Latency), live inference telemetry stream, and metrics.json."
                : isAlpha
                ? "Engineered AI model pipeline with app.py data processor, model.js neural tensor compiler (latentDim: 512, lr: 0.001), and FastAPI /health inference endpoints."
                : proj.description || "Custom project generated by Nexus AI multi-agent workspace.";

              return (
                <div
                  key={proj.id}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border p-4 transition-all relative group bg-[#0e0e13]",
                    isActive
                      ? "border-amber-500/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30"
                      : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60",
                  )}
                >
                  <div>
                    {/* Header: Title & Badges */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition-colors",
                            isActive
                              ? "bg-gradient-to-br from-amber-400 to-orange-500 text-black shadow-md shadow-amber-500/20"
                              : "bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700",
                          )}
                        >
                          <Folder className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-white truncate">
                            {proj.name}
                          </h3>
                          <span className="inline-block font-mono text-[10px] text-amber-400">
                            {proj.framework || "Web App"}
                          </span>
                        </div>
                      </div>

                      {isActive && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm" />
                          Active
                        </span>
                      )}
                    </div>

                    {/* What was created */}
                    <div className="mt-3 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400/90 mb-1">
                        <Sparkles className="h-3 w-3" />
                        <span>What was created</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {whatWasCreated}
                      </p>
                    </div>

                    {/* Meta info */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        {timeAgo(proj.createdAt)}
                      </span>
                      <span className="text-zinc-500">
                        Snapshot v1.0
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-2">
                    <button
                      onClick={() => {
                        selectProject(proj.id);
                        setActiveTab("code");
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      <span>Open in Code</span>
                    </button>

                    <button
                      onClick={() => {
                        selectProject(proj.id);
                        setActiveTab("preview");
                      }}
                      className="flex items-center justify-center gap-1 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors"
                      title="View live preview"
                    >
                      <MonitorPlay className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= Version Timeline & Code Diff ================= */
        <div className="flex h-full flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-800 overflow-hidden">
          {/* Version timeline list */}
          <div className="flex h-full w-full md:w-64 shrink-0 flex-col overflow-y-auto border-r border-zinc-800 bg-[#0d0d12] p-3 scrollbar-thin">
            <div className="mb-2.5 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <GitCommit className="h-4 w-4 text-amber-400" />
                <span>Checkpoints ({versions.length})</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[90px]">
                {currentProject?.name}
              </span>
            </div>

            <div className="space-y-2">
              {versions.map((ver, idx) => {
                const isSelected = (selectedVersionId ?? versions[0]?.id) === ver.id;
                const isLatest = idx === 0;

                return (
                  <button
                    key={ver.id}
                    onClick={() => {
                      setSelectedVersionId(ver.id);
                      setSelectedFile(ver.files[0]?.path ?? null);
                    }}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-all",
                      isSelected
                        ? "border-amber-500/80 bg-amber-500/10 shadow-md shadow-amber-500/5 text-amber-300"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-800/40 text-zinc-400",
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                        v{ver.versionNumber}
                      </span>
                      {isLatest && (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="line-clamp-2 text-xs font-medium text-zinc-200">
                      {ver.summary || ver.prompt || "Project generation"}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ver.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="font-mono text-amber-400/80">{ver.files.length} files</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Snapshot details & file preview */}
          <div className="flex flex-1 min-w-0 h-full flex-col overflow-hidden bg-[#0b0b0e]">
            {activeVersion ? (
              <>
                {/* Header info */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-800/80 bg-[#0d0d12] px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 font-mono text-xs font-bold text-amber-400">
                        v{activeVersion.versionNumber}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {new Date(activeVersion.timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-200 font-medium truncate">
                      {activeVersion.summary || activeVersion.prompt || "Checkpoint snapshot"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRestore(activeVersion.id)}
                      className="gap-1.5 text-xs shrink-0 bg-amber-500 text-black font-bold hover:bg-amber-400"
                      title="Restore this version snapshot"
                    >
                      <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Restore This Checkpoint</span>
                    </Button>
                  </div>
                </div>

                {/* File pills */}
                <div className="flex gap-1.5 overflow-x-auto border-b border-zinc-800/80 bg-zinc-950/80 px-3 py-1.5 scrollbar-thin">
                  {activeVersion.files.map((f) => {
                    const isActive = (selectedFile ?? activeVersion.files[0]?.path) === f.path;
                    return (
                      <button
                        key={f.path}
                        onClick={() => setSelectedFile(f.path)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono transition-colors",
                          isActive
                            ? "bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold shadow-sm"
                            : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200",
                        )}
                      >
                        <FileCode className="h-3.5 w-3.5 text-amber-400" />
                        <span>{f.path}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Code content */}
                <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-zinc-200 bg-[#09090c] scrollbar-thin">
                  {currentEntry ? (
                    <pre className="overflow-x-auto whitespace-pre">
                      <code>{currentEntry.content}</code>
                    </pre>
                  ) : (
                    <div className="text-zinc-500">Select a file to inspect.</div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-xs text-zinc-500">
                Select a checkpoint from the timeline on the left.
              </div>
            )}
          </div>
        </div>
      )}

      <NewProjectModal open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
    </div>
  );
}
