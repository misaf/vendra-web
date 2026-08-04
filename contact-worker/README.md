# Contact relay

Both website forms post here and this sends the result through Resend. It
exists because the site is a static export with no server, and the Resend API
key must never reach a browser.

Two forms, distinguished by a `form` field in the body:

| `form` | Sent from | Required fields | Subject |
|---|---|---|---|
| `contact` (default) | `/contact` | `email`, `name`, `message` | `[<subject>] <name>` |
| `waitlist` | `/signup` and the widget on `/pro` | `email` | `[Early access] <name or email>` |

Neither form collects a password, and neither ever should. This relay puts its
payload into an email, so anything posted to it ends up sitting in an inbox in
plain text. When self-serve sign-up lands, account creation has to post to the
platform's own auth API instead — not here.

## The one rule

`RESEND_API_KEY` goes in this Worker's secrets and nowhere else.

It must never appear in the website's environment, in `.env`, or under any
`NEXT_PUBLIC_` name. A `NEXT_PUBLIC_` value is inlined into the public
JavaScript bundle at build time, so publishing the key there hands anyone who
views source the ability to send mail as your verified domain until you rotate
it.

The website only ever knows `NEXT_PUBLIC_CONTACT_ENDPOINT`, which is this
Worker's public URL. That one is public on purpose.

## Deploy

```sh
npm create cloudflare@latest contact-worker -- --type=hello-world
cd contact-worker
# replace src/index.js with worker.js from this directory
npx wrangler secret put RESEND_API_KEY   # paste the key when prompted
npx wrangler deploy
```

`wrangler.toml`:

```toml
name = "vendra-contact"
main = "src/index.js"
compatibility_date = "2026-01-01"

[vars]
# Comma-separated. Include every origin the form is served from.
ALLOWED_ORIGIN = "https://vendra.dev,http://localhost:3000"

# Must be on a domain verified in Resend.
MAIL_FROM = "Vendra site <contact@vendra.dev>"

# Where the enquiries land.
MAIL_TO = "you@example.com"

# Per-IP rate limit, checked before the body is parsed and before Resend is
# called. Optional: without this binding the Worker still deploys and still
# works, but it logs a warning on every request and nothing caps the volume.
# Every accepted POST is a billed Resend call and a message two people read by
# hand, so deploy this before the endpoint is public.
#
# 5 submissions per minute per IP is generous for a human and useless for a
# loop. `simple` is Cloudflare's built-in limiter — no KV or Durable Object to
# provision.
[[unsafe.bindings]]
name = "RATE_LIMITER"
type = "ratelimit"
namespace_id = "1001"
simple = { limit = 5, period = 60 }
```

`RESEND_API_KEY` is set with `wrangler secret put`, not in `[vars]` — values in
`[vars]` are stored in plain text in this file.

## Point the site at it

Set this in the website's build environment (GitHub Actions, or wherever
`next build` runs):

```
NEXT_PUBLIC_CONTACT_ENDPOINT=https://vendra-contact.<your-subdomain>.workers.dev
```

Until it is set, `/contact` renders the direct-channel links and no form, which
is intentional — see `components/contact-form.tsx`.

## Verify

```sh
# contact
curl -i -X POST https://vendra-contact.<your-subdomain>.workers.dev \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://vendra.dev' \
  -d '{"form":"contact","name":"Test","email":"you@example.com","subject":"A plan or a quote","message":"Checking the relay works end to end."}'

# early access
curl -i -X POST https://vendra-contact.<your-subdomain>.workers.dev \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://vendra.dev' \
  -d '{"form":"waitlist","email":"you@example.com","name":"Test","scale":"A handful of client sites"}'
```

Expect `200` and `{"ok":true}`. Common failures:

| Response | Cause |
|---|---|
| `500 The relay is not configured.` | One of `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO` is unset — `wrangler tail` names which |
| `502 The message could not be sent.` | Resend rejected it — check `wrangler tail`; usually `MAIL_FROM` is not on a verified domain |
| `429 Too many messages.` | The per-IP limit. Expected while running the checks above more than five times in a minute |
| CORS error in the browser, `curl` fine | The site's origin is not in `ALLOWED_ORIGIN` |

Run either `curl` six times in a row to confirm the limiter is bound: the sixth
should be a `429`. If all six return `200`, the binding is missing — check
`wrangler tail` for the `rate limiting is not configured` warning.

## What stops abuse, and what does not

Worth being explicit, because the three controls here defend against different
things and it is easy to assume one covers another:

- **The honeypot** catches bots that fill every field they find. It is checked
  server-side as well as in the browser, so skipping the form does not skip it.
- **Validation and the length caps** reject the wrong *shape* of request.
- **The rate limit** is the only thing that bounds *volume*, which is the actual
  exposure: a valid, well-formed, honeypot-clean message repeated in a loop
  passes every other control here.
- **CORS stops none of it.** It is a browser policy. `curl` never sends the
  preflight and never reads the allowlist, so treat the allowlist as tidiness
  rather than as a control.

If the endpoint starts attracting real abuse, the next step is
[Turnstile](https://developers.cloudflare.com/turnstile/) — verify the token
here before the Resend call. That is a bigger change than the limiter because
the form has to render and submit the widget too.
