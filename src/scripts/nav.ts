/**
 * Mobile menu: the panel is the same <nav> that lays out inline on desktop, so
 * there is one copy of the links in the DOM. Open state lives on the header as
 * `data-nav-open`; CSS owns the transition.
 */
const header = document.querySelector<HTMLElement>("[data-nav]");
const toggle = header?.querySelector<HTMLButtonElement>("[data-nav-toggle]");
const panel = header?.querySelector<HTMLElement>("[data-nav-panel]");

if (header && toggle) {
  const desktop = window.matchMedia("(min-width: 960px)");

  const setOpen = (open: boolean): void => {
    header.dataset.navOpen = String(open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  setOpen(false);

  toggle.addEventListener("click", () => {
    setOpen(header.dataset.navOpen !== "true");
  });

  // A menu that survives navigation is a trap: every in-page link closes it.
  panel?.addEventListener("click", (event) => {
    if ((event.target as Element | null)?.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.dataset.navOpen === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target as Element | null;
    if (header.dataset.navOpen !== "true") return;
    if (target && !header.contains(target)) setOpen(false);
  });

  // Resizing past the breakpoint hands layout back to the desktop bar.
  desktop.addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}
