# Facts — SO: Auto Tags | All-in-One

Ground truth for blog posts about Auto Tags. Every claim below is backed by the
path in `Source:`. A post may only assert what appears here.

Repo: `../Shop-Ops-Suite`

## Traps

- The FAQ text in `KNOWLEDGE_BASE.md` is partly stale on money: it lists Pro at
  $19.99 and different quotas. **`app/config/plans.ts` is authoritative** — Pro
  is $14.99/month, and Free is 200 tagger tags/month.
- Auto Tags is not an inventory app, not a metafield editor and not a scheduled
  batch engine: rules are event-triggered. Scheduled work is done through Data
  Reprocess or Shopify Flow.
- Do not promise tagging based on metafield conditions — the app works on
  standard Shopify fields.
- Never claim a rule can tag orders that were placed before it existed: that is
  what Data Reprocess is for.
- Tags applied by the app stay on the resources if the app is uninstalled; the
  app does not remove them on uninstall.

### AT-01 — What it is
Claim: Auto Tags is a Shopify automation app that tags orders, customers and
products from rules the merchant defines, and adds a tag cleaner, bulk tag
operations and an activity log.
Source: KNOWLEDGE_BASE.md (What is SO: Auto Tags); README.md

### AT-02 — Rules run on webhooks
Claim: Rules are evaluated in near real time from Shopify webhooks.
Source: README.md (Smart Tagger); shopify.app.auto-tags.toml

### AT-03 — Which webhooks
Claim: The app subscribes to orders/create, orders/updated, customers/create,
customers/update, customers/purchasing_summary, products/create and
products/update, plus app/uninstalled and app/scopes_update.
Source: shopify.app.auto-tags.toml

### AT-04 — Rule anatomy
Claim: A rule is a resource type (orders, customers or products), a set of
conditions, AND/OR logic, the tags to apply, an enable flag and a priority.
Source: app/routes/app.tagger_.new.tsx; app/models/TaggingRule.ts

### AT-05 — AND/OR logic
Claim: With AND logic every condition must match; with OR logic any one matching
condition is enough. Rules like "total > $500" and "country = US OR country = CA"
are combinations of those two modes.
Source: KNOWLEDGE_BASE.md (condition logic); app/types/tagger.types.ts

### AT-06 — Order conditions
Claim: Order rules can use order total, line item count, discount codes,
fulfillment status, financial status, shipping country/province/city, customer
email, customer tags, source name and risk level.
Source: KNOWLEDGE_BASE.md (order conditions); app/services/tagger.service.ts

### AT-07 — Customer conditions
Claim: Customer rules can use total spent, order count, email domain, accepts
marketing, verified email, first and last name, tags, country, province, city and
created date.
Source: KNOWLEDGE_BASE.md (customer conditions); app/services/tagger.service.ts

### AT-08 — Product conditions
Claim: Product rules can use vendor, product type, title, tags, price and
compare-at price, minimum and maximum variant price, inventory quantity, status
(active, draft, archived), published state, and created or updated date.
Source: KNOWLEDGE_BASE.md (product conditions); app/services/tagger.service.ts

### AT-09 — Line-item conditions
Claim: A rule can match on what is inside the order, for example
"line_items.title contains …" or "line_items.vendor = …".
Source: KNOWLEDGE_BASE.md (tag based on specific products)

### AT-10 — Reset on Mismatch
Claim: With Reset on Mismatch on, the app removes the tags a rule added once the
resource no longer matches the rule — the mechanism behind segments like a VIP
tag that follows a customer's spending.
Source: app/models/TaggingRule.ts; app/components/Tagger/RuleFormModal.tsx

### AT-11 — Tags are added, tags are counted once
Claim: If several rules apply the same tag, the tag appears once on the resource,
but each rule trigger counts as an operation against the plan quota.
Source: KNOWLEDGE_BASE.md (multiple rules, same tag)

### AT-12 — Priority
Claim: Priority decides the order rules are evaluated in, lower number first,
with a default of 10.
Source: KNOWLEDGE_BASE.md (priority)

### AT-13 — Enable, disable, duplicate
Claim: Every rule has an enable toggle; duplicating a rule creates a disabled
copy with "(Copy)" appended to its name.
Source: KNOWLEDGE_BASE.md (enable/disable, duplicate)

### AT-14 — Export and import rules
Claim: All rules can be exported to a JSON file and imported back, which also
moves a rule set between stores.
Source: KNOWLEDGE_BASE.md (export/import rules)

### AT-15 — Data Reprocess
Claim: Data Reprocess applies rules to existing data — by a specific resource ID,
by date range, or across all resources — which is how a new rule reaches
historical orders.
Source: KNOWLEDGE_BASE.md (Data Reprocess)

### AT-16 — Rule library
Claim: The app ships a rule library of pre-built recipes (VIP customer,
wholesale order, high-value order and about 125 seeded tagging rules in total,
plus 30 metafield recipes) that can be imported and then edited.
Source: KNOWLEDGE_BASE.md (Rule Library); rules.md

### AT-17 — Testing a rule safely
Claim: A rule can be saved disabled, then run through Data Reprocess against one
resource ID, and its result checked in the Activity Log before the rule is
enabled.
Source: KNOWLEDGE_BASE.md (test a rule before enabling)

