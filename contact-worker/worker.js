/**
 * Contact-form relay: receives the `/contact` submission and sends it via Resend.
 *
 * ## Why this exists at all
 *
 * The website is a static export on GitHub Pages, so it has no server of its
 * own. Resend authenticates with a secret API key and has no browser-safe mode,
 * because a key the browser can read is a key anyone can read — in a static
 * build it would be inlined into a public JavaScript bundle, and whoever found
 * it could send mail as your verified domain for as long as it stayed valid.
 *
 * So the key lives here instead. This Worker is the only thing that ever sees
 * it: the site posts to this URL, this posts to Resend. Set
 * `NEXT_PUBLIC_CONTACT_ENDPOINT` on the site build to this Worker's URL — that
 * value is public by design and is meant to be.
 *
 * NEVER put RESEND_API_KEY in the website's environment, and never prefix it
 * with NEXT_PUBLIC_.
 *
 * ## Deploying
 *
 *   npm create cloudflare@latest contact-worker -- --type=hello-world
 *   # replace src/index.js with this file, then:
 *   npx wrangler secret put RESEND_API_KEY
 *   npx wrangler deploy
 *
 * Configure the rest in `wrangler.toml` (see the README beside this file).
 *
 * ## Porting
 *
 * The handler is a plain `Request` -> `Response` function, so it moves to any
 * runtime with that shape. On Vercel or Netlify, export it as the default
 * handler of an edge function and read `process.env` instead of `env`; nothing
 * else changes.
 */

/** Fields the forms send, and the limits this accepts. */
const LIMITS = {
  name: 200,
  email: 320, // The maximum length of an email address per RFC 3696 erratum.
  subject: 200,
  message: 5000,
  scale: 100 // Early-access only.
}

const cors = origin => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin'
})

const json = (body, status, origin) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) }
  })

/**
 * The origin this Worker will answer for.
 *
 * `ALLOWED_ORIGIN` is a comma-separated list so a preview deployment and the
 * live site can share one Worker. An origin that is not on the list gets the
 * first entry back, which is what makes the browser refuse the response — the
 * check is deliberately not "reflect whatever asked", because reflecting the
 * origin is the same as having no allowlist.
 */
function resolveOrigin(request, env) {
  const allowed = (env.ALLOWED_ORIGIN ?? '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)

  const origin = request.headers.get('Origin') ?? ''
  return allowed.includes(origin) ? origin : (allowed[0] ?? '')
}

/**
 * Validates against the shape the named form sends.
 *
 * Two forms post here — the contact form and the early-access signup — and they
 * require different fields: a waitlist entry is an address and nothing else, so
 * requiring a message would reject every one of them. `form` decides which
 * rules apply and defaults to `contact`, which is the stricter of the two: an
 * unlabelled payload is either an old client or something poking at the
 * endpoint, and neither should get the looser path.
 */
function validate(payload) {
  const errors = []
  const value = key => String(payload?.[key] ?? '').trim()
  const kind = value('form') === 'waitlist' ? 'waitlist' : 'contact'

  const email = value('email')
  if (!email) errors.push('email is required')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('email is not an address')
  }

  if (kind === 'contact') {
    if (!value('name')) errors.push('name is required')
    if (!value('message')) errors.push('message is required')
  }

  for (const [key, max] of Object.entries(LIMITS)) {
    if (value(key).length > max) errors.push(`${key} is longer than ${max}`)
  }

  return errors
}

/** Neutralises a header-injection attempt in a value that lands in a header. */
const oneLine = value =>
  String(value)
    .replace(/[\r\n]+/g, ' ')
    .trim()

/**
 * Renders a display name safely into a `Name <addr>` mailbox.
 *
 * `oneLine` already removes the CR/LF that would let a value break out into a
 * header of its own, which is the dangerous case. This handles the merely
 * malformed one: `reply_to` is a mailbox list, so a name containing `<`, `>` or
 * a comma restructures the field rather than sitting inside it. A name of
 * `Ann <ann@evil.example>` produced two apparent mailboxes and left which one a
 * reply reached up to whatever parsed it.
 *
 * RFC 5322 quoted-string, with `\` and `"` escaped, so the whole name is one
 * atom whatever it contains. Empty names return the bare address rather than an
 * empty pair of quotes, which some parsers reject.
 */
const mailbox = (name, address) => {
  const display = oneLine(name)
  if (!display) return address
  return `"${display.replace(/[\\"]/g, character => `\\${character}`)}" <${address}>`
}

/**
 * Per-IP rate limit, when one is bound.
 *
 * The controls already here stop the wrong *shape* of request — the honeypot,
 * the field rules, the length caps — and none of them stop the same valid
 * request arriving ten thousand times. CORS does not either: it is a browser
 * policy, and the preflight this Worker answers is something `curl` never asks
 * for. So the endpoint's real exposure is volume, and the cost of it is not
 * abstract: every accepted POST is an outbound Resend call against a paid quota
 * and a message in an inbox two people read by hand.
 *
 * Cloudflare's rate-limiting binding does the counting at the edge, so a
 * rejected request never reaches the Resend call. It is configured in
 * `wrangler.toml` rather than in code — see the README — and this stays optional
 * because the Worker must remain deployable by someone who has not set one up
 * yet. When it is absent the behaviour is exactly what it was before, and the
 * console line is there so "unlimited" is a state somebody chose rather than one
 * they inherited without noticing.
 *
 * Keyed on `CF-Connecting-IP`, which Cloudflare sets and a client cannot forge.
 * A missing value keys everything under one bucket, which is the safe direction
 * to fail: shared limit rather than no limit.
 */
