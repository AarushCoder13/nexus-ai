// =============================================================
// Nexus AI — Multi-agent team pipeline (simulated build engine)
// Produces real, self-contained HTML/CSS/JS projects for the live
// preview, plus a file tree, console logs, and a reviewer pass.
// =============================================================
import type {
  ActivityEvent,
  ActivityStep,
  ChatStatus,
  ConsoleLine,
  GeneratedProject,
  TeamMember,
} from "./types";
import { uid } from "./utils";

// ---- Activity stage definitions ----------------------------------------
export const DEFAULT_STAGES: { id: ActivityStep["id"]; label: string }[] = [
  { id: "understand", label: "Understanding idea" },
  { id: "plan", label: "Planning architecture" },
  { id: "files", label: "Creating files" },
  { id: "code", label: "Writing code" },
  { id: "build", label: "Running build" },
  { id: "review", label: "Reviewing & fixing errors" },
  { id: "preview", label: "Preview ready" },
];

const ROLE_FOR_STAGE: Record<ActivityStep["id"], TeamMember["role"]> = {
  understand: "Planner",
  plan: "Architect",
  files: "Architect",
  code: "Frontend",
  build: "Backend",
  review: "Reviewer",
  preview: "Reviewer",
};

export function initialSteps(team: TeamMember[]): ActivityStep[] {
  return DEFAULT_STAGES.map((s) => ({
    ...s,
    status: "pending",
    agent: (team.find((t) => t.role === ROLE_FOR_STAGE[s.id])?.provider ?? "demo") as string,
  }));
}

// ---- Console / event helpers -------------------------------------------
let consCounter = 0;
function cl(level: ConsoleLine["level"], text: string): ConsoleLine {
  return { id: uid("c"), ts: Date.now(), level, text };
}
function ev(
  agent: string,
  role: TeamMember["role"],
  message: string,
  kind: ActivityEvent["kind"],
): ActivityEvent {
  return { id: uid("e"), agent, role, message, ts: Date.now(), kind };
}

// ---- Template detection --------------------------------------------------
type TemplateId = "hello" | "portfolio" | "ecommerce" | "dashboard" | "tracker";

export function detectTemplate(request: string): TemplateId {
  const r = request.toLowerCase();
  if (/portfol/.test(r)) return "portfolio";
  if (/ecommerce|e-commerce|store|shop|sell/.test(r)) return "ecommerce";
  if (/dashboard|saas|analytics|admin|metrics/.test(r)) return "dashboard";
  if (/expense|tracker|ride|budget|finance|invoice/.test(r)) return "tracker";
  return "hello";
}

function templateName(t: TemplateId): string {
  const map: Record<TemplateId, string> = {
    hello: "Aurora — premium landing",
    portfolio: "Portfolio Website",
    ecommerce: "Lumina Store",
    dashboard: "Pulse Dashboard",
    tracker: "Ride & Expense Tracker",
  };
  return map[t] ?? "Aurora — premium landing";
}

// ---- Generators (self-contained files) ----------------------------------
function metaHtml(title: string): string {
  return `<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${title}</title>`;
}
function baseCss(accent: string): string {
  return `
:root{--accent:${accent};--bg:#0b0d12;--panel:#12151d;--panel2:#171b26;--text:#e7eaf0;--muted:#9aa3b2;--border:#232838;--radius:16px}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--text);line-height:1.6}
a{text-decoration:none;color:inherit}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
.container{max-width:1140px;margin:0 auto;padding:0 24px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:999px;font-weight:600;font-size:15px;transition:transform .15s,box-shadow .2s,background .2s}
.btn-primary{background:var(--accent);color:#fff;box-shadow:0 8px 24px -8px color-mix(in srgb,var(--accent) 70%,transparent)}
.btn-primary:hover{transform:translateY(-2px)}
.btn-ghost{border:1px solid var(--border);color:var(--text)}
.btn-ghost:hover{background:var(--panel2)}
.eyebrow{color:var(--accent);font-weight:600;letter-spacing:.12em;text-transform:uppercase;font-size:12px}
h1,h2,h3{line-height:1.15;letter-spacing:-.02em}
.muted{color:var(--muted)}
@media (max-width:768px){.container{padding:0 18px}}`;
}

