# Vendra Ecosystem Docs

Documentation for the Vendra platform, controller, storefront, and operations —
the three cooperating repositories documented as one system.

Built with [Nextra 4](https://nextra.site) on Next.js 16, with
[Pagefind](https://pagefind.app) for offline search.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Search is not available in `dev`: the Pagefind index is generated from
prerendered HTML by the `postbuild` step. To exercise search locally:

```bash
npm run build && npm start
```

## Repository layout

```
app/                 One directory per route; content lives in page.mdx
  _meta.tsx          Sidebar order and labels (one per section directory)
  layout.tsx         Navbar, footer, fonts, and site-wide metadata
  globals.css        Design tokens and every .vendra-* class
  robots.ts          Generated robots.txt
  sitemap.ts         Generated sitemap.xml; lastmod from each page's git history
  opengraph-image.tsx  Social share card, rendered at build time
components/vendra.tsx  The design system
mdx-components.tsx     Registers that design system globally for MDX
lib/site.ts            Canonical origin, site name, description
lib/base-path.mjs      Path prefix, shared with next.config.mjs (plain JS)
lib/navigation.ts      Navbar and footer labels, derived from app/_meta.tsx
lib/collection.ts      The dated-entry engine behind /blog and /faq
lib/blog.ts lib/faq.ts Those two sections, bound to their roots
lib/authors.ts         Post authors and their avatars
components/collection.tsx  Entry headers, listings, and tag clouds
scripts/               The validators described below, plus their tests
```

## Writing content

A page is `app/<section>/<page>/page.mdx` plus an entry in that section's
`_meta.tsx`. Frontmatter carries the description used for SEO:

```mdx
---
description: "One sentence, used as the meta description."
---

# Page title

<Lede>The opening paragraph.</Lede>
```

Every component in `components/vendra.tsx` is registered globally, so MDX uses
`<Lede>`, `<Steps>`, `<DefList>`, `<CommandList>`, `<FeatureGrid>` and the rest
**without imports**. They take array props rather than nested JSX children —
MDX indentation rules make deeply nested markup fragile.

Two constraints worth knowing before adding a component:

- Components that wrap MDX block children render a `<div>`, never a `<p>`. MDX
  wraps block children in their own paragraph, and a `<p>` inside a `<p>` is
  invalid HTML that fails hydration at runtime. `check:html` catches this.
- `tsc` does not typecheck `.mdx`, which is where nearly every call site lives.
  Props that must not be wrong silently are validated at runtime instead — an
  unknown `<Tag tone="...">` throws during prerender, so a typo fails the build
  rather than rendering a plausible-looking wrong colour.

## Checks

```bash
npm run check
```

Runs, in order:

| Step | What it protects against |
| --- | --- |
| `typecheck` | Type errors (`strict` is on) |
| `check:links` | Internal links and `_meta.tsx` keys pointing at routes that do not exist |
| `check:drift` | Docs disagreeing with the contracts they describe |
| `check:blog` | Blog/FAQ frontmatter that would make an entry silently invisible |
| `test` | The validators themselves silently breaking |
| `build` | Build failures; also static-exports to `out/` and generates the Pagefind index |
| `check:html` | Invalid HTML nesting in the exported output |

All of them run offline. No server, no network.

### About `npm test`

The validators are regex parsers aimed at files that change for unrelated
reasons, and their dangerous failure mode is silence — a pattern stops matching,
nothing gets validated, and the check still prints a tick. That has happened
once already: an MDX comment written to explain the drift coupling contained the
exact phrase the parser anchored on, so it parsed the comment instead of the
list.

`scripts/check.test.mjs` therefore asserts that each check *fails when it
should*, by copying the real sibling contracts into a fixture, mutating one
thing, and requiring the specific error. The unmutated fixture must pass first,
so a failure means the mutation caused it.

### About `check:drift`

This is the one that keeps the docs honest. It compares two machine-readable
contracts in the sibling repositories against the pages describing them:

| Contract | Page |
| --- | --- |
| `vendra-controller/api/openapi.yaml` | `app/controller/provisioning/page.mdx` |
| `vendra-storefront-florist/properties/schema.json` | `app/storefront/configuration/page.mdx` |
| `vendra/packages/` | `app/platform/packages/page.mdx` |

Drift is reported **in both directions**. A contract item missing from the docs
is an undocumented feature; a documented item missing from the contract is
worse, because it sends readers looking for something that no longer exists.

Because this repository stands alone, those files are usually absent — a fresh
clone, or CI. The check then skips cleanly rather than failing. It is a safety
net for when the whole ecosystem is checked out side by side, not a build
dependency. Point it elsewhere with `VENDRA_ECOSYSTEM_DIR`:

```bash
VENDRA_ECOSYSTEM_DIR=~/src/vendra npm run check:drift
```

The optional-field list in `storefront/configuration` is read out of a prose
sentence; that page carries a comment saying so. Reword it freely, but keep the
words "Optional fields include" and the backticks.

## Blog and FAQ

Two dated sections, one implementation.

| Section | Contains | Lives at |
| --- | --- | --- |
| `/faq` | Questions actually asked by clients, operators, and developers, answered in full | `app/faq/<slug>/page.mdx` |
| `/blog` | Technology notes, the decisions behind the ecosystem, announcements | `app/blog/<slug>/page.mdx` |

The split is editorial, not technical: an FAQ entry answers something someone
asked, a blog post explains something we chose. Neither restates the docs — the
docs are the reference, and both sections link into them.

An entry is a page with a `date`:

```mdx
---
title: "Two origins, one certificate"
date: "2026-07-28"
author: "Misaf"
description: "One sentence, used in the index, the feed, and search."
tags: ["operations", "tls"]
---

# Two origins, one certificate

Body, using the same components as the docs.
```

That is the whole workflow. Section indexes, tag pages, the RSS feed at
`/feed.xml`, and the sitemap are all derived from frontmatter through Nextra's
page map — there is no list to maintain, and tag pages are generated from the
tags actually in use.

`lib/collection.ts` is the engine; `lib/blog.ts` and `lib/faq.ts` bind it to a
section root, and `components/collection.tsx` renders both. Tags are scoped per
section, so `/blog/tags/controller` and `/faq/tags/controller` are different
pages — mixing questions with technology notes on one tag page would undo the
split. The RSS feed carries blog posts only.

The date/author/tags header above each entry is rendered from that same
frontmatter by the `wrapper` override in `mdx-components.tsx`, so an entry never
restates it in the body — it recovers which section it is in from the `filePath`
Nextra puts in page metadata. A `date` is what marks a page as an entry; no docs
page has one.

Author avatars come from `lib/authors.ts`, keyed by the `author` string, with
images committed under `public/authors/`. An unknown author still renders, just
without an avatar or link.

Entries are indexed by Pagefind. The indexes and tag listings are not — they
contain the same titles, and indexing both returns every result twice.

> `check:blog` covers both sections. It exists because that frontmatter-driven
> design fails quietly: an entry missing its `date` still builds and is still
> reachable by URL, it just never appears in the index, the tags, or the feed.

Deliberately not a second Nextra theme. `nextra-theme-blog` is version-compatible
with the docs theme, but Next.js allows only one global `mdx-components.tsx`, and
both themes map the same MDX primitives — so one would have to win for the whole
site. The blog and the FAQ are sections of this site, sharing its design system.

## Deployment

The site is statically exported (`output: 'export'`) to `out/` and published to
GitHub Pages by the `deploy` job in `.github/workflows/ci.yml`, which runs on
pushes to `master` after `check` passes.

<https://misaf.github.io/vendra-ecosystem-docs>

Enable it once under **Settings → Pages → Source → GitHub Actions**.

### Base path

A GitHub Pages *project* site is served from `/<repo>`, not the domain root, so
the build sets `basePath` (see `lib/base-path.mjs`). This has one consequence
worth remembering when writing components:

> `next/link` and Next's own asset URLs get the prefix automatically.
> A plain `<a href="/foo">` does **not**, and will 404 in production while
> working perfectly in local development.

Everything internal therefore uses `next/link` — see `components/vendra.tsx` and
the footer in `app/layout.tsx`. The favicon is declared explicitly in
`metadata.icons` for the same reason: a generated `app/icon` route emits a
`<link rel="icon">` without the prefix.

Moving to a custom domain means setting `BASE_PATH=` (empty) and updating
`NEXT_PUBLIC_SITE_URL`.

### Site URL

`NEXT_PUBLIC_SITE_URL` is read at **build** time, not runtime. `NEXT_PUBLIC_*`
values are inlined into the output, and canonical tags plus `sitemap.xml` are
generated during `next build`. Setting it only in the runtime environment has no
effect. Unset, URLs fall back to `http://localhost:3000`, which is deliberately
and visibly wrong rather than silently pointing at somebody else's domain.

The `check` job builds without it on purpose: it validates that the site builds,
it does not publish. The `deploy` job supplies the real origin.

## Scope

These pages describe how the repositories cooperate and where each
responsibility belongs. Package-level implementation detail stays in each
repository's own README.
