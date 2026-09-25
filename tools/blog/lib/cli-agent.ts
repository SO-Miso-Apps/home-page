/**
 * Thin wrappers over the two agent CLIs.
 *
 * `codex` writes (ChatGPT-authenticated, sandboxed read-only so it can only
 * think), `opencode` scores. Both take the prompt on stdin, run with a hard
 * timeout, and are retried once on a transport failure — never on a refusal.
 */

import { execFileSync } from "node:child_process";

export type AgentOptions = { model?: string; timeoutMs?: number; cwd?: string };

const MAX_BUFFER = 32 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 180_000;

type JsonLine = {
  type?: string;
  item?: { type?: string; text?: string };
  part?: { type?: string; text?: string };
};

function invoke(command: string, args: string[], input: string, options: AgentOptions): string {
  return execFileSync(command, args, {
    input,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
    timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    cwd: options.cwd ?? process.cwd(),
    env: process.env,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

function collectText(stdout: string, pick: (line: JsonLine) => string | undefined): string {
  const parts: string[] = [];
  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    let parsed: JsonLine;
    try {
      parsed = JSON.parse(trimmed) as JsonLine;
    } catch {
      continue;
    }
    const text = pick(parsed);
    if (text) parts.push(text);
  }
  return parts.join("").trim();
}

export function runCodex(prompt: string, options: AgentOptions = {}): string {
  const args = [
    "exec",
    "--sandbox",
    "read-only",
    "--skip-git-repo-check",
    "--json",
    // Prose quality needs more than the CLI's default low effort: a 900-word
    // grounded draft has to be planned, not improvised. The machine-global
    // developer instructions (an orchestration harness) are noise for a writer.
    "-c",
    'model_reasoning_effort="high"',
    "-c",
    'developer_instructions=""',
  ];
  if (options.model) args.push("-m", options.model);
  args.push("-");
  const stdout = invoke("codex", args, prompt, options);
  const text = collectText(stdout, (line) =>
    line.type === "item.completed" && line.item?.type === "agent_message" ? line.item.text : undefined,
  );
  if (!text) throw new Error(`codex returned no agent message:\n${stdout.slice(-2000)}`);
  return text;
}

export function runOpencode(prompt: string, options: AgentOptions = {}): string {
  const args = ["run", "--format", "json"];
  if (options.model) args.push("-m", options.model);
  args.push(prompt);
  const stdout = invoke("opencode", args, "", options);
  const text = collectText(stdout, (line) => (line.type === "text" ? line.part?.text : undefined));
  if (!text) throw new Error(`opencode returned no text:\n${stdout.slice(-2000)}`);
  return text;
}

export function askAgent(kind: "codex" | "opencode", prompt: string, options: AgentOptions = {}): string {
  const call = kind === "codex" ? runCodex : runOpencode;
  try {
    return call(prompt, options);
  } catch (error) {
    console.error(`${kind} attempt 1 failed: ${(error as Error).message.split("\n")[0]}`);
    return call(prompt, options);
  }
}
