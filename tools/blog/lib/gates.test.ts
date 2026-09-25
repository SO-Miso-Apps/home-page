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

/*
 * Filler for the length gates. It is built from disjoint slices of a synthetic
 * vocabulary so no two sentences share content words: the repetition gate would
 * correctly reject a fixture that reuses one sentence.
 */
const PREFIX = "log entry price title handle vendor status template image variant stock location revert diff checkpoint patch filter dashboard alert digest plan cap quota tag rule condition action priority trail record window actor".split(" ");
const base26 = (value: number): string => {
  let out = "";
  let rest = value;
  do {
    out = String.fromCharCode(97 + (rest % 26)) + out;
    rest = Math.floor(rest / 26) - 1;
  } while (rest >= 0);
  return out;
};
let cursor = 0;

/** Every token is unique, so no two fixture sentences can share content words. */
function sentence(): string {
  const words = Array.from({ length: 16 }, () => {
    const n = cursor++;
    return `${PREFIX[n % PREFIX.length]}${base26(Math.floor(n / PREFIX.length))}`;
  });
  return `${words.join(" ")}.`;
}

/** Body with 3 h2s, nine paragraphs and a bullet list — comfortably 700+ words. */
function body(extra = ""): Draft["content"] {
  const paragraph = (): string => [sentence(), sentence(), sentence(), sentence(), sentence()].join(" ");
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
        children: [{ _type: "span", _key: `ps${i}${j}`, text: paragraph() }],
      });
    }
  }
  blocks.splice(4, 0, { _type: "image", _key: "body-figure", alt: "Change trail" });
  blocks.push({
    _type: "block",
    _key: "links1",
    style: "normal",
    markDefs: [
      { _key: "lnk-app", _type: "link", href: "/apps/so-product-history-revert" },
      { _key: "lnk-blog", _type: "link", href: "/blog" },
    ],
    children: [
      { _type: "span", _key: "ln1", text: "the app page", marks: ["lnk-app"] },
      { _type: "span", _key: "ln2", text: "the blog", marks: ["lnk-blog"] },
    ],
  });
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

test("an overlong seo description fails seo_desc", () => {
  assert.ok(codes(draft({ seo_description: "x".repeat(161) })).includes("seo_desc"));
});

test("a description at the bound passes seo_desc", () => {
  assert.ok(!codes(draft({ seo_description: "x".repeat(160) })).includes("seo_desc"));
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
  const long = Array.from({ length: 40 }, sentence).join(" ");
  assert.ok(codes(draft({ content: body(long) })).includes("body_len"));
});

test("two sentences that restate each other fail repetition", () => {
  const repeated =
    "Every product change is recorded in the activity log so you can review what happened to the product. Every product change is recorded in the activity log so you can investigate what happened to the product.";
  assert.ok(codes(draft({ content: body(repeated) })).includes("repetition"));
});

test("distinct sentences pass repetition", () => {
  const distinct =
    "The log answers which staff account touched a product. Reverting one field writes the previous value back through the Shopify API.";
  assert.ok(!codes(draft({ content: body(distinct) })).includes("repetition"));
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

test("a listed link that never appears in the body fails links", () => {
  const links = ["/apps/so-product-history-revert", "/blog"];
  const stripped = body().map((block) => (block._type === "block" && block._key === "links1" ? { ...block, markDefs: [] } : block));
  assert.ok(codes(draft({ content: stripped, internal_links: links })).includes("links"));
});

test("a repeated internal link fails links", () => {
  assert.ok(codes(draft({ internal_links: ["/apps/so-product-history-revert", "/apps/so-product-history-revert"] })).includes("links"));
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
  const deep: Draft["content"][number] = { _type: "block", _key: "h4", style: "h4", markDefs: [], children: [{ _type: "span", _key: "hs4", text: "Deep" }] };
  const jumped: Draft["content"] = [...body(), deep];
  assert.ok(codes(draft({ content: jumped })).includes("structure"));
});

test("an image block with only alt text passes schema", () => {
  // The pipeline wires the media id in after the gates run, so the writer is
  // only asked for alt text.
  const withImage: Draft["content"] = [...body(), { _type: "image", _key: "img1", alt: "Change trail" }];
  assert.ok(!codes(draft({ content: withImage })).includes("schema"));
});

test("an image block with an empty asset fails schema", () => {
  const withImage: Draft["content"] = [...body(), { _type: "image", _key: "img1", alt: "x", asset: { url: "" } }];
  assert.ok(codes(draft({ content: withImage })).includes("schema"));
});

test("a body without an illustration fails figure_in_body", () => {
  const stripped = body().filter((block) => block._type !== "image");
  assert.ok(codes(draft({ content: stripped })).includes("figure_in_body"));
});

test("two illustrations fail figure_in_body", () => {
  const second: Draft["content"][number] = { _type: "image", _key: "second", alt: "Another" };
  const extra: Draft["content"] = [...body(), second];
  assert.ok(codes(draft({ content: extra })).includes("figure_in_body"));
});

test("a figure row that invents data fails figure", () => {
  const d = draft({
    figure: { template: "compare-table", eyebrow: "Product history", headline: "Compare", rows: [{ label: "Restores", value: "99.9% of edits" }] },
  });
  assert.ok(codes(d).includes("figure"));
});

test("a post that skips a required fact fails facts_used", () => {
  assert.ok(codes(draft({ used_facts: ["HR-01"] })).includes("facts_used"));
});

test("the banned list ships in the module", () => {
  assert.ok(BANNED_PHRASES.includes("delve"));
});
