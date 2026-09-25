const KEY = "miso-theme";
type Choice = "system" | "light" | "dark";

const root = document.documentElement;
const media = window.matchMedia("(prefers-color-scheme: dark)");

/** Reflect a choice into the DOM: resolved theme plus pressed control state. */
function apply(choice: Choice): void {
  const resolved = choice === "system" ? (media.matches ? "dark" : "light") : choice;
  root.dataset.theme = resolved;
  root.dataset.themeChoice = choice;
  for (const button of document.querySelectorAll<HTMLElement>("[data-theme-set]")) {
    button.setAttribute("aria-pressed", String(button.dataset.themeSet === choice));
  }
}

const current = (): Choice => (root.dataset.themeChoice as Choice | undefined) ?? "system";

// The head script in Base.astro already resolved the theme; this aligns the
// control (and covers the case where a control rendered before the script).
apply(current());

document.addEventListener("click", (event) => {
  const target = event.target as Element | null;
  const button = target?.closest?.("[data-theme-set]");
  if (!(button instanceof HTMLElement)) return;
  const choice = button.dataset.themeSet as Choice | undefined;
  if (!choice) return;
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    /* storage unavailable — the choice still applies for this page view */
  }
  apply(choice);
});

// Follow the OS while the visitor is on "system".
media.addEventListener("change", () => {
  if (current() === "system") apply("system");
});
