// =============================================================
// Nexus AI — LLM provider adapters + fallback orchestration
// Shared by /api/chat and /api/build. Keys are supplied per
// request by the client and never persisted server-side.
// =============================================================
import type { AgentRole, ProviderId } from "./types";
import { PROVIDERS } from "./types";

export type TeamRequest = { provider: ProviderId; role: AgentRole; key: string };

async function callOpenAI(key: string, prompt: string): Promise<string> {
  const cleanKey = (key || "").trim();
  const model = PROVIDERS.find((p) => p.id === "openai")?.model || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cleanKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || `OpenAI error ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(key: string, prompt: string): Promise<string> {
  const cleanKey = (key || "").trim();
  const model = PROVIDERS.find((p) => p.id === "anthropic")?.model || "claude-3-5-sonnet-latest";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": cleanKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || `Claude error ${res.status}`);
  }
  const data = await res.json();
  return data.content?.map((c: { type: string; text: string }) => c.text).join("") ?? "";
}

async function callGemini(key: string, prompt: string): Promise<string> {
  const cleanKey = (key || "").trim();
  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
  let lastErr: any = null;

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 8192,
            },
          }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const msg = err?.error?.message || `Gemini error ${res.status}`;
        lastErr = new Error(msg);
        if (res.status === 404 || msg.toLowerCase().includes("not found")) continue;
        throw lastErr;
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") ?? "";
      if (!text && data.candidates?.[0]?.finishReason) {
        throw new Error(`Gemini response: ${data.candidates[0].finishReason}`);
      }
      return text;
    } catch (e: any) {
      lastErr = e;
      if (e.message && (e.message.includes("not found") || e.message.includes("404"))) continue;
      throw e;
    }
  }
  throw lastErr || new Error("Gemini generation failed.");
}

async function callGrok(key: string, prompt: string): Promise<string> {
  const cleanKey = (key || "").trim();
  const model = PROVIDERS.find((p) => p.id === "grok")?.model || "grok-beta";
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cleanKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || `Grok error ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callMistral(key: string, prompt: string): Promise<string> {
  const cleanKey = (key || "").trim();
  const model = PROVIDERS.find((p) => p.id === "mistral")?.model || "mistral-large-latest";
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cleanKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || `Mistral error ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callDeepSeek(key: string, prompt: string): Promise<string> {
  const cleanKey = (key || "").trim();
  const model = PROVIDERS.find((p) => p.id === "deepseek")?.model || "deepseek-chat";
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cleanKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || `DeepSeek error ${res.status}`);
  }
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
 * Verifies a single key by making a lightweight 1-token test call.
 */
export async function verifySingleKey(provider: ProviderId, key: string): Promise<{ ok: boolean; message: string }> {
  if (provider === "demo") return { ok: true, message: "Demo mode requires no key." };
  const adapter = ADAPTERS[provider as Exclude<ProviderId, "demo">];
  if (!adapter) return { ok: false, message: `Unknown provider: ${provider}` };
  try {
    const text = await adapter((key || "").trim(), "Say 'OK' in one word.");
    if (text) return { ok: true, message: "Key verified successfully!" };
    return { ok: false, message: "Model returned an empty test response." };
  } catch (err: any) {
    return { ok: false, message: err?.message || String(err) };
  }
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
  const errors: string[] = [];
  const tried = new Set<string>();

  for (const member of ordered) {
    if (member.provider === "demo" || !member.key) continue;
    const cleanKey = member.key.trim();
    const cacheKey = `${member.provider}:${cleanKey}`;
    if (tried.has(cacheKey)) continue; // Don't try the exact same failing key multiple times
    tried.add(cacheKey);

    const adapter = ADAPTERS[member.provider as Exclude<ProviderId, "demo">];
    if (!adapter) continue;
    try {
      const text = await adapter(cleanKey, prompt);
      if (text) return { text, provider: member.provider, usedFallback: false };
    } catch (err: any) {
      const msg = `${member.provider}: ${err?.message || String(err)}`;
      errors.push(msg);
      console.error(`[Nexus AI] Provider error: ${msg}`);
    }
  }

  throw new Error(errors.length > 0 ? errors.join("; ") : "No working provider key available.");
}
