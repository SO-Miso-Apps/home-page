/** Which topic to write next: calendar order minus everything already used. */

import { slugify } from "./gates.ts";
import type { Topic } from "./topics.ts";
import type { Ledger } from "./types.ts";

export function usedTopicIds(ledger: Ledger): Set<string> {
  return new Set(ledger.runs.map((entry) => entry.topicId));
}

export function pickTopic(topics: Topic[], ledger: Ledger, existingSlugs: string[]): Topic | null {
  const used = usedTopicIds(ledger);
  for (const topic of topics) {
    if (used.has(topic.id)) continue;
    if (existingSlugs.includes(topic.id)) continue;
    if (existingSlugs.includes(slugify(topic.titleHint))) continue;
    return topic;
  }
  return null;
}
