"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Link2,
  Loader2,
  Monitor,
  Moon,
  Plug2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sun,
  Trash2,
  User,
  XCircle,
  Zap,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { PROVIDERS, ProviderId } from "@/lib/types";
import { PROVIDER_GUIDES } from "@/lib/provider-guides";
import { ApiKeyHelpModal } from "@/components/api-key-help-modal";
import {
  CONNECTORS,
  CONNECTOR_CATEGORIES,
  verifyConnector,
  type ConnectorCategory,
} from "@/lib/connectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { OAuthConnectModal } from "@/components/oauth-connect-modal";

type Tab = "profile" | "theme" | "keys" | "connectors" | "prefs";

export default function SettingsPage() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const userProfile = useStore((s) => s.userProfile);
  const setUserProfile = useStore((s) => s.setUserProfile);
  const keys = useStore((s) => s.keys);
  const setKey = useStore((s) => s.setKey);
  const connections = useStore((s) => s.connections ?? {});
  const setConnection = useStore((s) => s.setConnection);
  const connectedAccounts = useStore((s) => s.connectedAccounts ?? {});
  const disconnectAccount = useStore((s) => s.disconnectAccount);
  const leftWidth = useStore((s) => s.leftWidth);
  const rightWidth = useStore((s) => s.rightWidth);
  const setLeftWidth = useStore((s) => s.setLeftWidth);
  const setRightWidth = useStore((s) => s.setRightWidth);
  const publishSecret = useStore((s) => s.publishSecret);
  const setPublishSecret = useStore((s) => s.setPublishSecret);

  const [tab, setTab] = useState<Tab>("connectors");
  const isHydrated = useStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && !userProfile?.onboarded) {
      window.location.href = "/login";
    }
  }, [isHydrated, userProfile?.onboarded]);

  const [name, setName] = useState(userProfile?.name || "Aarush");
  const [email, setEmail] = useState(userProfile?.email || "aarush@nexus.ai");
  const [profession, setProfession] = useState(userProfile?.profession || "Software Engineer");
  const [workspaceType, setWorkspaceType] = useState<"solo" | "company">(userProfile?.workspaceType || "solo");
  const [companyName, setCompanyName] = useState(userProfile?.companyName || "");
  const [saved, setSaved] = useState(false);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [helpProviderId, setHelpProviderId] = useState<string | null>(null);

  // Connectors filter state
  const [connCategory, setConnCategory] = useState<string>("All");
  const [connSearch, setConnSearch] = useState<string>("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [oauthModalConnector, setOauthModalConnector] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Record<string, { ok: boolean; message: string; details?: string }>
  >({});

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "connectors", label: "Connectors", icon: Plug2 },
    { id: "keys", label: "API Keys", icon: KeyRound },
    { id: "profile", label: "Profile", icon: User },
    { id: "theme", label: "Theme", icon: Sun },
    { id: "prefs", label: "Preferences", icon: Monitor },
  ];

  const handleTestConnection = async (connectorId: string) => {
    setTestingId(connectorId);
    try {
      const res = await verifyConnector(connectorId, connections, connectedAccounts[connectorId]);
      setTestResults((prev) => ({ ...prev, [connectorId]: res }));
      if (res.ok) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Verification error");
    } finally {
      setTestingId(null);
    }
  };

  const handleClearConnector = (connectorId: string, fieldKeys: string[]) => {
    disconnectAccount(connectorId);
    fieldKeys.forEach((k) => setConnection(k, ""));
    setTestResults((prev) => {
      const next = { ...prev };
      delete next[connectorId];
      return next;
    });
    toast.info("Connection cleared");
  };

  const filteredConnectors = CONNECTORS.filter((c) => {
    const matchesCategory = connCategory === "All" || c.category === connCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(connSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(connSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(connSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLogout = () => {
    if (typeof document !== "undefined") {
      document.cookie = "nexus_auth=; path=/; max-age=0; SameSite=Lax";
    }
    setUserProfile({ onboarded: false });
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.href = "/login";
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <img src="/nexus-logo.png" alt="Nexus AI" className="h-6 w-6 rounded-lg object-contain" />
            <h1 className="text-lg font-bold">Settings</h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-6 py-8 md:grid-cols-[210px_1fr]">
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  tab === t.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </nav>

        <div className="rounded-3xl border border-border bg-card p-6">
          {/* Connectors Tab */}
          {tab === "connectors" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Plug2 className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-semibold">Integrations & Connectors</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect GitHub, Vercel, Netlify, Supabase, Cloudflare, and your favorite cloud services. Credentials stay encrypted locally in your browser.
                </p>
              </div>

              {/* Search & Category Pills */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search connectors (e.g. GitHub, Vercel, Supabase)..."
                    value={connSearch}
                    onChange={(e) => setConnSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {["All", ...CONNECTOR_CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setConnCategory(cat)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        connCategory === cat
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Connectors List */}
              <div className="space-y-4">
                {filteredConnectors.map((c) => {
                  const account = connectedAccounts[c.id];
                  const hasManualToken = c.fields.some((f) => Boolean(connections[f.key]?.trim()));
                  const isConnected = Boolean(account || hasManualToken);
                  const testRes = testResults[c.id];
                  const isTesting = testingId === c.id;

                  return (
                    <div
                      key={c.id}
                      className={cn(
                        "rounded-2xl border p-5 transition-all",
                        isConnected
                          ? "border-emerald-500/40 bg-card shadow-sm shadow-emerald-500/5"
                          : "border-border bg-card/60 hover:border-border/80",
                      )}
                    >
                      {/* Connector Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-sm"
                            style={{ backgroundColor: c.badgeColor }}
                          >
                            {c.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm">{c.name}</span>
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {c.category}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">{c.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                              isConnected
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-secondary text-muted-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                isConnected ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40",
                              )}
                            />
                            {isConnected ? "Connected" : "Not connected"}
                          </span>

                          <a
                            href={c.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            title="Documentation"
                          >
                            <span>Docs</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      {/* Main Connection Area */}
                      {isConnected ? (
                        /* Connected Account View */
                        <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  account?.avatarUrl ||
                                  `https://api.dicebear.com/7.x/identicon/svg?seed=${account?.username || connections[`${c.id}_owner`] || "aarush-coder"}`
                                }
                                alt="avatar"
                                className="h-9 w-9 rounded-full bg-secondary border border-border/60 object-cover"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-foreground">
                                    @{account?.username || connections[`${c.id}_owner`] || "aarush-coder"}
                                  </span>
                                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                    ✓ Active
                                  </span>
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                  {account?.team ? `Team: ${account.team} · ` : ""}Full read/write & deployment permissions
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isTesting}
                                onClick={() => handleTestConnection(c.id)}
                                className="h-8 text-xs gap-1"
                              >
                                {isTesting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3.5 w-3.5" />
                                )}
                                <span>Verify</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleClearConnector(c.id, c.fields.map((f) => f.key))}
                                className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Disconnect</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Not Connected: Big 1-Click Button */
                        <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                          <Button
                            onClick={() => setOauthModalConnector(c.id)}
                            className="w-full h-11 rounded-2xl gap-2 font-semibold text-xs shadow-md transition-all hover:opacity-95"
                            style={{
                              backgroundColor: c.accentColor,
                              color: c.id === "render" ? "#000000" : "#ffffff",
                            }}
                          >
                            <Zap className="h-4 w-4" />
                            <span>Connect with {c.name} in 1 Click</span>
                          </Button>
                        </div>
                      )}

                      {/* Feature tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.features.map((feat) => (
                          <span
                            key={feat}
                            className="rounded-md bg-secondary/70 px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>

                      {/* Test feedback */}
                      {testRes && (
                        <div
                          className={cn(
                            "mt-3 flex items-start gap-2 rounded-xl p-2.5 text-xs",
                            testRes.ok
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-destructive/10 text-destructive",
                          )}
                        >
                          {testRes.ok ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          ) : (
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold">{testRes.message}</div>
                            {testRes.details && (
                              <div className="mt-0.5 text-[11px] opacity-90">{testRes.details}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Optional Collapsed Manual Tokens Accordion */}
                      <details className="mt-3 pt-2 border-t border-border/40 text-xs group">
                        <summary className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground font-mono select-none flex items-center gap-1">
                          <KeyRound className="h-3 w-3" />
                          <span>Advanced: Use custom manual token instead</span>
                        </summary>
                        <div className="mt-3 space-y-3 pl-1">
                          {c.fields.map((f) => {
                            const val = connections[f.key] ?? "";
                            const isPw = f.type === "password";
                            const isVisible = Boolean(shown[f.key]);

                            return (
                              <div key={f.key} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <label className="font-medium text-foreground">
                                    {f.label} {f.required && <span className="text-primary">*</span>}
                                  </label>
                                  {f.helpText && (
                                    <span className="text-[11px] text-muted-foreground">{f.helpText}</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Input
                                    type={isPw ? (isVisible ? "text" : "password") : f.type}
                                    value={val}
                                    onChange={(e) => setConnection(f.key, e.target.value)}
                                    placeholder={f.placeholder}
                                    className="font-mono text-xs"
                                  />
                                  {isPw && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      type="button"
                                      onClick={() => setShown((s) => ({ ...s, [f.key]: !s[f.key] }))}
                                    >
                                      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {tab === "profile" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Profile & Workspace</h2>
                <p className="text-sm text-muted-foreground">Manage your identity, role, and personal preferences.</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#F97316] text-xl font-black text-black shadow-md">
                  {(name || "Aarush").slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <div className="text-sm font-semibold">{name || "Aarush"}</div>
                  <div className="text-xs text-muted-foreground">{profession || "Software Engineer"}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">Profession / Role</label>
                  <Input value={profession} onChange={(e) => setProfession(e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">Working Style</label>
                  <select
                    value={workspaceType}
                    onChange={(e) => setWorkspaceType(e.target.value as "solo" | "company")}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground [&>option]:bg-zinc-900 [&>option]:text-zinc-100"
                  >
                    <option value="solo" className="bg-zinc-900 text-zinc-100">Solo (Personal / Freelance)</option>
                    <option value="company" className="bg-zinc-900 text-zinc-100">Company / Team</option>
                  </select>
                </div>
              </div>

              {workspaceType === "company" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">Company / Team Name</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Studio"
                    className="rounded-xl"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  onClick={() => {
                    setUserProfile({
                      name: name.trim() || "Aarush",
                      email: email.trim() || "aarush@nexus.ai",
                      profession: profession.trim() || "Software Engineer",
                      workspaceType,
                      companyName: workspaceType === "company" ? companyName.trim() : "",
                    });
                    setSaved(true);
                    toast.success("Profile saved successfully!");
                    setTimeout(() => setSaved(false), 2000);
                  }}
                  className="rounded-xl"
                >
                  {saved ? "Saved ✓" : "Save changes"}
                </Button>
              </div>

              {/* Danger / Session Management */}
              <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-red-400">Account Session</h3>
                    <p className="text-xs text-muted-foreground">Sign out of your active session on this device.</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25 hover:text-red-300 transition-all shadow-sm"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {tab === "theme" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Appearance</h2>
                <p className="text-sm text-muted-foreground">Pick a look for the workspace.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {([
                  { id: "dark", label: "Dark", icon: Moon, desc: "Pure black — midnight workspace" },
                  { id: "light", label: "Light", icon: Sun, desc: "Pure white — clean & bright" },
                ] as const).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setTheme(o.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors",
                      theme === o.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        theme === o.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      <o.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-sm font-medium">{o.label}</div>
                      <div className="text-xs text-muted-foreground">{o.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {tab === "keys" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">API Keys</h2>
                <p className="max-w-md text-sm text-muted-foreground">
                  Bring your own keys — stored only in your browser and sent directly to each provider over HTTPS. Never exposed in the bundle.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-600">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Keys never leave your device except to reach the provider you chose.
              </div>
              {PROVIDERS.filter((p) => p.id !== "demo").map((p) => {
                const guide = PROVIDER_GUIDES[p.id];
                return (
                  <div key={p.id} className="rounded-2xl border border-border p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold"
                          style={{ background: `${p.color}1f`, color: p.color }}
                        >
                          {p.name[0]}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{p.name}</span>
                            {guide?.badge && (
                              <span className={cn("rounded-full border px-2 py-0.2 text-[10px] font-semibold", guide.badgeColor)}>
                                {guide.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{p.model}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                            keys[p.id] ? "bg-emerald-500/10 text-emerald-600" : "bg-secondary text-muted-foreground",
                          )}
                        >
                          {keys[p.id] ? "Configured" : "Not set"}
                        </span>

                        {guide && (
                          <>
                            <a
                              href={guide.getKeyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-secondary hover:text-primary"
                            >
                              <span>Get Key</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>

                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => setHelpProviderId(p.id)}
                              className="h-7 gap-1 rounded-xl px-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <HelpCircle className="h-3.5 w-3.5 text-primary" />
                              <span>Help</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        type={shown[p.id] ? "text" : "password"}
                        value={keys[p.id] ?? ""}
                        onChange={(e) => setKey(p.id, e.target.value)}
                        placeholder={guide?.placeholder || `Paste ${p.name} API key…`}
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={async () => {
                          try {
                            const clip = await navigator.clipboard.readText();
                            if (clip) {
                              setKey(p.id, clip.trim());
                              toast.success(`Pasted key for ${p.name}`);
                            }
                          } catch {
                            toast.error("Could not read clipboard.");
                          }
                        }}
                        className="rounded-xl text-xs"
                      >
                        Paste
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setShown((s) => ({ ...s, [p.id]: !s[p.id] }))}>
                        {shown[p.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Link2 className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Publish secret</div>
                    <div className="text-xs text-muted-foreground">
                      Gives generated projects a shareable URL (<code>…/p/{"{slug}"}</code>). Set the same value
                      server-side as <code>NEXUS_PUBLISH_SECRET</code> — leave blank to keep publishing disabled.
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Input
                    type={shown["publish"] ? "text" : "password"}
                    value={publishSecret}
                    onChange={(e) => setPublishSecret(e.target.value)}
                    placeholder="Leave blank to disable publishing"
                    className="font-mono text-xs"
                  />
                  <Button variant="outline" size="icon" onClick={() => setShown((s) => ({ ...s, publish: !s.publish }))}>
                    {shown["publish"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {tab === "prefs" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Workspace preferences</h2>
                <p className="text-sm text-muted-foreground">Panel sizing persists locally.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Left panel width ({leftWidth}px)
                  </label>
                  <Input
                    type="range"
                    min={220}
                    max={440}
                    value={leftWidth}
                    onChange={(e) => setLeftWidth(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Right panel width ({rightWidth}px)
                  </label>
                  <Input
                    type="range"
                    min={320}
                    max={640}
                    value={rightWidth}
                    onChange={(e) => setRightWidth(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
                All workspace preferences and panel sizes are saved and persist across sessions.
              </div>
            </div>
          )}
        </div>
      </div>

      <OAuthConnectModal
        open={Boolean(oauthModalConnector)}
        connectorId={oauthModalConnector}
        onClose={() => setOauthModalConnector(null)}
      />

      <ApiKeyHelpModal
        providerId={helpProviderId}
        onClose={() => setHelpProviderId(null)}
      />
    </div>
  );
}
