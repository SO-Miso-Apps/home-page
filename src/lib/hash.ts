/**
 * FNV-1a. Small, stable, dependency-free — used to pick decorative art
 * deterministically from an entry slug so a card keeps the same identity
 * across requests, server restarts and edge cache hits.
 */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
