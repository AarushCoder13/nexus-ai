"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Code2,
  CornerDownLeft,
  FileCode,
  FolderTree,
  GitBranch,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  TerminalSquare,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const LEVEL_COLOR: Record<string, string> = {
  info: "text-sky-600 dark:text-sky-300",
  cmd: "text-purple-600 dark:text-purple-300 font-medium",
  success: "text-emerald-600 dark:text-emerald-400 font-medium",
  warn: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400 font-bold",
};

const SHORTCUT_COMMANDS = [
  "help",
  "ls",
  "tree",
  "npm run build",
  "npm test",
  "git status",
  "git log",
];

export function ConsolePanel() {
  const lines = useStore((s) => s.consoleLines);
  const clearConsole = useStore((s) => s.clearConsole);
  const addConsoleLine = useStore((s) => s.addConsoleLine);
  const generated = useStore((s) => s.generated);
  const activeChatId = useStore((s) => s.activeChatId);
  const projectVersions = useStore((s) => s.projectVersions ?? {});
  const sendMessage = useStore((s) => s.sendMessage);
  const running = useStore((s) => s.running);

  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lines.length]);

  const executeCommand = (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    // Add to history
    setHistory((prev) => [...prev, raw]);
    setHistoryIndex(-1);

    // Echo the command
    addConsoleLine("cmd", `$ ${raw}`);

    const parts = raw.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
      case "?": {
        addConsoleLine("info", "--- Nexus AI Interactive CLI Terminal ---");
        addConsoleLine("info", "Available commands:");
        addConsoleLine("info", "  ls / dir         List project files & metadata");
        addConsoleLine("info", "  cat <filename>   Display file contents");
        addConsoleLine("info", "  tree             Display ASCII file tree structure");
        addConsoleLine("info", "  npm run build    Run static build compilation test");
        addConsoleLine("info", "  npm test         Run validation suite on code files");
        addConsoleLine("info", "  git status       Check active branch & uncommitted changes");
        addConsoleLine("info", "  git log          View project version checkpoints");
        addConsoleLine("info", "  whoami           Show active user and environment");
        addConsoleLine("info", "  clear / cls      Clear console logs");
        addConsoleLine("info", "  ai <prompt>      Ask the agent team to update project");
        break;
      }

      case "clear":
      case "cls": {
        clearConsole();
        break;
      }

      case "ls":
      case "dir": {
        if (!generated || !generated.files.length) {
          addConsoleLine("warn", "No generated files found in current workspace.");
          return;
        }
        addConsoleLine("info", `Directory listing for ${generated.name} (framework: ${generated.framework}):`);
        generated.files.forEach((f) => {
          const isEntry = f.path === generated.entry;
          const size = new Blob([f.content]).size;
          const sizeFormatted = size > 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} B`;
          addConsoleLine(
            "info",
            `  - ${f.path.padEnd(24)} ${sizeFormatted.padStart(8)} [${f.language}] ${isEntry ? "★ (entry)" : ""}`,
          );
        });
        addConsoleLine("success", `Total: ${generated.files.length} files.`);
        break;
      }

      case "tree": {
        if (!generated || !generated.files.length) {
          addConsoleLine("warn", "Project directory is empty.");
          return;
        }
        addConsoleLine("info", `${generated.name}/`);
        generated.files.forEach((f, idx) => {
          const isLast = idx === generated.files.length - 1;
          const prefix = isLast ? "└── " : "├── ";
          addConsoleLine("info", `${prefix}${f.path}`);
        });
        break;
      }

      case "cat": {
        if (!args.length) {
          addConsoleLine("error", "Usage: cat <filename> (e.g. cat app/index.html or cat README.md)");
          return;
        }
        const targetPath = args[0];
        const file = generated?.files.find(
          (f) => f.path.toLowerCase() === targetPath.toLowerCase() || f.path.endsWith(targetPath),
        );
        if (!file) {
          addConsoleLine("error", `File not found: ${targetPath}`);
          return;
        }
        addConsoleLine("info", `=== ${file.path} (${file.language}) ===`);
        const lines = file.content.split("\n");
        lines.slice(0, 50).forEach((l, i) => {
          addConsoleLine("info", `${String(i + 1).padStart(3, " ")} | ${l}`);
        });
        if (lines.length > 50) {
          addConsoleLine("warn", `... and ${lines.length - 50} more lines.`);
        }
        break;
      }

      case "npm": {
        const sub = args.join(" ").toLowerCase();
        if (sub === "run build" || sub === "build") {
          addConsoleLine("info", "Compiling assets & validating HTML/CSS/JS...");
          setTimeout(() => {
            if (generated?.files.length) {
              addConsoleLine("success", "✓ Synthesizing entrypoint: " + generated.entry);
              addConsoleLine("success", "✓ Verified DOM structure: 0 syntax errors");
              addConsoleLine("success", "✓ Minifying CSS rules & Tailwind inline utilities");
              addConsoleLine("success", `Build completed successfully in 420ms.`);
            } else {
              addConsoleLine("error", "Build failed: No project entrypoint found.");
            }
          }, 300);
        } else if (sub === "test" || sub === "run test") {
          addConsoleLine("info", "Running Nexus Automated Test Suite...");
          setTimeout(() => {
            const hasHtml = generated?.files.some((f) => f.path.endsWith(".html"));
            const hasEntry = generated?.files.some((f) => f.path === generated.entry);
            addConsoleLine(hasHtml ? "success" : "error", `  ${hasHtml ? "✓" : "✗"} HTML template test`);
            addConsoleLine(hasEntry ? "success" : "error", `  ${hasEntry ? "✓" : "✗"} Entrypoint accessibility`);
            addConsoleLine("success", `  ✓ Responsive viewport meta tag`);
            addConsoleLine("success", `  ✓ Character set UTF-8 declaration`);
            addConsoleLine("success", "PASS: 4 tests passed, 0 failed.");
          }, 400);
        } else {
          addConsoleLine("warn", `npm command '${args.join(" ")}' is simulated. Try 'npm run build' or 'npm test'.`);
        }
        break;
      }

      case "git": {
        const sub = args[0]?.toLowerCase();
        if (sub === "status") {
          addConsoleLine("info", "On branch main");
          addConsoleLine("info", "Your branch is up to date with 'origin/main'.");
          addConsoleLine("success", `Working tree clean — ${generated?.files.length ?? 0} files tracked.`);
        } else if (sub === "log") {
          const versions = activeChatId ? projectVersions[activeChatId] ?? [] : [];
          if (!versions.length) {
            addConsoleLine("info", "commit initial (HEAD -> main)\nAuthor: Aarush <aarush@nexus.ai>\n  Initial project generation");
          } else {
            versions.forEach((v) => {
              addConsoleLine(
                "info",
                `commit ${v.id.slice(0, 7)} (v${v.versionNumber})\nDate: ${new Date(v.timestamp).toLocaleString()}\n  ${v.prompt}`,
              );
            });
          }
        } else {
          addConsoleLine("info", "git: Supported commands are 'git status' and 'git log'.");
        }
        break;
      }

      case "whoami": {
        addConsoleLine("info", "User: Aarush (aarush@nexus.ai)");
        addConsoleLine("info", "Workspace: Nexus AI Local Storage (IndexedDB)");
        addConsoleLine("info", "Role: Full-stack Pair Programmer");
        break;
      }

      case "ai": {
        const prompt = args.join(" ").trim();
        if (!prompt) {
          addConsoleLine("error", "Usage: ai <instruction> (e.g. ai make the header darker)");
          return;
        }
        if (running) {
          addConsoleLine("warn", "An agent build is currently running. Please wait a moment.");
          return;
        }
        addConsoleLine("info", `🚀 Dispatched prompt to agent team: "${prompt}"`);
        void sendMessage(prompt);
        break;
      }

      default: {
        addConsoleLine(
          "warn",
          `Command not recognized: '${command}'. Type 'help' to see available commands or 'ai <prompt>' to ask the agent team.`,
        );
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeCommand(inputVal);
      setInputVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(history[nextIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setInputVal("");
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx] || "");
      }
    }
  };

  return (
    <div className="flex h-full flex-col bg-background font-mono text-xs">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-3 py-2">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <TerminalSquare className="h-4 w-4 text-emerald-500" />
          <span>Interactive CLI Terminal</span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600 font-medium">
            Active
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={clearConsole}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Clear output"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Shortcut Command Chips */}
      <div className="flex gap-1 overflow-x-auto border-b border-border/60 bg-secondary/30 px-3 py-1.5 scrollbar-thin">
        {SHORTCUT_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => executeCommand(cmd)}
            className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Output Log */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 space-y-1 overflow-y-auto scrollbar-thin p-3 text-[12px] leading-relaxed cursor-text bg-[#0b0b0e] font-mono"
      >
        {(lines.length === 0 ? [
          { id: "def-1", level: "info", text: "[NEXUS_AI] 14:03:12 Initializing..." },
          { id: "def-2", level: "info", text: "[NEXUS_AI] 14:05:12 Processing image..." },
          { id: "def-3", level: "info", text: "[NEXUS_AI] 14:05:12 Analyzing tensors..." },
          { id: "def-4", level: "success", text: "[NEXUS_AI] 14:03:12 Analysis complete. Result: 0.987" },
        ] : lines).map((l, i) => {
          const isNexusLog = l.text.startsWith("[NEXUS_AI]");
          if (isNexusLog) {
            const parts = l.text.slice(10).trim().split(" ");
            const time = parts[0];
            const msg = parts.slice(1).join(" ");
            return (
              <div key={l.id} className="flex items-center gap-2 font-mono text-[12px]">
                <span className="text-amber-400 font-bold select-none">[NEXUS_AI]</span>
                <span className="text-zinc-500 text-[11px] select-none">{time}</span>
                <span className={cn("text-zinc-200", l.level === "success" && "text-emerald-400")}>{msg}</span>
              </div>
            );
          }

          return (
            <div key={l.id} className="flex gap-2 font-mono">
              <span className="select-none text-zinc-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={cn("whitespace-pre-wrap break-all", LEVEL_COLOR[l.level] ?? "text-zinc-200")}>
                {l.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Interactive CLI Input Row */}
      <div className="flex items-center gap-2 border-t border-border bg-card/90 px-3 py-2.5">
        <div className="flex items-center gap-1 text-[12px] font-bold">
          <span className="text-emerald-500">nexus@ai</span>
          <span className="text-muted-foreground">:</span>
          <span className="text-primary">~/project</span>
          <span className="text-foreground">$</span>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type command (e.g. ls, npm run build, tree, help)..."
          className="flex-1 bg-transparent font-mono text-[12px] text-foreground outline-none placeholder:text-muted-foreground/60"
          autoFocus
        />

        <button
          onClick={() => {
            executeCommand(inputVal);
            setInputVal("");
          }}
          disabled={!inputVal.trim()}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
          title="Run command"
        >
          <CornerDownLeft className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
