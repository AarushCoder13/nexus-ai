// =============================================================
// Nexus AI — server-side HTML sanitization
// Published projects are served publicly at /p/[slug]. We sanitize
// project HTML before persisting so that LLM output or prompt
// injection cannot plant executable scripts / event handlers that
// run in a viewer's browser (stored XSS).
// =============================================================
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", { url: "http://localhost/" });
const DOMPurify = createDOMPurify(dom.window);

/** Sanitize HTML/SVG markup. Strips <script>, event handlers, and dangerous URIs. */
export function sanitizeMarkup(raw: string): string {
  return DOMPurify.sanitize(raw, {
    // Keep inline styles (needed by generated pages) but forbid script-bearing output.
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["srcdoc", "formaction", "xlink:href"],
  });
}
