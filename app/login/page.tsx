"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  HelpCircle,
  Key,
  Loader2,
  ShieldCheck,
  Sparkles,
  User,
  Briefcase,
  Building,
  Code2,
  Palette,
  Lightbulb,
  GraduationCap,
  Compass,
  Zap,
  Info,
  Terminal,
  Activity,
  Layers,
  Cpu,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { PROVIDERS, ProviderId } from "@/lib/types";
import { PROVIDER_GUIDES } from "@/lib/provider-guides";
import { ApiKeyHelpModal } from "@/components/api-key-help-modal";

// Official Google G icon SVG
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12c0 2.02.45 3.84 1.24 5.42l4.04-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

// Official GitHub Octocat icon SVG
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const PROFESSIONS = [
  { id: "developer", label: "Software Engineer", icon: Code2, desc: "Building full-stack apps" },
  { id: "designer", label: "UI/UX Designer", icon: Palette, desc: "Crafting beautiful interfaces" },
  { id: "founder", label: "Founder / Creator", icon: Lightbulb, desc: "Launching products fast" },
  { id: "student", label: "Student / Learner", icon: GraduationCap, desc: "Learning to build & code" },
  { id: "nontech", label: "Product Innovator", icon: Sparkles, desc: "Building without coding" },
  { id: "other", label: "Other / Exploring", icon: Compass, desc: "Curious about AI tools" },
];

