import { test } from "node:test";
import assert from "node:assert/strict";
import { pickTopic, usedTopicIds } from "./pick.ts";
import type { Ledger } from "./types.ts";
import type { Topic } from "./topics.ts";

const topic = (id: string): Topic => ({
  id,
  intent: "tips",
  titleHint: id,
  primaryKeyword: "shopify product history",
  secondaryKeywords: [],
  category: "merchant-playbook",
  factsRequired: ["HR-01"],
  internalLinks: ["/apps/history-revert"],
  figure: "og-card",
});

const topics = [topic("a"), topic("b"), topic("c")];

const ledger: Ledger = {
  runs: [
    { topicId: "a", app: "history-revert", date: "2026-09-26", entryId: "1", slug: "a", mediaId: "m", scores: {}, site: "https://misoapps.com" },
  ],
};

test("usedTopicIds collects every recorded topic", () => {
  assert.deepEqual([...usedTopicIds(ledger)], ["a"]);
});

test("picks the first unused topic", () => {
  assert.equal(pickTopic(topics, ledger, [])?.id, "b");
});

test("skips a topic whose slug is already live", () => {
  assert.equal(pickTopic(topics, { runs: [] }, ["b"])?.id, "a");
});

test("returns null when the calendar is exhausted", () => {
  assert.equal(pickTopic(topics, ledger, ["b", "c"]), null);
});

test("an empty calendar returns null", () => {
  assert.equal(pickTopic([], { runs: [] }, []), null);
});
