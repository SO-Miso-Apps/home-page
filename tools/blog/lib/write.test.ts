import { test } from "node:test";
import assert from "node:assert/strict";
import { buildWriterPrompt } from "./write.ts";
import { buildCriticPrompt, critiquePasses } from "./critique.ts";
import type { Draft } from "./types.ts";
import type { Fact } from "./facts.ts";
import type { Topic } from "./topics.ts";

const facts: Fact[] = [
  { id: "HR-01", claim: "The app keeps an activity log of product changes.", source: "app/routes/app.activity-log.tsx:1", tags: [] },
  { id: "HR-03", claim: "A revert restores up to 30 days of history.", source: "README.md:40", tags: [] },
];

const topic: Topic = {
  id: "hr-compare-two-versions",
  intent: "guide",
  titleHint: "Compare two versions of a product before you revert",
  primaryKeyword: "shopify product history",
  secondaryKeywords: ["revert product changes"],
  category: "merchant-playbook",
  factsRequired: ["HR-01", "HR-03"],
  internalLinks: ["/apps/history-revert"],
  figure: "compare-table",
};

const draft: Draft = {
  title: "Shopify product history: compare two versions",
  slug: "shopify-product-history-compare",
  excerpt: "e",
  seo_title: "t",
  seo_description: "d",
  used_facts: ["HR-01"],
  internal_links: ["/apps/history-revert"],
  content: [{ _type: "block", _key: "b1", style: "normal", markDefs: [], children: [{ _type: "span", _key: "s1", text: "Body text." }] }],
  figure: { template: "compare-table", eyebrow: "e", headline: "h", rows: [] },
};

test("writer prompt carries the facts, the topic and the JSON contract", () => {
  const prompt = buildWriterPrompt({ facts, topic, app: "history-revert", styleGuide: "House style." });
  assert.match(prompt, /HR-01/);
  assert.match(prompt, /A revert restores up to 30 days of history\./);
  assert.match(prompt, /shopify product history/);
  assert.match(prompt, /"seo_description"/);
  assert.match(prompt, /"used_facts"/);
  assert.match(prompt, /700 to 1200 words/);
  assert.match(prompt, /House style\./);
  assert.match(prompt, /delve/); // the banned list is shown to the writer
});

test("writer prompt insists on the figure rows tracing to facts", () => {
  const prompt = buildWriterPrompt({ facts, topic, app: "history-revert", styleGuide: "" });
  assert.match(prompt, /figure/);
  assert.match(prompt, /must come from a fact/);
});

test("a rewrite round includes the previous draft and the feedback", () => {
  const prompt = buildWriterPrompt({
    facts, topic, app: "history-revert", styleGuide: "",
    feedback: "gate fact_trace: 3500 products not in fact sheet",
    previous: draft,
  });
  assert.match(prompt, /3500 products not in fact sheet/);
  assert.match(prompt, /Shopify product history: compare two versions/);
});

test("critic prompt lists the five criteria and the draft", () => {
  const prompt = buildCriticPrompt(draft, facts, topic);
  for (const key of ["factuality", "specificity", "originality", "seo", "usefulness"]) {
    assert.match(prompt, new RegExp(key));
  }
  assert.match(prompt, /Shopify product history: compare two versions/);
  assert.match(prompt, /"violations"/);
});

test("critiquePasses enforces the thresholds", () => {
  const pass = { scores: { factuality: 4, specificity: 4, originality: 4, seo: 5, usefulness: 4 }, violations: [], verdict: "pass" as const, rewrite_notes: "" };
  assert.equal(critiquePasses(pass), true);
  assert.equal(critiquePasses({ ...pass, scores: { ...pass.scores, factuality: 3 } }), false);
  assert.equal(critiquePasses({ ...pass, scores: { ...pass.scores, usefulness: 1 } }), false);
  assert.equal(critiquePasses({ ...pass, violations: [{ kind: "x", quote: "q", why: "w" }] }), false);
  assert.equal(critiquePasses({ ...pass, verdict: "fail" }), false);
});
