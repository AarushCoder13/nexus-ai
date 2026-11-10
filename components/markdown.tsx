import React from "react";
import { cn } from "@/lib/utils";

// Minimal, safe Markdown renderer for AI messages.
// Renders to React elements — never injects raw HTML.

function escapeHtml(s: string): string {
  // React escapes text by default, so we only guard the literal < > chars;
  // leaving "&" intact avoids rendering artifacts like "&amp;".
  return s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // order matters: code spans first, then bold, then emphasis, then links
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(<span key={`${keyPrefix}t${i++}`}>{escapeHtml(text.slice(last, m.index))}</span>);
    if (m[1]) {
      nodes.push(
        <code key={`${keyPrefix}c${i++}`} className="rounded-md bg-foreground/10 px-1.5 py-0.5 font-mono text-[13px]">
          {escapeHtml(m[1].slice(1, -1))}
        </code>,
      );
    } else if (m[2]) {
      nodes.push(<strong key={`${keyPrefix}b${i++}`}>{renderInline(m[2].slice(2, -2), `${keyPrefix}b${i}`)}</strong>);
    } else if (m[3]) {
      nodes.push(<em key={`${keyPrefix}e${i++}`}>{escapeHtml(m[3].slice(1, -1))}</em>);
    } else if (m[4]) {
      nodes.push(
        <a key={`${keyPrefix}a${i++}`} href={m[6]} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
          {escapeHtml(m[5])}
        </a>,
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(<span key={`${keyPrefix}t${i++}`}>{escapeHtml(text.slice(last))}</span>);
  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let codeBlock: string[] = [];
  let codeLang = "";

  const flushCode = (key: number) => {
    if (codeBlock.length) {
      out.push(
        <pre key={`code${key}`} className="my-3 overflow-x-auto rounded-2xl border border-border bg-secondary/80 p-4 font-mono text-[13px] leading-relaxed text-foreground">
          <code>{codeBlock.join("\n")}</code>
        </pre>,
      );
      codeBlock = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      flushCode(i);
      codeLang = fence[1];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeBlock.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      continue;
    }
    if (/^#{1,4}\s/.test(line)) {
      flushCode(i);
      const level = line.match(/^(#+)/)![1].length;
      const text = line.replace(/^#+\s/, "");
      const Tag = `h${Math.min(level + 1, 4)}` as "h2" | "h3" | "h4" | "h5";
      const cls = level === 1 ? "text-lg font-bold mt-1" : level === 2 ? "text-base font-semibold mt-1" : "text-sm font-semibold";
      out.push(<Tag key={`h${i}`} className={cls}>{renderInline(text, `h${i}`)}</Tag>);
      i++;
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      flushCode(i);
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(<li key={`li${i}`}>{renderInline(lines[i].replace(/^[-*]\s/, ""), `li${i}`)}</li>);
        i++;
      }
      out.push(<ul key={`ul${i}`} className="my-2 list-disc space-y-1 pl-5">{items}</ul>);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      flushCode(i);
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={`ol${i}`}>{renderInline(lines[i].replace(/^\d+\.\s/, ""), `ol${i}`)}</li>);
        i++;
      }
      out.push(<ol key={`ol${i}`} className="my-2 list-decimal space-y-1 pl-5">{items}</ol>);
      continue;
    }
    if (/^>\s?/.test(line)) {
      flushCode(i);
      const quote: React.ReactNode[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(<p key={`q${i}`}>{renderInline(lines[i].replace(/^>\s?/, ""), `q${i}`)}</p>);
        i++;
      }
      out.push(
        <blockquote key={`bq${i}`} className="my-2 border-l-2 border-primary pl-3 text-muted-foreground">
          {quote}
        </blockquote>,
      );
      continue;
    }
    const trimmed = line.trim();
    if (trimmed === "") {
      flushCode(i);
      i++;
      continue;
    }
    out.push(<p key={`p${i}`} className="my-1.5">{renderInline(trimmed, `p${i}`)}</p>);
    i++;
  }
  flushCode(i);
  return <div className={cn("text-[14px] leading-relaxed")}>{out}</div>;
}
