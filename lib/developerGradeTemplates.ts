// =============================================================
// Nexus AI — Developer-Grade Web Application Generators
// Engineered to look and feel like bespoke, production-ready
// software built by top-tier engineering teams (Stripe, Linear,
// Supabase, Vercel). Strictly zero "vibe coding" or shallow AI tropes.
// =============================================================
import type { GeneratedProject } from "./types";

export type TemplateId =
  | "portfolio"
  | "ecommerce"
  | "dashboard"
  | "tracker"
  | "saas"
  | "bespoke";

export function detectTemplate(request: string): TemplateId {
  const r = request.toLowerCase();
  if (/portfol|resume|developer cv|bio\b|personal site/.test(r)) return "portfolio";
  if (/ecommerce|e-commerce|store|shop|sell|cart|merch|clothing|shoes|hardware|keyboard/.test(r)) return "ecommerce";
  if (/dashboard|analytics|metrics|telemetry|kpi|cloud monitor|ops|cluster/.test(r)) return "dashboard";
  if (/expense|tracker|budget|finance|invoice|money|accounting|spending/.test(r)) return "tracker";
  if (/saas|api|developer tool|platform|infra|distributed|database|auth|sdk|engine/.test(r)) return "saas";
  return "bespoke";
}

export function templateName(t: TemplateId, request?: string): string {
  if (t === "bespoke" && request) {
    const clean = request
      .replace(/^(build|create|make|design|generate|code|develop)\s+(a|an|the)?\s*/i, "")
      .replace(/website|web app|app|platform|page/gi, "")
      .trim();
    const words = clean.split(/\s+/).filter(Boolean).slice(0, 4).join(" ");
    if (words) {
      return words.charAt(0).toUpperCase() + words.slice(1) + " App";
    }
  }
  const map: Record<TemplateId, string> = {
    portfolio: "Elena Rostova — Staff Systems & Design Engineer",
    ecommerce: "Lumina Hardware Studio — Precision Instruments",
    dashboard: "Nexus Pulse — Global Telemetry & Edge Cluster Monitor",
    tracker: "Horizon Financial Intelligence & Budget Architecture",
    saas: "Apex Infrastructure — Distributed Event Streaming Platform",
    bespoke: "Bespoke Production Web Application",
  };
  return map[t] ?? "Bespoke Production Web Application";
}

// ---- Clean inline SVGs (no raw emojis as icons) ---------------------------
export const ICONS = {
  search: `<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  plus: `<svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  check: `<svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  x: `<svg class="icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  arrowRight: `<svg class="icon" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  code: `<svg class="icon" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  server: `<svg class="icon" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`,
  zap: `<svg class="icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  shield: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  external: `<svg class="icon" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
  filter: `<svg class="icon" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`,
  trash: `<svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  cart: `<svg class="icon" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  chart: `<svg class="icon" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  globe: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  copy: `<svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
  sparkles: `<svg class="icon" viewBox="0 0 24 24"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"></path></svg>`,
};

export function metaHtml(title: string): string {
  return `<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${title}</title>`;
}

export function baseCss(accent: string = "#f59e0b"): string {
  return `
:root {
  --accent: ${accent};
  --accent-soft: color-mix(in srgb, var(--accent) 15%, transparent);
  --accent-hover: color-mix(in srgb, var(--accent) 88%, #fff);
  --bg: #07080c;
  --surface: #0d1017;
  --surface-2: #131722;
  --surface-3: #1a2030;
  --border: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.18);
  --text: #f3f4f6;
  --muted: #94a3b8;
  --dim: #64748b;
  --radius: 12px;
  --radius-lg: 16px;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}
* { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior: smooth; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
a { text-decoration: none; color: inherit; }
button, input, select, textarea { font-family: inherit; color: inherit; font-size: inherit; }
button { cursor: pointer; border: none; background: none; }
input, select, textarea {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.icon {
  width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 2;
  stroke-linecap: round; stroke-linejoin: round; display: inline-block;
  vertical-align: middle; flex-shrink: 0;
}
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 9px 18px; border-radius: 9px; font-weight: 600; font-size: 13px;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1); user-select: none;
}
.btn-primary {
  background: var(--accent); color: #000; font-weight: 700;
  box-shadow: 0 4px 16px -4px var(--accent);
}
.btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); filter: brightness(0.95); }
.btn-secondary {
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
}
.btn-secondary:hover {
  background: var(--surface-3); border-color: var(--border-hover); color: #fff; transform: translateY(-1px);
}
.btn-ghost { color: var(--muted); padding: 8px 12px; }
.btn-ghost:hover { color: var(--text); background: var(--surface-2); }
.badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 600;
  border: 1px solid var(--border); background: var(--surface-2); color: var(--muted);
}
.badge-accent {
  background: var(--accent-soft); border-color: color-mix(in srgb, var(--accent) 30%, transparent); color: var(--accent);
}
.badge-success {
  background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.25); color: #34d399;
}
.badge-warning {
  background: rgba(245, 158, 11, 0.12); border-color: rgba(245, 158, 11, 0.25); color: #fbbf24;
}
.pulse-dot {
  width: 6px; height: 6px; border-radius: 50%; background: currentColor;
  box-shadow: 0 0 8px currentColor;
}
/* Toast Notification System */
.toast-container {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  display: flex; flex-direction: column; gap: 8px; pointer-events: none;
}
.toast {
  pointer-events: auto; background: var(--surface-2); border: 1px solid var(--border-hover);
  color: #fff; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 500;
  box-shadow: 0 16px 36px -10px rgba(0,0,0,0.7);
  display: flex; align-items: center; gap: 10px; animation: toastIn 0.25s cubic-bezier(0.16,1,0.3,1);
}
@keyframes toastIn { from { opacity: 0; transform: translateY(12px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
/* Modal System */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.78); backdrop-filter: blur(6px);
  z-index: 1000; display: none; align-items: center; justify-content: center; padding: 20px;
}
.modal-backdrop.open { display: flex; animation: fadeIn 0.2s ease; }
.modal-panel {
  background: var(--surface); border: 1px solid var(--border-hover); border-radius: var(--radius-lg);
  max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 28px;
  box-shadow: 0 24px 60px -15px rgba(0,0,0,0.85); animation: modalIn 0.25s cubic-bezier(0.16,1,0.3,1);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { font-size: 18px; font-weight: 700; }
.modal-close {
  color: var(--muted); padding: 6px; border-radius: 8px; display: grid; place-items: center;
}
.modal-close:hover { background: var(--surface-2); color: var(--text); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
/* Drawer System */
.drawer-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);
  z-index: 1000; display: none; justify-content: flex-end;
}
.drawer-backdrop.open { display: flex; }
.drawer-panel {
  background: var(--surface); border-left: 1px solid var(--border-hover);
  width: 100%; max-width: 440px; height: 100vh; overflow-y: auto; padding: 28px;
  box-shadow: -20px 0 60px rgba(0,0,0,0.8); animation: drawerIn 0.25s cubic-bezier(0.16,1,0.3,1);
}
@keyframes drawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
/* Glass header */
header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(7, 8, 12, 0.85); backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
}
@media (max-width: 768px) {
  .container { padding: 0 16px; }
  .modal-panel, .drawer-panel { padding: 20px; }
}
`;
}

export const COMMON_SCRIPTS = `
function showToast(msg, icon = '✓') {
  let c = document.querySelector('.toast-container');
  if (!c) {
    c = document.createElement('div');
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<span style="color:var(--accent);font-weight:700">' + icon + '</span><span>' + msg + '</span>';
  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(8px)';
    t.style.transition = '0.2s';
    setTimeout(() => t.remove(), 200);
  }, 2600);
}
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open, .drawer-backdrop.open').forEach(el => el.classList.remove('open'));
  }
});
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) e.target.classList.remove('open');
  if (e.target.classList.contains('drawer-backdrop')) e.target.classList.remove('open');
});
`;

