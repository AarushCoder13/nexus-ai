"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Crosshair,
  ExternalLink,
  Gauge,
  Loader2,
  Monitor,
  MousePointerClick,
  Palette,
  QrCode,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  Wand2,
  Wifi,
  X,
  XCircle,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Doc = { label: string; html: string };

type SelectedElement = {
  tag: string;
  selector: string;
  text: string;
  outerHTML: string;
};

type AuditItem = {
  id: string;
  category: "SEO" | "Accessibility" | "Performance" | "Best Practices";
  passed: boolean;
  title: string;
  recommendation: string;
};

export function PreviewPanel() {
  const generated = useStore((s) => s.generated);
  const previewMode = useStore((s) => s.previewMode);
  const setPreviewMode = useStore((s) => s.setPreviewMode);
  const sendMessage = useStore((s) => s.sendMessage);
  const running = useStore((s) => s.running);

  const [stack, setStack] = useState<Doc[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [frameKey, setFrameKey] = useState(0);

  // Feature 1: Visual Click-to-Edit Inspector
  const [inspectMode, setInspectMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [inspectPrompt, setInspectPrompt] = useState("");
  const [applyingEdit, setApplyingEdit] = useState(false);

  // Feature 5: Lighthouse & SEO Audit
  const [auditOpen, setAuditOpen] = useState(false);
  const [autoFixing, setAutoFixing] = useState(false);

  // Feature 4: Instant Mobile QR Code Tester
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [phoneUrl, setPhoneUrl] = useState<string>("");

  const handleOpenQrModal = async () => {
    let target = phoneUrl;
    if (!target) {
      if (typeof window !== "undefined") {
        target = window.location.origin.replace("localhost", "192.168.29.78");
      } else {
        target = "http://192.168.29.78:3000";
      }
      setPhoneUrl(target);
    }
    try {
      const url = await QRCode.toDataURL(target, {
        width: 260,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQrDataUrl(url);
      setQrModalOpen(true);
    } catch {
      toast.error("Failed to generate QR code");
    }
  };

  const regenerateQr = async (newUrl: string) => {
    setPhoneUrl(newUrl);
    if (!newUrl.trim()) return;
    try {
      const url = await QRCode.toDataURL(newUrl.trim(), {
        width: 260,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQrDataUrl(url);
    } catch {}
  };

  useEffect(() => {
    if (generated?.files) {
      const entry = generated.files.find((f) => f.path === generated.entry) ?? generated.files[0];
      const doc = { label: generated.entry, html: entry?.content ?? "" };
      setStack([doc]);
      setCursor(0);
    }
  }, [generated]);

  // Handle messages from the inspector inside iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "NEXUS_INSPECT_SELECT") {
        setSelectedElement({
          tag: e.data.tag,
          selector: e.data.selector,
          text: e.data.text,
          outerHTML: e.data.outerHTML,
        });
        toast.info(`Selected <${e.data.tag}> element. Describe your changes below.`);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const current = stack[cursor];
  const canBack = cursor > 0;
  const canForward = cursor < stack.length - 1;

  const refresh = () => {
    setLoading(true);
    setFrameKey((k) => k + 1);
    setTimeout(() => setLoading(false), 500);
  };

  const back = () => canBack && setCursor((c) => c - 1);
  const forward = () => canForward && setCursor((c) => c + 1);

  const openNewTab = () => {
    if (!current) return;
    const blob = new Blob([current.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // Inject inspector helper when inspectMode is enabled
  const processedHtml = useMemo(() => {
    if (!current?.html) return "";
    if (!inspectMode) return current.html;

    const inspectorScript = `
      <style id="nexus-inspector-style">
        .nexus-inspect-hover {
          outline: 2px dashed #06b6d4 !important;
          outline-offset: 2px !important;
          cursor: crosshair !important;
        }
        .nexus-inspect-selected {
          outline: 2px solid #8b5cf6 !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 16px rgba(139, 92, 246, 0.45) !important;
        }
      </style>
      <script>
        (function() {
          let hovered = null;
          let selected = null;
          document.addEventListener('mouseover', function(e) {
            if (hovered && hovered !== selected) hovered.classList.remove('nexus-inspect-hover');
            hovered = e.target;
            if (hovered !== selected && hovered !== document.body && hovered !== document.documentElement) {
              hovered.classList.add('nexus-inspect-hover');
            }
          }, true);
          document.addEventListener('mouseout', function(e) {
            if (hovered && hovered !== selected) hovered.classList.remove('nexus-inspect-hover');
            hovered = null;
          }, true);
          document.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (selected) selected.classList.remove('nexus-inspect-selected');
            selected = e.target;
            selected.classList.add('nexus-inspect-selected');
            const tag = selected.tagName.toLowerCase();
            const text = (selected.innerText || selected.textContent || '').trim().slice(0, 120);
            const id = selected.id ? '#' + selected.id : '';
            const cls = selected.className && typeof selected.className === 'string'
              ? '.' + selected.className.replace(/nexus-inspect-hover|nexus-inspect-selected/g, '').trim().split(/\\s+/).slice(0, 2).join('.')
              : '';
            window.parent.postMessage({
              type: 'NEXUS_INSPECT_SELECT',
              tag: tag,
              selector: tag + id + cls,
              text: text,
              outerHTML: selected.outerHTML.slice(0, 250)
            }, '*');
          }, true);
        })();
      </script>
    `;

    if (current.html.includes("</body>")) {
      return current.html.replace("</body>", `${inspectorScript}</body>`);
    }
    return `${current.html}${inspectorScript}`;
  }, [current?.html, inspectMode]);

  // Apply visual edit prompt to agent
  const handleApplyInspectorEdit = async (customText?: string) => {
    if (!selectedElement) return;
    const instruction = customText || inspectPrompt;
    if (!instruction.trim()) return;

    setApplyingEdit(true);
    const fullPrompt = `In the preview layout, target the <${selectedElement.tag}> element "${selectedElement.selector}" containing text "${selectedElement.text || ""}". Make this modification: ${instruction.trim()}`;

    try {
      setInspectPrompt("");
      setSelectedElement(null);
      setInspectMode(false);
      await sendMessage(fullPrompt);
      toast.success("Agent team is modifying the selected element!");
    } finally {
      setApplyingEdit(false);
    }
  };

  // Lighthouse Audit calculations
  const auditResults = useMemo(() => {
    const html = current?.html || "";
    const items: AuditItem[] = [];

    // SEO checks
    const hasTitle = /<title>[^<]+<\/title>/i.test(html);
    items.push({
      id: "seo-title",
      category: "SEO",
      passed: hasTitle,
      title: "Page Title Tag",
      recommendation: hasTitle ? "Page has a descriptive <title> tag." : "Add a descriptive <title> tag in <head>.",
    });

    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
    items.push({
      id: "seo-viewport",
      category: "SEO",
      passed: hasViewport,
      title: "Mobile Viewport Meta",
      recommendation: hasViewport ? "Mobile viewport is configured correctly." : "Add <meta name='viewport' content='width=device-width, initial-scale=1.0'>.",
    });

    const hasDescription = /<meta[^>]+name=["']description["']/i.test(html);
    items.push({
      id: "seo-desc",
      category: "SEO",
      passed: hasDescription,
      title: "Meta Description",
      recommendation: hasDescription ? "Meta description is present for search engines." : "Add a <meta name='description'> summary for SEO.",
    });

    const hasH1 = /<h1[^>]*>/i.test(html);
    items.push({
      id: "seo-h1",
      category: "SEO",
      passed: hasH1,
      title: "Primary H1 Heading",
      recommendation: hasH1 ? "Single clear primary <h1> is present." : "Add an <h1> heading for main content hierarchy.",
    });

    // Accessibility checks
    const images = (html.match(/<img[^>]*>/gi) || []);
    const imagesWithAlt = images.filter((img) => /alt=["'][^"']*["']/i.test(img));
    const allImagesHaveAlt = images.length === 0 || imagesWithAlt.length === images.length;
    items.push({
      id: "a11y-alt",
      category: "Accessibility",
      passed: allImagesHaveAlt,
      title: "Image Alt Text",
      recommendation: allImagesHaveAlt ? "All images include alt attributes." : "Add descriptive alt='...' text to all <img> tags.",
    });

    const hasSemanticLandmarks = /<(header|nav|main|footer|section)[^>]*>/i.test(html);
    items.push({
      id: "a11y-landmarks",
      category: "Accessibility",
      passed: hasSemanticLandmarks,
      title: "Semantic HTML5 Landmarks",
      recommendation: hasSemanticLandmarks ? "Layout uses modern semantic landmark elements." : "Use <header>, <main>, and <footer> tags.",
    });

    // Performance checks
    const isCleanSize = html.length < 150000;
    items.push({
      id: "perf-size",
      category: "Performance",
      passed: isCleanSize,
      title: "HTML Document Size",
      recommendation: isCleanSize ? `Compact payload (${Math.round(html.length / 1024)} KB).` : "Reduce inline assets.",
    });

    const hasModernCss = /display:\s*(flex|grid)|class=["'][^"']*(flex|grid)/i.test(html);
    items.push({
      id: "perf-css",
      category: "Performance",
      passed: hasModernCss,
      title: "Modern Layout Engine",
      recommendation: hasModernCss ? "Uses modern CSS Flexbox and Grid layouts." : "Upgrade styling to CSS Grid and Flexbox.",
    });

    // Best Practices
    const hasDoctype = /<!doctype\s+html>/i.test(html);
    items.push({
      id: "bp-doctype",
      category: "Best Practices",
      passed: hasDoctype,
      title: "HTML5 Doctype",
      recommendation: hasDoctype ? "Standard <!DOCTYPE html> declared." : "Declare <!DOCTYPE html> at the start.",
    });

    const hasCharset = /<meta[^>]+charset=["']?utf-8/i.test(html);
    items.push({
      id: "bp-charset",
      category: "Best Practices",
      passed: hasCharset,
      title: "UTF-8 Character Encoding",
      recommendation: hasCharset ? "Character encoding set to UTF-8." : "Include <meta charset='UTF-8'> in <head>.",
    });

    // Score calculations
    const categories: ("SEO" | "Accessibility" | "Performance" | "Best Practices")[] = [
      "SEO",
      "Accessibility",
      "Performance",
      "Best Practices",
    ];

    const scores = categories.reduce((acc, cat) => {
      const catItems = items.filter((i) => i.category === cat);
      const passedCount = catItems.filter((i) => i.passed).length;
      acc[cat] = Math.round((passedCount / catItems.length) * 100);
      return acc;
    }, {} as Record<string, number>);

    const overallScore = Math.round(
      Object.values(scores).reduce((a, b) => a + b, 0) / categories.length,
    );

    return { items, scores, overallScore };
  }, [current?.html]);

  const handleAutoFixAudit = async () => {
    const failing = auditResults.items.filter((i) => !i.passed);
    if (!failing.length) {
      toast.success("All audits are already 100% passed!");
      return;
    }

    setAutoFixing(true);
    const fixesList = failing.map((f) => `- ${f.title}: ${f.recommendation}`).join("\n");
    const prompt = `Please optimize the project code to fix these Lighthouse & SEO audit recommendations:\n${fixesList}\nEnsure 100% compliance with SEO, semantic tags, and best practices.`;

    try {
      setAuditOpen(false);
      await sendMessage(prompt);
      toast.success("Agent team is optimizing SEO & accessibility!");
    } finally {
      setAutoFixing(false);
    }
  };

  if (!generated || !current) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <Monitor className="h-7 w-7" />
        </div>
        <p className="text-sm font-medium">Ready to preview</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">Send a prompt and your generated app will render live here.</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col bg-background">
      {/* Browser Chrome Toolbar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-card px-2.5 gap-1.5 overflow-hidden">
        {/* Navigation buttons */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            onClick={back}
            disabled={!canBack}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 transition-colors"
            title="Back"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={forward}
            disabled={!canForward}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 transition-colors"
            title="Forward"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={refresh}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Refresh preview"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Address pill - flex-1 with min-w-0 and max-w so it yields space gracefully */}
        <div className="flex flex-1 min-w-[60px] max-w-[170px] items-center gap-1.5 rounded-full border border-border/70 bg-secondary/80 px-2.5 py-1 text-xs text-foreground shadow-inner">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="truncate font-mono text-[11px] text-muted-foreground select-none">
            preview://{current.label}
          </span>
        </div>

        {/* Tool actions on right - grouped with shrink-0 so they never clip or wrap */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Click-to-Edit Inspector Toggle */}
          <button
            onClick={() => {
              setInspectMode(!inspectMode);
              if (inspectMode) setSelectedElement(null);
              else toast.info("Inspect mode ON: Click any element in preview to edit it!");
            }}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all",
              inspectMode
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            title="Visual Inspector (Click any element to edit)"
          >
            <MousePointerClick className="h-3.5 w-3.5" />
            <span className="hidden xl:inline text-[11px]">Inspect</span>
          </button>

          {/* Lighthouse Audit Button */}
          <button
            onClick={() => setAuditOpen(true)}
            className="flex items-center gap-1 rounded-lg bg-secondary/60 hover:bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/40"
            title="Lighthouse SEO & Performance Audit"
          >
            <Gauge className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="font-mono text-[11px] text-emerald-500 font-bold">{auditResults.overallScore}%</span>
          </button>

          {/* Test on Phone (QR Code) */}
          <button
            onClick={handleOpenQrModal}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Scan QR to test live on mobile phone"
          >
            <QrCode className="h-3.5 w-3.5 text-primary" />
          </button>

          {/* Desktop / Mobile Switcher */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-secondary/80 p-0.5">
            <button
              onClick={() => setPreviewMode("desktop")}
              title="Desktop view"
              className={cn("rounded-md p-1 transition-colors", previewMode === "desktop" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              title="Mobile view"
              className={cn("rounded-md p-1 transition-colors", previewMode === "mobile" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Open in new tab */}
          <button
            onClick={openNewTab}
            title="Open preview in new tab"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="relative flex flex-1 items-start justify-center overflow-auto bg-background p-3">
        <div
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-white shadow-2xl transition-all duration-300",
            previewMode === "mobile" ? "h-[700px] w-full max-w-[390px]" : "h-full w-full",
          )}
        >
          <iframe
            key={`${frameKey}-${inspectMode ? "inspect" : "normal"}`}
            title="preview"
            srcDoc={processedHtml}
            className="h-full w-full bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>

        {/* Selected Element Floating Inspector Card */}
        {selectedElement && (
          <div className="absolute bottom-6 left-6 right-6 z-30 mx-auto max-w-xl rounded-2xl border border-primary/40 bg-card/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary/20 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                  &lt;{selectedElement.tag}&gt;
                </span>
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {selectedElement.selector}
                </span>
              </div>
              <button
                onClick={() => setSelectedElement(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {selectedElement.text && (
              <p className="mt-2 line-clamp-1 font-mono text-xs text-foreground bg-secondary/50 px-2 py-1 rounded">
                "{selectedElement.text}"
              </p>
            )}

            {/* Quick Action Chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "Change to modern gradient",
                "Make text larger and bold",
                "Add subtle hover lift",
                "Make this responsive",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleApplyInspectorEdit(chip)}
                  disabled={applyingEdit || running}
                  className="rounded-full border border-border bg-secondary/70 px-2.5 py-0.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Prompt input */}
            <div className="mt-3 flex items-center gap-2">
              <Input
                placeholder={`Describe changes for this <${selectedElement.tag}>...`}
                value={inspectPrompt}
                onChange={(e) => setInspectPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyInspectorEdit();
                  }
                }}
                className="text-xs"
              />
              <Button
                size="sm"
                disabled={!inspectPrompt.trim() || applyingEdit || running}
                onClick={() => handleApplyInspectorEdit()}
                className="gap-1.5 text-xs h-9"
              >
                {applyingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lighthouse Audit Modal */}
      {auditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Gauge className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground text-base">Lighthouse & SEO Audit Scorecard</h3>
                  <p className="text-xs text-muted-foreground">Real-time accessibility, SEO, performance, and best practices analysis</p>
                </div>
              </div>
              <button onClick={() => setAuditOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scorecard 4-cards grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(auditResults.scores).map(([name, score]) => {
                const isGood = score >= 90;
                const isFair = score >= 70 && score < 90;

                return (
                  <div key={name} className="flex flex-col items-center rounded-2xl border border-border bg-secondary/30 p-3 text-center">
                    <span className="text-xs font-medium text-muted-foreground">{name}</span>
                    <span
                      className={cn(
                        "mt-1 text-2xl font-black font-mono",
                        isGood ? "text-emerald-500" : isFair ? "text-amber-500" : "text-red-500",
                      )}
                    >
                      {score}%
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        isGood ? "bg-emerald-500/10 text-emerald-600" : isFair ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600",
                      )}
                    >
                      {isGood ? "Great" : isFair ? "Needs Work" : "Action Req."}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Detailed audit checks list */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
              {auditResults.items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border p-2.5 text-xs transition-colors",
                    item.passed ? "border-border bg-card/40" : "border-amber-500/30 bg-amber-500/5",
                  )}
                >
                  {item.passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{item.title}</span>
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{item.category}</span>
                    </div>
                    <p className="mt-0.5 text-muted-foreground">{item.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">
                Overall Health: <span className="font-bold text-foreground">{auditResults.overallScore}%</span>
              </span>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setAuditOpen(false)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  disabled={autoFixing || running || auditResults.overallScore === 100}
                  onClick={handleAutoFixAudit}
                  className="gap-1.5"
                >
                  {autoFixing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Auto-Fix with Agent Team
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instant Mobile QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="flex w-full items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <QrCode className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground text-sm">Test on Mobile Phone</h3>
                  <p className="text-[11px] text-muted-foreground">Scan with iOS or Android camera</p>
                </div>
              </div>
              <button
                onClick={() => setQrModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* QR Code Graphic Frame */}
            <div className="my-5 flex flex-col items-center">
              <div className="rounded-2xl border-4 border-white bg-white p-2 shadow-xl">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Mobile Preview QR Code"
                    className="h-56 w-56 rounded-xl object-contain"
                  />
                ) : (
                  <div className="flex h-56 w-56 items-center justify-center text-xs text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* URL Row */}
            <div className="w-full space-y-2">
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/50 p-1 pl-2.5">
                <input
                  type="text"
                  value={phoneUrl}
                  onChange={(e) => regenerateQr(e.target.value)}
                  className="flex-1 bg-transparent font-mono text-xs text-foreground outline-none"
                  placeholder="http://192.168.x.x:3000"
                />
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(phoneUrl).catch(() => {});
                    toast.success("Link copied to clipboard!");
                  }}
                  className="rounded-lg bg-card p-1.5 text-muted-foreground hover:text-foreground shadow-sm"
                  title="Copy link"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => window.open(phoneUrl, "_blank")}
                  className="rounded-lg bg-card p-1.5 text-muted-foreground hover:text-foreground shadow-sm"
                  title="Open URL"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Wi-Fi note */}
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-left text-[11px] text-emerald-600 dark:text-emerald-400">
                <Wifi className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  Make sure your phone is connected to the same Wi-Fi network as this computer to open the preview directly.
                </span>
              </div>
            </div>

            {/* Close Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQrModalOpen(false)}
              className="mt-4 w-full"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
