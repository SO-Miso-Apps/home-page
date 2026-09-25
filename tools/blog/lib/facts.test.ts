import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFacts, loadFacts } from "./facts.ts";

const md = `# Facts — fixture

### HR-01 — Activity log exists
Claim: The app keeps an activity log of product changes.
Source: app/routes/app.activity-log.tsx:1
Tags: feature, ui

### HR-02 — Field-level compare
Claim: Old and new values are shown per field, 2 values side by side.
Source: app/routes/app.compare.tsx:20
Tags: feature
`;

test("parses every fact block", () => {
  const facts = parseFacts(md);
  assert.equal(facts.length, 2);
  assert.deepEqual(facts[0], {
    id: "HR-01",
    claim: "The app keeps an activity log of product changes.",
    source: "app/routes/app.activity-log.tsx:1",
    tags: ["feature", "ui"],
  });
  assert.equal(facts[1].tags.length, 1);
});

test("throws when a block has no Source", () => {
  assert.throws(() => parseFacts("### HR-09 — nope\nClaim: something\n"), /missing Source/);
});

test("throws when a block has no Claim", () => {
  assert.throws(() => parseFacts("### HR-09 — nope\nSource: a/b.ts:1\n"), /missing Claim/);
});

test("loadFacts reads the fixture file from disk", () => {
  const facts = loadFacts("_fixture");
  assert.ok(facts.length >= 2);
});
