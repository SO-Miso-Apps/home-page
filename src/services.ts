// The two service tracks the studio sells beyond the app catalog: a custom app
// built around a merchant's workflow, and a storefront theme built to their
// brand. One source, rendered twice — the home section summarises a track and
// links to its anchor on /services, which renders the same track in full — so
// the short promise and the detail page can never drift apart.
export interface ServiceTrack {
  /** Anchor on /services; the fragment the home section links to. */
  id: string;
  title: string;
  /** One sentence: what the engagement is. */
  summary: string;
  /** Platforms and APIs the track is built on. */
  stack: string;
  /** The store or team the track fits. */
  bestFor: string;
  /** What the client owns at the end of the engagement. */
  deliverables: string[];
}

export const SERVICES: ServiceTrack[] = [
  {
    id: "custom-apps",
    title: "Custom app development",
    summary:
      "A Shopify or Shopline app built around the workflow your team still runs by hand today.",
    stack: "Shopify Admin GraphQL · Webhooks · Shopify Functions · Shopline APIs",
    bestFor:
      "Merchants whose operations outgrew spreadsheets and manual admin work, or who need behaviour an off-the-shelf app will not take on.",
    deliverables: [
      "A scope document: the workflow, the records it touches, and what happens at the edges — before any code.",
      "The app itself, private to your store or built for a public App Store listing.",
      "An admin interface that follows how your team already works, not a generic settings page.",
      "Handover: repository access, written setup notes, and a walkthrough with the people who will run it.",
      "Support after launch: review notices, API changes, and fixes answered by the people who wrote the code.",
    ],
  },
  {
    id: "custom-themes",
    title: "Custom theme development",
    summary:
      "A storefront theme built to your brand and your catalog — or a rework of the theme you already run.",
    stack: "Liquid · Theme sections and blocks · Shopify · Shopline themes",
    bestFor:
      "Brands whose storefront no longer fits what a marketplace theme can be stretched into, and whose team wants to edit it without a developer.",
    deliverables: [
      "Merchant-editable sections and blocks, so your team changes copy, merchandising and promotions from the theme editor.",
      "Design tokens for colour, type and spacing, so the storefront stays consistent as the catalog grows.",
      "Templates for every surface you sell on: home, collection, product, cart, and the pages in between.",
      "A performance and accessibility pass — Core Web Vitals budget, keyboard navigation, contrast, no layout shift.",
      "Handover: the theme files, setup notes, and support for the update path that follows.",
    ],
  },
];
