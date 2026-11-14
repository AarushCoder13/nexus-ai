"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Plus, Users, X, Sparkles, Check, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { AGENT_ROLES, PROVIDERS, type ProviderId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function ProviderRow({ provider, onDone }: { provider: ProviderId; onDone: () => void }) {
  const keys = useStore((s) => s.keys);
  const setKey = useStore((s) => s.setKey);
  const team = useStore((s) => s.team);
  const setTeamProvider = useStore((s) => s.setTeamProvider);
  const [show, setShow] = useState(false);

  const meta = PROVIDERS.find((p) => p.id === provider)!;
  const member = team.find((m) => m.provider === provider);
  const active = !!member && member.provider === provider;

  const toggle = () => {
    if (active) {
      // move this provider's role back to demo
      if (member) setTeamProvider(member.id, "demo");
    } else {
      // assign this provider to the first role currently on demo, or first member
      const demoMember = team.find((m) => m.provider === "demo");
      if (demoMember) setTeamProvider(demoMember.id, provider);
      else if (team[0]) setTeamProvider(team[0].id, provider);
    }
  };

  const roleLabel = member?.role;

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
          style={{ background: `${meta.color}1f`, color: meta.color }}
        >
          {meta.name[0]}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">{meta.name}</div>
          <div className="text-xs text-muted-foreground">{meta.model}</div>
        </div>
        <button
          onClick={toggle}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {active ? `Use as ${roleLabel} · on` : "Off"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-muted-foreground" />
        <Input
          type={show ? "text" : "password"}
          value={keys[provider] ?? ""}
          onChange={(e) => setKey(provider, e.target.value)}
          placeholder={`Paste ${meta.name} API key…`}
          className="h-8 font-mono text-xs"
        />
        <button onClick={() => setShow(!show)} className="text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Stored only in your browser. Sent just to {meta.name} over HTTPS for each request — never exposed.
      </p>
    </div>
  );
}

function RoleProviderSelect({
  value,
  onChange,
  dropUp = false,
}: {
  value: ProviderId;
  onChange: (provider: ProviderId) => void;
  dropUp?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const currentProvider = PROVIDERS.find((p) => p.id === value) || PROVIDERS[PROVIDERS.length - 1];

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 text-left text-xs font-medium text-zinc-200 transition-all shadow-sm hover:border-amber-500/50 hover:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500",
          open && "border-amber-500 ring-1 ring-amber-500 bg-zinc-900"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold shadow-sm"
            style={{
              backgroundColor: `${currentProvider.color}25`,
              color: currentProvider.color,
              border: `1px solid ${currentProvider.color}45`,
            }}
          >
            {currentProvider.name[0]}
          </span>
          <span className="truncate font-semibold text-zinc-100">{currentProvider.name}</span>
          <span className="hidden text-[11px] text-zinc-500 sm:inline truncate">({currentProvider.model})</span>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform duration-200",
            open && "rotate-180 text-amber-400"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute left-0 right-0 z-50 max-h-56 overflow-y-auto rounded-2xl border border-zinc-700/80 bg-[#0d0d12]/98 p-1.5 shadow-2xl backdrop-blur-2xl scrollbar-thin",
              dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
            )}
          >
            {PROVIDERS.map((p) => {
              const selected = p.id === value;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-all",
                    selected
                      ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30"
                      : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold shadow-sm"
                      style={{
                        backgroundColor: `${p.color}25`,
                        color: p.color,
                        border: `1px solid ${p.color}45`,
                      }}
                    >
                      {p.name[0]}
                    </span>
                    <div className="truncate">
                      <div className="leading-tight text-zinc-100 font-medium">{p.name}</div>
                      <div className="text-[10px] text-zinc-400 leading-tight">{p.model}</div>
                    </div>
                  </div>
                  {selected && <Check className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AgentsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const team = useStore((s) => s.team);
  const setTeamRole = useStore((s) => s.setTeamRole);
  const setTeamProvider = useStore((s) => s.setTeamProvider);
  const resetTeam = useStore((s) => s.resetTeam);
  const [tab, setTab] = useState<"team" | "keys">("keys");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-bold">Model Team</div>
                  <div className="text-xs text-muted-foreground">Bring your keys — the team works together</div>
                </div>
              </div>
              <button onClick={onClose} className="rounded-xl p-2 hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-1 border-b border-border px-6 py-2">
              {(["keys", "team"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
                    tab === t ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === "keys" ? "API Keys" : "Roles"}
                </button>
              ))}
            </div>

            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin p-6">
              {tab === "keys" ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <Sparkles className="h-4 w-4" /> No keys? No problem.
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      Without keys, Nexus runs in <b>Demo mode</b> — the team simulates the full build pipeline so
                      everything works instantly. Add keys whenever you want real generation.
                    </p>
                  </div>
                  {PROVIDERS.filter((p) => p.id !== "demo").map((p) => (
                    <ProviderRow key={p.id} provider={p.id} onDone={onClose} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 min-h-[380px]">
                  <p className="text-sm text-muted-foreground">
                    Assign each role a provider (set to <b>Demo</b> to use simulation for that role).
                  </p>
                  <div className="space-y-2">
                    {AGENT_ROLES.map((role, idx) => {
                      const member = team.find((m) => m.role === role);
                      return (
                        <div key={role} className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/40 p-3 hover:border-border transition-colors">
                          <div className="w-24 shrink-0 text-sm font-semibold text-zinc-200">{role}</div>
                          <RoleProviderSelect
                            value={member?.provider ?? "demo"}
                            onChange={(providerId) => {
                              if (!member) return;
                              setTeamProvider(member.id, providerId);
                              setTeamRole(member.id, role);
                            }}
                            dropUp={idx >= 3}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm" onClick={resetTeam} className="mt-2 text-xs">
                    <Plus className="h-4 w-4" /> Reset team
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-border px-6 py-4">
              <Button onClick={onClose}>Done</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
