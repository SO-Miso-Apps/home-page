import { getEmDashCollection, type CollectionFilter, type CollectionResult, type InferCollectionData } from "emdash";
import { DEFAULT_LANG, type Lang } from "../i18n";

// Distributes over the cursor/offset union, which a plain Omit would collapse.
type Filter = CollectionFilter extends infer F ? (F extends unknown ? Omit<F, "locale"> : never) : never;
type Result<D> = CollectionResult<D>;
type Hint = Result<unknown>["cacheHint"];

/**
 * A collection list in `lang`. EmDash entry lookups fall back to English but
 * list queries do not, so a /vi list read on its own would drop every entry
 * nobody has translated yet. Instead the English list sets the catalog, its
 * order and its paging, and each entry is swapped for its translation where
 * one exists. Entries that exist only in Vietnamese are not listed.
 *
 * The returned cacheHint covers both reads, so publishing either language
 * invalidates the page.
 */
export async function getLocalizedCollection<T extends string, D = InferCollectionData<T>>(
  type: T,
  filter: Filter,
  lang: Lang,
): Promise<Result<D>> {
  const base = await getEmDashCollection<T, D>(type, { ...filter, locale: DEFAULT_LANG } as CollectionFilter);
  if (lang === DEFAULT_LANG || base.error) return base;

  // Every translation, unpaged: a page of English entries can match
  // translations from anywhere in the Vietnamese list.
  const { cursor: _cursor, offset: _offset, limit: _limit, ...unpaged } = filter as CollectionFilter;
  const local = await getEmDashCollection<T, D>(type, { ...unpaged, locale: lang });
  if (local.error) {
    console.error(`Failed to load ${type} (${lang}); serving English:`, local.error);
    return base;
  }

  const groupOf = (entry: Result<D>["entries"][number]): string => {
    const data = entry.data as { translationGroup?: string | null };
    return data.translationGroup || entry.id;
  };
  const translated = new Map(local.entries.map((entry) => [groupOf(entry), entry]));
  return {
    ...base,
    // A translation's id carries its locale ("vi/<slug>"); keep the English
    // id so links and per-entry art stay the same in both languages.
    entries: base.entries.map((entry) => {
      const translation = translated.get(groupOf(entry));
      return translation ? { ...translation, id: entry.id } : entry;
    }),
    cacheHint: mergeHints(base.cacheHint, local.cacheHint),
  };
}

function mergeHints(a: Hint, b: Hint): Hint {
  const tags = [...new Set([...(a.tags ?? []), ...(b.tags ?? [])])];
  const lastModified = a.lastModified && b.lastModified ? (a.lastModified > b.lastModified ? a.lastModified : b.lastModified) : (a.lastModified ?? b.lastModified);
  return { ...a, ...b, tags, lastModified };
}