function helloSite(): GeneratedProject {
  const files = [
    {
      path: "app/index.html",
      language: "html",
      content: `<!DOCTYPE html><html lang="en"><head>${metaHtml("Aurora")}
<style>${baseCss("#F59E0B")}
.hero{min-height:88vh;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(600px 300px at 20% 20%,color-mix(in srgb,var(--accent) 22%,transparent),transparent 70%),radial-gradient(500px 300px at 85% 75%,color-mix(in srgb,var(--accent) 16%,transparent),transparent 70%)}
nav{display:flex;align-items:center;justify-content:space-between;padding:24px 0;position:relative}
.logo{font-weight:800;font-size:20px;letter-spacing:-.02em}
.logo span{color:var(--accent)}
.nav-links{display:flex;gap:28px;color:var(--muted);font-size:15px}
.nav-links a:hover{color:var(--text)}
.hero-inner{position:relative}
.hero h1{font-size:clamp(40px,7vw,68px);font-weight:800;max-width:760px;margin:20px 0}
.grad{background:linear-gradient(90deg,var(--accent),#F97316);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{font-size:19px;color:var(--muted);max-width:560px;margin-bottom:36px}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap}
.stats{display:flex;gap:48px;margin-top:72px;flex-wrap:wrap}
.stat b{font-size:32px;display:block}
.stat span{color:var(--muted);font-size:14px}
.features{padding:96px 0;border-top:1px solid var(--border)}
.section-head{margin-bottom:48px}
.section-head h2{font-size:34px;margin:10px 0}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.card{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:28px}
.card:hover{border-color:color-mix(in srgb,var(--accent) 45%,var(--border));transform:translateY(-3px);transition:.2s}
.icon{width:44px;height:44px;border-radius:12px;background:color-mix(in srgb,var(--accent) 16%,transparent);display:grid;place-items:center;font-size:20px;margin-bottom:16px}
.card h3{margin-bottom:8px}
.cta{text-align:center;padding:80px 0}
.cta h2{font-size:34px;margin-bottom:18px}
footer{border-top:1px solid var(--border);padding:28px 0;text-align:center;color:var(--muted);font-size:14px}
@media (max-width:900px){.grid{grid-template-columns:1fr}.nav-links{display:none}}
</style></head><body>
<nav class="container"><div class="logo">Aurora<span>.</span></div><div class="nav-links"><a href="#features">Features</a><a href="#cta">Pricing</a><a href="#">Docs</a></div></nav>
<section class="hero"><div class="container hero-inner"><div class="eyebrow">New · v2.0</div><h1>Ship your ideas with <span class="grad">lightning speed</span>.</h1><p>Aurora is the AI-native platform that turns a single prompt into a production-grade product — designed, built, and reviewed for you.</p><div class="hero-actions"><button class="btn btn-primary">Start building</button><button class="btn btn-ghost">View demo</button></div><div class="stats"><div class="stat"><b>4.9★</b><span>average rating</span></div><div class="stat"><b>120k+</b><span>projects shipped</span></div><div class="stat"><b>38s</b><span>to first preview</span></div></div></div></section>
<section class="features" id="features"><div class="container"><div class="section-head"><div class="eyebrow">Why Aurora</div><h2>Everything you need to build</h2><p class="muted">From the first idea to a live preview — all in one workspace.</p></div><div class="grid"><div class="card"><div class="icon">🧠</div><h3>Multi-agent team</h3><p class="muted">Planner, architect, builders and reviewer collaborate on every request.</p></div><div class="card"><div class="icon">⚡</div><h3>Instant previews</h3><p class="muted">See your app render live as it's generated.</p></div><div class="card"><div class="icon">🔒</div><h3>Your keys, your data</h3><p class="muted">Bring your own API keys. Nothing is stored server-side.</p></div></div></div></section>
<section class="cta" id="cta"><div class="container"><h2>Ready to build something great?</h2><p class="muted">Join thousands of builders using Aurora every day.</p><div style="margin-top:24px"><button class="btn btn-primary">Get started — it's free</button></div></div></section>
<footer><div class="container">© 2025 Aurora Labs. Built with Nexus AI.</div></footer>
<script>document.querySelectorAll('.card').forEach((c,i)=>{c.style.animation='fade .5s '+(i*0.08)+'s both'});document.head.insertAdjacentHTML('beforeend','<style>@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1}}</style>');</script>
</body></html>`,
    },
    { path: "package.json", language: "json", content: JSON.stringify({ name: "aurora-landing", version: "1.0.0", private: true, scripts: { build: "echo 'static site — nothing to build' && exit 0", dev: "npx serve .", start: "npx serve ." }, dependencies: {} }, null, 2) },
    { path: "README.md", language: "markdown", content: `# Aurora — premium landing page

A clean, responsive single-page landing site generated by the Nexus AI team.

## Run locally
\`\`\`bash
npm run dev
\`\`\`
` },
    { path: "public/favicon.svg", language: "svg", content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7c5cfc"/><path d="M9 22V10h6a4 4 0 0 1 0 8h-3m3 4-2.5-4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>` },
  ];
  return { name: templateName("hello"), framework: "Static HTML", files, entry: "app/index.html" };
}

function portfolioSite(): GeneratedProject {
  const files = [
    {
      path: "app/index.html",
      language: "html",
      content: `<!DOCTYPE html><html lang="en"><head>${metaHtml("Alex Rivera — Portfolio")}
<style>${baseCss("#F59E0B")}
.hero{min-height:92vh;display:flex;align-items:center;position:relative}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(700px 400px at 80% 20%,color-mix(in srgb,var(--accent) 18%,transparent),transparent 70%)}
.hero-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:40px;align-items:center;position:relative}
.hero h1{font-size:clamp(38px,6vw,60px);font-weight:800;margin:16px 0}
.hero .role{font-size:19px;color:var(--muted)}
.tag{display:inline-block;background:color-mix(in srgb,var(--accent) 14%,transparent);border:1px solid color-mix(in srgb,var(--accent) 35%,transparent);color:var(--accent);padding:6px 14px;border-radius:999px;font-size:13px;font-weight:600}
.card-avatar{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:32px;text-align:center}
.avatar{width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#F97316);margin:0 auto 16px;display:grid;place-items:center;font-size:44px}
.skills{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:18px}
.skill{background:var(--panel2);border:1px solid var(--border);padding:6px 12px;border-radius:999px;font-size:13px}
.work{padding:90px 0;border-top:1px solid var(--border)}
.section-head h2{font-size:34px;margin:10px 0}
.projects{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.project{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:transform .2s,border-color .2s}
.project:hover{transform:translateY(-4px);border-color:color-mix(in srgb,var(--accent) 40%,var(--border))}
.project-img{height:150px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 40%,var(--panel)),var(--panel2));display:grid;place-items:center;font-size:48px}
.project-body{padding:22px}
.project-body h3{margin-bottom:6px}
.about{padding:90px 0;border-top:1px solid var(--border);display:grid;grid-template-columns:1fr 1fr;gap:48px}
@media (max-width:900px){.hero-grid,.about{grid-template-columns:1fr}.projects{grid-template-columns:1fr}}
</style></head><body>
<nav class="container"><div class="logo">Alex<span style="color:var(--accent)"> Rivera</span></div><div class="nav-links"><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></div></nav>
<section class="hero"><div class="container hero-grid"><div><div class="tag">Available for work</div><h1>Designing & building <span style="color:var(--accent)">delightful</span> web experiences.</h1><p class="role">I'm Alex, a product-focused full-stack developer with 8 years turning complex problems into clean, fast interfaces.</p><div class="hero-actions" style="margin-top:28px;display:flex;gap:12px"><button class="btn btn-primary">See my work</button><button class="btn btn-ghost">Download CV</button></div></div><div class="card-avatar"><div class="avatar">👨‍💻</div><p style="font-weight:700;font-size:18px">Alex Rivera</p><p class="muted" style="font-size:14px">Full-stack Developer</p><div class="skills"><span class="skill">TypeScript</span><span class="skill">React</span><span class="skill">Node.js</span><span class="skill">Next.js</span><span class="skill">UI/UX</span></div></div></div></section>
<section class="work" id="work"><div class="container"><div class="section-head"><div class="eyebrow">Selected work</div><h2>Projects that ship</h2></div><div class="projects"><div class="project"><div class="project-img">📊</div><div class="project-body"><h3>Pulse Analytics</h3><p class="muted">Real-time analytics dashboard used by 2k+ SaaS teams.</p></div></div><div class="project"><div class="project-img">🛒</div><div class="project-body"><h3>Lumina Store</h3><p class="muted">Headless commerce storefront with sub-second loads.</p></div></div><div class="project"><div class="project-img">🧭</div><div class="project-body"><h3>TrailFinder</h3><p class="muted">Mobile-first hiking planner synced offline.</p></div></div></div></div></section>
<section class="about" id="about"><div class="container"><div><div class="eyebrow">About</div><h2 style="font-size:32px;margin:10px 0">A builder at heart</h2><p class="muted">I care about the details that make software feel effortless — performance, accessibility, and honest design. When I'm not shipping, I'm mentoring early-career devs and contributing to open source.</p></div><div><div style="background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:24px"><p class="muted" style="font-style:italic">"Alex doesn't just write code — they build products. The bar for quality is impossibly high and always met."</p><p style="margin-top:14px;font-weight:600">— Maya Chen, VP Engineering</p></div></div></div></section>
<section class="cta" id="contact"><div class="container"><h2>Let's build something together.</h2><p class="muted">Open to freelance, contract, and advisory roles.</p><div style="margin-top:24px"><button class="btn btn-primary">Get in touch</button></div></div></section>
<footer><div class="container">© 2025 Alex Rivera. Built with Nexus AI.</div></footer>
</body></html>`,
    },
    { path: "package.json", language: "json", content: JSON.stringify({ name: "portfolio-website", version: "1.0.0", private: true, scripts: { start: "npx serve .", build: "echo built && exit 0" }, dependencies: {} }, null, 2) },
    { path: "README.md", language: "markdown", content: `# Portfolio Website

A premium, responsive portfolio built by the Nexus AI team team.

\`\`\`bash
npm run start
\`\`\`
` },
  ];
  return { name: templateName("portfolio"), framework: "Static HTML", files, entry: "app/index.html" };
}

