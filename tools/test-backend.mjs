// Direct backend test of site/backend/contact.php (no browser). Needs the local server + fake SMTP running:
//   node tools/fake-smtp.js &  then  SITE_ENV_FILE=<test.env> php -S 127.0.0.1:8080 -t site tools/dev-router.php
// (test.env must point SMTP at 127.0.0.1:2525 and set RATE_LIMIT_MAX high.) Usage: node tools/test-backend.mjs [baseUrl]
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = new URL(process.argv[2] || 'http://127.0.0.1:8080');
const SINK = join(dirname(fileURLToPath(import.meta.url)), 'smtp-received.txt');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const req = (method, path, body, headers = {}) => new Promise((resolve, reject) => {
  const data = body ? new URLSearchParams(body).toString() : null;
  const r = http.request({ host: BASE.hostname, port: BASE.port, path, method, headers: { ...(data ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(data) } : {}), ...headers } }, (res) => {
    let b = ''; res.on('data', (c) => (b += c)); res.on('end', () => { let j = null; try { j = JSON.parse(b); } catch { /* not json */ } resolve({ status: res.statusCode, json: j, raw: b }); });
  });
  r.on('error', reject); if (data) r.write(data); r.end();
});
const sent = () => (existsSync(SINK) ? (readFileSync(SINK, 'utf8').match(/^DATA/gm) || []).length : 0);
const tok = async () => (await req('GET', '/backend/token.php')).json;

const valid = { name: 'Test Person', email: 'person@example.com', phone: '+1 323 509 3062', consent: 'yes' }; // consent box is required (fix list H02)
const results = []; let pass = 0, fail = 0;
const check = (label, ok, detail = '') => { (ok ? pass++ : fail++); results.push(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : '  -> ' + detail}`); };

const t = await tok(); await sleep(3300); // age the token past the 3 s anti-bot check
const post = (fields, opts = {}) => req('POST', '/backend/contact.php', { csrf_token: t.token, form_ts: t.ts, form_source: 'backend-test', ...fields }, { Origin: opts.origin || BASE.origin });
const reject = async (label, fields, field) => { const r = await post(fields); check(`reject: ${label}`, r.status === 422 && r.json && r.json.ok === false && (!field || (r.json.errors || {})[field]), `${r.status} ${r.raw.slice(0, 120)}`); };
const accept = async (label, fields) => { const r = await post(fields); check(`accept: ${label}`, r.status === 200 && r.json && r.json.ok === true, `${r.status} ${r.raw.slice(0, 120)}`); };

const before = sent();
// ---- required fields missing / blank
await reject('all fields empty', {}, 'name');
const noName = await post({ email: valid.email, phone: valid.phone }); check('reject: missing name (error keyed to name)', noName.status === 422 && !!noName.json.errors?.name, noName.raw);
await reject('whitespace-only name', { ...valid, name: '     ' }, 'name');
await reject('1-character name', { ...valid, name: 'A' }, 'name');
await reject('missing email', { name: valid.name, phone: valid.phone }, 'email');
await reject('whitespace-only email', { ...valid, email: '   ' }, 'email');
await reject('missing phone', { name: valid.name, email: valid.email }, 'phone');
await reject('whitespace-only phone', { ...valid, phone: '   ' }, 'phone');
// ---- invalid formats
for (const e of ['plain', 'a@b', 'a b@c.com', '@x.com', 'x@.com', 'x@@y.com']) await reject(`invalid email "${e}"`, { ...valid, email: e }, 'email');
for (const p of ['abc', '123', '555-CALL', '12345678901234567890', '++1 323 509 3062x']) await reject(`invalid phone "${p}"`, { ...valid, phone: p }, 'phone');
await reject('unknown service value', { ...valid, service: 'nonsense' }, 'service');
// ---- valid: only the three required fields, every optional field blank/absent
await accept('only name + email + phone', valid);
await accept('three required + consent, all optional fields present but empty', { ...valid, service: '', message: '', book_title: '', manuscript_status: '' });
{ const { consent, ...noConsent } = valid; await reject('consent checkbox not ticked (field absent)', noConsent, 'consent'); await reject('consent empty string', { ...valid, consent: '' }, 'consent'); await reject('consent with wrong value', { ...valid, consent: 'no' }, 'consent'); }
await accept('consent ticked + service + message', { ...valid, service: 'book-formatting', message: 'Optional text' });
// legitimate international / formatted phone numbers
for (const p of ['+1 323 509 3062', '+44 20 7946 0958', '(323) 509-3062', '323.509.3062', '+91 98765 43210', '+49-30-123456', '+61 2 9374 4000']) await accept(`phone "${p}"`, { ...valid, phone: p });
await accept('non-ASCII name', { ...valid, name: 'José Núñez' });
const expectedSends = 3 + 7 + 1; // only(1) + optional-empty(1) + service/message(1) + 7 phone formats + non-ASCII name(1) = 11 // accept() calls above, none of the rejected ones may send mail
// ---- protections still active (none of these may send mail)
const bad = await post(valid, { origin: 'http://evil.example' }); check('protect: foreign Origin rejected (403)', bad.status === 403, String(bad.status));
const forged = await req('POST', '/backend/contact.php', { ...valid, csrf_token: 'forged', form_ts: t.ts }, { Origin: BASE.origin }); check('protect: forged token rejected (400)', forged.status === 400, String(forged.status));
const hp = await post({ ...valid, website: 'http://spam.example' }); check('protect: honeypot gets silent success but sends nothing', hp.status === 200 && hp.json.ok === true);
const fresh = await tok(); const quick = await req('POST', '/backend/contact.php', { ...valid, csrf_token: fresh.token, form_ts: fresh.ts }, { Origin: BASE.origin }); check('protect: instant submission rejected (429)', quick.status === 429, String(quick.status));
const get = await req('GET', '/backend/contact.php'); check('protect: GET not allowed (405)', get.status === 405, String(get.status));
await sleep(800);
const delta = sent() - before; check(`mail: exactly the ${expectedSends} accepted submissions were emailed (sink saw ${delta})`, delta === expectedSends, String(delta));

console.log(results.join('\n')); console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
