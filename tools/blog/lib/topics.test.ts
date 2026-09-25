import { test } from "node:test";
import assert from "node:assert/strict";
import { validateTopic } from "./topics.ts";

const good = {
  id: "hr-compare-two-versions",
  intent: "guide",
  title_hint: "Compare two versions of a product before you revert",
  primary_keyword: "shopify product history",
  secondary_keywords: ["revert product changes"],
  category: "merchant-playbook",
  facts_required: ["HR-01", "HR-02"],
  internal_links: ["/apps/history-revert"],
  figure: "compare-table",
};

test("accepts a complete topic and maps to camelCase", () => {
  const topic = validateTopic(good);
  assert.equal(topic.id, "hr-compare-two-versions");
  assert.equal(topic.titleHint, good.title_hint);
  assert.equal(topic.primaryKeyword, good.primary_keyword);
  assert.deepEqual(topic.factsRequired, ["HR-01", "HR-02"]);
});

test("rejects an unknown category", () => {
  assert.throws(() => validateTopic({ ...good, category: "news" }), /category/);
});

test("rejects an empty facts_required", () => {
  assert.throws(() => validateTopic({ ...good, facts_required: [] }), /facts_required/);
});

test("rejects an unknown figure template", () => {
  assert.throws(() => validateTopic({ ...good, figure: "hero-shot" }), /figure/);
});

test("rejects a fact id with the wrong shape", () => {
  assert.throws(() => validateTopic({ ...good, facts_required: ["wat"] }), /facts_required/);
});

test("rejects internal links that are not paths", () => {
  assert.throws(() => validateTopic({ ...good, internal_links: ["https://example.com"] }), /internal_links/);
});

test("rejects an unknown intent", () => {
  assert.throws(() => validateTopic({ ...good, intent: "rant" }), /intent/);
});
