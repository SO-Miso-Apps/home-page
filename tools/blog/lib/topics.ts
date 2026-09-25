/** Topic calendar: what to write, for whom, and from which facts. */

import { readFileSync } from "node:fs";
import type { CategorySlug, FigureTemplate, Intent } from "./types.ts";

export type Topic = {
  id: string;
  intent: Intent;
  titleHint: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  category: CategorySlug;
  factsRequired: string[];
  internalLinks: string[];
  figure: FigureTemplate;
  notes?: string;
};

const INTENTS: Intent[] = ["intro", "guide", "compare", "tips", "troubleshoot"];
const CATEGORIES: CategorySlug[] = ["product-updates", "merchant-playbook"];
const FIGURES: FigureTemplate[] = ["og-card", "flow", "timeline", "compare-table", "rule-tree"];
const FACT_ID = /^[A-Z]{2}-\d{2}$/;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

type RawTopic = Record<string, unknown>;

function field(raw: RawTopic, key: string, id: string): unknown {
  if (!(key in raw)) throw new Error(`topic ${id}: missing required key ${key}`);
  return raw[key];
}

function asString(raw: RawTopic, key: string, id: string): string {
  const value = field(raw, key, id);
  if (typeof value !== "string" || value.trim() === "") throw new Error(`topic ${id}: ${key} must be a non-empty string`);
  return value;
}

function asStringArray(raw: RawTopic, key: string, id: string): string[] {
  const value = field(raw, key, id);
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`topic ${id}: ${key} must be an array of strings`);
  }
  return value as string[];
}

export function validateTopic(raw: unknown): Topic {
  if (typeof raw !== "object" || raw === null) throw new Error("topic: entry must be an object");
  const record = raw as RawTopic;
  const id = typeof record.id === "string" ? record.id : "";
  if (!KEBAB.test(id)) throw new Error(`topic ${String(record.id)}: id must be kebab-case`);

  const intent = asString(record, "intent", id);
  if (!INTENTS.includes(intent as Intent)) throw new Error(`topic ${id}: intent must be one of ${INTENTS.join(", ")}`);

  const category = asString(record, "category", id);
  if (!CATEGORIES.includes(category as CategorySlug)) {
    throw new Error(`topic ${id}: category must be one of ${CATEGORIES.join(", ")}`);
  }

  const figure = asString(record, "figure", id);
  if (!FIGURES.includes(figure as FigureTemplate)) {
    throw new Error(`topic ${id}: figure must be one of ${FIGURES.join(", ")}`);
  }

  const factsRequired = asStringArray(record, "facts_required", id);
  if (factsRequired.length === 0) throw new Error(`topic ${id}: facts_required must list at least one fact`);
  for (const factId of factsRequired) {
    if (!FACT_ID.test(factId)) throw new Error(`topic ${id}: facts_required entry "${factId}" is not a fact id like HR-07`);
  }

  const internalLinks = asStringArray(record, "internal_links", id);
  if (internalLinks.length === 0) throw new Error(`topic ${id}: internal_links must list at least one path`);
  for (const link of internalLinks) {
    if (!link.startsWith("/")) throw new Error(`topic ${id}: internal_links entry "${link}" must be a site-relative path`);
  }

  const secondaryKeywords = "secondary_keywords" in record ? asStringArray(record, "secondary_keywords", id) : [];

  return {
    id,
    intent: intent as Intent,
    titleHint: asString(record, "title_hint", id),
    primaryKeyword: asString(record, "primary_keyword", id),
    secondaryKeywords,
    category: category as CategorySlug,
    factsRequired,
    internalLinks,
    figure: figure as FigureTemplate,
    notes: typeof record.notes === "string" ? record.notes : undefined,
  };
}

export function loadTopics(app: string): Topic[] {
  const file = new URL(`../topics/${app}.json`, import.meta.url);
  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (!Array.isArray(parsed)) throw new Error(`topics ${app}: file must contain an array`);
  const topics = parsed.map(validateTopic);
  const seen = new Set<string>();
  for (const topic of topics) {
    if (seen.has(topic.id)) throw new Error(`topics ${app}: duplicate topic id ${topic.id}`);
    seen.add(topic.id);
  }
  return topics;
}
