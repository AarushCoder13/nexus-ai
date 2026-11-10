"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ClipboardCopy,
  LayoutTemplate,
  Loader2,
  Mic,
  MoreHorizontal,
  PanelLeft,
  PanelRight,
  Paperclip,
  Pencil,
  Share2,
  Users,
  X,
  Sparkles,
  Zap,
  Lightbulb,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/components/use-media-query";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AgentsModal } from "@/components/agents-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ActivityStep, ChatStatus } from "@/lib/types";

const SUGGESTIONS = [
  { icon: "🖼️", label: "Create a premium portfolio website" },
  { icon: "🚗", label: "Build a ride expense tracker" },
  { icon: "🛒", label: "Make an e-commerce store" },
  { icon: "📊", label: "Create a SaaS dashboard" },
];

// Built-in sample reference mockup so the Screenshot → Pixel Perfect flow
// can be tried instantly, without uploading a file.
const SAMPLE_REF_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='600'>
<rect width='900' height='600' fill='#0b0d12'/>
<rect x='80' y='48' width='240' height='48' rx='12' fill='#7c5cfc'/>
<rect x='80' y='130' width='520' height='190' rx='18' fill='#221f33'/>
<circle cx='150' cy='225' r='42' fill='#10b981'/>
<rect x='215' y='190' width='250' height='20' rx='10' fill='#e7eaf0'/>
<rect x='215' y='228' width='170' height='14' rx='7' fill='#9aa3b2'/>
<rect x='80' y='390' width='170' height='150' rx='18' fill='#8b5cf6'/>
<rect x='270' y='390' width='170' height='150' rx='18' fill='#f59e0b'/>
<rect x='460' y='390' width='170' height='150' rx='18' fill='#10b981'/>
</svg>`;
const SAMPLE_REF_URL = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(SAMPLE_REF_SVG);

function StatusBadge({ status }: { status: ChatStatus }) {
  if (status === "Building") {
    return (
      <Badge variant="warn" className="animate-pulse-soft">
        <Loader2 className="h-3 w-3 animate-spin" /> Building
      </Badge>
    );
  }
  if (status === "Preview Live") {
    return (
      <Badge variant="success">
        <Check className="h-3 w-3" /> Preview Live
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Ready
    </Badge>
  );
}

function AgentActivity() {
  const steps = useStore((s) => s.activitySteps);
  const events = useStore((s) => s.activityEvents);
  const running = useStore((s) => s.running);

  if (!running && steps.every((s) => s.status === "done")) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-3 rounded-2xl border border-border bg-card/60 p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Users className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-semibold">Agent team at work</span>
        <span className="text-xs text-muted-foreground">· {events.length} events</span>
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                step.status === "done" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
                step.status === "active" && "border-primary bg-primary/15 text-primary",
                step.status === "pending" && "border-border text-muted-foreground",
              )}
            >
              {step.status === "done" ? <Check className="h-3 w-3" /> : step.status === "active" ? <Loader2 className="h-3 w-3 animate-spin" /> : step.id[0].toUpperCase()}
            </span>
            <span className={cn("text-[13px]", step.status === "pending" ? "text-muted-foreground" : "text-foreground", step.status === "active" && "font-medium")}>
              {step.label}
            </span>
            {step.status === "active" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />}
          </div>
        ))}
      </div>
      {events.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-border pt-3">
          {events.slice(-3).map((e) => (
            <div key={e.id} className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 rounded-md bg-secondary px-1.5 py-0.5 font-medium text-muted-foreground">{e.role}</span>
              <span className="text-muted-foreground">{e.message}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function MessageRow({ message, last }: { message: { role: string; content: string; attachments?: { id: string; name: string; url: string }[] }; last: boolean }) {
  const isUser = message.role === "user";
  if (message.role === "agent") {
    return (
      <div className="flex justify-center">
        <div className="rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground">{message.content}</div>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-3xl px-4 py-3",
          isUser ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card",
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap text-[14px]">
            {message.content}
            {message.attachments?.map((a) => (
              <img key={a.id} src={a.url} alt={a.name} className="mt-2 max-h-48 w-full rounded-xl object-cover ring-1 ring-black/10" />
            ))}
          </div>
        ) : (
          <Markdown content={message.content} />
        )}
      </div>
    </motion.div>
  );
}

export function ChatArea() {
  const activeChatId = useStore((s) => s.activeChatId);
  const messages = useStore((s) => s.messages);
  const sendMessage = useStore((s) => s.sendMessage);
  const running = useStore((s) => s.running);
  const status = useStore((s) => s.status);
  const toggleLeft = useStore((s) => s.toggleLeft);
  const toggleRight = useStore((s) => s.toggleRight);
  const setDrawer = useStore((s) => s.setDrawer);
  const leftOpen = useStore((s) => s.leftOpen);
  const rightWidth = useStore((s) => s.rightWidth);
  const setRightWidth = useStore((s) => s.setRightWidth);
  const createChat = useStore((s) => s.createChat);
  const isMobile = useIsMobile();

  const dragging = useRef(false);
  const [draft, setDraft] = useState("");
  const [teamOpen, setTeamOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [draftAttachment, setDraftAttachment] = useState<{ name: string; url: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const maxAllowed = Math.min(500, Math.floor(window.innerWidth * 0.45));
      const newWidth = Math.min(maxAllowed, Math.max(240, startWidth - (moveEvent.clientX - startX)));
      setRightWidth(newWidth);
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

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRec =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRec) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Listening... Speak your prompt clearly!");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setDraft((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript.trim()}` : transcript.trim();
          });
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== "no-speech") {
          toast.error(`Voice error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      toast.error("Could not start microphone.");
      setIsListening(false);
    }
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setDraftAttachment({ name: f.name, url: String(reader.result) });
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const chatMessages = activeChatId ? messages[activeChatId] ?? [] : [];
  const chat = useStore((s) => s.chats.find((c) => c.id === s.activeChatId));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages.length, running]);

  const submit = (text?: string) => {
    const value = (text ?? draft).trim();
    if ((!value && !draftAttachment) || running || !activeChatId) return;
    const content = value || "Turn this screenshot into a pixel-perfect website";
    const att = draftAttachment;
    setDraft("");
    setDraftAttachment(null);
    void sendMessage(content, att);
  };

  const sendSampleScreenshot = () => {
    if (running || !activeChatId) return;
    const content = "Turn this screenshot into a pixel-perfect website";
    setDraft("");
    void sendMessage(content, { name: "mockup-design.svg", url: SAMPLE_REF_URL });
  };

  const copyChatLink = () => {
    const url = `${window.location.origin}/?c=${activeChatId}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setMoreOpen(false);
  };

  const empty = chatMessages.length === 0;

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0d0d10] shadow-2xl"
      style={{ width: isMobile ? "100%" : rightWidth }}
    >
      {!isMobile && (
        <div
          className="group absolute -left-2 top-0 z-30 h-full w-4 cursor-col-resize flex items-center justify-center"
          onMouseDown={startResizing}
          title="Drag to resize Assistant"
        >
          <div className="h-10 w-1 rounded-full bg-transparent group-hover:bg-amber-500/70 group-active:bg-amber-400 transition-colors" />
        </div>
      )}

      {/* Top Header Bar (matching screenshot) */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#0d0d11] px-3.5">
        <div className="flex items-center gap-2">
          <img
            src="/nexus-logo.png"
            alt="Nexus AI"
            className="h-5 w-5 object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]"
          />
          <span className="text-xs font-bold text-white tracking-wide">Nexus Assistant</span>
          <span className="text-[11px] text-zinc-500 font-medium">| Chat</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTeamOpen(true)}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            title="Model Team"
          >
            <Users className="h-3.5 w-3.5 text-amber-400 mr-1" />
            <span className="hidden sm:inline">Team</span>
          </Button>

          <button
            onClick={() => (isMobile ? setDrawer(null) : toggleRight())}
            title="Collapse Assistant"
            className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3.5">
        {empty && !running ? (
          <div className="space-y-3.5">
            {/* Screenshot Message 1: Nexus AI Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm mt-0.5 overflow-hidden p-0.5">
                <img src="/nexus-logo.png" alt="Nexus AI" className="h-full w-full object-contain" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-relaxed text-zinc-200">
                  Welcome back, Alex. Analyzing project <strong className="text-amber-300">'AlphaV'</strong>. Need help with <code className="rounded bg-zinc-800 px-1 py-0.5 text-amber-300">'process_data'</code>?
                </div>

                <button
                  type="button"
                  onClick={() => submit("Optimize function for speed")}
                  className="rounded-xl border border-amber-500/40 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-amber-200 hover:border-amber-400 hover:bg-amber-500/10 hover:text-amber-100 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Optimize function for speed</span>
                </button>
              </div>
            </motion.div>

            {/* Screenshot Message 2: Nexus AI Suggestion */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start gap-2.5"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm mt-0.5 overflow-hidden p-0.5">
                <img src="/nexus-logo.png" alt="Nexus AI" className="h-full w-full object-contain" />
              </div>

              <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-relaxed text-zinc-200 space-y-2">
                <p>
                  Analyzing <code className="rounded bg-zinc-800 px-1 py-0.5 text-amber-300">'app.py'</code>... Suggest vectorizing the loop.
                </p>
                <ul className="space-y-1 text-zinc-400 text-[11px] list-disc pl-4">
                  <li>Suggest enchachine in alt hata to resunts.</li>
                  <li>Coust vectorize the loop avorted by a comnication processing lihe loop.</li>
                </ul>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {chatMessages.map((m, i) => (
              <MessageRow key={m.id} message={m} last={i === chatMessages.length - 1} />
            ))}
            <AgentActivity />
            {running && (
              <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Nexus agent team compiling...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer & The 3 Action Buttons (matching screenshot) */}
      <div className="shrink-0 border-t border-zinc-800/80 bg-[#0d0d11] p-3 space-y-2.5">
        {/* Input box */}
        <div className="rounded-xl border border-zinc-800 bg-[#09090b] px-3 py-2 shadow-inner focus-within:border-amber-500/60 transition-colors">
          {isListening && (
            <div className="mb-1.5 flex items-center gap-2 text-xs text-red-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span>Listening to prompt...</span>
              <button onClick={toggleVoice} className="ml-auto text-xs underline">Done</button>
            </div>
          )}

          {draftAttachment && (
            <div className="mb-1.5 flex items-center gap-2 rounded-lg bg-zinc-800/60 p-1 text-xs">
              <img src={draftAttachment.url} alt={draftAttachment.name} className="h-6 w-8 rounded object-cover" />
              <span className="truncate text-zinc-400">{draftAttachment.name}</span>
              <button onClick={() => setDraftAttachment(null)} className="ml-auto p-1 text-zinc-500 hover:text-zinc-200">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Ask Nexus AI..."
              className="flex-1 bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 outline-none font-sans"
            />

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
            <button
              onClick={() => fileRef.current?.click()}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
              title="Attach screenshot or file"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={toggleVoice}
              className={cn("p-1 transition-colors", isListening ? "text-red-400 animate-pulse" : "text-zinc-500 hover:text-zinc-300")}
              title="Voice dictation"
            >
              <Mic className="h-3.5 w-3.5" />
            </button>

            <Button
              size="sm"
              onClick={() => submit()}
              disabled={(!draft.trim() && !draftAttachment) || running}
              className="h-7 w-7 rounded-lg p-0 bg-amber-500 hover:bg-amber-400 text-black font-bold"
            >
              {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* 3 Full-Width Action Buttons (exact match from screenshot) */}
        <div className="flex flex-col gap-2 pt-0.5">
          {/* Button 1: Generate Code (Solid Radiant Solar Amber Gradient) */}
          <button
            type="button"
            onClick={() => submit(draft.trim() ? draft : "Generate complete code and components for this project.")}
            disabled={running}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 py-3.5 text-xs sm:text-sm font-extrabold text-black shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center tracking-wide disabled:opacity-50"
          >
            Generate Code
          </button>

          {/* Button 2: Explain Functions (Dark button with amber outline) */}
          <button
            type="button"
            onClick={() => submit("Explain the main functions, structure, and architecture of this code.")}
            disabled={running}
            className="w-full rounded-2xl border border-amber-500/40 bg-zinc-900/60 py-3 text-xs sm:text-sm font-semibold text-amber-200 hover:border-amber-400 hover:text-amber-100 hover:bg-amber-500/10 active:scale-[0.99] transition-all flex items-center justify-center disabled:opacity-50"
          >
            Explain Functions
          </button>

          {/* Button 3: Refine Model (Dark button with amber outline) */}
          <button
            type="button"
            onClick={() => submit("Refine and optimize this code for production, clean state management, and responsive styling.")}
            disabled={running}
            className="w-full rounded-2xl border border-amber-500/40 bg-zinc-900/60 py-3 text-xs sm:text-sm font-semibold text-amber-200 hover:border-amber-400 hover:text-amber-100 hover:bg-amber-500/10 active:scale-[0.99] transition-all flex items-center justify-center disabled:opacity-50"
          >
            Refine Model
          </button>
        </div>
      </div>

      <AgentsModal open={teamOpen} onClose={() => setTeamOpen(false)} />
    </div>
  );
}
