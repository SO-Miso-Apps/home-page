/** Pulling one JSON object out of an agent's chatty reply. */

const FENCE = /```(?:json)?\s*([\s\S]*?)```/;

/**
 * Returns the first parseable JSON object in `text`, tolerating prose before and
 * after and ```json fences. Braces inside strings are skipped, so a value that
 * contains `}` does not end the scan early.
 */
export function extractJson<T>(text: string): T {
  const fenced = text.match(FENCE);
  if (fenced) {
    const parsed = tryParse<T>(fenced[1]);
    if (parsed !== undefined) return parsed;
  }
  const direct = tryParse<T>(text);
  if (direct !== undefined) return direct;

  for (let start = text.indexOf("{"); start !== -1; start = text.indexOf("{", start + 1)) {
    const end = findObjectEnd(text, start);
    if (end === -1) continue;
    const parsed = tryParse<T>(text.slice(start, end + 1));
    if (parsed !== undefined) return parsed;
  }
  throw new Error("no JSON object found in agent output");
}

function tryParse<T>(candidate: string): T | undefined {
  try {
    const value: unknown = JSON.parse(candidate.trim());
    if (value !== null && typeof value === "object" && !Array.isArray(value)) return value as T;
    if (Array.isArray(value)) return value as T;
    return undefined;
  } catch {
    return undefined;
  }
}

/** Index of the `}` that closes the object opening at `start`, or -1. */
function findObjectEnd(text: string, start: number): number {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
