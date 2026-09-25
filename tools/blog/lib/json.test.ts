import { test } from "node:test";
import assert from "node:assert/strict";
import { extractJson } from "./json.ts";

test("parses plain JSON", () => {
  assert.deepEqual(extractJson('{"a":1}'), { a: 1 });
});

test("parses JSON inside a fenced block", () => {
  assert.deepEqual(extractJson('Here you go:\n```json\n{"a":[1,2]}\n```\n'), { a: [1, 2] });
});

test("parses JSON surrounded by prose", () => {
  assert.deepEqual(extractJson('Sure. {"a":"b"} Hope that helps.'), { a: "b" });
});

test("ignores braces inside strings when scanning", () => {
  assert.deepEqual(extractJson('text {"a":"has } brace"} end'), { a: "has } brace" });
});

test("throws when there is no JSON object", () => {
  assert.throws(() => extractJson("no object here"), /no JSON object/);
});
