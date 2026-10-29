// Static audit of built output: links, assets, titles, h1, canonical, forbidden domains. Usage: node tools/audit.mjs
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const SITE = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const htmls = readdirSync(SITE, { recursive: true }).filter((f) => f.endsWith('.html')).map((f) => f.replace(/\\/g, '/'));
const routeOk = (p) => { p = p.split('#')[0].split('?')[0]; if (p === '' || p === '/') return true; const f = join(SITE, p.slice(1)); return existsSync(f + '.html') || (existsSync(f) && statSync(f).isFile()); };
const problems = []; const titles = new Map(); const descs = new Map(); let links = 0;
for (const f of htmls) {
  const h = readFileSync(join(SITE, f), 'utf8');
  const t = (h.match(/<title>(.*?)<\/title>/) || [])[1]; const d = (h.match(/name="description" content="(.*?)"/) || [])[1];
  if (!t) problems.push(`${f}: no title`); else { if (titles.has(t)) problems.push(`${f}: duplicate title with ${titles.get(t)}`); titles.set(t, f); }
  if (!d) problems.push(`${f}: no description`); else { if (descs.has(d)) problems.push(`${f}: duplicate description with ${descs.get(d)}`); descs.set(d, f); }
  const h1 = (h.match(/<h1[ >]/g) || []).length; if (h1 !== 1) problems.push(`${f}: ${h1} h1 tags`);
  if (!/rel="canonical"/.test(h)) problems.push(`${f}: no canonical`);
  if (/amazonselfpublish\.com|localhost|127\.0\.0\.1/.test(h)) problems.push(`${f}: forbidden domain reference`);
  if (/kdppublishingdominion|amazonpublisherservice/.test(h)) problems.push(`${f}: competitor reference`);
  for (const m of h.matchAll(/(?:href|src)="(\/[^"]*)"/g)) { links++; if (m[1].startsWith('//')) continue; if (!routeOk(m[1])) problems.push(`${f}: broken ${m[1]}`); }
  for (const m of h.matchAll(/srcset="(\/[^"]*)"/g)) { links++; if (!routeOk(m[1])) problems.push(`${f}: broken srcset ${m[1]}`); }
  const ids = [...h.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]); const dup = ids.filter((x, i) => ids.indexOf(x) !== i); if (dup.length) problems.push(`${f}: duplicate ids ${[...new Set(dup)].join(',')}`);
  for (const m of h.matchAll(/href="#([^"]+)"/g)) if (m[1] !== 'top' && !ids.includes(m[1]) && m[1] !== '') problems.push(`${f}: missing anchor #${m[1]}`);
  for (const m of h.matchAll(/<img (?![^>]*alt=)[^>]*>/g)) problems.push(`${f}: img without alt`);
}
console.log(`pages: ${htmls.length}, internal refs checked: ${links}`);
console.log(problems.length ? problems.join('\n') : 'No problems found');
// POLICY checks from the Microsoft Ads fix list (strike): these must never come back
const policy = [];
const rdir = (d) => readdirSync(d).flatMap((x) => { const p = join(d, x); return statSync(p).isDirectory() ? rdir(p) : [p]; });
const SITEDIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
for (const f of rdir(SITEDIR).filter((x) => x.endsWith('.html'))) {
  const h = readFileSync(f, 'utf8'); const rel = f.slice(SITEDIR.length + 1).split('\\').join('/');
  if (/Sample article|drafts? pending editorial|Draft text for review/i.test(h)) policy.push(rel + ': draft/placeholder notice present');
  if (rel !== 'index.html' && h.includes('/assets/img/books/')) policy.push(rel + ': cover images referenced outside the home page');
  if (/class="[^"]*showcase/.test(h) && rel !== 'index.html') policy.push(rel + ': cover gallery present outside the home page');
  if (!/Authors can publish on Amazon KDP directly and free of charge/.test(h)) policy.push(rel + ': footer KDP-is-free sentence missing');
  if (/<input[^>]*name="consent"[^>]*checked/.test(h)) policy.push(rel + ': consent checkbox is pre-ticked');
}
for (const p of ['publishing-services', 'amazon-publishing-services']) {
  const h = readFileSync(join(SITEDIR, p + '.html'), 'utf8');
  const first = (h.match(/<summary>([^<]*)/) || [])[1];
  if (first !== 'Can I publish on Amazon myself?') policy.push(p + ': FAQ 1 is not the KDP question (' + first + ')');
}
if (existsSync(join(SITEDIR, 'book-publishing-services.html'))) policy.push('old landing path still generates a page (should be a 301 only)');
console.log(policy.length ? 'POLICY VIOLATIONS:\n' + policy.join('\n') : 'Policy checks passed (no drafts, no cover gallery outside home, KDP disclosure in footer, consent unticked, FAQ 1 correct).');
// also run the form guard so the three-required-fields rule is checked on every audit
import { spawnSync } from 'node:child_process';
const fg = spawnSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), 'audit-forms.mjs')], { stdio: 'inherit' });
process.exit(problems.length || policy.length || fg.status ? 1 : 0);
