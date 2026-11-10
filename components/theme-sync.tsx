"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useStore } from "@/lib/store";
import { requestPersistentStorage } from "@/lib/idb";

export function ThemeSync() {
  const theme = useStore((s) => s.theme);

  // Rehydrate persisted state from IndexedDB on the client only
  useEffect(() => {
    const rehydrated = useStore.persist.rehydrate();
    if (rehydrated && typeof (rehydrated as any).then === "function") {
      void (rehydrated as Promise<void>).then(() => {
        void requestPersistentStorage();
      });
    } else {
      void requestPersistentStorage();
    }
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    if (theme === "dark") el.classList.add("dark");
    else el.classList.remove("dark");
  }, [theme]);

  return <Toaster richColors position="top-center" theme={theme} />;
}