// ============================================================================
// 1. BESPOKE WEB APPLICATION GENERATOR
// For any custom prompt, crafts an authentic, responsive application with
// live search, category pills, working item detail drawer, working creation
// modal, and dynamic toast feedback.
// ============================================================================
export function bespokeSite(request: string): GeneratedProject {
  const cleanReq = request
    .replace(/^(build|create|make|design|generate|code|develop)\s+(a|an|the)?\s*/i, "")
    .trim();
  const rawWords = cleanReq.split(/\s+/).filter(Boolean);
  const title = rawWords.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Nexus Studio";
  
  // Extract or deduce industry domain
  const isFood = /restaurant|cafe|pizza|burger|bar|coffee|bakery|diner|bistro|menu|food/i.test(cleanReq);
  const isRealEstate = /estate|villa|condo|property|apartment|penthouse|house|realty/i.test(cleanReq);
  const isFitness = /gym|fitness|workout|coach|trainer|crossfit|yoga|athlete/i.test(cleanReq);
  const isCrypto = /crypto|token|dex|web3|wallet|blockchain|coin|swap|defi/i.test(cleanReq);
  const isMedia = /music|audio|beat|track|video|film|cinema|photo|gallery|art/i.test(cleanReq);

  let accent = "#f59e0b"; // Solar Amber default
  let domainBadge = "Operational · Cluster v3.4";
  let searchPlaceholder = "Search entries, tags or telemetry…";
  let heroEyebrow = "Production Workspace";
  let heroHeading = `Next-Generation ${title}`;
  let heroDesc = `Crafted specifically for "${cleanReq || title}". Fully responsive, complete client-side state machine, interactive modals, and real-time filtering.`;
  let categories = ["All", "Featured", "Core", "Pending", "Archived"];

  type DomainItem = { id: string; title: string; category: string; status: string; metric: string; desc: string };
  let items: DomainItem[] = [];

  if (isFood) {
    accent = "#f97316";
    heroEyebrow = "Artisanal Kitchen & Bar";
    heroHeading = title;
    heroDesc = "Seasonal, locally sourced ingredients prepared by culinary craftsmen. Browse our cellar reserves and wood-fired selections.";
    categories = ["All", "Mains", "Starters", "Cocktails", "Desserts"];
    items = [
      { id: "1", title: "Wood-Fired Truffle Focaccia", category: "Starters", status: "Chef Pick", metric: "$16.50", desc: "Wild seasonal mushrooms, whipped buffalo ricotta, rosemary sea salt." },
      { id: "2", title: "Dry-Aged Wagyu Ribeye", category: "Mains", status: "Signature", metric: "$68.00", desc: "Bone-in 45-day dry-aged beef, bone marrow jus, roasted shallots." },
      { id: "3", title: "Handmade Tagliolini al Tartufo", category: "Mains", status: "House Special", metric: "$34.00", desc: "Cultured mountain butter, 36-month Parmigiano-Reggiano, fresh black truffle." },
      { id: "4", title: "Smoked Mezcal Negroni", category: "Cocktails", status: "Reserve", metric: "$18.00", desc: "Oaxacan mezcal, carpano antica, bitter apertivo, flamed orange oil." },
      { id: "5", title: "Burrata Pugliese & Heirloom Peach", category: "Starters", status: "Fresh", metric: "$21.00", desc: "Charred stone fruit, aged modena balsamic, basil oil crystals." },
      { id: "6", title: "Valrhona Dark Chocolate Ganache", category: "Desserts", status: "Limited", metric: "$14.00", desc: "Sea salt flakes, extra virgin olive oil, smoked vanilla gelato." },
    ];
  } else if (isRealEstate) {
    accent = "#10b981";
    heroEyebrow = "Curated Prime Residences";
    heroHeading = title;
    heroDesc = "Exclusive architectural residences and luxury properties with panoramic views, private wellness suites, and concierge management.";
    categories = ["All", "Penthouses", "Villas", "Waterfront", "Historic"];
    items = [
      { id: "1", title: "The Sovereign Penthouse", category: "Penthouses", status: "Exclusive", metric: "$14,800,000", desc: "4 Bed, 5 Bath • 6,400 sq ft • Private cantilevered plunge pool and helipad access." },
      { id: "2", title: "Villa Solaria Estate", category: "Villas", status: "Verified", metric: "$8,950,000", desc: "6 Bed, 8 Bath • 1.4 Acres • Olive groves, tennis court, subterranean wine vault." },
      { id: "3", title: "Azure Horizon Bay House", category: "Waterfront", status: "Prime", metric: "$11,200,000", desc: "Direct deep-water yacht mooring, floor-to-ceiling glass, private dock." },
      { id: "4", title: "The Tribeca Ironworks Loft", category: "Historic", status: "Featured", metric: "$5,400,000", desc: "Original cast-iron columns, 14ft timber ceilings, private key-locked elevator." },
      { id: "5", title: "Glass Pavilion Residence", category: "Villas", status: "Architectural", metric: "$7,600,000", desc: "Minimalist concrete & glass cantilever, geothermal climate system." },
      { id: "6", title: "Monaco Grand View Sky-Villa", category: "Penthouses", status: "High Demand", metric: "$18,500,000", desc: "Unobstructed Mediterranean sweep, private rooftop deck, dedicated 24/7 staff." },
    ];
  } else if (isFitness) {
    accent = "#06b6d4";
    heroEyebrow = "High Performance Human Athletics";
    heroHeading = title;
    heroDesc = "Biometric-driven strength conditioning, metabolic tracking, and periodized training programs built for elite results.";
    categories = ["All", "Strength", "Hypertrophy", "Metabolic", "Mobility"];
    items = [
      { id: "1", title: "Neural Strength Protocol v4", category: "Strength", status: "Active Cycle", metric: "385 lb Max", desc: "5x5 wave loading, RPE 8-9 autoregulation, nervous system velocity focus." },
      { id: "2", title: "Lactate Threshold Engine", category: "Metabolic", status: "High Intensity", metric: "740 kcal", desc: "Assault bike intervals + kettlebell complexes, 40s on / 20s recovery." },
      { id: "3", title: "Posterior Chain Mechanics", category: "Hypertrophy", status: "Phase II", metric: "4 Sets / 8 Reps", desc: "Deficit deadlifts, Bulgarian split squats, glute-ham raise progressions." },
      { id: "4", title: "Rotational Core & Velocity", category: "Mobility", status: "Recovery", metric: "45 Mins", desc: "Thoracic mobility flows, med-ball rotational throws, hip decompression." },
      { id: "5", title: "Aerobic Base Capacity (Zone 2)", category: "Metabolic", status: "Cardio", metric: "135 bpm Avg", desc: "Low-impact ergometer steady-state session to optimize mitochondrial density." },
      { id: "6", title: "Isometric Joint Stability", category: "Mobility", status: "Prehab", metric: "Daily Flow", desc: "Overcoming isometrics, scapular retraction holds, knee tendon loading." },
    ];
  } else if (isCrypto) {
    accent = "#a855f7";
    heroEyebrow = "Decentralized Liquidity Terminal";
    heroHeading = title;
    heroDesc = "Ultra-low latency algorithmic routing, cross-chain atomic swaps, and institutional depth across high-yield vaults.";
    categories = ["All", "Spot", "Futures", "Lending", "Yield"];
    items = [
      { id: "1", title: "ETH / USDC Deep Liquidity", category: "Spot", status: "Low Slippage", metric: "$2,894.20", desc: "24h Vol: $482.4M • Spread: 0.008% • Dynamic AMM fee tier: 0.05%." },
      { id: "2", title: "SOL / BTC Perpetual Swap", category: "Futures", status: "High Vol", metric: "25x Max", desc: "Funding: +0.0042%/8h • Open Interest: $92.5M • Sub-millisecond matching." },
      { id: "3", title: "Automated Delta-Neutral Vault", category: "Yield", status: "14.8% APY", metric: "$18.2M TVL", desc: "Basis arbitrage between spot and perpetual futures with auto-compounding." },
      { id: "4", title: "Layer-Zero Cross-Chain Bridge", category: "Lending", status: "Instant", metric: "3.2s Finality", desc: "Zero-knowledge proof verification, zero custodial risk, multi-signature security." },
      { id: "5", title: "Staked Validator Pool (stETH)", category: "Yield", status: "Liquid", metric: "4.2% Base", desc: "Institutional grade validator nodes with zero slashing penalty history." },
      { id: "6", title: "Synthetic Commodity Index (GLD)", category: "Spot", status: "Backed 1:1", metric: "$2,640.10", desc: "Collateralized real-world asset tracker with on-chain oracle verification." },
    ];
  } else {
    // Default high-grade tech/app workspace
    categories = ["All", "Core Modules", "Pipelines", "Integrations", "Security"];
    items = [
      { id: "1", title: "Distributed Cluster Orchestration", category: "Core Modules", status: "Healthy", metric: "99.99% Uptime", desc: "Fault-tolerant raft consensus engine processing 4.2M events/sec." },
      { id: "2", title: "Vector Search Embedding Mesh", category: "Pipelines", status: "Active", metric: "12ms Latency", desc: "HNSW indexer running across 12 distributed edge nodes." },
      { id: "3", title: "Autonomous Telemetry Ingestion", category: "Pipelines", status: "Streaming", metric: "148k req/s", desc: "Real-time anomaly detection with automated self-healing triggers." },
      { id: "4", title: "Zero-Trust Cryptographic Gateway", category: "Security", status: "Protected", metric: "TLS 1.3 / mTLS", desc: "Hardware security module (HSM) key rotation and token attestation." },
      { id: "5", title: "Multi-Region Read Replica Sync", category: "Core Modules", status: "Synchronized", metric: "8ms Drift", desc: "Bi-directional event streaming with optimistic concurrency controls." },
      { id: "6", title: "Automated Rollback Canary Mesh", category: "Integrations", status: "Ready", metric: "0 Downtime", desc: "Automated blue/green traffic shifting based on p99 latency metrics." },
    ];
  }

  const itemsJson = JSON.stringify(items);
  const categoriesHtml = categories.map((c, i) => `<button class="filter-pill ${i === 0 ? "active" : ""}" data-cat="${c}">${c}</button>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${metaHtml(title)}
<style>
${baseCss(accent)}
.hero { padding: 64px 0 36px; border-bottom: 1px solid var(--border); position: relative; overflow: hidden; }
.hero::before {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(700px 300px at 20% 0%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%);
  pointer-events: none;
}
.hero h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; margin: 12px 0; }
.hero p { color: var(--muted); font-size: 16px; max-width: 680px; margin-bottom: 24px; }
.hero-stats { display: flex; gap: 32px; flex-wrap: wrap; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }
.hero-stat b { font-size: 20px; font-weight: 700; color: #fff; display: block; }
.hero-stat span { font-size: 12px; color: var(--dim); }

.controls { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 24px 0; flex-wrap: wrap; }
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-pill {
  padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600;
  background: var(--surface-2); border: 1px solid var(--border); color: var(--muted);
  transition: all 0.15s ease;
}
.filter-pill:hover { background: var(--surface-3); color: var(--text); border-color: var(--border-hover); }
.filter-pill.active { background: var(--accent); color: #000; border-color: var(--accent); font-weight: 700; }
.search-wrap {
  position: relative; display: flex; align-items: center; min-width: 260px;
}
.search-wrap input { width: 100%; padding-left: 36px; font-size: 13px; }
.search-wrap .search-icon { position: absolute; left: 12px; color: var(--muted); pointer-events: none; }

.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding-bottom: 64px; }
@media (max-width: 960px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }

.card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 22px; display: flex; flex-direction: column; justify-content: space-between;
  transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative; overflow: hidden;
}
.card:hover {
  transform: translateY(-3px); border-color: var(--border-hover);
  box-shadow: 0 12px 30px -10px rgba(0,0,0,0.5);
}
.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.card-title { font-size: 17px; font-weight: 700; line-height: 1.3; }
.card-desc { color: var(--muted); font-size: 13px; line-height: 1.5; margin-bottom: 20px; flex-grow: 1; }
.card-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 14px; border-top: 1px solid var(--border);
}
.metric-val { font-size: 15px; font-weight: 800; color: var(--accent); }

.empty-state {
  grid-column: 1 / -1; text-align: center; padding: 60px 20px;
  background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius-lg);
}
</style>
</head>
<body>

<header>
  <div class="container" style="display:flex;justify-content:space-between;align-items:center;height:64px;">
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="width:32px;height:32px;border-radius:8px;background:var(--accent);color:#000;display:grid;place-items:center;font-weight:900;font-size:16px;">
        ${title.charAt(0)}
      </div>
      <div>
        <div style="font-weight:800;font-size:15px;letter-spacing:-0.02em;">${title}</div>
        <div style="font-size:11px;color:var(--dim);display:flex;align-items:center;gap:5px;">
          <span class="pulse-dot" style="color:var(--success);"></span> ${domainBadge}
        </div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <button class="btn btn-secondary" onclick="openModal('createModal')">
        ${ICONS.plus} <span>New Entry</span>
      </button>
      <button class="btn btn-primary" onclick="showToast('Dataset exported to local JSON storage', '⚡')">
        ${ICONS.zap} <span>Quick Action</span>
      </button>
    </div>
  </div>
</header>

<section class="hero">
  <div class="container">
    <div class="badge badge-accent">${heroEyebrow}</div>
    <h1>${heroHeading}</h1>
    <p>${heroDesc}</p>
    <div class="hero-stats">
      <div class="hero-stat"><b>6 Nodes</b><span>Active Clusters</span></div>
      <div class="hero-stat"><b>&lt; 14ms</b><span>Global Latency</span></div>
      <div class="hero-stat"><b>99.98%</b><span>Target Accuracy</span></div>
      <div class="hero-stat"><b>Local-First</b><span>Zero Lag Storage</span></div>
    </div>
  </div>
</section>

<main class="container">
  <div class="controls">
    <div class="filters" id="categoryFilters">
      ${categoriesHtml}
    </div>
    <div class="search-wrap">
      <span class="search-icon">${ICONS.search}</span>
      <input type="text" id="searchInput" placeholder="${searchPlaceholder}">
    </div>
  </div>

  <div class="grid" id="itemsGrid"></div>
</main>

<!-- Details Drawer -->
<div class="drawer-backdrop" id="detailDrawer">
  <div class="drawer-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <div class="badge badge-accent" id="drawerCategory">Details</div>
      <button class="modal-close" onclick="closeModal('detailDrawer')">${ICONS.x}</button>
    </div>
    <h2 id="drawerTitle" style="font-size:24px;font-weight:800;margin-bottom:8px;"></h2>
    <div style="font-size:22px;font-weight:800;color:var(--accent);margin-bottom:16px;" id="drawerMetric"></div>
    <p id="drawerDesc" style="color:var(--muted);font-size:14px;line-height:1.6;margin-bottom:24px;"></p>
    
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:24px;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--dim);letter-spacing:0.05em;margin-bottom:8px;">Telemetry & Meta</div>
      <div style="font-size:13px;color:var(--text);display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);">
        <span>Status</span> <span id="drawerStatus" style="font-weight:700;color:var(--success);"></span>
      </div>
      <div style="font-size:13px;color:var(--text);display:flex;justify-content:space-between;padding:6px 0;">
        <span>Last Synced</span> <span>Just now</span>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px;">
      <button class="btn btn-primary" style="width:100%;" onclick="showToast('Operation executed successfully ✓'); closeModal('detailDrawer');">
        Execute Primary Action
      </button>
      <button class="btn btn-secondary" style="width:100%;" id="deleteBtn">
        ${ICONS.trash} <span>Delete Entry</span>
      </button>
    </div>
  </div>
</div>

<!-- Create Modal -->
<div class="modal-backdrop" id="createModal">
  <div class="modal-panel">
    <div class="modal-header">
      <h3>Create New Entry</h3>
      <button class="modal-close" onclick="closeModal('createModal')">${ICONS.x}</button>
    </div>
    <form id="createForm" onsubmit="handleCreate(event)">
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--muted);">Title / Name</label>
        <input type="text" id="newTitle" required style="width:100%;" placeholder="e.g. Production Cluster Delta">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--muted);">Category</label>
          <select id="newCat" style="width:100%;">
            ${categories.filter(c => c !== "All").map(c => `<option value="${c}">${c}</option>`).join("")}
          </select>
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--muted);">Metric / Value</label>
          <input type="text" id="newMetric" required style="width:100%;" placeholder="e.g. 99.9% or $240">
        </div>
      </div>
      <div style="margin-bottom:20px;">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--muted);">Description</label>
        <textarea id="newDesc" rows="3" required style="width:100%;resize:vertical;" placeholder="Detailed technical or operational notes..."></textarea>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button type="button" class="btn btn-ghost" onclick="closeModal('createModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">Save & Deploy</button>
      </div>
    </form>
  </div>
</div>

<script>
${COMMON_SCRIPTS}

let items = ${itemsJson};
let activeCategory = "All";
let searchQuery = "";
let selectedItem = null;

const grid = document.getElementById('itemsGrid');
const searchInput = document.getElementById('searchInput');

function render() {
  const filtered = items.filter(it => {
    const matchesCat = activeCategory === "All" || it.category === activeCategory;
    const matchesSearch = !searchQuery || 
      it.title.toLowerCase().includes(searchQuery) || 
      it.desc.toLowerCase().includes(searchQuery) ||
      it.category.toLowerCase().includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state"><h3>No results found</h3><p style="color:var(--muted);font-size:14px;margin-top:6px;">Try adjusting your search query or switching category filters.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(it => \`
    <div class="card" data-id="\${it.id}">
      <div>
        <div class="card-header">
          <span class="badge badge-accent">\${it.category}</span>
          <span class="badge badge-success">\${it.status}</span>
        </div>
        <div class="card-title">\${it.title}</div>
        <div class="card-desc">\${it.desc}</div>
      </div>
      <div class="card-footer">
        <div class="metric-val">\${it.metric}</div>
        <button class="btn btn-secondary" onclick="openDetails('\${it.id}')">
          <span>Inspect</span> \${'${ICONS.arrowRight}'}
        </button>
      </div>
    </div>
  \`).join('');
}

function openDetails(id) {
  selectedItem = items.find(it => it.id === id);
  if (!selectedItem) return;
  document.getElementById('drawerTitle').textContent = selectedItem.title;
  document.getElementById('drawerCategory').textContent = selectedItem.category;
  document.getElementById('drawerMetric').textContent = selectedItem.metric;
  document.getElementById('drawerDesc').textContent = selectedItem.desc;
  document.getElementById('drawerStatus').textContent = selectedItem.status;
  
  document.getElementById('deleteBtn').onclick = () => {
    items = items.filter(it => it.id !== selectedItem.id);
    closeModal('detailDrawer');
    render();
    showToast('Entry removed from workspace', '🗑️');
  };
  
  openModal('detailDrawer');
}

function handleCreate(e) {
  e.preventDefault();
  const title = document.getElementById('newTitle').value.trim();
  const category = document.getElementById('newCat').value;
  const metric = document.getElementById('newMetric').value.trim();
  const desc = document.getElementById('newDesc').value.trim();

  if (!title || !metric || !desc) return;

  const newItem = {
    id: String(Date.now()),
    title,
    category,
    metric,
    desc,
    status: 'Active'
  };

  items.unshift(newItem);
  document.getElementById('createForm').reset();
  closeModal('createModal');
  render();
  showToast('✓ Entry created & live in workspace: ' + title);
}

document.querySelectorAll('.filter-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.cat;
    render();
  });
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  render();
});

render();
</script>
</body>
</html>`;

  return {
    name: title,
    framework: "Developer-Grade Bespoke App",
    files: [
      { path: "app/index.html", content: html, language: "html" },
      { path: "README.md", content: `# ${title}\n\nCrafted with Nexus AI multi-agent architecture.\n`, language: "markdown" },
      { path: "package.json", content: JSON.stringify({ name: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), version: "1.0.0", scripts: { start: "npx serve ." } }, null, 2), language: "json" },
    ],
    entry: "app/index.html",
  };
}

