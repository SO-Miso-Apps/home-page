# Facts — SO: Product History & Revert

Ground truth for blog posts about History Revert. Every claim below is backed by
the path in `Source:`. A post may only assert what appears here.

Repo: `../history-revert`

## Traps

- Do not quote the App Store-style plan prices in `listing/` copy or any FAQ you
  find in the repo: `app/config/plans.ts` is authoritative.
- "Restores everything" is false. Point-in-time restore covers a fixed field set
  and deliberately leaves variants, images, metafields and collections alone.
- Never claim the app can recover a product that was never tracked, or that it
  restores the original product ID or creation date.
- `Unknown` as an author is a real, documented outcome, not a bug.
- The app tracks **products** (with their variants, images, metafields and
  collections). It is not an order-history or theme-history tool.

### HR-01 — What is tracked
Claim: The app tracks product create, update and delete events, plus variant,
image, metafield, SEO and collection-membership changes.
Source: README.md (Features; How It Works)

### HR-02 — Webhook driven
Claim: Changes are captured from Shopify webhooks — products/create,
products/update and products/delete — processed asynchronously by a BullMQ
worker.
Source: README.md (How It Works; Background Processing)

### HR-03 — Change records are JSON Patch
Claim: Each change is stored as the JSON Patch that describes it, appended to a
change log, with a full product checkpoint written every so often.
Source: README.md (How It Works: Activity Logging)

### HR-04 — State reconstruction
Claim: A product's state at any moment is the newest checkpoint at or before that
moment plus the changes recorded after it, so a new checkpoint never removes an
earlier point in time.
Source: README.md (How It Works: Activity Logging)

### HR-05 — Retention refusals
Claim: A restore to a moment older than the plan's retention window is refused
with the date the history still starts from, rather than answered with a newer
state.
Source: README.md (How It Works: Activity Logging, Revert Process)

### HR-06 — Staff attribution source
Claim: Whoever made a change is resolved from Shopify's store timeline events
(BasicEvent.author), because webhook payloads carry no actor.
Source: app/services/staff-attribution.service.ts; README.md (Staff Attribution)

### HR-07 — What can be attributed
Claim: Only create, delete, publishing or unpublishing, and status changes carry
an attributable Shopify event; changes to title, description, price, tags,
variants, metafields and images are logged with author "Unknown".
Source: README.md (Staff Attribution table)

### HR-08 — The caveat is shown in the product
Claim: The Unknown-author caveat is surfaced as a tooltip on every "Changed by"
column, a banner on the product history page, and a hint on the plan feature.
Source: README.md (Staff Attribution); app/components/StaffAttributionCaveat.tsx

### HR-09 — The app's own writes are attributed to the operator
Claim: Every revert, point-in-time restore and deleted-product restore is
recorded under the staff member who triggered it, resolved from the online
access token (session.onlineAccessInfo.associated_user).
Source: app/utils/actor.ts; README.md (Staff Attribution)

### HR-10 — Editor saves are attributed too
Claim: A save from the in-app product editor is performed with the shop's offline
token but recorded under the name of the staff member who submitted it.
Source: README.md (Product Editor)

### HR-11 — Field-level revert
Claim: Individual fields can be reverted to a previous value.
Source: README.md (One-Click Reverts); app/routes/api.revert.tsx

### HR-12 — Whole-product revert
Claim: An entire product can be reverted to a historical state.
Source: README.md (One-Click Reverts); app/services/revert.service.ts

### HR-13 — Point-in-time restore scope
Claim: Point-in-time restore puts a product's own details back to any entry in
its timeline — title, description, handle, vendor, product type, tags, status,
template and SEO — writing only the fields that actually differ.
Source: README.md (One-Click Reverts: Point-in-Time Restore)

### HR-14 — Point-in-time restore leaves the rest alone
Claim: Point-in-time restore leaves variants, images, metafields and collections
untouched; each of those stays individually revertible.
Source: README.md (One-Click Reverts: Point-in-Time Restore)

### HR-15 — Preview before revert
Claim: A revert shows a before/after comparison before it is confirmed.
Source: README.md (One-Click Reverts); app/services/restore-preview.service.ts

### HR-16 — Batch revert
Claim: Multiple changes can be reverted together, and bulk point-in-time restore
is limited to the Scale and Enterprise plans.
Source: README.md (One-Click Reverts: Batch Operations); app/config/plans.ts (canBulkRestore)

### HR-17 — Idempotent reverts
Claim: Revert operations are idempotent, so the same revert cannot be applied
twice.
Source: README.md (One-Click Reverts: Idempotent Operations)

### HR-18 — In-app product editor coverage
Claim: The editor covers product fields (title, description, handle, vendor,
product type, tags, status, template), variant fields except stock levels, image
alt text and image order, product and variant metafields, collections, and the
product category.
Source: README.md (Product Editor); app/services/product-editor.service.ts

### HR-19 — Editor conflict handling
Claim: If a field changed while the editor form was open, the save is refused
instead of overwriting; there is no approval step, so a save goes live at once.
Source: README.md (Product Editor)

### HR-20 — Deletions are archived
Claim: A products/delete event archives the snapshot instead of discarding it,
and the deleted record is kept as the audit trail.
Source: README.md (Deleted Product Recovery)

