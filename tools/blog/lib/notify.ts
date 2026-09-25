/** Desktop notification. Never fatal: the run's result matters more. */

import { execFileSync } from "node:child_process";

export function notify(title: string, message: string): void {
  try {
    const script = `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`;
    execFileSync("osascript", ["-e", script], { stdio: "ignore" });
  } catch {
    console.error(`notification failed: ${title} — ${message}`);
  }
}
