"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Boxes,
  Briefcase,
  Check,
  FolderPlus,
  LayoutDashboard,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type TemplateType = "portfolio" | "saas" | "ecommerce" | "blank";

interface TemplateOption {
  id: TemplateType;
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: "portfolio",
    title: "Portfolio Website",
    badge: "Static HTML / CSS",
    description: "Creative studio portfolio with interactive hero, work showcase grid, and dark styling.",
    icon: Briefcase,
  },
  {
    id: "saas",
    title: "SaaS Analytics Dashboard",
    badge: "Next.js / Tailwind",
    description: "Production telemetry dashboard with active KPI metrics, revenue cards, and latency counters.",
    icon: LayoutDashboard,
  },
  {
    id: "ecommerce",
    title: "E-Commerce Storefront",
    badge: "Interactive Web App",
    description: "High-conversion product grid with cart actions, product highlights, and responsive layouts.",
    icon: ShoppingBag,
  },
  {
    id: "blank",
    title: "Blank Project",
    badge: "Clean Canvas",
    description: "Minimal starter project with clean files ready for custom coding or prompt generation.",
    icon: Boxes,
  },
];

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewProjectModal({ open, onClose }: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("portfolio");
  const [loading, setLoading] = useState(false);
  const createProject = useStore((s) => s.createProject);
  const setActiveTab = useStore((s) => s.setActiveTab);

  if (!open) return null;

  const handleCreate = () => {
    const finalName = name.trim() || TEMPLATES.find((t) => t.id === selectedTemplate)?.title || "New Project";
    setLoading(true);

    try {
      const pId = createProject(finalName, selectedTemplate);
      setActiveTab("code");
      toast.success(`Project "${finalName}" created successfully!`, {
        description: "Your workspace is ready in the Code editor.",
      });
      setName("");
      onClose();
    } catch (err) {
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#0c0c10] shadow-2xl text-zinc-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-[#0e0e14]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700/80 shadow-md p-1">
                <img src="/nexus-logo.png" alt="Nexus AI" className="h-full w-full object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Create New Project</h3>
                <p className="text-[11px] text-zinc-400">Choose a template or start blank with instant AI generation</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5">
            {/* Project Name Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Studio Portfolio, DeFi Dashboard..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500/80 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-medium"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
            </div>

            {/* Template Selector Grid */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Starter Template
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate === tmpl.id;
                  const Icon = tmpl.icon;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={cn(
                        "flex flex-col text-left rounded-xl border p-3 transition-all relative group",
                        isSelected
                          ? "border-amber-500/80 bg-amber-500/10 shadow-sm shadow-amber-500/10"
                          : "border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/50 hover:border-zinc-700",
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                              isSelected
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-200",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-bold transition-colors",
                              isSelected ? "text-amber-300" : "text-zinc-200",
                            )}
                          >
                            {tmpl.title}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-black">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px]">
                        <span className="font-mono text-zinc-500">{tmpl.badge}</span>
                        {isSelected && (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Selected
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-800/80 bg-[#0e0e14] px-6 py-3.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 px-5 py-2 text-xs font-bold text-black shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Create Project</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
