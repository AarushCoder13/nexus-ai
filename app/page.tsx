"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import { ChatArea } from "@/components/chat";
import { Workspace } from "@/components/workspace";

export default function Home() {
  const leftOpen = useStore((s) => s.leftOpen);
  const rightOpen = useStore((s) => s.rightOpen);
  const drawer = useStore((s) => s.drawer);
  const setDrawer = useStore((s) => s.setDrawer);

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
