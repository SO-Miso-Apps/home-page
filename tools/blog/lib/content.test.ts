/**
 * Content integrity: the fact sheets and topic calendars are hand-written, so
 * they get the same treatment as code — every reference must resolve.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { loadFacts } from "./facts.ts";
import { loadTopics } from "./topics.ts";
import { keywordCoverage } from "./gates.ts";
import type { AppId } from "./types.ts";

const APPS: AppId[] = ["history-revert", "auto-tags"];
const MIN_FACTS = 25;
const MIN_TOPICS = 30;

test("both apps ship a substantial fact sheet", () => {
  for (const app of APPS) {
    const facts = loadFacts(app);
    assert.ok(facts.length >= MIN_FACTS, `${app}: ${facts.length} facts, expected at least ${MIN_FACTS}`);
    for (const fact of facts) {
      assert.match(fact.id, /^[A-Z]{2}-\d{2}$/, `${fact.id} is not shaped like HR-01`);
      assert.ok(fact.claim.length > 20, `${fact.id} claim is too thin`);
      assert.match(fact.source, /[/.]/, `${fact.id} needs a real source path`);
    }
  }
});

test("both apps ship a topic calendar of at least 30 entries", () => {
  for (const app of APPS) {
    const topics = loadTopics(app);
    assert.ok(topics.length >= MIN_TOPICS, `${app}: ${topics.length} topics, expected at least ${MIN_TOPICS}`);
  }
});

test("every topic's required facts resolve inside the two sheets", () => {
  const known = new Set([...loadFacts("history-revert"), ...loadFacts("auto-tags")].map((fact) => fact.id));
  for (const app of APPS) {
    for (const topic of loadTopics(app)) {
      for (const id of topic.factsRequired) {
        assert.ok(known.has(id), `topic ${topic.id} requires unknown fact ${id}`);
      }
    }
  }
});

test("every internal link points at a path the site serves", () => {
  const allowedPrefixes = ["/apps/so-", "/blog"];
  for (const app of APPS) {
    for (const topic of loadTopics(app)) {
      assert.ok(topic.internalLinks.length >= 2, `topic ${topic.id} needs at least two links`);
      for (const link of topic.internalLinks) {
        assert.ok(
          allowedPrefixes.some((prefix) => link.startsWith(prefix)),
          `topic ${topic.id} links to ${link}, which the site does not serve`,
        );
      }
    }
  }
});

test("every title hint carries its keyword and fits a title", () => {
  for (const app of APPS) {
    for (const topic of loadTopics(app)) {
      const coverage = keywordCoverage(topic.titleHint, topic.primaryKeyword);
      assert.ok(
        coverage.ratio >= 0.75,
        `${topic.id}: title hint is missing ${coverage.missing.join(", ")} from "${topic.primaryKeyword}"`,
      );
      assert.ok(topic.titleHint.length <= 60, `${topic.id}: title hint is ${topic.titleHint.length} chars`);
    }
  }
});

test("the calendar covers every intent and both categories", () => {
  for (const app of APPS) {
    const topics = loadTopics(app);
    const intents = new Set(topics.map((topic) => topic.intent));
    const categories = new Set(topics.map((topic) => topic.category));
    for (const intent of ["intro", "guide", "compare", "tips", "troubleshoot"]) {
      assert.ok(intents.has(intent as never), `${app} has no ${intent} topic`);
    }
    assert.equal(categories.size, 2, `${app} should use both categories`);
  }
});

test("each app ships at least one cross-app comparison", () => {
  for (const app of APPS) {
    const other = app === "history-revert" ? "auto-tags" : "history-revert";
    const otherPrefix = other === "history-revert" ? "HR-" : "AT-";
    const crossing = loadTopics(app).filter((topic) => topic.factsRequired.some((id) => id.startsWith(otherPrefix)));
    assert.ok(crossing.length >= 1, `${app} has no topic citing the other app's facts`);
  }
});
