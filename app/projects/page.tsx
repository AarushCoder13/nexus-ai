"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, FolderKanban, FolderPlus, Globe, Rocket } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

type PublishedRef = { slug: string; name: string; files: string[]; url: string };

export default function ProjectsPage() {
  const projects = useStore((s) => s.projects);
  const createChat = useStore((s) => s.createChat);

  const userProfile = useStore((s) => s.userProfile);
  const isHydrated = useStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && !userProfile?.onboarded) {
      window.location.href = "/login";
    }
  }, [isHydrated, userProfile?.onboarded]);

  const [published, setPublished] = useState<PublishedRef[]>([]);
  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setPublished(d.projects || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <img src="/nexus-logo.png" alt="Nexus AI" className="h-8 w-8 rounded-xl object-contain" />
            <span className="font-bold">Nexus <span className="text-primary">AI</span></span>
          </div>
          <Link href="/">
            <Button size="sm">Open workspace</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FolderKanban className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">Everything your team has generated.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => { const id = createChat(); window.location.href = `/?c=${id}`; }}
            className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <FolderPlus className="h-8 w-8" />
            <span className="text-sm font-medium">New project</span>
          </button>

          {projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group relative rounded-3xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Rocket className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{p.framework}</span>
                <Link href="/" className="flex items-center gap-1 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {published.length > 0 && (
          <>
            <h2 className="mb-4 mt-10 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Globe className="h-4 w-4" /> Published — live URLs
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {published.map((p) => (
                <div key={p.slug} className="rounded-3xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.name}</div>
                      <a href={p.url} target="_blank" rel="noreferrer" className="block truncate text-xs text-primary hover:underline">
                        {p.url}
                      </a>
                    </div>
                    <Link href={p.url} target="_blank" className="shrink-0 rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.files.slice(0, 3).map((f) => (
                      <span key={f} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