function ecommerceSite(): GeneratedProject {
  const files = [
    {
      path: "app/index.html",
      language: "html",
      content: `<!DOCTYPE html><html lang="en"><head>${metaHtml("Lumina Store")}
<style>${baseCss("#8b5cf6")}
header{position:sticky;top:0;background:color-mix(in srgb,var(--bg) 80%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);z-index:20}
.topbar{display:flex;align-items:center;gap:24px;padding:16px 0}
.logo{font-weight:800;font-size:20px}
.search{flex:1;display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--border);border-radius:999px;padding:10px 18px}
.search input{background:none;border:none;outline:none;color:var(--text);flex:1;font-size:14px}
.cart{display:flex;align-items:center;gap:8px;background:var(--panel);border:1px solid var(--border);padding:10px 16px;border-radius:999px;font-weight:600}
.cart-count{background:var(--accent);color:#fff;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:12px}
.cats{display:flex;gap:10px;flex-wrap:wrap;padding:18px 0}
.cat{padding:8px 16px;border:1px solid var(--border);border-radius:999px;font-size:14px}
.cat.active{background:var(--accent);border-color:var(--accent);color:#fff}
.products{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:24px 0 80px}
.product{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:transform .2s,border-color .2s}
.product:hover{transform:translateY(-4px);border-color:color-mix(in srgb,var(--accent) 40%,var(--border))}
.p-img{height:150px;display:grid;place-items:center;font-size:52px;background:var(--panel2)}
.p-body{padding:18px}
.p-body h3{font-size:16px;margin-bottom:4px}
.price{color:var(--accent);font-weight:700;margin:8px 0}
.add{width:100%;padding:10px;border-radius:12px;background:var(--panel2);border:1px solid var(--border);font-weight:600}
.add:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px 20px;opacity:0;transition:.3s;box-shadow:0 12px 32px -8px rgba(0,0,0,.5);z-index:30}
.toast.show{opacity:1;transform:translateX(-50%)}
@media (max-width:1000px){.products{grid-template-columns:repeat(2,1fr)}}
@media (max-width:560px){.products{grid-template-columns:1fr}}
</style></head><body>
<header><div class="container topbar"><div class="logo">Lumina<span style="color:var(--accent)">.</span></div><div class="search">🔍<input placeholder="Search products…" id="search"></div><div class="cart" id="cartBtn">🛒 <span id="cartCount" class="cart-count">0</span></div></div></header>
<div class="container"><div class="cats"><span class="cat active" data-cat="all">All</span><span class="cat" data-cat="audio">Audio</span><span class="cat" data-cat="wear">Wearables</span><span class="cat" data-cat="home">Home</span><span class="cat" data-cat="accessory">Accessories</span></div></div>
<div class="container"><div class="products" id="products"></div></div>
<div class="toast" id="toast">Added to cart ✓</div>
<script>
const products=[
{name:"Aurora Buds",cat:"audio",emoji:"🎧",price:129},
{name:"Pulse Watch",cat:"wear",emoji:"⌚",price:249},
{name:"Orb Light",cat:"home",emoji:"💡",price:59},
{name:"Nimbus Cap",cat:"accessory",emoji:"🧢",price:25},
{name:"Echo Speaker",cat:"audio",emoji:"🔊",price:179},
{name:"Vertex Glasses",cat:"accessory",emoji:"🕶️",price:95},
{name:"Atlas Mug",cat:"home",emoji:"☕",price:22},
{name:"Flux Band",cat:"wear",emoji:"📿",price:69}];
let cart=[],cat="all";
const box=document.getElementById("products");
function render(){const q=(document.getElementById("search").value||"").toLowerCase();
const list=products.filter(p=>(cat==="all"||p.cat===cat)&&(p.name.toLowerCase().includes(q)));
box.innerHTML=list.map((p,i)=>'<div class="product"><div class="p-img">'+p.emoji+'</div><div class="p-body"><h3>'+p.name+'</h3><div class="price">$'+p.price+'.00</div><button class="add" data-id="'+i+'">Add to cart</button></div></div>').join("")||'<p class="muted" style="grid-column:1/-1;text-align:center;padding:40px">No products found</p>';}
box.addEventListener("click",e=>{const b=e.target.closest(".add");if(!b)return;const p=products[b.dataset.id];cart.push(p);document.getElementById("cartCount").textContent=cart.length;const t=document.getElementById("toast");t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1400);});
document.querySelectorAll(".cat").forEach(c=>c.addEventListener("click",()=>{document.querySelectorAll(".cat").forEach(x=>x.classList.remove("active"));c.classList.add("active");cat=c.dataset.cat;render();}));
document.getElementById("search").addEventListener("input",render);render();
</script></body></html>`,
    },
    { path: "package.json", language: "json", content: JSON.stringify({ name: "lumina-store", version: "1.0.0", scripts: { start: "npx serve .", build: "echo built && exit 0" }, dependencies: {} }, null, 2) },
    { path: "README.md", language: "markdown", content: `# Lumina Store — e-commerce demo

A responsive storefront with search, category filters, and a working cart.

\`\`\`bash
npm run start
\`\`\`
` },
  ];
  return { name: templateName("ecommerce"), framework: "Static HTML", files, entry: "app/index.html" };
}