### AT-18 — Data Cleaner
Claim: The Data Cleaner scans the store through Shopify's Bulk Operations API and
finds duplicate tags (case-insensitive, like "Sale" and "sale"), orphaned tags
and malformed tags.
Source: KNOWLEDGE_BASE.md (Data Cleaner, Deep Scan); app/services/bulk_operation.service.ts

### AT-19 — Merging tags
Claim: Cleaner has a merge mode: pick the duplicate tags, name the target tag,
and the duplicates are merged into it.
Source: KNOWLEDGE_BASE.md (merge similar tags)

### AT-20 — Bulk operations
Claim: Bulk operations cover three jobs — find and replace a tag, add a tag, or
remove a tag — across everything that matches, and always show a preview with how
many resources will change before anything is written.
Source: app/routes/app.bulk.tsx; KNOWLEDGE_BASE.md (Bulk Operations, preview)

### AT-21 — Reverting bulk operations is a Pro feature
Claim: Pro adds Backup & Revert: each bulk operation keeps a backup and can be
reverted from the Activity Log.
Source: app/config/plans.ts (Pro features); app/models/Backup.ts; app/services/revert.service.ts

### AT-22 — Activity log
Claim: Every rule trigger, bulk operation and cleanup job is logged with a
timestamp, a status (Success, Failed or Pending) and details, and can be filtered
by category, status and date range.
Source: KNOWLEDGE_BASE.md (Activity Log); app/routes/app.activity.tsx; app/models/ActivityLog.ts

### AT-23 — Log retention
Claim: Activity logs are pruned by a configurable retention window — the app's
documented default is 90 days.
Source: app/services/activity.service.ts (cleanupOldLogs); KNOWLEDGE_BASE.md (activity data)

### AT-24 — Plans
Claim: Free is $0 with unlimited rules, 200 tagger tags, 500 bulk operations, 500
cleaner operations and 10 AI rule generations per month; Basic is $4.99/month or
$49.99/year for 2,000 tagger tags, 3,000 bulk and 3,000 cleaner operations with
unlimited AI rule generations.
Source: app/config/plans.ts

### AT-25 — Pro plan
Claim: Pro is $14.99/month or $149.99/year and removes every operation limit,
adds Backup & Revert and priority support.
Source: app/config/plans.ts

### AT-26 — What counts as an operation
Claim: An operation is counted whenever the app modifies a resource — one tag
applied counts as one, each resource cleaned counts as one, each modified
resource in a bulk job counts as one — and the quota resets monthly.
Source: KNOWLEDGE_BASE.md (what counts as an operation)

### AT-27 — Hitting the quota
Claim: When the monthly quota is used up, rules stop processing new events and
the app shows a warning banner; upgrading applies the larger quota immediately.
Source: KNOWLEDGE_BASE.md (quota exceeded)

### AT-28 — Usage visibility
Claim: Billing & Usage shows the current plan, this month's usage against the
limit, the last three months of usage and a progress bar.
Source: KNOWLEDGE_BASE.md (check usage)

### AT-29 — Shopify Flow triggers
Claim: The app ships six Flow triggers — Customer Tag Applied, Customer Tag
Removed, Order Tag Applied, Order Tag Removed, Product Tag Applied and Product
Tag Removed — each carrying a reference to the resource and the rule name, so an
existing automation can be chained after a tag lands.
Source: extensions/flow-trigger-*/shopify.extension.toml

### AT-30 — Background processing
Claim: Heavy work runs in background jobs on a Redis and BullMQ queue, and store
scans use Shopify's Bulk Operations API, so the storefront is not loading the
work.
Source: README.md (Architecture, Infrastructure); KNOWLEDGE_BASE.md (store performance); app/services/scheduler.service.ts

### AT-31 — Storage
Claim: Rules, logs and configuration live in MongoDB; rules are modelled in
app/models/TaggingRule.ts and usage counters in app/models/Usage.ts.
Source: README.md (Architecture); app/models/TaggingRule.ts; app/models/Usage.ts

### AT-32 — Dashboard
Claim: The app home page shows store statistics (orders, products, customers),
active rule count and AI suggestions for inventory and marketing.
Source: README.md (Dashboard & AI Advisor); app/services/dashboard.service.ts

### AT-33 — Permissions it asks for
Claim: The app requests read_themes, write_customers, write_inventory,
write_orders and write_products.
Source: shopify.app.auto-tags.toml

### AT-34 — Uninstalling
Claim: Rules and settings survive an uninstall for 30 days; tags already applied
to resources stay on those resources because they are Shopify data.
Source: KNOWLEDGE_BASE.md (uninstall)

### AT-35 — Not a scheduler
Claim: Every rule is event-triggered; scheduled batch tagging is done with Data
Reprocess over a date range or with Shopify Flow's scheduled triggers.
Source: KNOWLEDGE_BASE.md (scheduled rules)

### AT-36 — Metafield conditions are not supported
Claim: Conditions work on standard Shopify fields; metafield-based conditions
require Shopify Flow or a feature request.
Source: KNOWLEDGE_BASE.md (custom metafield values in conditions)
