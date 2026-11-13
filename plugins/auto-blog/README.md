# Auto Blog (EmDash plugin)

Writes blog posts for Shopify merchants with Claude on a schedule, in eight
types (`src/article-types.ts`):

| Type | Example | Research sources | Target share |
| --- | --- | --- | --- |
| `howto` | How to add a wishlist to Shopify | help.shopify.com, shopify.dev, App Store | 20% |
| `problem` | Why Shopify customers abandon wishlists | open web (studies, Baymard, NN/g, Shopify) | 15% |
| `feature` | How to set up price drop alerts in Shopify | help.shopify.com, shopify.dev, App Store | 20% |
| `best` / `alternatives` / `versus` | Wishlist Hero vs Themivo | apps.shopify.com only | 25% |
| `technical` | Shopify wishlist API integration guide | shopify.dev, help center, GitHub | 10% |
| `research` | Does a wishlist increase conversion rates? | open web (original research only) | 10% |

Each run: (1) plan: settle the topic and type (a queued topic, optionally with
a `type:` prefix, or a fresh topic of the type furthest below its target
share); (2) research with that type's sources; (3) write structured JSON with
the type's article structure; then convert to Portable Text (tables and code
blocks), render a 1200×630 cover with the type's kicker, and save the post as
a draft or publish it. The type sets the category (`app-comparisons`,
`how-to`, `troubleshooting`, `developers`, `research`, created on first use)
and is recorded per post in KV (`state:postTypes`). Our own apps
(`src/our-apps.ts`) are mentioned only where they genuinely do the job, as one
option among equals, with a disclosure line.

Admin → **Auto Blog**: Claude API key (stored encrypted with
`EMDASH_ENCRYPTION_KEY`), schedule (UTC weekdays and hour), draft or publish,
model, topic queue (optional `howto:`, `feature:`, `research:` … prefixes), editor brief, "Write a post now", and the run log.

## Shared between themivo.com and misoapps.com

The same plugin runs in two repos:

- `themivo/plugins/auto-blog` (`@themivo/plugin-auto-blog`)
- `home-page/plugins/auto-blog` (`@misoapps/plugin-auto-blog`)

Only `src/brand.ts` (site name, origin, which publisher is "us", post field
names, cover colours and logo), `fonts/` (cover fonts) and `package.json`
(name) differ. Keep every other file identical: when you change one, copy it
to the other repo, for example

```bash
rsync -a --exclude brand.ts ../themivo/plugins/auto-blog/src/ plugins/auto-blog/src/
```

`src/our-apps.ts` lists the live apps of both studios; update it in both repos
when an app launches or a listing changes.