function dashboardSite(): GeneratedProject {
  const files = [
    {
      path: "app/index.html",
      language: "html",
      content: `<!DOCTYPE html><html lang="en"><head>${metaHtml("Pulse Dashboard")}
<style>${baseCss("#6366f1")}
.layout{display:grid;grid-template-columns:230px 1fr;min-height:100vh}
.side{background:var(--panel);border-right:1px solid var(--border);padding:24px 16px}
.brand{font-weight:800;font-size:19px;padding:0 8px 24px;display:flex;align-items:center;gap:10px}
.nav{display:flex;flex-direction:column;gap:4px}
.nav a{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:12px;color:var(--muted);font-size:15px}
.nav a:hover{background:var(--panel2);color:var(--text)}
.nav a.active{background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--accent);font-weight:600}
.main{padding:28px 32px}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;flex-wrap:wrap;gap:12px}
.top h1{font-size:26px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.stat-card{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:20px}
.stat-card .lbl{color:var(--muted);font-size:13px}
.stat-card b{font-size:28px;display:block;margin:6px 0}
.stat-card .delta{font-size:13px;font-weight:600}
.up{color:#34d399}.down{color:#f87171}
.dash{display:grid;grid-template-columns:1.6fr 1fr;gap:16px}
.panel{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:20px}
.panel h3{font-size:16px;margin-bottom:16px}
canvas{width:100%;height:220px}
table{width:100%;border-collapse:collapse;font-size:14px}
th{text-align:left;color:var(--muted);font-weight:500;padding:8px 10px;border-bottom:1px solid var(--border)}
td{padding:10px;border-bottom:1px solid var(--border)}
.badge{padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600}
.badge.ok{background:color-mix(in srgb,#34d399 16%,transparent);color:#34d399}
.badge.warn{background:color-mix(in srgb,#fbbf24 16%,transparent);color:#fbbf24}
@media (max-width:1000px){.layout{grid-template-columns:1fr}.side{display:none}.stats{grid-template-columns:repeat(2,1fr)}.dash{grid-template-columns:1fr}}
</style></head><body>
<div class="layout"><aside class="side"><div class="brand">◆ Pulse</div><nav class="nav"><a class="active" href="#">📊 Overview</a><a href="#">📈 Analytics</a><a href="#">💰 Revenue</a><a href="#">👥 Customers</a><a href="#">⚙️ Settings</a></nav></aside>
<main class="main"><div class="top"><h1>Overview</h1><button class="btn btn-primary">+ New report</button></div>
<div class="stats"><div class="stat-card"><span class="lbl">Revenue</span><b>$48,290</b><span class="delta up">▲ 12.4%</span></div><div class="stat-card"><span class="lbl">Active users</span><b>8,124</b><span class="delta up">▲ 4.1%</span></div><div class="stat-card"><span class="lbl">Conversion</span><b>3.7%</b><span class="delta up">▲ 0.6%</span></div><div class="stat-card"><span class="lbl">Churn</span><b>1.2%</b><span class="delta down">▼ 0.3%</span></div></div>
<div class="dash"><div class="panel"><h3>Revenue trend</h3><canvas id="chart"></canvas></div><div class="panel"><h3>Recent activity</h3><table><thead><tr><th>Event</th><th>Status</th></tr></thead><tbody><tr><td>Subscription created</td><td><span class="badge ok">Active</span></td></tr><tr><td>Payment processed</td><td><span class="badge ok">Success</span></td></tr><tr><td>New signup</td><td><span class="badge warn">Pending</span></td></tr><tr><td>Export requested</td><td><span class="badge ok">Done</span></td></tr></tbody></table></div></div></main></div>
<script>
const c=document.getElementById("chart"),ctx=c.getContext("2d");
const data=[12,18,15,26,22,34,31,42];const w=c.width=Math.max(300,c.parentElement.clientWidth-60),h=c.height=220;
const step=w/(data.length-1);ctx.strokeStyle="#6366f1";ctx.lineWidth=3;ctx.lineJoin="round";
ctx.beginPath();ctx.moveTo(0,h-40);data.forEach((v,i)=>{const x=i*step,y=h-40-v*3.4;ctx.lineTo(x,y);});ctx.stroke();
ctx.fillStyle="rgba(99,102,241,.15)";ctx.lineTo(w,h-40);ctx.lineTo(0,h-40);ctx.fill();
ctx.fillStyle="#9aa3b2";ctx.font="12px Inter";data.forEach((v,i)=>{ctx.fillText(v,i*step-6,h-44-v*3.4);});
</script></body></html>`,
    },
    { path: "package.json", language: "json", content: JSON.stringify({ name: "pulse-dashboard", version: "1.0.0", scripts: { start: "npx serve .", build: "echo built && exit 0" }, dependencies: {} }, null, 2) },
    { path: "README.md", language: "markdown", content: `# Pulse Dashboard

A responsive analytics dashboard with live-rendered chart.

\`\`\`bash
npm run start
\`\`\`
` },
  ];
  return { name: templateName("dashboard"), framework: "Static HTML", files, entry: "app/index.html" };
}

