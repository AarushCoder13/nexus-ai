"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Key, CheckCircle2, ShieldCheck, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROVIDER_GUIDES, ProviderGuide } from "@/lib/provider-guides";
import { cn } from "@/lib/utils";

interface ApiKeyHelpModalProps {
  providerId: string | null;
  onClose: () => void;
}

export function ApiKeyHelpModal({ providerId, onClose }: ApiKeyHelpModalProps) {
  if (!providerId) return null;

  const guide: ProviderGuide | undefined = PROVIDER_GUIDES[providerId];
  if (!guide) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="border-b border-border/80 bg-secondary/30 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Key className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">How to get your {guide.name} Key</h3>
                    {guide.badge && (
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", guide.badgeColor)}>
                        {guide.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{guide.tagline}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6 scrollbar-thin">
            {/* Direct action banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-foreground">Official Key Portal</div>
                <div className="text-[11px] text-muted-foreground">Takes ~30 seconds to generate</div>
              </div>
              <Button
                size="sm"
                className="shrink-0 gap-1.5 rounded-xl font-semibold shadow-sm"
                onClick={() => window.open(guide.getKeyUrl, "_blank", "noopener,noreferrer")}
              >
                <span>Open {guide.name} Dashboard</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Step by step checklist */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Step-by-Step Instructions
              </div>
              <div className="space-y-2.5">
                {guide.steps.map((step) => (
                  <div
                    key={step.number}
                    className="flex items-start gap-3 rounded-2xl border border-border/80 bg-background/60 p-3.5 transition-colors hover:border-border"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                      {step.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-foreground">{step.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Helpful tip box */}
            {guide.tip && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-600 dark:text-amber-400">
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Helpful Tip: </span>
                  {guide.tip}
                </div>
              </div>
            )}

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3.5 py-2.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                Your key is stored safely on your browser device only. It is never logged or saved to any central database.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/80 bg-secondary/20 px-6 py-4 flex items-center justify-between">
            <div className="text-[11px] text-muted-foreground">
              Format hint: <span className="font-mono text-foreground font-semibold">{guide.keyPrefix}</span>
            </div>
            <Button variant="default" size="sm" onClick={onClose} className="rounded-xl px-5">
              Got it
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
