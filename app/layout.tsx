import type { Metadata } from "next";
import { ThemeSync } from "@/components/theme-sync";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus AI — Agent Workspace",
  description: "Multi-agent AI workspace. Plan, build, review and preview projects with a team of models.",
  icons: {
    icon: "/nexus-logo.png",
    apple: "/nexus-logo.png",
  },
  openGraph: {
    images: ["/nexus-logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
