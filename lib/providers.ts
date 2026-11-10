// =============================================================
// Nexus AI — LLM provider adapters + fallback orchestration
// Shared by /api/chat and /api/build. Keys are supplied per
// request by the client and never persisted server-side.
// =============================================================
import type { AgentRole, ProviderId } from "./types";
import { PROVIDERS } from "./types";

export type TeamRequest = { provider: ProviderId; role: AgentRole; key: string };

async function callOpenAI(key: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: PROVIDERS.find((p) => p.id === "openai")!.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2200,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(key: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: PROVIDERS.find((p) => p.id === "anthropic")!.model,
      max_tokens: 2200,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}`);
  const data = await res.json();
  return data.content?.map((c: { type: string; text: string }) => c.text).join("") ?? "";
}

async function callGemini(key: string, prompt: string): Promise<string> {
  const model = PROVIDERS.find((p) => p.id === "gemini")!.model;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join("") ?? "";
}

async function callGrok(key: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: PROVIDERS.find((p) => p.id === "grok")!.model,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Grok ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callMistral(key: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: PROVIDERS.find((p) => p.id === "mistral")!.model,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Mistral ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callDeepSeek(key: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: PROVIDERS.find((p) => p.id === "deepseek")!.model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

const ADAPTERS: Record<Exclude<ProviderId, "demo">, (k: string, p: string) => Promise<string>> = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  gemini: callGemini,
  grok: callGrok,
  mistral: callMistral,
  deepseek: callDeepSeek,
};

function roleRank(r: AgentRole): number {
  const order: AgentRole[] = ["Planner", "Architect", "Frontend", "Backend", "Reviewer"];
  return order.indexOf(r);
}

/**
 * Call the team's configured providers in order until one returns text.
 * Returns the text plus which provider served the request.
 */
export async function runWithFallback(team: TeamRequest[], prompt: string): Promise<{
  text: string;
  provider: ProviderId;
  usedFallback: boolean;
}> {
  const ordered = [...team].sort((a, b) => roleRank(a.role) - roleRank(b.role));
  for (const member of ordered) {
    if (member.provider === "demo" || !member.key) continue;
    const adapter = ADAPTERS[member.provider as Exclude<ProviderId, "demo">];
    if (!adapter) continue;
    try {
      const text = await adapter(member.key, prompt);
      if (text) return { text, provider: member.provider, usedFallback: false };
    } catch {
      // fall through to next provider
    }
  }
  throw new Error("No working provider key available for this role.");
}
