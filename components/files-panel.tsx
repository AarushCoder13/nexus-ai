"use client";

import React, { useState } from "react";
import { FileCode2, FileJson, FileText, File, Folder, FolderOpen, Plus, FilePlus2, FolderPlus } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ProjectFile } from "@/lib/types";
import { cn } from "@/lib/utils";

function iconFor(path: string) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "html" || ext === "css" || ext === "js" || ext === "ts" || ext === "tsx" || ext === "jsx") return <FileCode2 className="h-4 w-4 text-sky-400" />;
  if (ext === "json") return <FileJson className="h-4 w-4 text-amber-400" />;
  if (ext === "md") return <FileText className="h-4 w-4 text-slate-400" />;
  return <File className="h-4 w-4 text-slate-400" />;
}

function buildTree(files: ProjectFile[]) {
  const root: Record<string, any> = {};
  for (const f of files) {
    const parts = f.path.split("/");
    let node = root;
    parts.forEach((part, idx) => {
      if (idx === parts.length - 1) {
        node[part] = { file: f };
      } else {
        if (!node[part]) node[part] = {};
        node = node[part];
      }
    });
  }
  return root;
}

function TreeNode({ name, node, depth }: { name: string; node: any; depth: number }) {
  const setOpenFile = useStore((s) => s.setOpenFile);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const activeFile = useStore((s) => s.activeFile);
  const [open, setOpen] = useState(depth < 1);

  if (node.file) {
    const f = node.file as ProjectFile;
    const active = activeFile === f.path;
    return (
      <button
        onClick={() => { setOpenFile(f.path); setActiveTab("code"); }}
        style={{ paddingLeft: depth * 14 + 8 }}
        className={cn("flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-[13px]", active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}
      >
        {iconFor(f.path)}
        <span className="truncate">{name}</span>
      </button>
    );
  }

  const keys = Object.keys(node);
  return (
    <div>
      <button onClick={() => setOpen(!open)} style={{ paddingLeft: depth * 14 + 8 }} className="flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground">
        {open ? <FolderOpen className="h-4 w-4 text-amber-400" /> : <Folder className="h-4 w-4 text-amber-400" />}
        <span className="font-medium">{name}</span>
      </button>
      {open && (
        <div>
          {keys.map((k) => (
            <TreeNode key={k} name={k} node={node[k]} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FilesPanel() {
  const files = useStore((s) => s.projectFiles);
  const generated = useStore((s) => s.generated);
  const tree = buildTree(files);
  const list = files.map((f) => f.path).join("\n");

  const addPlaceholder = (kind: "file" | "folder") => {
    // Placeholder for a real sandbox write path (see Agent tool).
    const p = window.prompt(`${kind === "file" ? "File" : "Folder"} path (relative to project):`, kind === "file" ? "app/new.js" : "app");
    if (!p) return;
    // Surface as a console note via the store console.
    useStore.setState((s) => ({ consoleLines: [...s.consoleLines, { id: `c_${Date.now()}`, ts: Date.now(), level: "info", text: `// add ${kind} → ${p} (sandbox write stubbed)` }] }));
  };

  if (!generated || files.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <Folder className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground">No project files yet.<br />Send a prompt to generate a file tree.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold text-muted-foreground">{files.length} files</span>
        <div className="flex gap-1">
          <button title="Add file" onClick={() => addPlaceholder("file")} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <FilePlus2 className="h-4 w-4" />
          </button>
          <button title="Add folder" onClick={() => addPlaceholder("folder")} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <FolderPlus className="h-4 w-4" />
          </button>
          <button title="Add (plus)" onClick={() => addPlaceholder("file")} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {Object.keys(tree).map((k) => (
          <TreeNode key={k} name={k} node={tree[k]} depth={0} />
        ))}
      </div>
      <div className="border-t border-border p-3">
        <div className="rounded-xl bg-secondary/40 p-2">
          <div className="text-[11px] font-semibold text-muted-foreground">Project paths</div>
          <pre className="mt-1 max-h-24 overflow-hidden font-mono text-[11px] text-muted-foreground">{list}</pre>
        </div>
      </div>
    </div>
  );
}
