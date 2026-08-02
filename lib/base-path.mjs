/**
 * Path prefix the site is served under.
 *
 * Plain JavaScript, not TypeScript, because `next.config.mjs` is loaded by Node
 * before any TypeScript tooling exists — and this value has to be identical in
 * the Next config and in `lib/site.ts`, so it lives in one file both can read.
 *
 * A GitHub Pages *project* site is served from `https://<user>.github.io/<repo>`.
 * Set BASE_PATH to '' when deploying to a domain root (a custom domain, or a
 * `<user>.github.io` user site).
 */
export const basePath = process.env.BASE_PATH ?? '/vendra-ecosystem-docs'