async function withinRateLimit(request, env) {
  if (!env.RATE_LIMITER) {
    console.warn('rate limiting is not configured — see contact-worker/README')
    return true
  }

  const key = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  const { success } = await env.RATE_LIMITER.limit({ key })
  return success
}

const escapeHtml = value =>
  String(value).replace(
    /[&<>"']/g,
    char =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char]
  )

const handler = {
  async fetch(request, env) {
    const origin = resolveOrigin(request, env)

    if (request.method === 'OPTIONS') {
      // The form sends `Content-Type: application/json`, which is not a
      // simple request, so the browser preflights every submission.
      return new Response(null, { status: 204, headers: cors(origin) })
    }

    if (request.method !== 'POST') {
      return json({ error: 'Use POST.' }, 405, origin)
    }

    /* Before the body is read, so a flood costs this Worker a header lookup
       rather than a JSON parse. 429 with `Retry-After`: the site shows its
       generic failure message for any non-2xx, which already tells the reader
       to try again or use another route, and that is the right thing to say
       here — the sender of the one legitimate message caught behind somebody
       else's flood should not be told they did something wrong. */
    if (!(await withinRateLimit(request, env))) {
      return new Response(
        JSON.stringify({ error: 'Too many messages. Try again shortly.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            ...cors(origin)
          }
        }
      )
    }

    let payload
    try {
      payload = await request.json()
    } catch {
      return json({ error: 'Body must be JSON.' }, 400, origin)
    }

    /* Server-side honeypot. The site clears this before posting, so it only
       ever arrives filled in from something that skipped the form and posted
       here directly. Answer 200 rather than 4xx: a bot that is told it failed
       is a bot that tries a different shape. */
    if (String(payload?.company ?? '').trim()) {
      return json({ ok: true }, 200, origin)
    }

    const errors = validate(payload)
    if (errors.length) {
      return json({ error: errors.join('; ') }, 400, origin)
    }

    /* All three, not just the key. `MAIL_FROM` and `MAIL_TO` are passed
       straight to Resend, so an unset one sent `"from": undefined` and bought a
       502 and a log line about a rejected send — which reads as an upstream
       fault rather than as the missing variable it is. Same class of mistake as
       a missing key and it deserves the same distinct answer. */
    if (!env.RESEND_API_KEY || !env.MAIL_FROM || !env.MAIL_TO) {
      // Configuration fault, not the sender's fault — say so distinctly so it
      // is not mistaken for a validation failure while setting the Worker up.
      console.error(
        'relay misconfigured; missing:',
        [
          !env.RESEND_API_KEY && 'RESEND_API_KEY',
          !env.MAIL_FROM && 'MAIL_FROM',
          !env.MAIL_TO && 'MAIL_TO'
        ]
          .filter(Boolean)
          .join(', ')
      )
      return json({ error: 'The relay is not configured.' }, 500, origin)
    }

    const waitlist = String(payload.form ?? '') === 'waitlist'
    const name = oneLine(payload.name || '')
    const email = oneLine(payload.email)

    /* The two forms produce different mail on purpose. A waitlist entry is a
       record to file, a contact message is something to answer, and giving
       them the same subject line means the inbox cannot tell a lead from a
       question without opening both. The `[Early access]` prefix is stable so
       it can be filtered on. */
    const subject = waitlist
      ? `[Early access] ${name || email}`
      : `[${oneLine(payload.subject || 'Contact form')}] ${name || email}`

    const message = waitlist
      ? `Scale: ${oneLine(payload.scale || 'not given')}`
      : String(payload.message)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Must be an address on a domain verified in the Resend account. It is
        // deliberately NOT the sender's address: sending as them would fail
        // your own SPF/DKIM and land the mail in spam.
        from: env.MAIL_FROM,
        to: env.MAIL_TO,
        // So hitting Reply in the mail client answers the person who wrote in.
        // Quoted through `mailbox` — an unquoted display name containing a
        // comma or angle brackets turns this one address into an address list.
        reply_to: mailbox(name, email),
        subject,
        text: `From: ${name || '(no name given)'} <${email}>\n\n${message}`,
        html:
          `<p><strong>From:</strong> ${escapeHtml(name || '(no name given)')} ` +
          `&lt;${escapeHtml(email)}&gt;</p>` +
          `<hr><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`
      })
    })

    if (!response.ok) {
      // Log the upstream detail, return none of it: Resend's errors name the
      // account, the domain, and the key state, and none of that belongs in a
      // response to an anonymous poster.
      console.error('resend rejected', response.status, await response.text())
      return json({ error: 'The message could not be sent.' }, 502, origin)
    }

    return json({ ok: true }, 200, origin)
  }
}

export default handler
