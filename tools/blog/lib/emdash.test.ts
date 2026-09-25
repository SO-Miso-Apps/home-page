import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDraftBody } from "./emdash.ts";
import type { Draft, DraftBody } from "./types.ts";
import type { Topic } from "./topics.ts";

const draft: Draft = {
  title: "Shopify product history: compare two versions",
  slug: "shopify-product-history-compare",
  excerpt: "Compare before you revert.",
  seo_title: "Shopify product history: compare two versions",
  seo_description: "y".repeat(150),
  used_facts: ["HR-01"],
  internal_links: ["/apps/history-revert"],
  content: [
    { _type: "block", _key: "b1", style: "normal", markDefs: [], children: [{ _type: "span", _key: "s1", text: "Body." }] },
    { _type: "image", _key: "i1", alt: "Change trail", asset: { id: "media_1" } },
  ],
  figure: { template: "og-card", eyebrow: "Product history", headline: "Every change", rows: [] },
};

const topic: Topic = {
  id: "hr-compare-two-versions",
  intent: "guide",
  titleHint: "Compare two versions",
  primaryKeyword: "shopify product history",
  secondaryKeywords: [],
  category: "merchant-playbook",
  factsRequired: ["HR-01"],
  internalLinks: ["/apps/history-revert"],
  figure: "og-card",
};

function body(over: { mediaId?: string; figureMediaId?: string } = {}): DraftBody {
  return buildDraftBody({ draft, topic, mediaId: over.mediaId ?? "media_1", figureMediaId: over.figureMediaId });
}

test("builds the EmDash create body", () => {
  const built = body();
  assert.equal(built.slug, "shopify-product-history-compare");
  assert.equal(built.status, undefined, "status stays unset so the server keeps it a draft");
  assert.deepEqual(built.data.og_image, { id: "media_1" });
  assert.equal(built.seo.image, "media_1");
  assert.equal(built.seo.title, draft.seo_title);
  assert.deepEqual(built.taxonomies, { category: ["merchant-playbook"] });
  assert.equal(built.data.content.length, draft.content.length);
});

test("inline figure image keeps its alt text", () => {
  const img = body({ figureMediaId: "media_2" }).data.content.find((b) => b._type === "image");
  assert.ok(img && img._type === "image");
  assert.deepEqual(img.asset, { id: "media_2" });
  assert.equal(img.alt, "Change trail");
});

test("without a second media id the inline image reuses the og media", () => {
  const img = body().data.content.find((b) => b._type === "image");
  assert.ok(img && img._type === "image");
  assert.deepEqual(img.asset, { id: "media_1" });
});