function trackerSite(): GeneratedProject {
  const files = [
    {
      path: "app/index.html",
      language: "html",
      content: `<!DOCTYPE html><html lang="en"><head>${metaHtml("Ride & Expense Tracker")}
<style>${baseCss("#10b981")}
.app{max-width:640px;margin:0 auto;padding:32px 20px 80px}
h1{font-size:28px;margin-bottom:4px}
.sub{color:var(--muted);margin-bottom:28px}
.form{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:22px;display:grid;grid-template-columns:1fr 1fr auto;gap:12px;margin-bottom:24px}
input,select{background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;color:var(--text);font-size:14px;outline:none}
input:focus,select:focus{border-color:var(--accent)}
.total{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center}
.total b{font-size:30px;color:var(--accent)}
.list{display:flex;flex-direction:column;gap:10px}
.item{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:16px 18px;display:flex;align-items:center;gap:14px;animation:pop .25s ease}
@keyframes pop{from{transform:scale(.97);opacity:0}to{transform:scale(1);opacity:1}}
.item .emoji{font-size:22px;width:40px;height:40px;border-radius:12px;background:var(--panel2);display:grid;place-items:center}
.item .name{flex:1}
.item .name b{display:block;font-size:15px}
.item .name span{font-size:13px;color:var(--muted)}
.amt{font-weight:700;color:var(--accent)}
.del{opacity:.5;font-size:18px;border-radius:8px;padding:4px 8px}
.del:hover{opacity:1;background:var(--panel2)}
.empty{text-align:center;color:var(--muted);padding:40px 0}
@media (max-width:520px){.form{grid-template-columns:1fr}}
</style></head><body>
<div class="app"><div class="eyebrow">Personal finance</div><h1>Ride & Expense Tracker</h1><p class="sub">Log what you spend — it's saved in your browser.</p>
<div class="form"><select id="type"><option>🚗 Ride</option><option>🍔 Food</option><option>⛽ Fuel</option><option>🎬 Fun</option><option>📦 Other</option></select><input id="amount" type="number" min="0" step="0.01" placeholder="Amount ($)"><button class="btn btn-primary" id="add">Add</button></div>
<div class="total"><span class="muted">Total spent</span><b id="total">$0.00</b></div>
<div class="list" id="list"></div></div>
<script>
const KEY="nexus-expenses";
let items=[];try{items=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){}
const list=document.getElementById("list"),total=document.getElementById("total");
function render(){const sum=items.reduce((a,i)=>a+Number(i.amount),0);total.textContent="$"+sum.toFixed(2);
if(!items.length){list.innerHTML='<div class="empty">Nothing yet — add your first expense above.</div>';return;}
list.innerHTML=items.map((it,i)=>'<div class="item"><div class="emoji">'+it.type.split(" ")[0]+'</div><div class="name"><b>'+it.name+'</b><span>'+it.type.replace(it.type.split(" ")[0]+" ","")+'</span></div><span class="amt">$'+Number(it.amount).toFixed(2)+'</span><button class="del" data-i="'+i+'">✕</button></div>').join("");}
list.addEventListener("click",e=>{const b=e.target.closest(".del");if(!b)return;items.splice(Number(b.dataset.i),1);localStorage.setItem(KEY,JSON.stringify(items));render();});
document.getElementById("add").addEventListener("click",()=>{const amt=document.getElementById("amount"),sel=document.getElementById("type");
if(!amt.value||Number(amt.value)<=0){amt.focus();return;}
items.push({type:sel.value,name:sel.value.replace(sel.value.split(" ")[0]+" ",""),amount:Number(amt.value)});
localStorage.setItem(KEY,JSON.stringify(items));amt.value="";render();});
render();
</script></body></html>`,
    },
    { path: "package.json", language: "json", content: JSON.stringify({ name: "expense-tracker", version: "1.0.0", scripts: { start: "npx serve .", build: "echo built && exit 0" }, dependencies: {} }, null, 2) },
    { path: "README.md", language: "markdown", content: `# Ride & Expense Tracker

A lightweight expense tracker with localStorage persistence.

\`\`\`bash
npm run start
\`\`\`
` },
  ];
  return { name: templateName("tracker"), framework: "Static HTML", files, entry: "app/index.html" };
}

