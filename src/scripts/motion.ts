/**
 * Motion layer. Everything here is additive: the page is fully readable and
 * navigable with this file absent or with motion reduced, because entrance
 * states are applied by JS rather than baked into CSS.
 *
 * Rules followed throughout: transform/opacity only, one ScrollTrigger per
 * concern, everything created inside gsap.matchMedia() so the reduced-motion
 * branch reverts it all.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "power3.out", duration: 0.72 });

/** Sticky header gains its border and full background once the page moves. */
function initHeaderState(): void {
  const header = document.querySelector<HTMLElement>(".site-header");
  if (!header) return;

  ScrollTrigger.create({
    start: 6,
    end: "max",
    toggleClass: { targets: header, className: "is-scrolled" },
  });
}

/** Pointer-tracked highlight for cards. Reads the rect once per enter. */
function initSpotlight(): void {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  for (const card of document.querySelectorAll<HTMLElement>("[data-spotlight]")) {
    let rect: DOMRect | null = null;

    card.addEventListener("pointerenter", () => {
      rect = card.getBoundingClientRect();
    });

    card.addEventListener("pointermove", (event) => {
      if (!rect) rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x.toFixed(2)}%`);
      card.style.setProperty("--my", `${y.toFixed(2)}%`);
    });

    card.addEventListener("pointerleave", () => {
      rect = null;
    });
  }
}

const mm = gsap.matchMedia();

// A single query string (not a conditions object) so the handler runs exactly
// when motion is welcome; gsap reverts every tween and ScrollTrigger it created
// as soon as the query stops matching, so reduce-motion users are never left
// with hidden content — nothing is hidden outside this handler.
mm.add("(prefers-reduced-motion: no-preference)", () => {
  initHeaderState();
  initSpotlight();

  // --- Hero ---------------------------------------------------------------
  const heroItems = gsap.utils.toArray<HTMLElement>("[data-hero-item]");
  const heroArt = document.querySelector<HTMLElement>("[data-hero-art]");

  if (heroItems.length > 0) {
    gsap.from(heroItems, {
      y: 26,
      autoAlpha: 0,
      duration: 0.85,
      stagger: 0.08,
      // Drop the inline transform once done so CSS :hover rules own it again.
      clearProps: "transform",
    });
  }

  if (heroArt) {
    gsap.from(heroArt, {
      y: 34,
      scale: 0.97,
      autoAlpha: 0,
      duration: 1.1,
      delay: 0.12,
      clearProps: "transform",
    });
    // Perpetual drift on an inner node so it never fights the entrance tween.
    const float = heroArt.querySelector<HTMLElement>("[data-float]");
    if (float) {
      gsap.to(float, { y: -12, duration: 3.6, ease: "sine.inOut", repeat: -1, yoyo: true });
    }
  }

  // --- Scroll reveals -----------------------------------------------------
  const revealTargets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
  if (revealTargets.length > 0) {
    gsap.set(revealTargets, { y: 22, autoAlpha: 0 });
    ScrollTrigger.batch(revealTargets, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.07,
          overwrite: true,
          // Without this, GSAP's inline transform would outrank the CSS :hover
          // lift and hover would look dead on every revealed card.
          clearProps: "transform",
        }),
    });
  }

  // --- Process rail -------------------------------------------------------
  const stepsSection = document.querySelector<HTMLElement>("[data-steps]");
  const rail = stepsSection?.querySelector<HTMLElement>("[data-steps-line]");
  if (stepsSection && rail) {
    gsap.fromTo(
      rail,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        transformOrigin: "left center",
        scrollTrigger: {
          trigger: stepsSection,
          start: "top 80%",
          end: "bottom 70%",
          scrub: 0.5,
        },
      },
    );
  }

  // Web fonts change line boxes, which moves every trigger boundary.
  void document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
  // No cleanup returned on purpose: gsap.matchMedia() reverts everything
  // created above once the motion query stops matching.
});