export default function LoginPage() {
  const storeUserProfile = useStore((s) => s.userProfile);
  const setUserProfile = useStore((s) => s.setUserProfile);
  const storeKeys = useStore((s) => s.keys);
  const setKey = useStore((s) => s.setKey);

  // Wizard Step: 1 = Auth, 2 = Profile, 3 = API Keys
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Auth state
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  // Step 2: Profile state
  const [name, setName] = useState(storeUserProfile?.name || "Aarush");
  const [profession, setProfession] = useState(storeUserProfile?.profession || "Software Engineer");
  const [customProfession, setCustomProfession] = useState("");
  const [workspaceType, setWorkspaceType] = useState<"solo" | "company">(
    storeUserProfile?.workspaceType || "solo",
  );
  const [companyName, setCompanyName] = useState(storeUserProfile?.companyName || "");

  // Step 3: API Keys state
  const [keys, setLocalKeys] = useState<Record<string, string>>({
    gemini: storeKeys.gemini || "",
    openai: storeKeys.openai || "",
    anthropic: storeKeys.anthropic || "",
    deepseek: storeKeys.deepseek || "",
    grok: storeKeys.grok || "",
    mistral: storeKeys.mistral || "",
  });
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [helpProviderId, setHelpProviderId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  // Sync state if store updates
  useEffect(() => {
    if (storeUserProfile?.name) setName(storeUserProfile.name);
    if (storeUserProfile?.email && !email) setEmail(storeUserProfile.email);
  }, [storeUserProfile]);

  const handleGoogleLogin = () => {
    setLoadingGoogle(true);
    toast.info("Connecting with Google Account…");
    setTimeout(() => {
      setEmail("aarush@gmail.com");
      setName("Aarush");
      setLoadingGoogle(false);
      toast.success("Signed in with Google!");
      setStep(2);
    }, 600);
  };

  const handleGitHubLogin = () => {
    setLoadingGithub(true);
    toast.info("Connecting with GitHub…");
    setTimeout(() => {
      setEmail("aarush-coder@github.com");
      setName("Aarush");
      setLoadingGithub(false);
      toast.success("Signed in with GitHub!");
      setStep(2);
    }, 600);
  };

  const handleInstantDemoLogin = () => {
    setLoadingDemo(true);
    toast.success("Guest Access Activated! Opening Nexus AI workspace...");
    if (typeof document !== "undefined") {
      document.cookie = "nexus_auth=1; path=/; max-age=31536000; SameSite=Lax";
    }
    setUserProfile({
      name: "Aarush",
      email: "guest@nexus.ai",
      profession: "Software Engineer",
      workspaceType: "solo",
      onboarded: true,
    });
    setTimeout(() => {
      window.location.href = "/";
    }, 600);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !pass.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }

    if (mode === "signin") {
      toast.success(`Welcome back, ${email.split("@")[0]}!`);
      if (typeof document !== "undefined") {
        document.cookie = "nexus_auth=1; path=/; max-age=31536000; SameSite=Lax";
      }
      setUserProfile({
        name: email.split("@")[0],
        email: email.trim(),
        onboarded: true,
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } else {
      toast.success("Account created! Let's tailor your experience.");
      setStep(2);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProfession = customProfession.trim() || profession;
    setUserProfile({
      name: name.trim() || "Aarush",
      profession: finalProfession,
      workspaceType,
      companyName: workspaceType === "company" ? companyName.trim() : "",
    });
    toast.success(`Nice to meet you, ${name}!`);
    setStep(3);
  };

  const handleCompleteSetup = (skipKeys = false) => {
    setCompleting(true);

    if (!skipKeys) {
      Object.entries(keys).forEach(([provider, val]) => {
        if (val.trim()) {
          setKey(provider as ProviderId, val.trim());
        }
      });
      toast.success("API Keys safely saved to encrypted browser storage!");
    } else {
      toast.info("Starting in Demo Mode. You can add API keys anytime in Settings.");
    }

    if (typeof document !== "undefined") {
      document.cookie = "nexus_auth=1; path=/; max-age=31536000; SameSite=Lax";
    }

    setUserProfile({
      name: name.trim() || "Aarush",
      email: email.trim() || "aarush@nexus.ai",
      profession: customProfession.trim() || profession,
      workspaceType,
      companyName: workspaceType === "company" ? companyName.trim() : "",
      onboarded: true,
    });

    setTimeout(() => {
      window.location.href = "/";
    }, 700);
  };

  const handlePasteKey = async (providerId: string) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setLocalKeys((prev) => ({ ...prev, [providerId]: text.trim() }));
        toast.success(`Pasted key for ${PROVIDER_GUIDES[providerId]?.name || providerId}`);
      }
    } catch {
      toast.error("Could not read clipboard. Please paste manually.");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#07070a] text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/4 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-[15%] h-[550px] w-[550px] rounded-full bg-orange-600/10 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-1/3 h-[500px] w-[500px] rounded-full bg-amber-600/5 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #3f3f46 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Main Dual-Column Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* ================= LEFT SIDE: Hero Showcase ================= */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:pr-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-xl shadow-amber-500/10 p-1.5">
              <img
                src="/nexus-logo.png"
                alt="Nexus AI"
                className="h-full w-full object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">Nexus</span>
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  AI
                </span>
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">Autonomous Multi-Agent Software Studio</p>
            </div>
          </div>

          {/* Hero Headlines */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Build full-stack software{" "}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                at thought speed.
              </span>
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
              Pair with specialized AI agent swarms that plan architectures, write production code, run live previews, and push to GitHub & Vercel — 100% privately in your browser.
            </p>
          </div>

          {/* Interactive Live Telemetry / Terminal Widget */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d12]/90 p-4 shadow-2xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-300">
                <Terminal className="h-3.5 w-3.5 text-amber-400" />
                <span>nexus-core-runtime // v2.0.4</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cluster Online
                </span>
              </div>
            </div>

            {/* Simulated Live Terminal Feed */}
            <div className="space-y-1.5 font-mono text-[11px] text-zinc-300 leading-relaxed">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-amber-400">$</span> nexus agents spawn --swarm full-stack
              </div>
              <div className="text-zinc-400">
                <span className="text-emerald-400 font-bold">✓ Planner</span>: Architecture designed in 0.8s
              </div>
              <div className="text-zinc-400">
                <span className="text-amber-400 font-bold">⚡ Coder</span>: Next.js + Tailwind scaffold generated
              </div>
              <div className="text-zinc-400">
                <span className="text-sky-400 font-bold">👁️ Reviewer</span>: 0 vulnerabilities, syntax verified
              </div>
            </div>

            {/* Model Badges */}
            <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-zinc-400">
              <span className="rounded-md bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-zinc-300">Claude 3.7</span>
              <span className="rounded-md bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-zinc-300">GPT-4o</span>
              <span className="rounded-md bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-zinc-300">Gemini 2.0</span>
              <span className="rounded-md bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-zinc-300">DeepSeek R1</span>
              <span className="ml-auto text-amber-400 font-semibold">12ms Latency</span>
            </div>
          </div>

          {/* Value Props Grid */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-2.5 text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>On-Device</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">Encrypted in browser</p>
            </div>

            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-2.5 text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span>10x Speed</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">Instant live preview</p>
            </div>

            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-2.5 text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-orange-400" />
                <span>Multi-Model</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">Unified agent swarm</p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Auth Card & Wizard ================= */}
        <div className="lg:col-span-6 w-full">
          {/* Wizard Step Progress Tracker */}
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-[#0e0e14]/90 p-2.5 shadow-lg backdrop-blur-md">
            {[
              { s: 1, title: "1. Account" },
              { s: 2, title: "2. Role" },
              { s: 3, title: "3. AI Keys" },
            ].map((item) => (
              <button
                key={item.s}
                type="button"
                onClick={() => {
                  if (item.s < step) setStep(item.s as 1 | 2 | 3);
                }}
                className={cn(
                  "flex items-center gap-2 text-xs font-semibold transition-all px-2 py-1 rounded-xl",
                  step === item.s
                    ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                    : step > item.s
                    ? "text-emerald-400 hover:text-emerald-300"
                    : "text-zinc-500",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm",
                    step === item.s
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black"
                      : step > item.s
                      ? "bg-emerald-500 text-black"
                      : "bg-zinc-800 text-zinc-500",
                  )}
                >
                  {step > item.s ? <Check className="h-3 w-3 stroke-[3]" /> : item.s}
                </span>
                <span>{item.title}</span>
              </button>
            ))}
          </div>

          {/* Main Glassmorphic Form Card */}
          <div className="rounded-3xl border border-zinc-800 bg-[#0c0c11]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/5 blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              {/* ================= STEP 1: LOGIN / SIGNUP ================= */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      {mode === "signup" ? "Create your workspace" : "Welcome back to Nexus"}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400">
                      Access your private multi-agent development studio.
                    </p>
                  </div>

                  {/* Mode Switcher */}
                  <div className="flex rounded-xl bg-zinc-900/90 p-1 border border-zinc-800">
                    {(["signup", "signin"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={cn(
                          "flex-1 rounded-lg py-1.5 text-xs font-bold transition-all select-none",
                          mode === m
                            ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-sm"
                            : "text-zinc-400 hover:text-white",
                        )}
                      >
                        {m === "signup" ? "New Account (3 Steps)" : "Sign In"}
                      </button>
                    ))}
                  </div>

                  {/* 1-Click Social Sign-in */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loadingGoogle || loadingGithub}
                      className="group flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-800 hover:border-zinc-700 hover:text-white shadow-sm"
                    >
                      {loadingGoogle ? (
                        <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                      ) : (
                        <GoogleIcon className="transition-transform group-hover:scale-105" />
                      )}
                      <span>Continue with Google (1-Click)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGitHubLogin}
                      disabled={loadingGoogle || loadingGithub}
                      className="group flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-800 hover:border-zinc-700 hover:text-white shadow-sm"
                    >
                      {loadingGithub ? (
                        <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                      ) : (
                        <GitHubIcon className="transition-transform group-hover:scale-105" />
                      )}
                      <span>Continue with GitHub (1-Click)</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative text-center text-xs">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-zinc-800" />
                    </div>
                    <span className="relative bg-[#0c0c11] px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      or continue with email
                    </span>
                  </div>

                  {/* Email & Password Form */}
                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500/80 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
                      />
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-300">Password</label>
                        {mode === "signin" && (
                          <button
                            type="button"
                            onClick={() => toast.info("Password reset link sent to your email!")}
                            className="text-[11px] font-medium text-amber-400 hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          required
                          value={pass}
                          onChange={(e) => setPass(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 pr-10 focus:border-amber-500/80 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-xs text-zinc-400">Remember this device</span>
                      </label>

                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Private Auth</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition-all"
                    >
                      <span>Continue to Profile Setup</span>
                      <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </form>

                  {/* Instant Demo Quick Access */}
                  <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleInstantDemoLogin}
                      disabled={loadingDemo}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all shadow-sm"
                    >
                      {loadingDemo ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      )}
                      <span>Instant Guest Access (Launch Workspace Now)</span>
                    </button>

                    <div className="text-center">
                      <Link
                        href="/"
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <span>Skip setup & enter workspace directly →</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ================= STEP 2: PROFILE & ROLE ================= */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      Tell us about yourself
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400">
                      Nexus AI will tailor code output, architecture suggestions, and project structure to your goals.
                    </p>
                  </div>

                  <form onSubmit={handleStep2Submit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                        What should we call you?
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aarush"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500/80 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all font-medium"
                      />
                    </div>

                    {/* Profession Selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-300">
                        What is your primary role?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {PROFESSIONS.map((p) => {
                          const Icon = p.icon;
                          const isSelected = profession === p.label;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setProfession(p.label);
                                setCustomProfession("");
                              }}
                              className={cn(
                                "flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-all",
                                isSelected
                                  ? "border-amber-500/80 bg-amber-500/10 text-white shadow-sm shadow-amber-500/10 ring-1 ring-amber-500/30"
                                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40 hover:text-white",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-lg transition-colors",
                                    isSelected ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-400",
                                  )}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-xs font-bold leading-tight">{p.label}</span>
                              </div>
                              <span className="text-[10px] text-zinc-500">{p.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Working Solo or Company? */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Workspace Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setWorkspaceType("solo")}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all",
                            workspaceType === "solo"
                              ? "border-amber-500/80 bg-amber-500/10 text-white ring-1 ring-amber-500/30"
                              : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800/40 hover:text-white",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-lg",
                              workspaceType === "solo" ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-400",
                            )}
                          >
                            <User className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-xs font-bold">Solo Developer</div>
                            <div className="text-[10px] text-zinc-500">Personal projects</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setWorkspaceType("company")}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all",
                            workspaceType === "company"
                              ? "border-amber-500/80 bg-amber-500/10 text-white ring-1 ring-amber-500/30"
                              : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800/40 hover:text-white",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-lg",
                              workspaceType === "company" ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-400",
                            )}
                          >
                            <Building className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-xs font-bold">Company / Team</div>
                            <div className="text-[10px] text-zinc-500">Shared workspace</div>
                          </div>
                        </button>
                      </div>

                      {workspaceType === "company" && (
                        <div className="pt-1">
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Company or Studio Name"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500/80 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all font-medium"
                          />
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 px-5 py-2 text-xs font-bold text-black shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
                      >
                        <span>Continue to AI Keys</span>
                        <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ================= STEP 3: API KEYS SETUP ================= */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold tracking-tight text-white">
                        Power your AI models
                      </h2>
                      <span className="rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 text-[10px] font-bold">
                        Optional — 1 key is enough
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      Keys are <b>completely optional</b>. You do not need to fill in every key — just <b>1 key</b> powers the whole team.
                    </p>
                  </div>

                  {/* Informational callout */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <p className="text-zinc-300 leading-relaxed text-[11px]">
                        <b>No key is compulsory!</b> Putting just <strong className="text-white">ONE key</strong> (like free Google Gemini or OpenAI) automatically powers all agent roles. Or click below to start in Demo Mode anytime.
                      </p>
                    </div>
                  </div>

                  {/* Provider Key List */}
                  <div className="space-y-2.5 max-h-[36vh] overflow-y-auto pr-1 scrollbar-thin">
                    {PROVIDERS.filter((p) => p.id !== "demo").map((p) => {
                      const guide = PROVIDER_GUIDES[p.id];
                      const val = keys[p.id] || "";
                      const isShown = Boolean(showKey[p.id]);

                      return (
                        <div
                          key={p.id}
                          className={cn(
                            "rounded-xl border p-3 transition-all",
                            val ? "border-amber-500/50 bg-amber-500/5" : "border-zinc-800 bg-zinc-900/50",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold"
                                style={{ background: `${p.color}22`, color: p.color }}
                              >
                                {p.name[0]}
                              </span>
                              <span className="text-xs font-bold text-white">{p.name}</span>
                              {guide?.badge && (
                                <span className={cn("rounded-full border px-1.5 py-0.2 text-[9px] font-semibold", guide.badgeColor)}>
                                  {guide.badge}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {guide && (
                                <>
                                  <a
                                    href={guide.getKeyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 hover:text-white"
                                  >
                                    <span>Get Key</span>
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => setHelpProviderId(p.id)}
                                    className="p-1 text-zinc-400 hover:text-white rounded"
                                    title="Help guide"
                                  >
                                    <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div className="relative flex-1">
                              <input
                                type={isShown ? "text" : "password"}
                                value={val}
                                onChange={(e) => setLocalKeys((prev) => ({ ...prev, [p.id]: e.target.value }))}
                                placeholder={guide?.placeholder || `Paste ${p.name} API key…`}
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1.5 font-mono text-xs text-white placeholder-zinc-500 pr-8 focus:border-amber-500/80 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowKey((s) => ({ ...s, [p.id]: !s[p.id] }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                              >
                                {isShown ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handlePasteKey(p.id)}
                              className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white"
                            >
                              Paste
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Demo Mode Button */}
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs">
                    <span className="text-[11px] text-zinc-400">Want to test without keys first?</span>
                    <button
                      type="button"
                      onClick={() => handleCompleteSetup(true)}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 hover:bg-amber-500/20"
                    >
                      Start in Demo Mode
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      Back
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCompleteSetup(true)}
                        className="rounded-xl border border-zinc-700 bg-zinc-800/90 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
                      >
                        Skip (Demo Mode)
                      </button>

                      <button
                        type="button"
                        disabled={completing}
                        onClick={() => handleCompleteSetup(false)}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {completing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Launching…</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Save & Launch 🚀</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Security Assurance */}
          <p className="mt-3 text-center text-[10px] text-zinc-500">
            Nexus AI is on-device first. All code, prompts, and API keys remain safely in your browser's IndexedDB.
          </p>
        </div>
      </div>

      {/* Interactive Step-by-Step Help Modal */}
      <ApiKeyHelpModal providerId={helpProviderId} onClose={() => setHelpProviderId(null)} />
    </div>
  );
}