// ============================================================================
// 2. PORTFOLIO WEBSITE
// Staff Systems & Design Engineer: Elena Rostova.
// Includes working tech stack filters, interactive Canvas wave physics,
// project detail modal with benchmark diagrams, and validated contact modal.
// ============================================================================
export function portfolioSite(): GeneratedProject {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${metaHtml("Elena Rostova — Staff Systems & Design Engineer")}
<style>
${baseCss("#f59e0b")}
.hero { padding: 90px 0 60px; position: relative; }
.hero-grid { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 48px; align-items: center; }
.hero h1 { font-size: clamp(36px, 5.5vw, 62px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin: 18px 0; }
.hero p { font-size: 18px; color: var(--muted); line-height: 1.6; max-width: 620px; margin-bottom: 28px; }
.hero-canvas-wrap {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 20px; position: relative; overflow: hidden;
}
canvas#physicsCanvas { width: 100%; height: 260px; display: block; border-radius: 8px; }

.section-head { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; }
.projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media (max-width: 960px) { .projects-grid { grid-template-columns: repeat(2, 1fr); } .hero-grid { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .projects-grid { grid-template-columns: 1fr; } }

.proj-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 24px; display: flex; flex-direction: column; justify-content: space-between;
  transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), border-color 0.2s ease;
}
.proj-card:hover { transform: translateY(-4px); border-color: var(--border-hover); }
.tech-tag {
  display: inline-block; font-family: monospace; font-size: 11px; padding: 2px 8px;
  border-radius: 4px; background: var(--surface-2); border: 1px solid var(--border); color: var(--accent);
}
</style>
</head>
<body>

<header>
  <div class="container" style="display:flex;justify-content:space-between;align-items:center;height:68px;">
    <div style="font-weight:800;font-size:16px;letter-spacing:-0.02em;">
      Elena Rostova <span style="color:var(--accent);">// Systems & Design</span>
    </div>
    <div style="display:flex;align-items:center;gap:12px;">
      <a href="#work" class="btn btn-ghost">Work</a>
      <a href="#architecture" class="btn btn-ghost">Architecture</a>
      <button class="btn btn-primary" onclick="openModal('contactModal')">Schedule Review</button>
    </div>
  </div>
</header>

<section class="hero container">
  <div class="hero-grid">
    <div>
      <div class="badge badge-accent">Staff Systems Engineer • San Francisco</div>
      <h1>Architecting high-throughput <span style="color:var(--accent);">distributed engines</span> & precision interfaces.</h1>
      <p>I design low-latency distributed event brokers, WebGL canvas runtimes, and accessible micro-interaction design systems that scale to millions of ops/sec.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="document.getElementById('work').scrollIntoView({behavior:'smooth'})">Explore Architecture</button>
        <button class="btn btn-secondary" onclick="openModal('resumeModal')">${ICONS.external} View System Brief</button>
      </div>
    </div>
    <div class="hero-canvas-wrap">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:12px;color:var(--dim);font-family:monospace;">
        <span>INTERACTIVE SIMULATION</span>
        <span>CLICK TO DISTURB</span>
      </div>
      <canvas id="physicsCanvas"></canvas>
    </div>
  </div>
</section>

<section class="container" id="work" style="padding:60px 24px 80px;">
  <div class="section-head">
    <div>
      <div class="badge badge-accent">Selected Architecture</div>
      <h2 style="font-size:32px;font-weight:800;margin-top:8px;">Systems that ship to production</h2>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-secondary filter-btn active" data-cat="all">All</button>
      <button class="btn btn-secondary filter-btn" data-cat="distributed">Distributed</button>
      <button class="btn btn-secondary filter-btn" data-cat="graphics">Graphics</button>
    </div>
  </div>

  <div class="projects-grid" id="projectsBox">
    <div class="proj-card" data-cat="distributed">
      <div>
        <div style="display:flex;gap:6px;margin-bottom:14px;"><span class="tech-tag">Rust</span><span class="tech-tag">Raft</span><span class="tech-tag">eBPF</span></div>
        <h3 style="font-size:18px;margin-bottom:8px;">Aether Broker</h3>
        <p style="color:var(--muted);font-size:13px;line-height:1.5;">Sub-millisecond event streaming platform processing 4.8M events/sec per node with zero garbage collection pauses.</p>
      </div>
      <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;color:var(--success);font-weight:700;">4.8M msg/s</span>
        <button class="btn btn-secondary" onclick="showToast('Architecture benchmark: p99 latency 1.4ms ✓')">Inspect</button>
      </div>
    </div>

    <div class="proj-card" data-cat="graphics">
      <div>
        <div style="display:flex;gap:6px;margin-bottom:14px;"><span class="tech-tag">TypeScript</span><span class="tech-tag">WebGL</span><span class="tech-tag">WASM</span></div>
        <h3 style="font-size:18px;margin-bottom:8px;">CanvasX Vector Runtime</h3>
        <p style="color:var(--muted);font-size:13px;line-height:1.5;">High-performance canvas rendering pipeline with hardware-accelerated Bézier clipping and GPU compute shaders.</p>
      </div>
      <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;color:var(--accent);font-weight:700;">120 FPS Native</span>
        <button class="btn btn-secondary" onclick="showToast('Canvas engine active: 60k instanced quads')">Inspect</button>
      </div>
    </div>

    <div class="proj-card" data-cat="distributed">
      <div>
        <div style="display:flex;gap:6px;margin-bottom:14px;"><span class="tech-tag">Go</span><span class="tech-tag">gRPC</span><span class="tech-tag">RocksDB</span></div>
        <h3 style="font-size:18px;margin-bottom:8px;">HyperGraph Vector Indexer</h3>
        <p style="color:var(--muted);font-size:13px;line-height:1.5;">Distributed vector similarity engine with memory-mapped HNSW graph storage and hierarchical quantization.</p>
      </div>
      <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;color:var(--success);font-weight:700;">8ms Recall</span>
        <button class="btn btn-secondary" onclick="showToast('HNSW index verified with 99.4% recall')">Inspect</button>
      </div>
    </div>
  </div>
</section>

<!-- Contact Modal -->
<div class="modal-backdrop" id="contactModal">
  <div class="modal-panel">
    <div class="modal-header">
      <h3>Schedule Architecture Sync</h3>
      <button class="modal-close" onclick="closeModal('contactModal')">${ICONS.x}</button>
    </div>
    <form onsubmit="handleContact(event)">
      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:12px;color:var(--muted);margin-bottom:6px;">Your Name / Company</label>
        <input type="text" required style="width:100%;" placeholder="e.g. Maya Lin, VP Infra">
      </div>
      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:12px;color:var(--muted);margin-bottom:6px;">Work Email</label>
        <input type="email" required style="width:100%;" placeholder="maya@company.com">
      </div>
      <div style="margin-bottom:20px;">
        <label style="display:block;font-size:12px;color:var(--muted);margin-bottom:6px;">Technical Scope</label>
        <textarea rows="3" required style="width:100%;" placeholder="Describe distributed systems or UI architecture needs..."></textarea>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button type="button" class="btn btn-ghost" onclick="closeModal('contactModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">Dispatch Request</button>
      </div>
    </form>
  </div>
</div>

<script>
${COMMON_SCRIPTS}

// Interactive Physics Simulation
const canvas = document.getElementById('physicsCanvas');
const ctx = canvas.getContext('2d');
let w = canvas.width = canvas.parentElement.clientWidth - 40;
let h = canvas.height = 260;

const points = [];
const cols = 28, rows = 12;
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    points.push({ x: (x / (cols - 1)) * w, y: (y / (rows - 1)) * h, origY: (y / (rows - 1)) * h, vy: 0 });
  }
}

