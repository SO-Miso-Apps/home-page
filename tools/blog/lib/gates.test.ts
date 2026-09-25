import { test } from "node:test";
import assert from "node:assert/strict";
import { runGates, BANNED_PHRASES } from "./gates.ts";
import type { Draft } from "./types.ts";
import type { Fact } from "./facts.ts";
import type { Topic } from "./topics.ts";

const facts: Fact[] = [
  { id: "HR-01", claim: "The app keeps an activity log of product changes.", source: "app/routes/app.activity-log.tsx:1", tags: [] },
  { id: "HR-02", claim: "Old and new values are shown per field.", source: "app/routes/app.compare.tsx:20", tags: [] },
  { id: "HR-03", claim: "A revert restores up to 30 days of history.", source: "README.md:40", tags: [] },
];

const topic: Topic = {
  id: "hr-compare-two-versions",
  intent: "guide",
  titleHint: "Compare two versions",
  primaryKeyword: "shopify product history",
  secondaryKeywords: [],
  category: "merchant-playbook",
  factsRequired: ["HR-01", "HR-02", "HR-03"],
  internalLinks: ["/apps/so-product-history-revert", "/blog"],
  figure: "compare-table",
};

const SENTENCE =
  "The activity log records what changed, when it changed, and which staff account changed it, so a merchant can answer a support question without guessing. ";

/** Body with 3 h2s, nine paragraphs and a bullet list — comfortably 700+ words. */
function body(extra = ""): Draft["content"] {
  const paragraph = SENTENCE.repeat(4);
  const blocks: Draft["content"] = [];
  for (let i = 0; i < 3; i++) {
    blocks.push({
      _type: "block",
      _key: `h${i}`,
      style: "h2",
      markDefs: [],
      children: [{ _type: "span", _key: `hs${i}`, text: `Section ${i + 1}` }],
    });
    for (let j = 0; j < 3; j++) {
      blocks.push({
        _type: "block",
        _key: `p${i}${j}`,
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", _key: `ps${i}${j}`, text: paragraph }],
      });
    }
  }
  blocks.push({
    _type: "block",
    _key: "l1",
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [{ _type: "span", _key: "ls1", text: "Open the product, then open the activity log." }],
  });
  if (extra) {
    blocks.push({
      _type: "block",
      _key: "x1",
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: "xs1", text: extra }],
    });
  }
  return blocks;
}

function draft(over: Partial<Draft> = {}): Draft {
  return {
    title: "Shopify product history: compare two versions",
    slug: "compare-two-versions-before-revert",
    excerpt: "Compare two versions before you revert.",
    seo_title: "Shopify product history: compare two versions",
    seo_description: "x".repeat(150),
    used_facts: ["HR-01", "HR-02", "HR-03"],
    internal_links: ["/apps/so-product-history-revert", "/blog"],
    content: body(),
    figure: {
      template: "compare-table",
      eyebrow: "Product history",
      headline: "Compare two versions",
      rows: [{ label: "Price", value: "old and new" }],
    },
    ...over,
  };
}

const codes = (d: Draft, existingSlugs: string[] = []) =>
  runGates({ draft: d, facts, topic, existingSlugs }).failures.map((f) => f.code);

test("a good draft clears every gate", () => {
  const result = runGates({ draft: draft(), facts, topic, existingSlugs: [] });
  assert.deepEqual(result.failures, []);
  assert.equal(result.ok, true);
});

test("title over 60 chars fails title_len", () => {
  assert.ok(codes(draft({ title: "Shopify product history ".repeat(4) })).includes("title_len"));
});

test("title missing the primary keyword fails title_keyword", () => {
  assert.ok(codes(draft({ title: "How to undo a price edit" })).includes("title_keyword"));
});

test("short seo description fails seo_desc", () => {
  assert.ok(codes(draft({ seo_description: "too short" })).includes("seo_desc"));
});

test("a slug with spaces or uppercase fails slug", () => {
  assert.ok(codes(draft({ slug: "Not A Slug" })).includes("slug"));
});

