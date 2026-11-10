"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import { ChatArea } from "@/components/chat";
import { Workspace } from "@/components/workspace";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const isHydrated = useStore((s) => s.isHydrated);
  const userProfile = useStore((s) => s.userProfile);
  const leftOpen = useStore((s) => s.leftOpen);
  const rightOpen = useStore((s) => s.rightOpen);
  const drawer = useStore((s) => s.drawer);
  const setDrawer = useStore((s) => s.setDrawer);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isHydrated) {
      if (!userProfile?.onboarded) {
        router.replace("/login");
      }
    }
  }, [mounted, isHydrated, userProfile?.onboarded, router]);

  // While store is hydrating or checking auth, show sleek cyber loader
  if (!mounted || !isHydrated || !userProfile?.onboarded) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#07070a] text-zinc-100 select-none">
        <div className="relative flex flex-col items-center">
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-zinc-900 p-2 shadow-2xl shadow-amber-500/10">
            <img
              src="/nexus-logo.png"
              alt="Nexus AI"
              className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse"
            />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            <span className="text-xs font-semibold tracking-wide text-zinc-400">
              Initializing Nexus AI...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black p-2 sm:p-2.5 gap-2 sm:gap-2.5 text-foreground select-none supports-[height:100dvh]:h-dvh">
      {/* Desktop: left sidebar */}
      <div className="hidden h-full md:block shrink-0">
        <Sidebar />
      </div>

      {/* Center: Workspace (Code Editor, Live Preview, Files, Console) */}
      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Workspace />
      </main>

      {/* Desktop: right panel (Nexus Assistant / Chat) */}
      <div className="hidden h-full lg:block shrink-0">
        {rightOpen && <ChatArea />}
      </div>

      {/* Mobile: sidebar drawer */}
      <AnimatePresence>
        {drawer === "sidebar" && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(null)} />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute left-0 top-0 h-full w-[300px] max-w-[85vw]"
            >
              <Sidebar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: chat assistant drawer */}
      <AnimatePresence>
        {(drawer === "workspace" || drawer === ("chat" as any)) && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(null)} />
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute right-0 top-0 h-full w-[min(430px,92vw)]"
            >
              <ChatArea />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