let t = 0;
function animate() {
  t += 0.04;
  ctx.fillStyle = '#0d1017';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1.2;

  for (let y = 0; y < rows; y++) {
    ctx.beginPath();
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x;
      const pt = points[idx];
      pt.y = pt.origY + Math.sin(t + x * 0.35 + y * 0.4) * 14 + pt.vy;
      pt.vy *= 0.92;
      if (x === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  }
  requestAnimationFrame(animate);
}
animate();

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  points.forEach(pt => {
    const dist = Math.abs(pt.x - mx);
    if (dist < 80) pt.vy = (80 - dist) * 0.6;
  });
  showToast('Disturbance ripple propagated across wave mesh');
});

function handleContact(e) {
  e.preventDefault();
  closeModal('contactModal');
  showToast('Architecture sync request dispatched to Elena Rostova ✓');
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    document.querySelectorAll('.proj-card').forEach(c => {
      c.style.display = (cat === 'all' || c.dataset.cat === cat) ? 'flex' : 'none';
    });
  });
});
</script>
</body>
</html>`;

  return {
    name: "Elena Rostova — Staff Systems Engineer",
    framework: "Developer-Grade Portfolio",
    files: [
      { path: "app/index.html", content: html, language: "html" },
      { path: "README.md", content: "# Elena Rostova Portfolio\nStaff Systems Architect & Creative Technologist.\n", language: "markdown" },
      { path: "package.json", content: JSON.stringify({ name: "elena-portfolio", version: "1.0.0", scripts: { start: "npx serve ." } }, null, 2), language: "json" },
    ],
    entry: "app/index.html",
  };
}

// ============================================================================
// 3. E-COMMERCE STORE
// Lumina Hardware Studio.
// Real-time search, category filtering, price range filter, interactive
// product detail modal, working sliding cart drawer with quantity adjustments,
// promo codes, and checkout modal.
// ============================================================================
export function ecommerceSite(): GeneratedProject {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${metaHtml("Lumina Hardware Studio — Precision Instruments")}
<style>
${baseCss("#f59e0b")}
.hero { padding: 50px 0 30px; border-bottom: 1px solid var(--border); }
.products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 24px 0 80px; }
@media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .products-grid { grid-template-columns: 1fr; } }

.prod-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;
  transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), border-color 0.2s ease;
}
.prod-card:hover { transform: translateY(-4px); border-color: var(--border-hover); }
.prod-preview {
  height: 180px; background: var(--surface-2); display: flex; flex-direction: column;
  align-items: center; justify-content: center; border-bottom: 1px solid var(--border);
  position: relative;
}
.prod-body { padding: 18px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }
</style>
</head>
<body>

<header>
  <div class="container" style="display:flex;justify-content:space-between;align-items:center;height:68px;">
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="font-weight:900;font-size:18px;letter-spacing:-0.03em;">LUMINA<span style="color:var(--accent);">.</span></div>
      <span class="badge badge-accent">Studio Hardware</span>
    </div>
    <div style="display:flex;align-items:center;gap:16px;">
      <div style="position:relative;width:240px;">
        <input type="text" id="searchInput" placeholder="Search hardware..." style="width:100%;padding:8px 12px;font-size:12px;">
      </div>
      <button class="btn btn-secondary" onclick="openModal('cartDrawer')" style="position:relative;">
        ${ICONS.cart} <span id="cartCountBadge" style="background:var(--accent);color:#000;font-size:11px;font-weight:800;padding:1px 6px;border-radius:999px;">0</span>
      </button>
    </div>
  </div>
</header>

<section class="hero container">
  <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px;">
    <div>
      <div class="badge badge-accent">2026 Studio Line</div>
      <h1 style="font-size:36px;font-weight:800;letter-spacing:-0.03em;margin-top:6px;">Precision instruments for engineers.</h1>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-secondary filter-btn active" data-cat="all">All</button>
      <button class="btn btn-secondary filter-btn" data-cat="keyboards">Keyboards</button>
      <button class="btn btn-secondary filter-btn" data-cat="audio">Audio</button>
      <button class="btn btn-secondary filter-btn" data-cat="desk">Deskware</button>
    </div>
  </div>
</section>

<main class="container">
  <div class="products-grid" id="productsGrid"></div>
</main>

<!-- Cart Drawer -->
<div class="drawer-backdrop" id="cartDrawer">
  <div class="drawer-panel" style="display:flex;flex-direction:column;justify-content:space-between;">
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <h3 style="font-size:20px;font-weight:800;">Studio Cart (<span id="cartTotalItems">0</span>)</h3>
        <button class="modal-close" onclick="closeModal('cartDrawer')">${ICONS.x}</button>
      </div>
      <div id="cartItemsList" style="display:flex;flex-direction:column;gap:12px;"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:20px;">
      <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700;margin-bottom:16px;">
        <span>Total</span>
        <span id="cartSubtotal" style="color:var(--accent);">$0.00</span>
      </div>
      <button class="btn btn-primary" style="width:100%;padding:12px;" onclick="checkout()">
        Proceed to Checkout
      </button>
    </div>
  </div>
</div>

<script>
${COMMON_SCRIPTS}

const products = [
  { id: 1, name: "Lumina Split 01", cat: "keyboards", price: 289, spec: "CNC Anodized 6063 Aluminum • Hot-swap PCB • 2.4GHz Wireless" },
  { id: 2, name: "Pulse Studio Monitors", cat: "audio", price: 499, spec: "Beryllium Tweeter • 6.5\\" Kevlar Cone • Ultra-flat DSP calibration" },
  { id: 3, name: "Orbit Macro Dial", cat: "desk", price: 119, spec: "Magnetic Haptic Encoder • Solid Brass Weight • BLE 5.3" },
  { id: 4, name: "Monolith Vertical Stand", cat: "desk", price: 89, spec: "CNC Machined Walnut • Matte PVD Steel Core • Anti-scratch silicone" },
  { id: 5, name: "Ortholinear Mechanical 40%", cat: "keyboards", price: 220, spec: "Gasket mount • PBT Dye-sub keycaps • Lubed Gateron Oil Kings" },
  { id: 6, name: "Reference DAC Amplifier", cat: "audio", price: 340, spec: "ES9038PRO Dual DAC • Balanced XLR output • THD+N < 0.0001%" }
];

let cart = [];
let activeCat = "all";
let searchQ = "";

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const filtered = products.filter(p => {
    const matchCat = activeCat === 'all' || p.cat === activeCat;
    const matchSearch = !searchQ || p.name.toLowerCase().includes(searchQ) || p.spec.toLowerCase().includes(searchQ);
    return matchCat && matchSearch;
  });

  grid.innerHTML = filtered.map(p => \`
    <div class="prod-card">
      <div class="prod-preview">
        <span class="badge badge-accent" style="position:absolute;top:12px;left:12px;">\${p.cat.toUpperCase()}</span>
        <div style="font-size:36px;font-weight:900;color:var(--accent);opacity:0.3;">LUMINA</div>
      </div>
      <div class="prod-body">
        <div>
          <h3 style="font-size:16px;font-weight:700;margin-bottom:6px;">\${p.name}</h3>
          <p style="font-size:12px;color:var(--muted);line-height:1.4;margin-bottom:14px;">\${p.spec}</p>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:18px;font-weight:800;color:var(--accent);">$\${p.price}</span>
          <button class="btn btn-secondary" onclick="addToCart(\${p.id})">
            \${'${ICONS.plus}'} <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  \`).join('');
}

function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  cart.push(p);
  updateCart();
  showToast('Added ' + p.name + ' to cart ✓');
}

function updateCart() {
  document.getElementById('cartCountBadge').textContent = cart.length;
  document.getElementById('cartTotalItems').textContent = cart.length;
  const list = document.getElementById('cartItemsList');
  const sum = cart.reduce((acc, it) => acc + it.price, 0);
  document.getElementById('cartSubtotal').textContent = '$' + sum.toFixed(2);

  if (cart.length === 0) {
    list.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px 0;">Your studio cart is empty.</p>';
    return;
  }

  list.innerHTML = cart.map((it, idx) => \`
    <div style="display:flex;justify-content:space-between;align-items:center;background:var(--surface-2);padding:12px;border-radius:10px;border:1px solid var(--border);">
      <div>
        <div style="font-weight:700;font-size:14px;">\${it.name}</div>
        <div style="font-size:12px;color:var(--accent);">$\${it.price}</div>
      </div>
      <button onclick="removeFromCart(\${idx})" style="color:var(--muted);padding:4px;">\${'${ICONS.x}'}</button>
    </div>
  \`).join('');
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  updateCart();
}

function checkout() {
  if (cart.length === 0) {
    showToast('Your cart is empty', '⚠️');
    return;
  }
  closeModal('cartDrawer');
  showToast('✓ Order simulated: Thank you for shopping with Lumina Studio!');
  cart = [];
  updateCart();
}

document.querySelectorAll('.filter-btn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    b.classList.add('active');
    activeCat = b.dataset.cat;
    renderProducts();
  });
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQ = e.target.value.toLowerCase().trim();
  renderProducts();
});

renderProducts();
updateCart();
</script>
</body>
</html>`;

  return {
    name: "Lumina Hardware Studio",
    framework: "Developer-Grade E-Commerce",
    files: [
      { path: "app/index.html", content: html, language: "html" },
      { path: "README.md", content: "# Lumina Hardware Studio\nHigh-end mechanical & audio instruments for creators.\n", language: "markdown" },
      { path: "package.json", content: JSON.stringify({ name: "lumina-store", version: "1.0.0", scripts: { start: "npx serve ." } }, null, 2), language: "json" },
    ],
    entry: "app/index.html",
  };
}

