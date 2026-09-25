import { test } from "node:test";
import assert from "node:assert/strict";
import { fillTemplate, loadTemplate } from "./figure.ts";

const tpl = `<div><p>{{eyebrow}}</p><h1>{{headline}}</h1><ul>{{#rows}}<li>{{label}} = {{value}}</li>{{/rows}}</ul><span>{{note}}</span></div>`;

test("substitutes scalars and repeats the rows block", () => {
  const html = fillTemplate(
    { template: "compare-table", eyebrow: "Product history", headline: "Every change", rows: [{ label: "Price", value: "old" }, { label: "Images", value: "new" }], note: "misoapps.com" },
    tpl,
  );
  assert.match(html, /<p>Product history<\/p>/);
  assert.match(html, /<h1>Every change<\/h1>/);
  assert.equal(html.match(/<li>/g)?.length, 2);
  assert.match(html, /<li>Price = old<\/li>/);
  assert.match(html, /<span>misoapps\.com<\/span>/);
  assert.ok(!html.includes("{{"));
});

test("escapes HTML in facts coming from source", () => {
  const html = fillTemplate(
    { template: "og-card", eyebrow: "a & b", headline: '<script>alert("x")</script>', rows: [] },
    tpl,
  );
  assert.ok(html.includes("a &amp; b"));
  assert.ok(!html.includes("<script>"));
});

test("an empty rows list removes the block entirely", () => {
  const html = fillTemplate({ template: "og-card", eyebrow: "e", headline: "h", rows: [] }, tpl);
  assert.equal(html.match(/<li>/g), null);
});

test("loadTemplate reads every shipped template", () => {
  for (const name of ["og-card", "flow", "timeline", "compare-table", "rule-tree"] as const) {
    assert.ok(loadTemplate(name).includes("<!-- figure:"), `template ${name} must carry its marker`);
  }
});
