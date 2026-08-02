/**
 * Path prefix the site is served under.
 *
 * Plain JavaScript, not TypeScript, because `next.config.mjs` is loaded by Node
 * before any TypeScript tooling exists — and this value has to be identical in
 * the Next config and in `lib/site.ts`, so it lives in one file both can read.
 *
 * This site is served from the root of its own domain, so the default is empty.
 * Set BASE_PATH to `/<repo>` only when publishing to a GitHub Pages *project*
 * site, which is served from `https://<user>.github.io/<repo>`.
 */
export const basePath = process.env.BASE_PATH ?? ''