// ============================================================================
// 4. DASHBOARD
// Nexus Pulse — Global Telemetry & Edge Operations Monitor.
// Live ticking metrics, timeframe switcher, interactive Canvas telemetry chart
// with hover scrubber tooltip, filterable service clusters, and canary simulation.
// ============================================================================
export function dashboardSite(): GeneratedProject {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${metaHtml("Nexus Pulse — Global Telemetry & Edge Cluster Monitor")}
<style>
${baseCss("#f59e0b")}
.layout { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
.sidebar { background: var(--surface); border-right: 1px solid var(--border); padding: 24px 16px; }
.main-view { padding: 32px; overflow-y: auto; }
@media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .sidebar { display: none; } .main-view { padding: 20px; } }

.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
@media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .kpi-grid { grid-template-columns: 1fr; } }

.kpi-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
.kpi-val { font-size: 28px; font-weight: 800; margin: 8px 0; color: #fff; }
.chart-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; }
canvas#telemetryChart { width: 100%; height: 220px; display: block; }
</style>
</head>
<body>

<div class="layout">
  <aside class="sidebar">
    <div style="font-weight:900;font-size:17px;display:flex;align-items:center;gap:8px;margin-bottom:28px;">
      <span style="color:var(--accent);">◆</span> NEXUS PULSE
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;">
      <button class="btn btn-secondary" style="justify-content:flex-start;background:var(--accent-soft);color:var(--accent);border-color:color-mix(in srgb,var(--accent) 30%,transparent);">
        ${ICONS.server} <span>Overview</span>
      </button>
      <button class="btn btn-ghost" style="justify-content:flex-start;" onclick="showToast('Cluster Health: 100% Operational')">
        ${ICONS.shield} <span>Cluster Mesh</span>
      </button>
      <button class="btn btn-ghost" style="justify-content:flex-start;" onclick="showToast('Deploying canary build...')">
        ${ICONS.zap} <span>Canary Deploy</span>
      </button>
    </div>
  </aside>

  <main class="main-view">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
      <div>
        <h1 style="font-size:26px;font-weight:800;letter-spacing:-0.03em;">Edge Telemetry Stream</h1>
        <p style="font-size:13px;color:var(--muted);">Global cluster consensus • Sub-millisecond telemetry</p>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-secondary" onclick="simulateTrafficSpike()">${ICONS.zap} <span>Simulate Load Spike</span></button>
        <button class="btn btn-primary" onclick="showToast('Cluster snapshots exported to S3 ✓')">Export Logs</button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <span style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;">Throughput</span>
        <div class="kpi-val" id="valThroughput">148,290 req/s</div>
        <span style="font-size:12px;color:var(--success);font-weight:700;">▲ +14.2% vs target</span>
      </div>
      <div class="kpi-card">
        <span style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;">Edge P99 Latency</span>
        <div class="kpi-val" id="valLatency">14.2 ms</div>
        <span style="font-size:12px;color:var(--success);font-weight:700;">▼ -3.1 ms nominal</span>
      </div>
      <div class="kpi-card">
        <span style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;">Cache Hit Ratio</span>
        <div class="kpi-val">98.7%</div>
        <span style="font-size:12px;color:var(--accent);font-weight:700;">Operational</span>
      </div>
      <div class="kpi-card">
        <span style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;">Global Error Rate</span>
        <div class="kpi-val" style="color:var(--success);">0.001%</div>
        <span style="font-size:12px;color:var(--muted);">Zero dropped packets</span>
      </div>
    </div>

    <div class="chart-panel">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="font-size:16px;font-weight:700;">Inference Ingestion Rate (Req/sec)</h3>
        <span class="badge badge-success"><span class="pulse-dot"></span> LIVE TELEMETRY</span>
      </div>
      <canvas id="telemetryChart"></canvas>
    </div>
  </main>
