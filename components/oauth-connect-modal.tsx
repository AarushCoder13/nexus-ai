"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  Github,
  Globe,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  Plug2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { CONNECTORS, type ConnectorDefinition, type ConnectedAccount } from "@/lib/connectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Official brand SVG logos for crisp rendering
function ProviderLogo({ id, className }: { id: string; className?: string }) {
  switch (id) {
    case "github":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );
    case "vercel":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L24 22H0L12 1Z" />
        </svg>
      );
    case "supabase":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path
            d="M13.44 2.12c-.52-.89-1.84-.71-2.1.27L7.38 13.56c-.22.84.4 1.68 1.28 1.68h5.71l-2.81 6.64c-.45 1.06.91 1.95 1.68 1.09l9.62-10.74c.73-.81.16-2.11-.93-2.11H15.9l2.76-6.52c.38-.89-.37-1.82-1.22-1.48Z"
            fill="#3ECF8E"
          />
        </svg>
      );
    case "netlify":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.22 8.78L12 3l5.78 5.78L12 14.56 6.22 8.78zM3 12l3.22-3.22L12 14.56 8.78 17.78 3 12zm18 0l-5.78 5.78L12 14.56l5.78-5.78L21 12zM12 21l-3.22-3.22L12 14.56l3.22 3.22L12 21z" />
        </svg>
      );
    case "stripe":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.97 15.754.5 12.873.5 7.94.5 4.35 3.033 4.35 7.422c0 5.495 7.574 4.595 7.574 6.969 0 .979-.844 1.469-2.31 1.469-2.025 0-4.887-1.077-6.842-2.193l-.936 5.568C3.896 20.35 6.945 21 9.94 21c5.127 0 8.877-2.457 8.877-6.994 0-5.748-7.669-4.708-7.669-7.056 0-.819.736-1.282 1.828-1.282.88 0 2.016.324 2.87.824l-.87 2.658z" />
        </svg>
      );
    default:
      return <Zap className={className} />;
  }
}

type StepState = "idle" | "connecting" | "authorizing" | "syncing" | "done";

