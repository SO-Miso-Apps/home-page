#!/usr/bin/env node
/** What the pipeline has published and how much calendar is left. */

import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { loadFacts } from "./lib/facts.ts";
import { loadTopics } from "./lib/topics.ts";
import { readLedger } from "./lib/ledger.ts";
import { usedTopicIds } from "./lib/pick.ts";
import type { AppId } from "./lib/types.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const APPS: AppId[] = ["history-revert", "auto-tags"];

const ledger = readLedger(join(HERE, "state", "published.json"));
const used = usedTopicIds(ledger);

for (const app of APPS) {
  const topics = loadTopics(app);
  const facts = loadFacts(app);
  const runs = ledger.runs.filter((run) => run.app === app);
  const remaining = topics.filter((topic) => !used.has(topic.id));
  console.log(`\n${app}`);
  console.log(`  facts: ${facts.length}   topics: ${topics.length}   used: ${runs.length}   remaining: ${remaining.length}`);
  const last = runs[runs.length - 1];
  if (last) {
    const scores = Object.entries(last.scores)
      .map(([key, value]) => `${key} ${value}`)
      .join(", ");
    console.log(`  last:  ${last.date} ${last.slug} (topic ${last.topicId})${scores ? ` — ${scores}` : ""}`);
  } else {
    console.log("  last:  nothing yet");
  }
  if (remaining.length > 0) {
    console.log(`  next:  ${remaining[0].id} — ${remaining[0].titleHint}`);
  } else {
    console.log("  next:  calendar empty; add entries to tools/blog/topics/" + app + ".json");
  }
  if (remaining.length <= 7) console.log(`  note:  ${remaining.length} topics left — add more soon`);
}
