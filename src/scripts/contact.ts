/**
 * Contact form: submit in place and render the outcome.
 *
 * Strictly additive — with this file absent the form still posts and the route
 * answers with a 303 back to `#request`, where the `?contact=` banner reports the
 * same result. Nothing here may be required for a visitor to reach us.
 */
const form = document.querySelector<HTMLFormElement>("[data-contact-form]");

if (form) {
  const started = form.querySelector<HTMLInputElement>("[data-contact-started]");
  const submit = form.querySelector<HTMLButtonElement>("[data-contact-submit]");
  const status = form.querySelector<HTMLElement>("[data-contact-status]");
  const done = document.querySelector<HTMLElement>("[data-contact-done]");
  const serviceField = form.querySelector("#contact-service");
  const service = serviceField instanceof HTMLSelectElement ? serviceField : null;

  // The route only enforces a minimum fill time when it receives this stamp.
  if (started) started.value = String(Date.now());

  const clearField = (name: string | undefined): void => {
    if (!name) return;
    const slot = form.querySelector<HTMLElement>(`[data-contact-error="${name}"]`);
    if (slot) slot.textContent = "";
    form.querySelector(`[name="${name}"]`)?.removeAttribute("aria-invalid");
  };

  form.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    clearField(target.closest("input, select, textarea")?.getAttribute("name") ?? undefined);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    for (const slot of form.querySelectorAll<HTMLElement>("[data-contact-error]")) slot.textContent = "";
    for (const field of form.querySelectorAll("[aria-invalid]")) field.removeAttribute("aria-invalid");
    if (status) status.textContent = "Sending…";
    if (submit) submit.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const parsed: unknown = await response.json().catch(() => null);
      const payload = parsed !== null && typeof parsed === "object" ? parsed : {};

      if (response.ok) {
        form.hidden = true;
        if (done) {
          done.hidden = false;
          done.scrollIntoView({ block: "nearest" });
        }
        return;
      }

      let firstInvalid: HTMLElement | null = null;
      if ("errors" in payload && payload.errors !== null && typeof payload.errors === "object") {
        for (const [name, message] of Object.entries(payload.errors)) {
          if (typeof message !== "string") continue;
          const slot = form.querySelector<HTMLElement>(`[data-contact-error="${name}"]`);
          const field = form.querySelector<HTMLElement>(`[name="${name}"]`);
          if (slot) slot.textContent = message;
          if (field) {
            field.setAttribute("aria-invalid", "true");
            firstInvalid ??= field;
          }
        }
      }
      firstInvalid?.focus();

      if ("message" in payload && typeof payload.message === "string") {
        if (status) status.textContent = payload.message;
      } else if (status) {
        status.textContent = firstInvalid
          ? "Please check the highlighted fields."
          : "Something went wrong. Please try again.";
      }
    } catch {
      if (status) {
        status.textContent =
          "Could not reach the server. Please try again, or email hi@misoapps.com.";
      }
    } finally {
      if (submit) submit.disabled = false;
    }
  });

  // `/services?service=custom-apps` and every in-page "Request a quote" link
  // preselect the track, so nobody answers the same question twice.
  const selectService = (value: string | null | undefined): void => {
    if (!service || !value) return;
    if ([...service.options].some((option) => option.value === value)) service.value = value;
  };

  selectService(new URLSearchParams(window.location.search).get("service"));
  for (const link of document.querySelectorAll<HTMLElement>("[data-contact-service]")) {
    link.addEventListener("click", () => selectService(link.dataset.contactService));
  }
}