export function OAuthConnectModal({
  open,
  onClose,
  connectorId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  connectorId: string | null;
  onSuccess?: (account: ConnectedAccount) => void;
}) {
  const connectedAccounts = useStore((s) => s.connectedAccounts ?? {});
  const connectAccount = useStore((s) => s.connectAccount);
  const disconnectAccount = useStore((s) => s.disconnectAccount);

  const connector = CONNECTORS.find((c) => c.id === connectorId);
  const existingAccount = connectorId ? connectedAccounts[connectorId] : null;

  const [username, setUsername] = useState(
    existingAccount?.username || connector?.oauthConfig?.defaultUsername || "aarush-coder",
  );
  const [step, setStep] = useState<StepState>("idle");

  if (!open || !connector) return null;

  const handleStartOAuth = async () => {
    setStep("connecting");
    // Step 1: Connecting to OAuth provider
    await new Promise((r) => setTimeout(r, 450));
    setStep("authorizing");
    // Step 2: Granting scopes and exchange token
    await new Promise((r) => setTimeout(r, 550));
    setStep("syncing");
    // Step 3: Syncing workspace
    await new Promise((r) => setTimeout(r, 400));
    setStep("done");

    const finalAccount: ConnectedAccount = {
      provider: connector.id,
      username: username.trim() || connector.oauthConfig.defaultUsername,
      name: "Aarush",
      email: `${username.trim() || "aarush"}@nexus.ai`,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username.trim() || "aarush"}`,
      team: connector.oauthConfig.defaultTeam,
      connectedAt: Date.now(),
      scopes: connector.oauthConfig.scopes,
      isDemoOAuth: true,
    };

    connectAccount(connector.id, finalAccount);
    toast.success(`Connected to ${connector.name} as @${finalAccount.username}!`);

    setTimeout(() => {
      setStep("idle");
      onSuccess?.(finalAccount);
      onClose();
    }, 600);
  };

  const handleDisconnect = () => {
    disconnectAccount(connector.id);
    toast.info(`Disconnected from ${connector.name}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step === "idle" ? onClose : undefined}
        className="fixed inset-0 bg-background/80 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={step !== "idle"}
          className="absolute right-4 top-4 rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Handshake Animation Banner */}
        <div className="mb-6 flex items-center justify-center pt-2">
          <div className="relative flex items-center gap-6">
            {/* Nexus AI App Logo */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-background shadow-lg">
              <img src="/nexus-logo.png" alt="Nexus AI" className="h-9 w-9 rounded-xl object-contain" />
            </div>

            {/* Glowing animated connection beam */}
            <div className="relative flex w-16 items-center justify-center">
              <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/80 to-emerald-400" />
              <motion.div
                animate={{ x: [-20, 20, -20] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50"
              />
            </div>

            {/* Provider Logo */}
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 shadow-lg"
              style={{ backgroundColor: connector.badgeColor, color: "#ffffff" }}
            >
              <ProviderLogo id={connector.id} className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Connect {connector.name}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            1-Click OAuth authorization for instant repo sync and edge deployments.
          </p>
        </div>

        {/* If already connected, show management view */}
        {existingAccount && step === "idle" ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 font-bold">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">@{existingAccount.username}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                    Connected
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {existingAccount.team ? `Team: ${existingAccount.team} · ` : ""}Full permissions granted
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-secondary/40 p-3 text-xs space-y-2">
              <div className="font-medium text-foreground">Authorized Scopes:</div>
              <div className="flex flex-wrap gap-1">
                {connector.oauthConfig.scopes.map((s) => (
                  <span key={s} className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={handleStartOAuth}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-authorize
              </Button>
              <Button
                variant="ghost"
                className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          /* Connecting or not yet connected view */
          <div className="mt-6 space-y-4">
            {/* Account Selector */}
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-3.5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" /> Connect as Account:
                </span>
                <span className="text-[10px] text-muted-foreground">Default User</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                  @
                </div>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. your-handle"
                  disabled={step !== "idle"}
                  className="h-8 text-xs font-mono font-medium"
                />
              </div>
            </div>

            {/* Permission Scopes preview */}
            <div className="space-y-2 rounded-2xl border border-border/60 bg-secondary/20 p-3.5">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Requested Permissions:
                </span>
                <span className="text-[10px] text-emerald-500 font-semibold">1-Click OAuth</span>
              </div>
              <ul className="space-y-1.5 text-xs text-foreground/80">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Create & commit code repositories</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Trigger live instant preview deployments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Sync project settings & environment variables</span>
                </li>
              </ul>
            </div>

            {/* Animated Step Status */}
            {step !== "idle" && (
              <div className="flex items-center gap-2.5 rounded-xl bg-primary/10 p-3 text-xs font-medium text-primary">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                <span>
                  {step === "connecting" && `Connecting to ${connector.name} OAuth portal…`}
                  {step === "authorizing" && "Authorizing scopes & validating identity…"}
                  {step === "syncing" && "Configuring live deployment pipeline…"}
                  {step === "done" && "Successfully connected!"}
                </span>
              </div>
            )}

            {/* 1-Click Action Button */}
            <div className="pt-2">
              <Button
                disabled={step !== "idle" || !username.trim()}
                onClick={handleStartOAuth}
                className="w-full h-11 rounded-2xl font-semibold gap-2 shadow-lg transition-all"
                style={{
                  backgroundColor: connector.accentColor,
                  color: connector.id === "render" ? "#000000" : "#ffffff",
                }}
              >
                {step === "idle" ? (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Connect with {connector.name} in 1 Click</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting…</span>
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-[11px] text-muted-foreground">
              Instant connection · No manual API token copying required
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
