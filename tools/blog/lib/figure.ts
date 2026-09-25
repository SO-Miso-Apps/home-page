/** Figure rendering: fill an HTML/CSS template, then capture it with Chrome. */

import { execFile } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { promisify } from "node:util";
import type { FigureSpec, FigureTemplate } from "./types.ts";

const run = promisify(execFile);
const TEMPLATES: FigureTemplate[] = ["og-card", "flow", "timeline", "compare-table", "rule-tree"];

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function loadTemplate(template: FigureTemplate): string {
  if (!TEMPLATES.includes(template)) throw new Error(`figure: unknown template "${template}"`);
  return readFileSync(new URL(`../render/${template}.html`, import.meta.url), "utf8");
}

/** Replaces scalars and repeats the `{{#rows}}…{{/rows}}` block once per row. */
export function fillTemplate(spec: FigureSpec, templateHtml: string): string {
  const rows = spec.rows
    .map((row) =>
      templateHtml
        .match(/{{#rows}}([\s\S]*?){{\/rows}}/)?.[1]
        .replaceAll("{{label}}", escapeHtml(row.label))
        .replaceAll("{{value}}", escapeHtml(row.value)) ?? "",
    )
    .join("");

  return templateHtml
    .replace(/{{#rows}}[\s\S]*?{{\/rows}}/, rows)
    .replaceAll("{{eyebrow}}", escapeHtml(spec.eyebrow))
    .replaceAll("{{headline}}", escapeHtml(spec.headline))
    .replaceAll("{{note}}", escapeHtml(spec.note ?? ""))
    .replace(/{{[a-z]+}}/g, "");
}

export async function renderFigure(
  spec: FigureSpec,
  outFile: string,
  size: { width: number; height: number } = { width: 1200, height: 630 },
): Promise<void> {
  const templateHtml = loadTemplate(spec.template);
  const html = fillTemplate(spec, templateHtml).replace(
    '<link rel="stylesheet" href="figure.css">',
    `<style>\n${readFileSync(new URL("../render/figure.css", import.meta.url), "utf8")}\n</style>`,
  );
  if (html.includes("{{")) throw new Error("figure: template placeholders left unfilled");
  const htmlFile = outFile.replace(/\.png$/, ".html");
  writeFileSync(htmlFile, html);

  const capture = new URL("../render/capture.sh", import.meta.url).pathname;
  await run("bash", [capture, htmlFile, outFile, String(size.width), String(size.height)]);

  const { stdout } = await run("sips", ["-g", "pixelWidth", "-g", "pixelHeight", outFile]);
  const width = Number(stdout.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(stdout.match(/pixelHeight:\s*(\d+)/)?.[1]);
  if (width !== size.width || height !== size.height) {
    throw new Error(`figure: captured ${width}x${height}, expected ${size.width}x${size.height}`);
  }
}
