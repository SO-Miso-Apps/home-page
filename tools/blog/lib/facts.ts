/**
 * Fact sheets are the pipeline's ground truth: a post may only claim what a
 * fact states, and every fact cites a real path inside the app repo.
 */

import { readFileSync } from "node:fs";

export type Fact = {
  id: string;
  claim: string;
  source: string;
  tags: string[];
};

const HEADING = /^###\s+([A-Z]{2}-\d{2})\s+—\s+(.+)$/;

export function parseFacts(markdown: string): Fact[] {
  const facts: Fact[] = [];
  let id: string | null = null;
  let claim = "";
  let source = "";
  let tags: string[] = [];

  const flush = () => {
    if (id === null) return;
    if (!claim) throw new Error(`facts: ${id} missing Claim`);
    if (!source) throw new Error(`facts: ${id} missing Source`);
    facts.push({ id, claim, source, tags });
    id = null;
    claim = "";
    source = "";
    tags = [];
  };

  for (const line of markdown.split("\n")) {
    const heading = line.match(HEADING);
    if (heading) {
      flush();
      id = heading[1];
      continue;
    }
    if (id === null) continue;
    if (line.startsWith("Claim: ")) claim = line.slice("Claim: ".length).trim();
    else if (line.startsWith("Source: ")) source = line.slice("Source: ".length).trim();
    else if (line.startsWith("Tags: ")) {
      tags = line
        .slice("Tags: ".length)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  }
  flush();

  const seen = new Set<string>();
  for (const fact of facts) {
    if (seen.has(fact.id)) throw new Error(`facts: duplicate id ${fact.id}`);
    seen.add(fact.id);
  }
  return facts;
}

export function loadFacts(app: string): Fact[] {
  const file = new URL(`../facts/${app}.md`, import.meta.url);
  return parseFacts(readFileSync(file, "utf8"));
}

/** Everything a fact sheet asserts, lower-cased, for the fact-trace gate. */
export function factsText(facts: Fact[]): string {
  return facts.map((fact) => `${fact.id} ${fact.claim} ${fact.source}`).join("\n").toLowerCase();
}

export function factsById(facts: Fact[]): Map<string, Fact> {
  return new Map(facts.map((fact) => [fact.id, fact]));
}
