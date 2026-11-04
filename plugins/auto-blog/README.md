# Auto Blog (EmDash plugin)

Writes Shopify app comparison posts with Claude on a schedule: researches the
Shopify App Store (web search and fetch limited to apps.shopify.com), writes a
neutral comparison as structured JSON, converts it to Portable Text (with the
comparison table), renders a 1200×630 cover, and saves the post as a draft or
publishes it. Our own apps (`src/our-apps.ts`) are added only in the niches
they compete in, with a disclosure line.

Admin → **Auto Blog**: Claude API key (stored encrypted with
`EMDASH_ENCRYPTION_KEY`), schedule (UTC weekdays and hour), draft or publish,
model, topic queue, editor brief, "Write a post now", and the run log.

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