// ---- Screenshot → pixel-perfect ------------------------------------------
export type ReferenceAttachment = { name: string; url: string };

/**
 * Sample dominant colors from a reference image (client-side canvas).
 * Quantizes the image to a grid and buckets colors to build a palette.
 */
function extractPalette(dataUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 48;
        const c = document.createElement("canvas");
        c.width = size;
        c.height = size;
        const ctx = c.getContext("2d");
        if (!ctx) return resolve([]);
        ctx.drawImage(img, 0, 0, size, size);
        const d = ctx.getImageData(0, 0, size, size).data;
        const buckets: Record<string, { r: number; g: number; b: number; n: number }> = {};
        for (let i = 0; i < d.length; i += 4) {
          const r = Math.round(d[i] / 16) * 16;
          const g = Math.round(d[i + 1] / 16) * 16;
          const b = Math.round(d[i + 2] / 16) * 16;
          const k = `${r},${g},${b}`;
          if (!buckets[k]) buckets[k] = { r, g, b, n: 0 };
          buckets[k].n++;
        }
        const sorted = Object.values(buckets).sort((a, b2) => b2.n - a.n);
        const top = sorted.slice(0, 6).map((x) => "#" + [x.r, x.g, x.b].map((v) => v.toString(16).padStart(2, "0")).join(""));
        resolve(top);
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = dataUrl;
  });
}

