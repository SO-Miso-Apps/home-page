/** Run ledger: what was written, when, and where it landed. */

import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { Ledger, LedgerEntry } from "./types.ts";

export function readLedger(path: string): Ledger {
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as Ledger).runs)) return parsed as Ledger;
  } catch {
    /* a missing or half-written ledger must not stop a run */
  }
  return { runs: [] };
}

export function recordRun(path: string, entry: LedgerEntry): void {
  const ledger = readLedger(path);
  ledger.runs.push(entry);
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.tmp`;
  writeFileSync(temp, `${JSON.stringify(ledger, null, 2)}\n`);
  renameSync(temp, path);
}
