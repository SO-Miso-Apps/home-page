import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDraft, parseCritique } from "./draft.ts";

const block = { _type: "block", _key: "b1", style: "h2", markDefs: [], children: [{ _type: "span", _key: "s1", text: "Hello" }] };

const raw = {
  title: "Shopify product history: what changed",
  slug: "shopify-product-history-what-changed",
  excerpt: "e",
  seo_title: "t",
  seo_description: "d",
  used_facts: ["HR-01"],
  internal_links: ["/apps/so-product-history-revert"],
  content: [block, { _type: "image", _key: "i1", alt: "diagram" }],
  figure: { template: "timeline", eyebrow: "History", headline: "Every change", rows: [{ label: "Price", value: "old and new" }] },
};

test("parses a well-formed draft", () => {
  const draft = parseDraft(raw);
  assert.equal(draft.slug, "shopify-product-history-what-changed");
  assert.equal(draft.content.length, 2);
  assert.equal(draft.figure.rows.length, 1);
});

test("fills in span keys the model left out", () => {
  const draft = parseDraft({ ...raw, content: [{ ...block, children: [{ _type: "span", text: "Hello" }] }] });
  const first = draft.content[0];
  assert.ok(first._type === "block");
  assert.equal(first.children[0]._key, "s00");
});

test("rejects a draft with no content", () => {
  assert.throws(() => parseDraft({ ...raw, content: [] }), /content must be a non-empty array/);
});

test("rejects a block type the renderer cannot draw", () => {
  assert.throws(() => parseDraft({ ...raw, content: [{ _type: "video", _key: "v" }] }), /cannot draw/);
});

test("rejects an unknown figure template", () => {
  assert.throws(() => parseDraft({ ...raw, figure: { ...raw.figure, template: "hero" } }), /figure\.template/);
});

test("rejects a non-string seo description", () => {
  assert.throws(() => parseDraft({ ...raw, seo_description: 12 }), /seo_description/);
});

test("rejects a missing used_facts array", () => {
  assert.throws(() => parseDraft({ ...raw, used_facts: "HR-01" }), /used_facts/);
});

test("parses a critique and defaults the verdict to fail", () => {
  const critique = parseCritique({
    scores: { factuality: 5, specificity: 4, originality: 4, seo: 5, usefulness: 4 },
    violations: [{ kind: "vague", quote: "q", why: "w" }],
    verdict: "maybe",
    rewrite_notes: "Tighten the opening.",
  });
  assert.equal(critique.verdict, "fail");
  assert.equal(critique.scores.factuality, 5);
  assert.equal(critique.violations[0].kind, "vague");
});

test("rejects a critique missing a score", () => {
  assert.throws(
    () => parseCritique({ scores: { factuality: 5, specificity: 4, originality: 4, seo: 5 }, violations: [] }),
    /usefulness/,
  );
});