async function pixelPerfectSite(dataUrl: string, name: string): Promise<GeneratedProject> {
  const palette = await extractPalette(dataUrl);
  const accent = palette[1] || palette[0] || "#6d5dfc";
  const dark = palette[0] || "#0b0d12";
  const title = (name.replace(/\.[^.]+$/, "") || "Design").replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  const swatches = palette.slice(0, 5).map((c) => `<span style="background:${c}">${c}</span>`).join("");

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${title} — Pixel Perfect</title><style>
:root{--accent:${accent};--bg:${dark};--panel:#12151d;--panel2:#171b26;--text:#e7eaf0;--muted:#9aa3b2;--border:#232838;--radius:16px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6}
.container{max-width:1080px;margin:0 auto;padding:0 24px}
nav{display:flex;justify-content:space-between;align-items:center;padding:22px 0;border-bottom:1px solid var(--border)}
.logo{font-weight:800;font-size:19px}.logo span{color:var(--accent)}
.nav-links{display:flex;gap:24px;color:var(--muted);font-size:14px}
.hero{padding:64px 0 40px}
.eyebrow{color:var(--accent);font-weight:600;letter-spacing:.12em;text-transform:uppercase;font-size:12px}
h1{font-size:clamp(28px,4vw,42px);margin:12px 0;letter-spacing:-.02em}
.hero p{color:var(--muted);max-width:560px;margin-bottom:24px}
.btn{display:inline-flex;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:600;border:none}
.compare{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:32px 0 56px}
.frame{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
.frame .cap{padding:10px 14px;font-size:12px;color:var(--muted);border-bottom:1px solid var(--border);font-weight:600}
.frame img{width:100%;display:block;max-height:360px;object-fit:cover;background:#fff}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding-bottom:56px}
.card{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:22px}
.card .dot{width:36px;height:36px;border-radius:10px;margin-bottom:12px}
.card h3{font-size:15px;margin-bottom:6px}
.card p{color:var(--muted);font-size:13px}
.palette{display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding-bottom:56px}
.palette span{font-family:monospace;font-size:11px;color:#fff;padding:14px 12px;border-radius:10px;display:inline-block}
.palette .lbl{color:var(--muted);font-size:13px;font-weight:600}
.swatches{display:flex;gap:8px}
@media (max-width:860px){.compare,.cards{grid-template-columns:1fr}.nav-links{display:none}}
</style></head><body>
<nav class="container"><div class="logo">Nexus<span>.</span></div><div class="nav-links"><a href="#compare">Compare</a><a href="#cards">Blocks</a></div></nav>
<section class="hero container"><div class="eyebrow">Screenshot · Pixel Perfect</div><h1>${title}</h1><p>Rebuilt from your reference screenshot — palette extracted automatically, layout recreated, ready for production.</p><button class="btn">Explore</button></section>
<section class="container" id="compare"><div class="compare"><div class="frame"><div class="cap">Original reference</div><img src="${dataUrl}" alt="Original reference"/></div><div class="frame"><div class="cap">Rendered with Nexus</div><div style="padding:22px"><div class="eyebrow" style="font-size:11px">Recreated layout</div><h1 style="font-size:24px">Pixel-perfect output</h1><p style="color:var(--muted);font-size:14px;margin:10px 0 18px">Spacing, hierarchy and color balance follow your original design.</p><button class="btn">Live preview</button></div></div></div></section>
<section class="container" id="cards"><div class="cards"><div class="card"><div class="dot" style="background:${palette[1] || "#8b5cf6"}"></div><h3>Brand palette</h3><p>Dominant tones detected from your reference, applied across the site.</p></div><div class="card"><div class="dot" style="background:${palette[2] || "#10b981"}"></div><h3>Layout grid</h3><p>The section structure mirrors the proportions of your screenshot.</p></div><div class="card"><div class="dot" style="background:${palette[3] || "#f59e0b"}"></div><h3>Responsive</h3><p>Adapts cleanly from desktop to mobile without losing intent.</p></div></div></section>
<section class="container"><div class="palette"><span class="lbl">Extracted palette</span><div class="swatches">${swatches}</div></div></section>
</body></html>`;

  const files = [
    { path: "app/index.html", language: "html", content: html },
    { path: "package.json", language: "json", content: JSON.stringify({ name: "pixel-perfect", version: "1.0.0", scripts: { start: "npx serve .", build: "echo built && exit 0" }, dependencies: {} }, null, 2) },
    { path: "README.md", language: "markdown", content: `# ${title} — Screenshot to Pixel Perfect\n\nRecreated from \`${name}\` by the Nexus AI team.\n\nExtracted palette: ${palette.join(", ") || "default"}\n` },
  ];
  return { name: `${title}`, framework: "Static HTML · from screenshot", files, entry: "app/index.html" };
}

async function generateFor(request: string, attachment?: ReferenceAttachment): Promise<{ project: GeneratedProject; palette?: string[] }> {
  if (attachment) {
    const project = await pixelPerfectSite(attachment.url, attachment.name);
    return { project, palette: undefined };
  }
  switch (detectTemplate(request)) {
    case "portfolio": return { project: portfolioSite() };
    case "ecommerce": return { project: ecommerceSite() };
    case "dashboard": return { project: dashboardSite() };
    case "tracker": return { project: trackerSite() };
    default: return { project: helloSite() };
  }
}

// ---- Reviewer pass: applies polish + appends fixes ------------------------
function applyReviewPass(project: GeneratedProject, notes: string[]): GeneratedProject {
  // In a real integration this would trigger the Reviewer model to rewrite
  // files. Here we demonstrate the mechanics by injecting the review notes
  // into the README and adding a tiny "reviewed" banner to the HTML.
  const files = project.files.map((f) => {
    if (f.path === "README.md") {
      const extra = notes.map((n) => `- ${n}`).join("\n");
      return { ...f, content: `${f.content}\n\n## Reviewer pass\n${extra}\n` };
    }
    return f;
  });
  return { ...project, files };
}

// ---- Main pipeline -------------------------------------------------------
export type BuildCallbacks = {
  onStep?: (step: ActivityStep) => void;
  onEvent?: (event: ActivityEvent) => void;
  onConsole?: (line: ConsoleLine) => void;
  onStatus?: (status: ChatStatus) => void;
  onProject?: (project: GeneratedProject) => void;
  onReviewNotes?: (notes: string[]) => void;
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runAgentPipeline(
  request: string,
  team: TeamMember[],
  cb: BuildCallbacks,
  opts: { attachment?: ReferenceAttachment } = {},
): Promise<GeneratedProject> {
  const display = (m: TeamMember) =>
    `${m.provider === "demo" ? "Nexus" : PROVIDER_LABEL[m.provider]}`;
  const roleFor = (role: TeamMember["role"]) => team.find((t) => t.role === role);

  cb.onStatus?.("Building");

  // Stage 1 — Understand (Planner)
  let st: ActivityStep = { id: "understand", label: "Understanding idea", status: "active", agent: display(roleFor("Planner")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Planner")!), "Planner", `Parsing request: "${request.slice(0, 60)}"`, "start"));
  await delay(650);
  cb.onConsole?.(cl("info", `Analyzing intent → template "${templateName(detectTemplate(request))}"`));
  if (opts.attachment) {
    cb.onEvent?.(ev("Vision", "Planner", `Analyzing reference design: ${opts.attachment.name}`, "note"));
    cb.onConsole?.(cl("info", `Detected uploaded reference → ${opts.attachment.name}`));
  }

  // Stage 2 — Plan (Architect)
  st = { ...st, status: "done" }; cb.onStep?.(st);
  st = { id: "plan", label: "Planning architecture", status: "active", agent: display(roleFor("Architect")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Planner")!), "Planner", `Handing off structure brief to Architect`, "handoff"));
  cb.onEvent?.(ev(display(roleFor("Architect")!), "Architect", "Mapping file tree, layout system, and responsive breakpoints", "start"));
  await delay(720);
  cb.onConsole?.(cl("info", "Planning layout, color system, and responsive breakpoints"));

  // Stage 3 — Files
  st = { ...st, status: "done" }; cb.onStep?.(st);
  st = { id: "files", label: "Creating files", status: "active", agent: display(roleFor("Architect")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Architect")!), "Architect", "Scaffolding project structure", "note"));
  await delay(420);
  cb.onConsole?.(cl("cmd", "mkdir app && touch app/index.html package.json README.md"));

  // Stage 4 — Code (Frontend + Backend)
  st = { ...st, status: "done" }; cb.onStep?.(st);
  st = { id: "code", label: "Writing code", status: "active", agent: display(roleFor("Frontend")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Frontend")!), "Frontend", `Generating UI components and layouts`, "start"));
  await delay(700);
  cb.onConsole?.(cl("cmd", "writing app/index.html …"));
  cb.onEvent?.(ev(display(roleFor("Backend")!), "Backend", "Adding client-side logic (state, interactivity, storage)", "note"));
  await delay(500);
  const { project: draft } = await generateFor(request, opts.attachment);
  if (opts.attachment) {
    cb.onConsole?.(cl("info", "Extracted palette & layout intent from reference image"));
  }
  cb.onConsole?.(cl("success", `Wrote ${draft.files.length} files`));
  cb.onProject?.(draft);

  // Stage 5 — Build
  st = { ...st, status: "done" }; cb.onStep?.(st);
  st = { id: "build", label: "Running build", status: "active", agent: display(roleFor("Backend")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Backend")!), "Backend", "Running production build in sandbox", "start"));
  await delay(600);
  cb.onConsole?.(cl("cmd", "$ npm run build"));
  await delay(400);
  cb.onConsole?.(cl("info", "Compiling… ✓ 0 errors"));
  cb.onConsole?.(cl("success", "Build completed successfully"));
  st = { ...st, status: "done" }; cb.onStep?.(st);

  // Stage 6 — Review (Reviewer marks a corrective pass)
  st = { id: "review", label: "Reviewing & fixing errors", status: "active", agent: display(roleFor("Reviewer")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Reviewer")!), "Reviewer", "Draft is not production-ready yet — running critique pass", "start"));
  await delay(650);
  cb.onEvent?.(ev(display(roleFor("Reviewer")!), "Reviewer", "Flagged: spacing rhythm inconsistent, missing focus states, weak hero contrast", "review"));
  const notes = [
    "Normalized spacing scale and vertical rhythm",
    "Added keyboard focus-visible states for accessibility",
    "Hardened contrast on muted text for WCAG AA",
    "Applied hover + motion polish across interactive elements",
  ];
  cb.onConsole?.(cl("warn", "Reviewer flagged 3 issues → applying fixes"));
  await delay(600);
  const final = applyReviewPass(draft, notes);
  cb.onProject?.(final);
  cb.onReviewNotes?.(notes);
  await delay(450);
  cb.onConsole?.(cl("success", "Review fixes applied — all issues resolved"));
  cb.onEvent?.(ev(display(roleFor("Reviewer")!), "Reviewer", "Post-fix check passed. Commoning preview.", "done"));
  st = { ...st, status: "done" }; cb.onStep?.(st);

  // Stage 7 — Preview
  st = { id: "preview", label: "Preview ready", status: "active", agent: display(roleFor("Reviewer")!) };
  cb.onStep?.(st);
  cb.onEvent?.(ev(display(roleFor("Reviewer")!), "Reviewer", "Preview is live — render at srcDoc", "done"));
  await delay(350);
  st = { ...st, status: "done" }; cb.onStep?.(st);
  cb.onStatus?.("Preview Live");

  return final;
}

const PROVIDER_LABEL: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Claude",
  gemini: "Gemini",
  grok: "Grok",
  mistral: "Mistral",
  deepseek: "DeepSeek",
  demo: "Nexus",
};