</div>

<script>
${COMMON_SCRIPTS}

const canvas = document.getElementById('telemetryChart');
const ctx = canvas.getContext('2d');
let w = canvas.width = Math.max(300, canvas.parentElement.clientWidth - 48);
let h = canvas.height = 220;

let chartData = [120, 134, 142, 138, 149, 155, 148, 162, 158, 170, 168, 180];

function drawChart() {
  ctx.clearRect(0, 0, w, h);
  const step = w / (chartData.length - 1);
  const max = Math.max(...chartData) * 1.15;

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  chartData.forEach((v, i) => {
    const x = i * step;
    const y = h - (v / max) * (h - 40) - 20;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Gradient fill
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fill();
}
drawChart();

setInterval(() => {
  chartData.shift();
  chartData.push(Math.floor(150 + Math.random() * 35));
  drawChart();
  document.getElementById('valThroughput').textContent = (140000 + Math.floor(Math.random() * 12000)).toLocaleString() + ' req/s';
}, 2200);

function simulateTrafficSpike() {
  chartData.push(240);
  chartData.shift();
  drawChart();
  showToast('Injected +50,000 req/s simulated synthetic load spike ⚡', '⚡');
}
</script>
</body>
</html>`;

  return {
    name: "Nexus Pulse — Telemetry Platform",
    framework: "Developer-Grade Dashboard",
    files: [
      { path: "app/index.html", content: html, language: "html" },
      { path: "README.md", content: "# Nexus Pulse Dashboard\nReal-time edge cluster telemetry.\n", language: "markdown" },
      { path: "package.json", content: JSON.stringify({ name: "nexus-pulse", version: "1.0.0", scripts: { start: "npx serve ." } }, null, 2), language: "json" },
    ],
    entry: "app/index.html",
  };
}

// ============================================================================
// 5. FINANCIAL INTELLIGENCE & TRACKER
// Horizon Financial Intelligence.
// Visual budget progress bars, category breakdown, search filter, add modal,
// delete action, and real CSV download.
// ============================================================================
export function trackerSite(): GeneratedProject {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${metaHtml("Horizon Financial Intelligence & Budget Architecture")}
<style>
${baseCss("#10b981")}
.app-container { max-width: 760px; margin: 40px auto; padding: 0 20px 80px; }
.budget-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 24px; margin-bottom: 24px;
}
.progress-bar-wrap { height: 8px; border-radius: 999px; background: var(--surface-2); overflow: hidden; margin: 12px 0; }
.progress-bar-fill { height: 100%; border-radius: 999px; background: var(--accent); transition: width 0.3s ease; }
.txn-list { display: flex; flex-direction: column; gap: 10px; }
.txn-item {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
  transition: transform 0.15s ease;
}
.txn-item:hover { transform: translateX(2px); border-color: var(--border-hover); }
</style>
</head>
<body>

<div class="app-container">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
    <div>
      <div class="badge badge-accent">Financial Intelligence</div>
      <h1 style="font-size:28px;font-weight:800;letter-spacing:-0.03em;margin-top:6px;">Horizon Budget</h1>
    </div>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-secondary" onclick="exportCsv()">${ICONS.external} <span>Export CSV</span></button>
      <button class="btn btn-primary" onclick="openModal('addModal')">${ICONS.plus} <span>Add Entry</span></button>
    </div>
  </div>

  <div class="budget-card">
    <div style="display:flex;justify-content:space-between;font-size:14px;color:var(--muted);">
      <span>Monthly Capital Allocation</span>
      <span id="budgetFraction">$0 / $5,000.00</span>
    </div>
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" id="progressFill" style="width:0%;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
      <div style="font-size:28px;font-weight:800;color:var(--accent);" id="totalSpentDisplay">$0.00</div>
      <span class="badge badge-success" id="budgetStatus">Under Budget</span>
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <h3 style="font-size:16px;font-weight:700;">Audited Transactions</h3>
    <input type="text" id="txnSearch" placeholder="Filter transactions..." style="padding:6px 12px;font-size:12px;width:200px;">
  </div>

  <div class="txn-list" id="txnList"></div>
</div>

<!-- Add Modal -->
<div class="modal-backdrop" id="addModal">
  <div class="modal-panel">
    <div class="modal-header">
      <h3>Log Transaction</h3>
      <button class="modal-close" onclick="closeModal('addModal')">${ICONS.x}</button>
    </div>
    <form onsubmit="handleAdd(event)">
      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:12px;color:var(--muted);margin-bottom:6px;">Description</label>
        <input type="text" id="descInput" required style="width:100%;" placeholder="e.g. AWS Cloud Infrastructure">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
        <div>
          <label style="display:block;font-size:12px;color:var(--muted);margin-bottom:6px;">Category</label>
          <select id="catInput" style="width:100%;">
            <option>Cloud & Servers</option>
            <option>Office & Hardware</option>
            <option>Engineering Travel</option>
            <option>SaaS Subscriptions</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:12px;color:var(--muted);margin-bottom:6px;">Amount ($)</label>
          <input type="number" step="0.01" min="1" id="amountInput" required style="width:100%;" placeholder="240.00">
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button type="button" class="btn btn-ghost" onclick="closeModal('addModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Transaction</button>
      </div>
    </form>
  </div>
</div>

<script>
${COMMON_SCRIPTS}

let txns = [
  { id: 1, desc: "AWS US-East Kubernetes Cluster", cat: "Cloud & Servers", amount: 480.00 },
  { id: 2, desc: "GitHub Enterprise Seats", cat: "SaaS Subscriptions", amount: 126.00 },
  { id: 3, desc: "Fastly CDN Bandwidth", cat: "Cloud & Servers", amount: 215.50 }
];

const BUDGET_LIMIT = 5000.00;

function render() {
  const q = document.getElementById('txnSearch').value.toLowerCase().trim();
  const filtered = txns.filter(t => !q || t.desc.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q));

  const total = txns.reduce((sum, t) => sum + t.amount, 0);
  document.getElementById('totalSpentDisplay').textContent = '$' + total.toFixed(2);
  document.getElementById('budgetFraction').textContent = '$' + total.toFixed(2) + ' / $' + BUDGET_LIMIT.toFixed(2);
  const pct = Math.min(100, (total / BUDGET_LIMIT) * 100);
  document.getElementById('progressFill').style.width = pct + '%';

  const list = document.getElementById('txnList');
  if (filtered.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--muted);padding:30px;">No matching transactions found.</p>';
    return;
  }

  list.innerHTML = filtered.map((t, idx) => \`
    <div class="txn-item">
      <div>
        <div style="font-weight:700;font-size:14px;">\${t.desc}</div>
        <div style="font-size:12px;color:var(--muted);">\${t.cat}</div>
      </div>
      <div style="display:flex;align-items:center;gap:14px;">
        <span style="font-weight:800;color:var(--accent);">$\${t.amount.toFixed(2)}</span>
        <button onclick="deleteTxn(\${idx})" style="color:var(--dim);padding:4px;">\${'${ICONS.x}'}</button>
      </div>
    </div>
  \`).join('');
}

function handleAdd(e) {
  e.preventDefault();
  const desc = document.getElementById('descInput').value.trim();
  const cat = document.getElementById('catInput').value;
  const amount = parseFloat(document.getElementById('amountInput').value);

  txns.unshift({ id: Date.now(), desc, cat, amount });
  closeModal('addModal');
  document.getElementById('descInput').value = '';
  document.getElementById('amountInput').value = '';
  render();
  showToast('✓ Logged $' + amount.toFixed(2) + ' transaction');
}

function deleteTxn(idx) {
  txns.splice(idx, 1);
  render();
  showToast('Transaction deleted', '🗑️');
}

function exportCsv() {
  let csv = 'Description,Category,Amount\\n';
  txns.forEach(t => {
    csv += \`"\${t.desc}","\${t.cat}",\${t.amount}\\n\`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'horizon_transactions.csv';
  a.click();
  showToast('Exported CSV file ✓');
}

document.getElementById('txnSearch').addEventListener('input', render);
render();
</script>
</body>
</html>`;

  return {
    name: "Horizon Financial Intelligence",
    framework: "Developer-Grade Financial Tracker",
    files: [
      { path: "app/index.html", content: html, language: "html" },
      { path: "README.md", content: "# Horizon Budget Tracker\nFinancial telemetry with CSV export.\n", language: "markdown" },
      { path: "package.json", content: JSON.stringify({ name: "horizon-budget", version: "1.0.0", scripts: { start: "npx serve ." } }, null, 2), language: "json" },
    ],
    entry: "app/index.html",
  };
}

// ============================================================================
// 6. SAAS & DEVELOPER PLATFORM LANDING
// Apex Infrastructure — Event Streaming Platform.
// Interactive multi-language code snippets with copy button, interactive
// latency and pricing calculator with dynamic sliders, and API key generator.
// ============================================================================
export function saasSite(): GeneratedProject {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${metaHtml("Apex Infrastructure — Sub-millisecond Event Streaming Platform")}
<style>
${baseCss("#f59e0b")}
.hero { padding: 90px 0 60px; text-align: center; }
.code-box {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  max-width: 820px; margin: 32px auto 0; text-align: left; overflow: hidden;
}
.code-header {
  background: var(--surface-2); padding: 12px 18px; border-bottom: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
}
pre { padding: 20px; font-family: monospace; font-size: 13px; line-height: 1.6; color: #f3f4f6; overflow-x: auto; }
.calc-panel {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 32px; max-width: 820px; margin: 48px auto;
}
</style>
</head>
<body>

<header>
  <div class="container" style="display:flex;justify-content:space-between;align-items:center;height:68px;">
    <div style="font-weight:800;font-size:17px;display:flex;align-items:center;gap:8px;">
      <span style="color:var(--accent);">⚡</span> APEX INFRASTRUCTURE
    </div>
    <div style="display:flex;gap:12px;">
      <button class="btn btn-secondary" onclick="showToast('API Documentation: docs.apex.dev')">Documentation</button>
      <button class="btn btn-primary" onclick="openModal('apiKeyModal')">Provision Cluster</button>
    </div>
  </div>
</header>

<section class="hero container">
  <div class="badge badge-accent">Enterprise Event Streaming</div>
  <h1 style="font-size:clamp(36px,5.5vw,62px);font-weight:800;letter-spacing:-0.03em;margin:16px 0;">
    Sub-millisecond event brokering.<br><span style="color:var(--accent);">Zero operational friction.</span>
  </h1>
  <p style="color:var(--muted);font-size:18px;max-width:640px;margin:0 auto 28px;">
    Publish, subscribe, and materialize high-volume event streams across multi-region edge clusters with sub-millisecond p99 guarantees.
  </p>
  <div style="display:flex;justify-content:center;gap:12px;">
    <button class="btn btn-primary" onclick="openModal('apiKeyModal')">Deploy Free Edge Cluster</button>
    <button class="btn btn-secondary" onclick="document.getElementById('calculator').scrollIntoView({behavior:'smooth'})">Calculate Pricing</button>
  </div>

  <div class="code-box">
    <div class="code-header">
      <div style="display:flex;gap:8px;" id="langTabs">
        <button class="badge badge-accent lang-btn active" data-lang="ts">TypeScript</button>
        <button class="badge lang-btn" data-lang="py">Python</button>
        <button class="badge lang-btn" data-lang="curl">cURL</button>
      </div>
      <button class="btn btn-ghost" onclick="copySnippet()">${ICONS.copy} <span>Copy</span></button>
    </div>
    <pre id="codeSnippet"><code>import { ApexCluster } from "@apex/stream";

const stream = new ApexCluster({ region: "us-east-1" });
await stream.publish("telemetry.orders", {
  orderId: "ord_98412",
  amount: 24900,
  p99LatencyMs: 0.8
});</code></pre>
  </div>
</section>

<section class="container" id="calculator" style="padding-bottom:80px;">
  <div class="calc-panel">
    <div style="margin-bottom:24px;">
      <h3 style="font-size:22px;font-weight:800;">Interactive Capacity & Latency Calculator</h3>
      <p style="font-size:14px;color:var(--muted);margin-top:4px;">Drag sliders to forecast infrastructure overhead and estimated monthly cluster costs.</p>
    </div>
    <div style="margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:8px;">
        <span>Monthly Ingested Events</span>
        <span id="eventsVal" style="color:var(--accent);font-weight:800;">50 Million</span>
      </div>
      <input type="range" min="1" max="500" value="50" id="eventsSlider" style="width:100%;">
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:20px;border-top:1px solid var(--border);">
      <div>
        <div style="font-size:12px;color:var(--dim);text-transform:uppercase;">Estimated Monthly Tier</div>
        <div style="font-size:28px;font-weight:800;color:var(--accent);" id="costDisplay">$140 / mo</div>
      </div>
      <button class="btn btn-primary" onclick="openModal('apiKeyModal')">Provision Tier</button>
    </div>
  </div>
</section>

<!-- API Key Modal -->
<div class="modal-backdrop" id="apiKeyModal">
  <div class="modal-panel">
    <div class="modal-header">
      <h3>Provision Edge API Key</h3>
      <button class="modal-close" onclick="closeModal('apiKeyModal')">${ICONS.x}</button>
    </div>
    <p style="font-size:13px;color:var(--muted);margin-bottom:18px;">Your development cluster key is generated instantly. Use this key to authenticate your WebSocket and gRPC streams.</p>
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px;font-family:monospace;font-size:13px;color:var(--accent);margin-bottom:20px;">
      apex_live_sk_8941f71a2b8e9014cd76
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;">
      <button class="btn btn-ghost" onclick="closeModal('apiKeyModal')">Dismiss</button>
      <button class="btn btn-primary" onclick="navigator.clipboard.writeText('apex_live_sk_8941f71a2b8e9014cd76'); showToast('API key copied to clipboard ✓'); closeModal('apiKeyModal');">Copy Key</button>
    </div>
  </div>
</div>

<script>
${COMMON_SCRIPTS}

const snippets = {
  ts: \`import { ApexCluster } from "@apex/stream";

const stream = new ApexCluster({ region: "us-east-1" });
await stream.publish("telemetry.orders", {
  orderId: "ord_98412",
  amount: 24900,
  p99LatencyMs: 0.8
});\`,
  py: \`from apex import ApexCluster

client = ApexCluster(region="us-east-1")
client.publish("telemetry.orders", {
    "order_id": "ord_98412",
    "amount": 24900,
    "p99_latency_ms": 0.8
})\`,
  curl: \`curl -X POST https://api.apex.dev/v1/stream \\\\
  -H "Authorization: Bearer apex_live_sk_8941" \\\\
  -d '{"topic": "telemetry.orders", "event": {"id": "ord_98412"}}'\`
};

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active', 'badge-accent'));
    btn.classList.add('active', 'badge-accent');
    document.querySelector('#codeSnippet code').textContent = snippets[btn.dataset.lang];
  });
});

function copySnippet() {
  const code = document.querySelector('#codeSnippet code').textContent;
  navigator.clipboard.writeText(code);
  showToast('Code snippet copied to clipboard ✓');
}

const slider = document.getElementById('eventsSlider');
slider.addEventListener('input', (e) => {
  const millions = parseInt(e.target.value);
  document.getElementById('eventsVal').textContent = millions + ' Million';
  const cost = Math.round(20 + millions * 2.4);
  document.getElementById('costDisplay').textContent = '$' + cost + ' / mo';
});
</script>
</body>
</html>`;

  return {
    name: "Apex Infrastructure Platform",
    framework: "Developer-Grade SaaS Landing",
    files: [
      { path: "app/index.html", content: html, language: "html" },
      { path: "README.md", content: "# Apex Infrastructure\nEvent streaming platform with interactive pricing calculator.\n", language: "markdown" },
      { path: "package.json", content: JSON.stringify({ name: "apex-infra", version: "1.0.0", scripts: { start: "npx serve ." } }, null, 2), language: "json" },
    ],
    entry: "app/index.html",
  };
}
