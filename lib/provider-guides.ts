// =============================================================
// Nexus AI — AI Provider Guides & API Key Helper Documentation
// Clear, non-technical instructions and direct links for each AI provider.
// =============================================================

export interface ProviderGuide {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  badgeColor?: string;
  websiteUrl: string;
  getKeyUrl: string;
  keyPrefix: string;
  placeholder: string;
  freeTier: boolean;
  recommendedFor: string;
  steps: {
    number: number;
    title: string;
    description: string;
  }[];
  tip?: string;
}

export const PROVIDER_GUIDES: Record<string, ProviderGuide> = {
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    tagline: "Gemini 1.5 Flash & Pro — Fast, versatile, with generous free tier",
    badge: "Free Tier Available",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    websiteUrl: "https://aistudio.google.com",
    getKeyUrl: "https://aistudio.google.com/app/apikey",
    keyPrefix: "AIzaSy...",
    placeholder: "AIzaSy...",
    freeTier: true,
    recommendedFor: "Best for beginners — 100% free with your Google account!",
    steps: [
      {
        number: 1,
        title: "Open Google AI Studio",
        description: "Click the 'Get Key' button to open aistudio.google.com and sign in with your regular Google account.",
      },
      {
        number: 2,
        title: "Click 'Get API Key'",
        description: "In the top left menu or dashboard, click the blue button that says 'Get API key' (or 'Create API key').",
      },
      {
        number: 3,
        title: "Create a Key in a Project",
        description: "Choose 'Create API key in new project' or select an existing Google Cloud project.",
      },
      {
        number: 4,
        title: "Copy and Paste",
        description: "Copy your new key (it starts with 'AIzaSy') and paste it into the box below. That's it!",
      },
    ],
    tip: "Google offers a completely free tier with high rate limits, making it the easiest way to start without entering a credit card.",
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    tagline: "GPT-4o & GPT-4o-mini — The industry standard for coding and reasoning",
    badge: "Most Popular",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    websiteUrl: "https://platform.openai.com",
    getKeyUrl: "https://platform.openai.com/api-keys",
    keyPrefix: "sk-proj-...",
    placeholder: "sk-proj-...",
    freeTier: false,
    recommendedFor: "Exceptional code generation and complex multi-file architectural planning.",
    steps: [
      {
        number: 1,
        title: "Go to OpenAI Platform",
        description: "Click 'Get Key' to visit platform.openai.com/api-keys. Sign in or sign up if you haven't yet.",
      },
      {
        number: 2,
        title: "Navigate to API Keys",
        description: "Click on 'API keys' in the left sidebar menu under Dashboard.",
      },
      {
        number: 3,
        title: "Create a New Secret Key",
        description: "Click the green button '+ Create new secret key'. You can name it 'Nexus AI'.",
      },
      {
        number: 4,
        title: "Copy Immediately",
        description: "Copy the key that pops up (starts with 'sk-'). Note: OpenAI only shows this once! Paste it right here.",
      },
    ],
    tip: "Make sure you have added a few dollars of credit in your OpenAI Billing settings (e.g. $5 is enough for hundreds of app builds).",
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic Claude",
    tagline: "Claude 3.5 Sonnet — World-class coding, UI design, and front-end magic",
    badge: "Top Coder",
    badgeColor: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    websiteUrl: "https://console.anthropic.com",
    getKeyUrl: "https://console.anthropic.com/settings/keys",
    keyPrefix: "sk-ant-...",
    placeholder: "sk-ant-...",
    freeTier: false,
    recommendedFor: "Highest rated model for frontend styling, UI widgets, and clean code.",
    steps: [
      {
        number: 1,
        title: "Go to Anthropic Console",
        description: "Click 'Get Key' to open console.anthropic.com and log in with your email or Google.",
      },
      {
        number: 2,
        title: "Click on API Keys",
        description: "In your dashboard, click on 'API Keys' under Settings in the top or side menu.",
      },
      {
        number: 3,
        title: "Generate Key",
        description: "Click '+ Create Key', name it 'Nexus Workspace', and click Create.",
      },
      {
        number: 4,
        title: "Copy and Paste",
        description: "Copy the key that starts with 'sk-ant-api03-' and paste it into the field here.",
      },
    ],
    tip: "Claude 3.5 Sonnet produces stunning, modern UI designs right out of the box.",
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    tagline: "DeepSeek-V3 & DeepSeek-R1 — Insanely low cost, top-tier programming intelligence",
    badge: "Super Cheap",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    websiteUrl: "https://platform.deepseek.com",
    getKeyUrl: "https://platform.deepseek.com/api_keys",
    keyPrefix: "sk-...",
    placeholder: "sk-...",
    freeTier: false,
    recommendedFor: "High-volume code generation at 95% lower cost than other providers.",
    steps: [
      {
        number: 1,
        title: "Visit DeepSeek Platform",
        description: "Click 'Get Key' to open platform.deepseek.com and register or log in.",
      },
      {
        number: 2,
        title: "Open API Keys",
        description: "In the left-hand navigation bar, click on 'API Keys'.",
      },
      {
        number: 3,
        title: "Create New Key",
        description: "Click the blue 'Create API Key' button, type a name like 'Nexus', and confirm.",
      },
      {
        number: 4,
        title: "Paste into Nexus",
        description: "Copy the key that appears and paste it into the DeepSeek field.",
      },
    ],
    tip: "DeepSeek models cost pennies per million tokens. Very budget friendly!",
  },
  grok: {
    id: "grok",
    name: "xAI Grok",
    tagline: "Grok 2 — Fast, witty, and powerful real-time reasoning",
    badge: "Real-time AI",
    badgeColor: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
    websiteUrl: "https://console.x.ai",
    getKeyUrl: "https://console.x.ai/",
    keyPrefix: "xai-...",
    placeholder: "xai-...",
    freeTier: false,
    recommendedFor: "Direct access to xAI's flagship Grok models.",
    steps: [
      {
        number: 1,
        title: "Visit xAI Console",
        description: "Click 'Get Key' to open console.x.ai and sign in with your X (Twitter) or email account.",
      },
      {
        number: 2,
        title: "Go to API Keys",
        description: "Select API Keys from the side navigation.",
      },
      {
        number: 3,
        title: "Create Key",
        description: "Click 'Create API Key', set permissions, and generate your token.",
      },
      {
        number: 4,
        title: "Paste into Nexus",
        description: "Copy your key (starts with 'xai-') and paste it here.",
      },
    ],
  },
  mistral: {
    id: "mistral",
    name: "Mistral AI",
    tagline: "Codestral & Mistral Large — European state-of-the-art open models",
    badge: "Open Weights Leader",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    websiteUrl: "https://console.mistral.ai",
    getKeyUrl: "https://console.mistral.ai/api-keys/",
    keyPrefix: "mis_...",
    placeholder: "mis_...",
    freeTier: false,
    recommendedFor: "Codestral is specifically trained on 80+ programming languages.",
    steps: [
      {
        number: 1,
        title: "Open Mistral Console",
        description: "Click 'Get Key' to open console.mistral.ai and log in.",
      },
      {
        number: 2,
        title: "Go to Codestral / API Keys",
        description: "Select 'Codestral API Keys' or 'API Keys' in the sidebar.",
      },
      {
        number: 3,
        title: "Create Key",
        description: "Click 'Create new key', label it 'Nexus', and generate.",
      },
      {
        number: 4,
        title: "Paste into Nexus",
        description: "Copy your key and paste it into the Mistral input box.",
      },
    ],
  },
};
