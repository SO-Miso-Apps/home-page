/** EmDash HTTP API: media upload, draft creation, housekeeping. */

import { readFileSync } from "node:fs";
import { basename } from "node:path";
import type { CreatedEntry, Draft, DraftBody, MediaItem, PortableBlock } from "./types.ts";
import type { Topic } from "./topics.ts";

const MEDIA_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export function contentTypeFor(file: string): string {
  const dot = file.lastIndexOf(".");
  const type = dot === -1 ? undefined : MEDIA_TYPES[file.slice(dot).toLowerCase()];
  if (!type) throw new Error(`emdash: cannot infer a content type for ${file}`);
  return type;
}

/** The exact JSON the create endpoint expects, with the figures wired in. */
export function buildDraftBody(input: {
  draft: Draft;
  topic: Topic;
  mediaId: string;
  figureMediaId?: string;
}): DraftBody {
  const inlineMedia = input.figureMediaId ?? input.mediaId;
  const content: PortableBlock[] = input.draft.content.map((block) =>
    block._type === "image" ? { ...block, asset: { id: inlineMedia } } : block,
  );
  return {
    slug: input.draft.slug,
    data: {
      title: input.draft.title,
      excerpt: input.draft.excerpt,
      content,
      og_image: { id: input.mediaId },
    },
    seo: { title: input.draft.seo_title, description: input.draft.seo_description, image: input.mediaId },
    taxonomies: { category: [input.topic.category] },
  };
}

type ApiOptions = { method?: string; body?: unknown; raw?: string | Uint8Array; headers?: Record<string, string> };

/** EmDash answers failures with `{ success: false, error: { code, message } }`. */
function errorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = payload.error;
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  }
  return fallback;
}

export async function api<T>(site: string, token: string, path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}`, ...options.headers };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(new URL(path, site), {
    method: options.method ?? "GET",
    headers,
    body: options.raw ?? (options.body === undefined ? undefined : JSON.stringify(options.body)),
  });
  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text === "" ? null : JSON.parse(text);
  } catch {
    payload = text;
  }
  if (!response.ok) {
    throw new Error(
      `emdash ${options.method ?? "GET"} ${path} → ${response.status}: ${errorMessage(payload, text).slice(0, 400)}`,
    );
  }
  // Every call site names the shape it expects; the server is the owner of it.
  return payload as T;
}

export async function healthCheck(site: string, token: string): Promise<void> {
  await api(site, token, "/_emdash/api/content/posts?limit=1");
}

export async function listPublishedSlugs(site: string, token: string, collection = "posts"): Promise<string[]> {
  const slugs: string[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 10; page++) {
    const query = `limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const payload = await api<{ data?: { items?: { slug?: string; status?: string }[]; nextCursor?: string | null } }>(
      site,
      token,
      `/_emdash/api/content/${collection}?${query}`,
    );
    const items = payload.data?.items ?? [];
    for (const item of items) {
      if (item.status === "published" && item.slug) slugs.push(item.slug);
    }
    cursor = payload.data?.nextCursor ?? undefined;
    if (!cursor || items.length === 0) break;
  }
  return slugs;
}

export async function uploadMedia(site: string, token: string, file: string, filename = basename(file)): Promise<string> {
  const bytes = readFileSync(file);
  const contentType = contentTypeFor(file);
  const ticket = await api<{ data: { uploadUrl: string; mediaId: string; headers: Record<string, string> } }>(
    site,
    token,
    "/_emdash/api/media/upload-url",
    { method: "POST", body: { filename, contentType, size: bytes.byteLength } },
  );
  const { uploadUrl, mediaId, headers } = ticket.data;
  // The local provider's upload endpoint sits behind the same auth as the API;
  // an S3-backed signed URL ignores the extra header.
  const put = await fetch(new URL(uploadUrl, site), {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, ...headers },
    body: bytes,
  });
  if (!put.ok) throw new Error(`emdash media PUT → ${put.status}: ${(await put.text()).slice(0, 300)}`);

  const confirmed = await api<{ data: { item: MediaItem } }>(site, token, `/_emdash/api/media/${mediaId}/confirm`, {
    method: "POST",
    body: {},
  });
  const item = confirmed.data.item;
  // EmDash marks a confirmed upload `ready`; `pending` or `failed` means the
  // bytes never landed.
  if (item.status !== "ready") throw new Error(`emdash media ${mediaId} is ${item.status}, not ready`);
  return mediaId;
}

export async function createDraft(site: string, token: string, body: DraftBody): Promise<CreatedEntry> {
  const payload = await api<{ data: { item: CreatedEntry } }>(site, token, "/_emdash/api/content/posts", {
    method: "POST",
    body,
  });
  const item = payload.data.item;
  if (item.status !== "draft") throw new Error(`emdash created ${item.id} as ${item.status}; expected a draft`);
  return item;
}

export async function deletePost(site: string, token: string, id: string): Promise<void> {
  await api(site, token, `/_emdash/api/content/posts/${id}`, { method: "DELETE" });
  await api(site, token, `/_emdash/api/content/posts/${id}/permanent`, { method: "DELETE" });
}

export async function deleteMedia(site: string, token: string, id: string): Promise<void> {
  await api(site, token, `/_emdash/api/media/${id}`, { method: "DELETE" });
}
