// Permanent guard: every <form> must require Name, Email, Phone AND the (unticked) privacy/terms box, keep everything else optional,
// and show the KDP/non-affiliation disclosure directly under the submit button (Microsoft Ads fix list C01, H02).
// Usage: node tools/audit-forms.mjs   (exit code 1 on any violation). Run after every build.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = process.argv[2] ? resolve(process.argv[2]) : join(dirname(fileURLToPath(import.meta.url)), '..', 'site'); // optional: audit an extracted zip instead
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(SITE).filter((f) => f.endsWith('.html'));

const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([a-zA-Z_:-]+)(?:="([^"]*)")?/g)].slice(1).map((m) => [m[1], m[2] ?? true]));
const violations = []; const list = [];
const REQUIRED = ['email', 'name', 'phone'];

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const page = '/' + relative(SITE, f).replace(/\\/g, '/').replace(/\.html$/, '').replace(/^index$/, '');
  for (const m of html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/g)) {
    const fa = attrs('<form ' + m[1]); const body = m[2]; const id = fa.id || '(no id)';
    const controls = [...body.matchAll(/<(input|select|textarea)\b([^>]*)>/g)].map((c) => ({ tag: c[1], ...attrs('<x ' + c[2]) }));
    const byName = (n) => controls.find((c) => c.name === n);
    const where = `${page} #${id}`; const bad = (msg) => violations.push(`${where}: ${msg}`);
    list.push(where);

    if (!String(fa.class || '').includes('lead-form')) bad('form is not a .lead-form, so the shared validation/submit handler is NOT attached');
    if (fa.method !== 'post' || fa.action !== '/backend/contact.php') bad(`unexpected method/action ${fa.method} ${fa.action}`);
    for (const n of REQUIRED) {
      const c = byName(n);
      if (!c) { bad(`missing field "${n}"`); continue; }
      if (!c.required) bad(`field "${n}" is not required`);
      if (n === 'email' && c.type !== 'email') bad('email field is not type=email');
      if (n === 'phone' && c.type !== 'tel') bad('phone field is not type=tel');
      if (n === 'name' && c.type !== 'text') bad('name field is not type=text');
      // visible required marker and associated label
      const label = new RegExp(`<label for="${c.id}">([^<]*(?:<span[^>]*>[^<]*</span>)?[^<]*)</label>`).exec(body);
      if (!label) bad(`field "${n}" has no associated label`);
      else if (!/class="req"/.test(label[1])) bad(`field "${n}" has no visible required marker`);
    }
    const required = controls.filter((c) => c.required && c.type !== 'hidden').map((c) => c.name).sort();
    const extra = required.filter((n) => !REQUIRED.includes(n) && n !== 'consent');
    if (extra.length) bad(`optional fields are marked required: ${extra.join(', ')}`);
    // optional controls must not carry a required marker
    const stars = [...body.matchAll(/<label[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/label>/g)].filter((l) => l[2].includes('class="req"')).map((s) => controls.find((c) => c.id === s[1])?.name);
    const wantStars = [...REQUIRED, 'consent'].sort().join();
    if (stars.sort().join() !== wantStars) bad(`required markers on [${stars.join(', ')}] instead of [${wantStars}]`);
    const cs = byName('consent');
    if (!cs || !cs.required || cs.checked) bad('consent checkbox must exist, be required and be UNticked by default');
    // the disclosure paragraph must come immediately after the submit button's closing tag (whitespace allowed)
    const afterBtn = body.slice(body.indexOf('</button>') + '</button>'.length).replace(/^\s+/, '');
    const wantDisc = '<p class="form-disclosure">Independent service: we are not affiliated with or endorsed by Amazon. You can publish on Amazon KDP yourself for free at <a href="https://kdp.amazon.com" target="_blank" rel="noopener nofollow">kdp.amazon.com</a>. We charge only for the optional services you choose.</p>';
    if (!afterBtn.startsWith(wantDisc)) bad('KDP/non-affiliation disclosure is not directly under the submit button');
    for (const n of ['website', 'csrf_token', 'form_ts', 'form_source', 'page_url']) if (!byName(n)) bad(`missing protection/tracking field "${n}"`);
    if (!/<button[^>]*type="submit"/.test(body)) bad('no submit button');
    if (!/href="\/privacy-policy"/.test(body)) bad('no privacy-policy link');
  }
}

console.log(`forms found: ${list.length} across ${new Set(list.map((l) => l.split(' #')[0])).size} pages`);
console.log(violations.length ? `VIOLATIONS (${violations.length}):\n` + violations.join('\n') : 'All forms require Name, Email, Phone and the unticked consent box, keep other fields optional, and carry the disclosure under the button.');
if (process.env.LIST_FORMS) console.log(list.join('\n'));
process.exit(violations.length ? 1 : 0);
