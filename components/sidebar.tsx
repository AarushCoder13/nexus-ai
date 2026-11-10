"use client";

import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronsLeft,
  Folder,
  FolderKanban,
  Laptop,
  Boxes,
  Rocket,
  Settings,
  History,
  FileCode,
  FileText,
  Plus,
  Search,
  Trash2,
  Pencil,
  Pin,
  PinOff,
  MessageSquare,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useStore, timeAgo } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AgentsModal } from "@/components/agents-modal";
import { NewProjectModal } from "@/components/new-project-modal";

function ChatItem({ chat }: { chat: ReturnType<typeof useStore.getState>["chats"][number] }) {
  const activeChatId = useStore((s) => s.activeChatId);
  const selectChat = useStore((s) => s.selectChat);
  const deleteChat = useStore((s) => s.deleteChat);
  const togglePin = useStore((s) => s.togglePin);
  const renameChat = useStore((s) => s.renameChat);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chat.title);
  const active = activeChatId === chat.id;

  return (
    <div
      className={cn(
        "group relative rounded-xl px-2.5 py-1.5 transition-colors",
        active ? "bg-amber-500/10 text-amber-300" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
      )}
    >
      <button className="flex w-full items-center gap-2 text-left text-xs" onClick={() => selectChat(chat.id)}>
        <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded", active ? "text-amber-400" : "text-zinc-500")}>
          {chat.pinned ? <Pin className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
        </span>
        <span className="min-w-0 flex-1 truncate">{title}</span>
      </button>

      {!editing && (
        <div className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-lg border border-border bg-background/90 p-0.5 shadow-sm backdrop-blur group-hover:flex">
          <button title="Rename" onClick={() => { setTitle(chat.title); setEditing(true); }} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <Pencil className="h-3 w-3" />
          </button>
          <button title={chat.pinned ? "Unpin" : "Pin"} onClick={() => togglePin(chat.id)} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            {chat.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
          </button>
          <button title="Delete" onClick={() => deleteChat(chat.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const chats = useStore((s) => s.chats);
  const userProfile = useStore((s) => s.userProfile);
  const leftOpen = useStore((s) => s.leftOpen);
  const toggleLeft = useStore((s) => s.toggleLeft);
  const leftWidth = useStore((s) => s.leftWidth);
  const setLeftWidth = useStore((s) => s.setLeftWidth);
  const projects = useStore((s) => s.projects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const selectProject = useStore((s) => s.selectProject);
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [showChats, setShowChats] = useState(false);

  const handleLogout = () => {
    if (typeof document !== "undefined") {
      document.cookie = "nexus_auth=; path=/; max-age=0; SameSite=Lax";
    }
    useStore.getState().setUserProfile({ onboarded: false });
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.href = "/login";
    }, 400);
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(340, Math.max(160, startWidth + (moveEvent.clientX - startX)));
      setLeftWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="relative flex h-full flex-col select-none">
      <AnimatePresence>
        {leftOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: leftWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0d0d10] p-2.5 text-zinc-300 shadow-2xl"
          >
            {/* Top Brand & Collapse */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1 pt-1 pb-1">
                <div className="flex items-center gap-2">
                  <img
                    src="/nexus-logo.png"
                    alt="Nexus AI"
                    className="h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.45)]"
                  />
                  <span className="text-sm font-bold tracking-tight text-white">Nexus AI</span>
                </div>
                <button
                  onClick={toggleLeft}
                  title="Collapse sidebar"
                  className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
              </div>

              {/* Main Nav Section */}
              <nav className="flex flex-col gap-1">
                {/* Active Workspace Pill */}
                <button
                  onClick={() => setActiveTab("code")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left",
                    activeTab === "code" || activeTab === "preview"
                      ? "border border-amber-500/60 bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/5 font-semibold"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200",
                  )}
                >
                  <Laptop className="h-4 w-4 text-amber-400" />
                  <span>Workspace</span>
                </button>

                {/* History Link */}
                <button
                  onClick={() => setActiveTab("history")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left",
                    activeTab === "history"
                      ? "border border-amber-500/60 bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/5"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200",
                  )}
                >
                  <History className="h-4 w-4 text-amber-400" />
                  <span>History</span>
                </button>

                <button
                  onClick={() => setTeamModalOpen(true)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 transition-colors text-left"
                >
                  <Boxes className="h-4 w-4 text-zinc-400" />
                  <span>Models</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("code");
                    useStore.getState().addConsoleLine("info", "Deployments connected: GitHub, Vercel ready");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 transition-colors text-left"
                >
                  <Rocket className="h-4 w-4 text-zinc-400" />
                  <span>Deployments</span>
                </button>

                <a
                  href="/settings"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 transition-colors text-left"
                >
                  <Settings className="h-4 w-4 text-zinc-400" />
                  <span>Settings</span>
                </a>
              </nav>

              {/* Projects Section (User projects, NOT file tree!) */}
              <div className="pt-2">
                <div className="flex items-center justify-between px-2 pb-2 text-xs font-semibold text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <FolderKanban className="h-3.5 w-3.5 text-amber-400" />
                    <span>Projects ({projects.length})</span>
                  </span>
                  <button
                    onClick={() => setNewProjectOpen(true)}
                    title="Create New Project"
                    className="flex items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[11px] font-bold text-amber-400 hover:bg-amber-500/25 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>New</span>
                  </button>
                </div>

                {/* Quick Add Button */}
                <button
                  onClick={() => setNewProjectOpen(true)}
                  className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 px-2.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/70 transition-all shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>+ New Project</span>
                </button>

                {/* Projects List */}
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[220px] scrollbar-thin pr-0.5">
                  {projects.map((proj) => {
                    const isActive = activeProjectId === proj.id;
                    return (
                      <button
                        key={proj.id}
                        onClick={() => {
                          selectProject(proj.id);
                          setActiveTab("code");
                        }}
                        className={cn(
                          "group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all",
                          isActive
                            ? "border border-amber-500/60 bg-amber-500/10 text-amber-300 font-semibold shadow-sm"
                            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors",
                            isActive ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-400",
                          )}
                        >
                          <Folder className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-semibold">{proj.name}</div>
                          <div className="truncate text-[10px] text-zinc-500">{proj.framework || "Project"}</div>
                        </div>
                        {isActive && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom User Profile Section (Alex R. • Online) */}
            <div className="border-t border-zinc-800/80 pt-3">
              <div className="flex items-center justify-between rounded-xl px-1.5 py-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-600 text-xs font-bold text-white shadow">
                    {(userProfile?.name || "Alex R.").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-zinc-200">
                      {userProfile?.name || "Alex R."}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                      <span>Online</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href="/settings"
                    title="Workspace Settings"
                    className="rounded-xl border border-zinc-700/80 bg-zinc-800/60 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all shadow-sm"
                  >
                    <Settings className="h-4 w-4" />
                  </a>

                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all shadow-sm group"
                  >
                    <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AgentsModal open={teamModalOpen} onClose={() => setTeamModalOpen(false)} />
      <NewProjectModal open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />

      {/* Resize drag handle */}
      {leftOpen && (
        <div
          className="group absolute -right-2 top-0 z-30 h-full w-4 cursor-col-resize flex items-center justify-center"
          onMouseDown={startResizing}
          title="Drag to resize sidebar"
        >
          <div className="h-10 w-1 rounded-full bg-transparent group-hover:bg-amber-500/70 group-active:bg-amber-400 transition-colors" />
        </div>
      )}
    </div>
  );
}
