import { LANG_STORAGE_KEY } from "../i18n";

// The switch is a set of plain links; this only records which one was picked,
// so the next English page a Vietnamese-browser visitor opens is not
// redirected back against their choice.
document.addEventListener("click", (event) => {
  const link = (event.target as Element | null)?.closest?.("[data-lang-set]");
  if (!(link instanceof HTMLElement) || !link.dataset.langSet) return;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, link.dataset.langSet);
  } catch {
    /* storage unavailable — the link still switches this page */
  }
});
