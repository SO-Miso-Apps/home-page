/** Shared types for the blog pipeline. Nothing here performs I/O. */

export type AppId = "history-revert" | "auto-tags";

export type Intent = "intro" | "guide" | "compare" | "tips" | "troubleshoot";

export type CategorySlug = "product-updates" | "merchant-playbook";

export type FigureTemplate = "og-card" | "flow" | "timeline" | "compare-table" | "rule-tree";

/* ---------------------------------------------------------------- Portable Text */

export type MarkDef = { _key: string; _type: string; href?: string };

export type BlockChild = { _type: "span"; _key: string; text: string; marks?: string[] };

export type TextBlock = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: MarkDef[];
  children: BlockChild[];
  listItem?: "bullet" | "number";
  level?: number;
};

export type ImageBlock = {
  _type: "image";
  _key: string;
  alt?: string;
  asset?: { id?: string; url?: string };
};

export type CodeBlock = { _type: "code"; _key: string; code: string; language?: string };

export type PortableBlock = TextBlock | ImageBlock | CodeBlock;

/* ---------------------------------------------------------------- Pipeline values */

export type FigureSpec = {
  template: FigureTemplate;
  eyebrow: string;
  headline: string;
  rows: { label: string; value: string }[];
  note?: string;
};

export type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  used_facts: string[];
  internal_links: string[];
  content: PortableBlock[];
  figure: FigureSpec;
};

export type CritiqueScores = {
  factuality: number;
  specificity: number;
  originality: number;
  seo: number;
  usefulness: number;
};

export type Critique = {
  scores: CritiqueScores;
  violations: { kind: string; quote: string; why: string }[];
  verdict: "pass" | "fail";
  rewrite_notes: string;
};

export type GateFailure = { code: string; detail: string };

export type GateResult = { ok: boolean; failures: GateFailure[] };

export type LedgerEntry = {
  topicId: string;
  app: AppId;
  date: string;
  entryId: string;
  slug: string;
  mediaId: string;
  scores: Partial<CritiqueScores>;
  site: string;
};

export type Ledger = { runs: LedgerEntry[] };

/* ---------------------------------------------------------------- EmDash HTTP */

export type DraftBody = {
  slug: string;
  status?: string;
  data: {
    title: string;
    excerpt: string;
    content: PortableBlock[];
    og_image: { id: string };
  };
  seo: { title: string; description: string; image: string };
  taxonomies: Record<string, string[]>;
};

export type MediaItem = {
  id: string;
  mimeType: string;
  size: number;
  status?: string;
  url?: string;
  storageKey?: string;
};

export type CreatedEntry = { id: string; slug: string; status: string };