test("a slug already published fails duplicate", () => {
  assert.ok(codes(draft({ slug: "already-there" }), ["already-there"]).includes("duplicate"));
});

test("a title that slugifies onto a published slug fails duplicate", () => {
  const d = draft({ slug: "brand-new-slug", title: "Shopify product history: compare two versions!" });
  assert.ok(codes(d, ["shopify-product-history-compare-two-versions"]).includes("duplicate"));
});

test("a body under 700 words fails body_len", () => {
  const short = draft({
    content: [
      { _type: "block", _key: "h", style: "h2", markDefs: [], children: [{ _type: "span", _key: "s", text: "Small" }] },
      { _type: "block", _key: "p", style: "normal", markDefs: [], children: [{ _type: "span", _key: "s2", text: "Short body." }] },
    ],
  });
  assert.ok(codes(short).includes("body_len"));
});

test("a body over 1200 words fails body_len", () => {
  assert.ok(codes(draft({ content: body(SENTENCE.repeat(20)) })).includes("body_len"));
});

test("hard-sell filler words fail banned", () => {
  assert.ok(codes(draft({ content: body("We delve into the activity log.") })).includes("banned"));
});

test("emoji fails banned", () => {
  assert.ok(codes(draft({ content: body("This is great 🚀") })).includes("banned"));
});

test("an untraceable number fails fact_trace", () => {
  assert.ok(codes(draft({ content: body("It keeps 3,500 products in step.") })).includes("fact_trace"));
});

test("a traceable number passes fact_trace", () => {
  assert.ok(!codes(draft({ content: body("A revert restores up to 30 days of history.") })).includes("fact_trace"));
});

test("an untraceable backticked identifier fails fact_trace", () => {
  assert.ok(codes(draft({ content: body("It calls `inventorySetQuantities` for you.") })).includes("fact_trace"));
});

test("fewer than two internal links fails links", () => {
  assert.ok(codes(draft({ internal_links: [] })).includes("links"));
});

test("an internal link the site does not serve fails links", () => {
  assert.ok(codes(draft({ internal_links: ["/apps/so-product-history-revert", "/apps/nope"] })).includes("links"));
});

test("a post link that is not published yet fails links", () => {
  assert.ok(codes(draft({ internal_links: ["/apps/so-product-history-revert", "/blog/not-live"] })).includes("links"));
});

test("a missing h2 structure fails structure", () => {
  const blocks = body().filter((b) => b._type !== "block" || b.style !== "h2");
  assert.ok(codes(draft({ content: blocks })).includes("structure"));
});

test("no list at all fails structure", () => {
  const blocks = body().filter((b) => b._type !== "block" || !b.listItem);
  assert.ok(codes(draft({ content: blocks })).includes("structure"));
});

test("an unknown block type fails schema", () => {
  // The fixture deliberately steps outside PortableBlock: the schema gate must
  // reject any block type the renderer cannot draw.
  const bad = [...body(), { _type: "video", _key: "v" }] as unknown as Draft["content"];
  assert.ok(codes(draft({ content: bad })).includes("schema"));
});

test("duplicate block keys fail schema", () => {
  const blocks = body();
  assert.ok(codes(draft({ content: [...blocks, { ...blocks[1] }] })).includes("schema"));
});

test("a heading jump fails structure", () => {
  const jumped = [
    ...body(),
    { _type: "block", _key: "h4", style: "h4", markDefs: [], children: [{ _type: "span", _key: "hs4", text: "Deep" }] } as const,
  ];
  assert.ok(codes(draft({ content: jumped })).includes("structure"));
});

test("a figure row that invents data fails figure", () => {
  const d = draft({
    figure: { template: "compare-table", eyebrow: "Product history", headline: "Compare", rows: [{ label: "Restores", value: "99.9% of edits" }] },
  });
  assert.ok(codes(d).includes("figure"));
});

test("the banned list ships in the module", () => {
  assert.ok(BANNED_PHRASES.includes("delve"));
});
