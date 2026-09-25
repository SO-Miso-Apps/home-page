/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

/**
 * Worker bindings, mirroring `wrangler.jsonc`.
 *
 * Hand-written on purpose: `pnpm cf-typegen` emits the same bindings plus
 * ~600 KB of workerd runtime types. `Cloudflare.Env` is the interface
 * `import { env } from "cloudflare:workers"` resolves against — the global `Env`
 * alias is what the adapter and `ExportedHandler<Env>` reach for. When a binding
 * is added or renamed in `wrangler.jsonc`, change it here too (or delete this
 * file and commit the generated `worker-configuration.d.ts` instead).
 */
interface MisoBindings {
  DB: D1Database;
  MEDIA: R2Bucket;
  CACHE: KVNamespace;
  IMAGES: ImagesBinding;
  /** Contact form delivery; restricted to one sender and one recipient. */
  EMAIL: SendEmail;
  EMDASH_ENCRYPTION_KEY: string;
}

declare namespace Cloudflare {
  interface Env extends MisoBindings {}
}

interface Env extends MisoBindings {}