### HR-21 — Restores recreate as drafts
Claim: Restoring a deleted product recreates it from its last recorded state and
always as a draft; publishing it back to sales channels is opt-in and off by
default.
Source: README.md (Deleted Product Recovery)

### HR-22 — A deletion restores once
Claim: A deletion can be restored once — the archived record is marked so a
second click cannot create a duplicate product — and deleting the recreated
product makes it restorable again.
Source: README.md (Deleted Product Recovery)

### HR-23 — Full restore payload
Claim: A deleted-product restore rebuilds title, description, handle, vendor,
product type, template, tags, SEO, status, options, variants (price, compare-at
price, SKU, barcode, tax settings, inventory policy, unit pricing, weight, unit
cost, harmonized system code, country and province of origin, stock per
location), product and variant metafields, images with alt text, each variant's
own image, collections and the product category.
Source: README.md (Deleted Product Recovery)

### HR-24 — What cannot come back
Claim: The original product ID and creation date, order and discount history,
analytics, subscription and selling-plan groups, combined listings, translations,
and any product that was never tracked cannot be restored.
Source: README.md (Deleted Product Recovery)

### HR-25 — Restore warnings
Claim: A restore reports what it could not reproduce as warnings — an image whose
bytes are no longer held, a collection or location deleted since, or a state
captured from a webhook rather than a full read — and warnings do not fail the
restore.
Source: README.md (Deleted Product Recovery)

### HR-26 — Image bytes are copied
Claim: Image bytes are stored by the app while the product exists, because
Shopify deletes a product's media with the product; a restore uploads those bytes
and only falls back to the original CDN URL while it still answers.
Source: README.md (Deleted Product Recovery: Images); app/services/image-backup.service.ts

### HR-27 — Where image copies live
Claim: Image copies are stored in Cloudflare R2 — one object per shop, uploaded
once, with a claim row so two workers cannot write the same bytes twice.
Source: README.md (Deleted Product Recovery: Images); .env.example; app/models/ImageObject.ts

### HR-28 — Why image bytes live outside the database
Claim: Measured at about 11 images per product, one product is roughly 3.6 MB of
image bytes — about 7 GB at the 2,000-product tier and about 53 GB at 15,000.
Source: README.md (Deleted Product Recovery: Images)

### HR-29 — Plans
Claim: Starter is $12.99/month for 30 tracked products and 3 months of history;
Growth $18.99/month for 100 products, 6 months and priority support; Scale
$27.99/month for 2,000 products, 12 months and email alerts; Enterprise
$54.99/month for 15,000 products and 24 months. Annual billing is $129.99,
$189.99, $279.99 and $549.99.
Source: app/config/plans.ts; README.md (Subscription Management)

### HR-30 — Unlimited reverts
Claim: Reverts and snapshots are unlimited on every plan; plans differ only by
how many products are tracked and how far back history is kept.
Source: README.md (Subscription Management); app/config/plans.ts

### HR-31 — Trial
Claim: Monthly plans carry a 7-day trial; annual plans are about 17% cheaper than
paying monthly.
Source: app/config/plans.ts (MONTHLY_TRIAL_DAYS, ANNUAL_SAVINGS)

### HR-32 — Tracked-product cap
Claim: A shop at its tracked-product cap gets no history for new products, so
those deletions have nothing to restore from; the app warns on the home page and
in Billing.
Source: README.md (Subscription Management; Deleted Product Recovery)

### HR-33 — Email alerts
Claim: Email alerts cover a revert (product, reverted fields, source), a product
deletion, and a throttled change digest — at most one per 30 minutes, and only
when three or more changes land together.
Source: README.md (Email Alerts)

### HR-34 — Alerts are a plan feature
Claim: Email alerts are available on the Scale and Enterprise plans, can be
toggled in Billing, and the recipient can be set with
Settings.emailPreferences.email.
Source: README.md (Email Alerts); app/config/plans.ts

### HR-35 — Your own reverts are not logged as merchant edits
Claim: Before a revert writes to Shopify, it records what it is about to write in
a short-lived Redis ledger, and the worker drops the parts of the incoming
webhook diff that the ledger accounts for; a webhook carrying both the revert and
a real edit keeps the edit.
Source: README.md (How It Works: Revert Process); app/services/revert-echo.service.ts

### HR-36 — Activity dashboard
Claim: The dashboard shows headline counts for all time, today and the selected
period, an activity trend, a breakdown by change type, the most changed products
and changes per staff member.
Source: README.md (Visual History & Analytics)

### HR-37 — Search and filters
Claim: History can be filtered by changed field, change type, date range and free
text.
Source: README.md (Visual History & Analytics); app/routes/app.logs.tsx

### HR-38 — Product page access
Claim: History is reachable per product, and an admin link extension puts the
same entry in the product's action menu in Shopify admin
(admin.product-details.action.link).
Source: extensions/view-history; README.md (Shopify Extension)

### HR-39 — Scale
Claim: The app is built to handle stores with 50,000+ products, using MongoDB for
records, Redis for queueing and caching, and BullMQ for background jobs.
Source: README.md (Performance & Scalability; Tech Stack)

### HR-40 — Permissions it asks for
Claim: The app requests read_themes, read_products, write_products,
write_inventory, read_inventory and read_locations — stock is read with
read_inventory and a location is confirmed with read_locations before stock is
written back.
Source: README.md (Environment Variables)
