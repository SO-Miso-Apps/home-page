import { LANG_COOKIE, LANG_STORAGE_KEY } from "../i18n";

// The switch is a set of plain links; this only records which one was picked,
// so the next English page a Vietnamese-browser visitor opens is not
// redirected back against their choice. The cookie carries the same choice
// to the edge redirect rule for visitors in Vietnam.
document.addEventListener("click", (event) => {
  const link = (event.target as Element | null)?.closest?.("[data-lang-set]");
  if (!(link instanceof HTMLElement) || !link.dataset.langSet) return;
  document.cookie = LANG_COOKIE.replace("%s", link.dataset.langSet);
  try {
    localStorage.setItem(LANG_STORAGE_KEY, link.dataset.langSet);
  } catch {
    /* storage unavailable — the link still switches this page */
  }
});
