"use client";

import React, { useState } from "react";
import {
  Boxes,
  Check,
  ChevronRight,
  CreditCard,
  Layout,
  MessageSquare,
  Navigation,
  Plus,
  Rows3,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ComponentCategory =
  | "All"
  | "Hero"
  | "Features"
  | "Pricing"
  | "Testimonials"
  | "Navigation"
  | "Footers"
  | "CTA";

type ComponentBlock = {
  id: string;
  category: ComponentCategory;
  title: string;
  description: string;
  badge: string;
  promptInstruction: string;
  previewSnippet: string;
};

const BLOCKS: ComponentBlock[] = [
  {
    id: "hero-gradient",
    category: "Hero",
    title: "Gradient Bento Hero",
    description: "High-impact hero with glowing radial gradient, bold headline, primary & secondary CTAs, and a 3-stat metric bar.",
    badge: "Popular",
    promptInstruction: "Add a modern Gradient Bento Hero section with glowing radial gradient background, bold headline, two pill CTA buttons, and a 3-metric statistics counter bar (e.g. 10k+ users, 99.9% uptime, 2.4s speed).",
    previewSnippet: "⚡ Headline + Subtitle + [Get Started] [Live Demo] + 3 Stat Badges",
  },
  {
    id: "hero-split",
    category: "Hero",
    title: "Split Media Hero",
    description: "Left text column with badge & CTA, right interactive mock card with glassmorphism effect.",
    badge: "Clean",
    promptInstruction: "Add a Split Layout Hero with headline and email signup on the left, and an interactive glassmorphic product dashboard mockup card on the right.",
    previewSnippet: "Left: Text & Inputs · Right: Glassmorphic Preview Card",
  },
  {
    id: "features-grid",
    category: "Features",
    title: "3-Column Feature Cards",
    description: "Three responsive cards with colorful icon badges, crisp descriptions, and subtle hover lift animation.",
    badge: "Essential",
    promptInstruction: "Insert a 3-column features section highlighting key benefits with colorful icon containers, clean titles, body copy, and hover lift effects.",
    previewSnippet: "Card 1: Lightning Fast · Card 2: Bank-Grade Security · Card 3: 24/7 AI Sync",
  },
  {
    id: "features-bento",
    category: "Features",
    title: "Modern Bento Grid",
    description: "Asymmetrical 4-block bento grid highlighting main capability in a large card, plus 3 complementary mini-cards.",
    badge: "Modern",
    promptInstruction: "Add an asymmetrical 4-block Bento Grid showcase highlighting the flagship feature in a double-wide card and 3 compact feature tiles.",
    previewSnippet: "Large Hero Card (2 cols) + 2 Vertical Feature Cards",
  },
  {
    id: "pricing-tier",
    category: "Pricing",
    title: "3-Tier SaaS Pricing Table",
    description: "Free, Pro (highlighted with 'Popular' badge), and Enterprise tiers with monthly/yearly pricing and feature checklists.",
    badge: "High Conversion",
    promptInstruction: "Add a clean 3-tier SaaS pricing table (Starter $0, Pro $29/mo with popular badge and glowing border, Enterprise $99/mo) with checkmark feature lists and prominent CTA buttons.",
    previewSnippet: "Free ($0) · Pro ($29/mo) [Popular] · Enterprise ($99/mo)",
  },
  {
    id: "testimonials-wall",
    category: "Testimonials",
    title: "Social Proof Reviews Wall",
    description: "Grid of 3 customer feedback cards with 5-star ratings, quotes, avatar initials, and company designations.",
    badge: "Trust",
    promptInstruction: "Add a social proof testimonial section featuring 3 customer review cards with 5 yellow star ratings, testimonial quotes, avatar badges, and author roles.",
    previewSnippet: "⭐⭐⭐⭐⭐ 'Saved our team 20 hours a week' — Sarah K., CTO",
  },
  {
    id: "navbar-floating",
    category: "Navigation",
    title: "Floating Island Navbar",
    description: "Sticky pill navbar with backdrop-filter blur, logo, nav links (Features, Pricing, Docs), and 'Sign In' button.",
    badge: "Sleek",
    promptInstruction: "Add a floating island sticky navbar with rounded pill border, backdrop-blur effect, logo, navigation links, and an action button.",
    previewSnippet: "[Logo]  Features · Pricing · Docs  [Get Started]",
  },
  {
    id: "footer-columns",
    category: "Footers",
    title: "Multi-Column Modern Footer",
    description: "4-column footer with brand blurb, Product, Resources, Company links, social icons, and copyright row.",
    badge: "Complete",
    promptInstruction: "Add a multi-column modern footer with logo, description, Product/Company/Legal links columns, and bottom copyright line.",
    previewSnippet: "Brand Column + 3 Link Columns + Copyright & Socials",
  },
  {
    id: "cta-banner",
    category: "CTA",
    title: "High-Conversion CTA Banner",
    description: "Gradient card with high-impact invitation, inline email input box, and 'Join waitlist / Get Started' button.",
    badge: "Urgent",
    promptInstruction: "Add an eye-catching full-width Call to Action banner with rich gradient background, compelling headline, and an inline email input button.",
    previewSnippet: "Ready to launch? Enter email: [your@email.com] [Start Now]",
  },
];

export function ComponentLibrary() {
  const [selectedCat, setSelectedCat] = useState<ComponentCategory>("All");
  const [insertingId, setInsertingId] = useState<string | null>(null);
  const sendMessage = useStore((s) => s.sendMessage);
  const running = useStore((s) => s.running);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const categories: ComponentCategory[] = [
    "All",
    "Hero",
    "Features",
    "Pricing",
    "Testimonials",
    "Navigation",
    "Footers",
    "CTA",
  ];

  const filtered = BLOCKS.filter(
    (b) => selectedCat === "All" || b.category === selectedCat,
  );

  const handleInsert = async (block: ComponentBlock) => {
    if (running) {
      toast.info("An agent build is currently in progress. Please wait a moment.");
      return;
    }

    setInsertingId(block.id);
    toast.success(`Agent team is inserting "${block.title}" into the project…`);
    try {
      await sendMessage(block.promptInstruction);
      setActiveTab("preview");
    } finally {
      setInsertingId(null);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Boxes className="h-4 w-4" />
          </span>
          <h2 className="text-base font-bold text-foreground">UI Component & Block Library</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Click any block to have your multi-agent team assemble and integrate it into your current project layout.
        </p>
      </div>

      {/* Category filters */}
      <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              selectedCat === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Block cards */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {filtered.map((block) => {
          const isInserting = insertingId === block.id;

          return (
            <div
              key={block.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{block.title}</span>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {block.badge}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {block.description}
                </p>

                {/* Micro preview wireframe */}
                <div className="mt-3 rounded-xl border border-border/80 bg-secondary/40 p-2 font-mono text-[11px] text-muted-foreground">
                  {block.previewSnippet}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {block.category}
                </span>

                <Button
                  size="sm"
                  disabled={running}
                  onClick={() => handleInsert(block)}
                  className="gap-1.5 text-xs h-8"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isInserting ? "Inserting…" : "Insert Block"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
