"use client";

import React from "react";
import { Check, Copy, FileCode2, Save, X, FolderTree, PanelLeftClose, PanelLeft, FileText, File } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function getFileBadge(p: string) {
  const ext = p.split(".").pop()?.toLowerCase();
  if (ext === "py") return <span className="text-xs">🐍</span>;
  if (ext === "js" || ext === "ts" || ext === "tsx") return <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-bold text-amber-400">JS</span>;
  if (ext === "html") return <span className="rounded bg-orange-500/20 px-1 py-0.2 text-[9px] font-bold text-orange-400">HTML</span>;
  if (ext === "json") return <span className="rounded bg-yellow-500/20 px-1 py-0.2 text-[9px] font-bold text-yellow-400">JSON</span>;
  if (ext === "md") return <span className="rounded bg-sky-500/20 px-1 py-0.2 text-[9px] font-bold text-sky-400">MD</span>;
  return <FileCode2 className="h-3.5 w-3.5 text-zinc-400" />;
}

const KW = "const|let|var|function|return|if|else|for|while|new|import|export|default|class|extends|true|false|null|undefined|async|await|try|catch|typeof|of|in|this|from";
const PATTERNS = [
  { cls: "text-muted-foreground italic", re: /\/\/[^\n]*|\/\*[\s\S]*?\*\// },
  { cls: "text-amber-600 dark:text-amber-300", re: /"[^"]*"|'[^']*'|`[^`]*`/ },
  { cls: "text-orange-600 dark:text-orange-400", re: /\b\d+(\.\d+)?\b/ },
  { cls: "text-purple-600 dark:text-purple-400 font-medium", re: new RegExp(`\\b(${KW})\\b`) },
  { cls: "text-sky-600 dark:text-sky-400", re: /<\/?[a-zA-Z][^>]*>|&[a-z]+;/ },
];

function highlightLine(line: string, key: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let text = line;
  let guard = 0;
  while (text.length > 0 && guard < 200) {
    guard++;
    let best = null as null | { index: number; len: number; cls: string };
    for (const p of PATTERNS) {
      const m = text.match(p.re);
      if (m && m.index !== undefined && (best === null || m.index < best.index)) {
        best = { index: m.index, len: m[0].length, cls: p.cls };
      }
    }
    if (!best) {
      nodes.push(<React.Fragment key={`${key}-${guard}`}>{text}</React.Fragment>);
      break;
    }
    if (best.index > 0) nodes.push(<React.Fragment key={`${key}-a${guard}`}>{text.slice(0, best.index)}</React.Fragment>);
    nodes.push(
      <span key={`${key}-h${guard}`} className={best.cls}>
        {text.slice(best.index, best.index + best.len)}
      </span>,
    );
    text = text.slice(best.index + best.len);
  }
  return nodes;
}

const DEFAULT_FILES = [
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
from pydantic import BaseModel

app = FastAPI(title="AlphaV Inference API")

@app.get("/health")
def health():
    return {"status": "online", "model": "AlphaV", "latency_ms": 12}`,
  },
];

function CodeView({ code, lang, path }: { code: string; lang: string; path: string }) {
  const lines = code.split("\n");
  const isAppPy = path.endsWith("app.py");
  const startOffset = isAppPy ? 23 : 0; // Starts at line 24 for app.py matching screenshot

  return (
    <div className="flex-1 overflow-auto scrollbar-thin font-mono text-[13px] leading-[1.8] bg-[#0b0b0e] py-2">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, i) => {
            const lineNum = startOffset + i + 1;
            const isHighlightLine = isAppPy && (lineNum === 32 || line.includes("NexusAI.expood"));
            return (
              <tr
                key={i}
                className={cn(
                  "relative align-top transition-colors",
                  isHighlightLine ? "bg-amber-500/10 border-y border-amber-500/25" : "hover:bg-zinc-800/25",
                )}
              >
                <td className="w-12 select-none border-r border-zinc-800/80 px-3 text-right text-[11px] text-zinc-500">
                  {lineNum}
                </td>
                <td className="relative whitespace-pre-wrap px-4 text-zinc-200">
                  {highlightLine(line, `${path}-${i}`)}
                  {isHighlightLine && (
                    <span className="absolute right-0 top-0 h-full w-1 bg-amber-400 shadow-sm shadow-amber-400/80" />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CodePanel() {
  const files = useStore((s) => s.projectFiles);
  const openFiles = useStore((s) => s.openFiles);
  const activeFile = useStore((s) => s.activeFile);
  const setActiveFile = useStore((s) => s.setActiveFile);
  const setOpenFile = useStore((s) => s.setOpenFile);
  const closeFile = useStore((s) => s.closeFile);
  const updateFileContent = useStore((s) => s.updateFileContent);
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [showFiles, setShowFiles] = React.useState(true);

  const displayFiles = files.length > 0 ? files : DEFAULT_FILES;
  const currentPath = activeFile || displayFiles[0]?.path || "app.py";
  const f = displayFiles.find((x) => x.path === currentPath) || displayFiles[0];

  const effectiveOpenFiles = openFiles.length > 0 ? openFiles : ["app.py", "model.js", "api.py"];

  const copyCode = () => {
    if (!f) return;
    navigator.clipboard?.writeText(f.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }).catch(() => {});
  };

  const onEditContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!f) return;
    updateFileContent(f.path, e.target.value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="flex h-full w-full bg-[#0b0b0e] overflow-hidden">
      {/* File Explorer (Shown ONLY in Code mode & strictly inside Code tab) */}
      {showFiles && (
        <div className="flex w-44 md:w-52 shrink-0 flex-col border-r border-zinc-800/80 bg-[#0d0d12] select-none">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800/80 px-2.5 bg-[#0f0f15]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <FolderTree className="h-3.5 w-3.5 text-amber-400" />
              <span>Project Files ({displayFiles.length})</span>
            </div>
            <button
              onClick={() => setShowFiles(false)}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
              title="Collapse files explorer"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {displayFiles.map((item) => {
              const isActive = currentPath === item.path || currentPath.endsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    setOpenFile(item.path);
                    setActiveFile(item.path);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-left transition-colors",
                    isActive
                      ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/40 shadow-sm"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200",
                  )}
                >
                  <span className="shrink-0">{getFileBadge(item.path)}</span>
                  <span className="truncate flex-1 font-mono text-[11px]">{item.path}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Editor & Tabs */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        {/* File Tabs Bar */}
        <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#0d0d11] px-2 overflow-hidden">
          <div className="flex flex-1 min-w-0 items-center gap-1 overflow-x-auto scrollbar-none">
            {!showFiles && (
              <button
                onClick={() => setShowFiles(true)}
                className="mr-1 flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/20 transition-colors shrink-0"
                title="Show files explorer"
              >
                <FolderTree className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold">Files ({displayFiles.length})</span>
              </button>
            )}

            {effectiveOpenFiles.map((p) => {
              const isActive = currentPath === p || currentPath.endsWith(p);

              return (
                <div
                  key={p}
                  onClick={() => setActiveFile(p)}
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-2 rounded-t-lg px-3 py-1.5 text-xs transition-colors",
                    isActive
                      ? "border-t-2 border-t-amber-500 bg-[#0b0b0e] border-x border-zinc-800 text-amber-300 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40",
                  )}
                >
                  <span className="shrink-0">{getFileBadge(p)}</span>
                  <span className="truncate max-w-[120px] font-mono">{p.split("/").pop()}</span>
                  {isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeFile(p);
                      }}
                      className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 pl-2">
            {saved && <span className="text-[11px] text-emerald-400 font-medium">Saved ✓</span>}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "rounded-lg px-2 py-0.5 text-xs transition-colors font-medium",
                isEditing ? "bg-amber-500/20 text-amber-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800",
              )}
              title={isEditing ? "Finish editing" : "Edit file"}
            >
              {isEditing ? "Done" : "Edit"}
            </button>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Copy file code"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden md:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Editor Main Canvas */}
        {isEditing ? (
          <textarea
            value={f.content}
            onChange={onEditContent}
            spellCheck={false}
            className="flex-1 resize-none bg-[#0b0b0e] p-4 font-mono text-[13px] leading-relaxed text-zinc-100 outline-none scrollbar-thin"
          />
        ) : (
          <CodeView code={f.content} lang={f.language} path={f.path} />
        )}
      </div>
    </div>
  );
}
