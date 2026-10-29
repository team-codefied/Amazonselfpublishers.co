// Independent verification of the Microsoft Ads strike Fix List + revised landing-page docx against a built site folder
// (point it at the EXTRACTED ZIP to test the real deliverable). Usage: node tools/verify-fixlist.mjs <dir>
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const DIR = resolve(process.argv[2] || 'site');
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(DIR);
const pages = files.filter((f) => f.endsWith('.html')).map((f) => ({ path: '/' + relative(DIR, f).split('\\').join('/').replace(/\.html$/, '').replace(/^index$/, ''), html: readFileSync(f, 'utf8') }));
const page = (p) => (pages.find((x) => x.path === p) || { html: '' }).html;
const dec = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&middot;/g, '\u00b7');
const txt = (h) => dec(h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<\/?(?:a|span|strong|em|b|i|small|picture|source)\b[^>]*>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim(); // inline tags vanish, block tags become spaces
const sec = (html, marker) => { const i = html.search(new RegExp(`<section class="[^"]*${marker}`)); if (i < 0) return ''; const j = html.indexOf('</section>', i); return html.slice(i, j + 10); };
const lis = (h) => [...h.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => txt(m[1]));
const R = []; const check = (id, label, ok, detail = '') => R.push({ id, label, ok: !!ok, detail });
const eq = (a, b) => a === b;

const DISC = 'Independent service: we are not affiliated with or endorsed by Amazon. You can publish on Amazon KDP yourself for free at kdp.amazon.com. We charge only for the optional services you choose.';
const KDP_ANSWER = 'Yes. Amazon KDP is free to use and you can publish there directly at kdp.amazon.com. We are an independent company, not affiliated with Amazon, and we charge only for the editing, design, formatting and publishing support you choose.';
const FOOT = 'Authors can publish on Amazon KDP directly and free of charge; we charge only for the optional services they choose.';

/* ===== C01: disclosure everywhere ===== */
{
  let formsTotal = 0, badDisc = [], badFoot = [];
  for (const p of pages) {
    if (!txt(sec(p.html, 'x') || '') && false) continue;
    const footer = (p.html.match(/<footer[\s\S]*?<\/footer>/) || [''])[0];
    if (!txt(footer).includes(FOOT)) badFoot.push(p.path);
    for (const m of p.html.matchAll(/<form\b[\s\S]*?<\/form>/g)) {
      formsTotal++;
      const after = m[0].slice(m[0].indexOf('</button>') + 9).trimStart();
      const para = (after.match(/^<p class="form-disclosure">([\s\S]*?)<\/p>/) || [])[1];
      if (!para || txt(para) !== DISC) badDisc.push(p.path + '#' + (m[0].match(/id="([^"]+)"/) || [])[1]);
    }
  }
  check('C01.1', `exact disclosure directly under the submit button of every form (${formsTotal} forms)`, badDisc.length === 0 && formsTotal > 0, badDisc.slice(0, 5).join(', '));
  check('C01.4', `footer disclaimer includes the KDP-is-free sentence on every page (${pages.length} pages)`, badFoot.length === 0, badFoot.slice(0, 5).join(', '));
}

/* ===== landing page /publishing-services vs the docx ===== */
const LP = page('/publishing-services');
{
  const hero = sec(LP, 'lp-hero'), card = sec(LP, 'lp-form-wrap');
  check('LP.0', 'landing page exists at a neutral path with no "amazon" in the slug', LP.length > 0 && !'/publishing-services'.includes('amazon'));
  check('LP.1', 'hero eyebrow = BOOK PUBLISHING SERVICES', txt((hero.match(/<p class="kicker[^"]*">([\s\S]*?)<\/p>/) || [])[1] || '').toUpperCase() === 'BOOK PUBLISHING SERVICES');
  check('LP.2', 'hero heading exact', txt((hero.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || '') === 'Take Your Manuscript from Draft to Finished Book');
  const lede = txt((hero.match(/<p class="lede[^"]*">([\s\S]*?)<\/p>/) || [])[1] || '');
  check('LP.3', 'hero paragraph exact', lede === 'From editing and book design to formatting and publishing support, we help you prepare your manuscript for readers while keeping control of your creative work.');
  const iLede = hero.indexOf('class="lede'), iDisc = hero.indexOf('class="hero-disclosure"'), iAct = hero.indexOf('class="hero-actions"');
  check('C01.2', 'disclosure sits below the hero paragraph and ABOVE the buttons', iLede > -1 && iDisc > iLede && iAct > iDisc);
  check('LP.4', 'hero disclosure text exact', txt((hero.match(/<p class="hero-disclosure">([\s\S]*?)<\/p>/) || [])[1] || '') === DISC);
  const acts = hero.slice(iAct); const btns = [...acts.matchAll(/<(?:a|button)[^>]*class="btn[^"]*"[^>]*>([\s\S]*?)<\/(?:a|button)>/g)].map((m) => txt(m[1]));
  check('LP.5', 'two hero CTAs: "Get Your Free Quote" and "Call Us" (phone link kept)', btns.length === 2 && btns[0] === 'Get Your Free Quote' && btns[1].startsWith('Call Us') && acts.includes('href="tel:+13235093062"'), JSON.stringify(btns));
  check('LP.6', 'form heading exact', txt((card.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || '') === 'Get Your Free Book Publishing Quote');
  check('LP.7', 'form description exact', txt((card.match(/<\/h2><p>([\s\S]*?)<\/p>/) || [])[1] || '') === "Tell us about your book and the services you need. We'll review your inquiry and discuss the next steps.");
  const f = (card.match(/<form[\s\S]*?<\/form>/) || [''])[0];
  const labels = [...f.matchAll(/<label for="[^"]*">([\s\S]*?)<\/label>/g)].map((m) => txt(m[1]));
  check('LP.8', 'form fields: Full Name*, Email*, Phone*, Service Needed (optional), Project Details (optional), consent*', ['Full Name *', 'Email *', 'Phone *', 'Service Needed (optional)', 'Project Details (optional)'].every((l) => labels.includes(l)), JSON.stringify(labels));
  check('LP.9', 'form button label = Get My Free Quote', /<span class="btn-label">Get My Free Quote<\/span>/.test(f));
  check('LP.10', 'form still posts to the existing endpoint', f.includes('action="/backend/contact.php"') && f.includes('name="csrf_token"') && f.includes('name="website"'));
  check('LP.11', 'service dropdown preselects Book Publishing and is optional', /<option value="book-publishing-services" selected>/.test(f) && !/<select[^>]*name="service"[^>]*required/.test(f));
  const ov = sec(LP, 'lp-over');
  check('LP.12', 'overview: eyebrow, heading, both paragraphs', txt((ov.match(/<p class="kicker">([\s\S]*?)<\/p>/) || [])[1] || '').toUpperCase() === 'OVERVIEW' && txt((ov.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || '') === 'What This Service Covers' && txt(ov).includes('A book involves several stages, from reviewing the manuscript to preparing the final files for publication. Our services provide support with the parts of the process you choose.') && txt(ov).includes('Whether you need help with editing, cover design, formatting or publishing preparation, we can discuss your requirements and identify the services that suit your project.'));
  check('LP.13', 'overview side panel "What Is Included?" + 4 bullets in the two-column layout', txt((ov.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1] || '') === 'What Is Included?' && JSON.stringify(lis((ov.match(/<aside[\s\S]*?<\/aside>/) || [''])[0])) === JSON.stringify(['Free initial discussion about your project', 'Optional services based on your requirements', 'Clear explanation of the agreed scope', 'Support with preparing your book for publication']) && ov.includes('class="container ov-grid"'));
  const dl = sec(LP, 'deliver');
  const items = [...dl.matchAll(/<li><span class="dn">(\d+)<\/span><h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p><\/li>/g)].map((m) => [m[1], txt(m[2]), txt(m[3])]);
  const wantD = [['01', 'Manuscript Review', 'Review the manuscript requirements and identify the type of editing or preparation support needed.'], ['02', 'Editing Coordination', "Discuss editing and proofreading requirements based on the manuscript's condition and project scope."], ['03', 'Cover and Interior Design', "Prepare cover and interior design files according to the book's format and agreed specifications."], ['04', 'Format Preparation', 'Prepare the manuscript layout and publishing files for the selected book format.'], ['05', 'File Setup and Support', 'Help prepare the required files and explain the next steps in the publishing process.'], ['06', 'Launch Preparation', 'Review the agreed deliverables and help you prepare for your chosen publishing route.']];
  check('LP.14', 'deliverables: eyebrow WHAT WE DO, heading, 6 numbered items exact', txt((dl.match(/<p class="kicker">([\s\S]*?)<\/p>/) || [])[1] || '').toUpperCase() === 'WHAT WE DO' && txt((dl.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || '') === 'Deliverables and Scope' && JSON.stringify(items) === JSON.stringify(wantD), JSON.stringify(items).slice(0, 200));
  const pr = sec(LP, 'journey');
  const steps = [...pr.matchAll(/<li><span class="sn">(\d+)<\/span><h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p><\/li>/g)].map((m) => [m[1], txt(m[2]), txt(m[3])]);
  check('LP.15', 'process: black section, HOW IT WORKS, heading, intro, 4 steps exact', /class="sec journey dark"/.test(pr) && txt((pr.match(/<p class="kicker[^"]*">([\s\S]*?)<\/p>/) || [])[1] || '').toUpperCase() === 'HOW IT WORKS' && txt((pr.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || '') === 'Our Book Publishing Process' && txt(pr).includes('A clear process helps you understand what your project needs and which services you may want to choose.') && JSON.stringify(steps) === JSON.stringify([['01', 'Share Your Manuscript Details', 'Tell us about your book, its current stage and your goals.'], ['02', 'Discuss Your Options', 'Review the services, deliverables and project requirements.'], ['03', 'Review the Work', 'Review the agreed deliverables and provide feedback where applicable.'], ['04', 'Prepare for Publication', 'Prepare the final files and next steps according to the agreed scope.']]));
  const bn = sec(LP, 'benefits');
  check('LP.16', 'benefits: black section, WHY IT HELPS, heading, 5 bullets exact, no sales/ranking promises', /class="sec benefits dark"/.test(bn) && txt((bn.match(/<p class="kicker[^"]*">([\s\S]*?)<\/p>/) || [])[1] || '').toUpperCase() === 'WHY IT HELPS' && txt((bn.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || '') === 'Benefits of Working With Us' && JSON.stringify(lis(bn)) === JSON.stringify(['Choose only the services you need.', 'Understand the scope of your project before proceeding.', 'Get support with editing, design and formatting.', 'Keep control of your creative work.', 'Discuss your publishing options with an independent service provider.']) && !/guarantee|bestseller ranking/i.test(txt(bn)));
  const fq = sec(LP, 'faq');
  const qa = [...fq.matchAll(/<summary>([\s\S]*?)<span class="plus"[\s\S]*?<div class="ans"><p>([\s\S]*?)<\/p>/g)].map((m) => [txt(m[1]), txt(m[2])]);
  check('LP.17', 'FAQ heading exact + accordion markup retained', txt((fq.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || '') === 'Book Publishing: Frequently Asked Questions' && fq.includes('<details') && fq.includes('class="acc"'));
  check('C01.3', 'FAQ 1 = "Can I publish on Amazon myself?" with the exact required answer', qa[0] && qa[0][0] === 'Can I publish on Amazon myself?' && qa[0][1] === KDP_ANSWER);
  const wantQA = [['Can I select only some of your services?', 'Yes. You can choose the services that suit your project. We can discuss your requirements and explain the available options before you decide.'], ['How long does book publishing take?', 'The timeline depends on your manuscript, the services selected and the work required. We can discuss an estimated timeline after reviewing your project.'], ['Do you offer manuscript editing?', "Editing and proofreading support can be discussed according to your manuscript's condition and requirements."], ['How do I get started?', 'Complete the quote form with your contact details and information about your book. Our team can then discuss your requirements and the next steps.']];
  check('LP.18', 'the four suggested FAQs from the docx follow, word for word', wantQA.every((w) => qa.some((q) => q[0] === w[0] && q[1] === w[1])), JSON.stringify(qa.map((q) => q[0])));
  const rl = sec(LP, 'related');
  const cards = [...rl.matchAll(/<a href="([^"]+)"><span class="n">\d+<\/span><strong>([\s\S]*?)<\/strong><span>([\s\S]*?)<\/span>/g)].map((m) => [m[1], txt(m[2]), txt(m[3])]);
  check('LP.19', 'related: RELATED SERVICES, "Often Paired With Book Publishing", 4 cards + blurbs exact with working links', txt((rl.match(/<p class="kicker">([\s\S]*?)<\/p>/) || [])[1] || '').toUpperCase() === 'RELATED SERVICES' && txt((rl.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || '') === 'Often Paired With Book Publishing' && JSON.stringify(cards) === JSON.stringify([['/book-editing-proofreading-services', 'Book Editing & Proofreading', 'Improve clarity, consistency and readability.'], ['/book-cover-designing-services', 'Book Cover Design', 'Develop a cover suited to your book.'], ['/book-formatting', 'Book Formatting', 'Prepare the interior layout for publication.'], ['/book-marketing-services', 'Book Marketing', 'Explore promotional support for your book.']]) && cards.every((c) => page(c[0]).length > 0), JSON.stringify(cards).slice(0, 200));
  const cta = sec(LP, 'cta-band');
  const ctaForm = (cta.match(/<form[\s\S]*?<\/form>/) || [''])[0];
  check('LP.20', 'bottom CTA: black band, eyebrow LET\'S TALK, heading, description, button "Request a Free Quote"', /class="sec cta-band"/.test(cta) && txt((cta.match(/<p class="kicker">([\s\S]*?)<\/p>/) || [])[1] || '').toUpperCase() === "LET'S TALK" && txt((cta.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || '') === 'Start Your Book Publishing Project' && txt(cta).includes("Share your book details and the services you need. We'll review your requirements and discuss the available options.") && /<span class="btn-label">Request a Free Quote<\/span>/.test(ctaForm));
  const consents = [...LP.matchAll(/<input[^>]*name="consent"[^>]*>/g)].map((m) => m[0]);
  check('LP.21', 'consent checkbox unchecked + required in all 3 landing forms', consents.length === 3 && consents.every((c) => !/checked/.test(c) && /required/.test(c)), String(consents.length));
  const labelTxt = [...LP.matchAll(/<label for="[^"]*-consent">([\s\S]*?)<\/label>/g)].map((m) => txt(m[1]).replace(/\s*\*$/, ''));
  check('LP.22', 'consent statement exact, with Privacy Policy and Terms linked to the existing pages', labelTxt.length === 3 && labelTxt.every((l) => l === 'I agree to be contacted about my inquiry and acknowledge the Privacy Policy and Terms.') && /<label for="lp-form-final-consent">[\s\S]*href="\/privacy-policy"[\s\S]*href="\/terms-and-conditions"/.test(LP));
  const order = ['lp-hero', 'lp-form-wrap', 'strip light', 'lp-over', 'deliver', 'journey', 'benefits', 'faq', 'related', 'cta-band'].map((m) => LP.search(new RegExp(`<section class="[^"]*${m}`)));
  check('LP.23', 'final page order: hero+form, overview, deliverables, process, benefits, FAQ, related, bottom CTA', order.every((v, i) => v > -1 && (i === 0 || v > order[i - 1])), order.join(','));
  check('LP.24', 'dedicated landing design (dark hero, overlapping form card, trust strip), standard header/menu and footer present', /class="lp-hero"/.test(LP) && /class="lp-card"/.test(LP) && /<div class="mega"/.test(LP) && /<footer class="site-footer"/.test(LP));
  check('LP.25', 'no cover gallery or cover image on the landing page', !/showcase|shelf|\/assets\/img\/books\//.test(LP));
}

/* ===== C03 + inventory ===== */
{
  const offenders = pages.filter((p) => p.path !== '/' && (p.html.includes('/assets/img/books/') || /<section class="[^"]*showcase/.test(p.html))).map((p) => p.path);
  check('C03.1', 'cover gallery/images absent from every page except the home page (landing + 19 service pages + portfolio)', offenders.length === 0, offenders.join(', '));
  const svcPages = ['book-publishing-services', 'amazon-publishing-services', 'book-marketing-services', 'ebook-writing-services', 'ebook-publishing-services', 'audio-book-services', 'seo-optimized-content-services', 'article-writing', 'book-formatting', 'book-trailer', 'book-illustrations-designing-services', 'book-cover-designing-services', 'book-printing-services', 'copy-writing-services', 'ghost-writing-services', 'book-editing-proofreading-services', 'author-website-development-services', 'blog-writing', 'book-promotion'];
  const existing = svcPages.filter((s) => s !== 'book-publishing-services').filter((s) => page('/' + s).length > 0);
  check('C03.2', 'all 19 service pages exist (18 at their old URLs + Book Publishing at the new one)', existing.length === 18 && page('/publishing-services').length > 0, String(existing.length));
  const pf = page('/our-portfolio');
  check('C03.3', 'Portfolio: "Our Work" with the exact placeholder, no covers, no filters, no gallery', txt((pf.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || '') === 'Our Work' && txt(pf).includes('Client projects will appear here once they are complete and the author has approved sharing them. Ask us for sample edits, cover concepts and formatting examples.') && !/pf-grid|filters|shelf|\/assets\/img\/books\//.test(pf));
  const imgs = files.filter((f) => f.split('\\').join('/').includes('/assets/img/books/')).map((f) => f.split(/[\\/]/).pop()).sort();
  const old = imgs.filter((n) => /legends|think-local|coffee-with-god|subtle-art|hitta|me-acorde|romagus|furrr|bristol|beyond-the-snake|president|bread|extraordinary|poem-to-book|submit-publish|guide-manuscript/.test(n));
  check('C03.4', 'old third-party cover files are deleted from /assets/img/books/ (not reachable by URL)', old.length === 0 && imgs.length === 16, `files=${imgs.length} old=${old.join(',')}`);
  check('C03.5', 'the adult-worded first cover is not in the deliverable', !files.some((f) => /secret-sex/i.test(f)) && !pages.some((p) => /Secret Sex/i.test(p.html)));
  const home = page('/');
  const gal = sec(home, 'showcase');
  check('COV.1', 'home keeps its cover gallery with the 8 new sample covers, labelled as samples/not client projects, no links to a portfolio of them', (gal.match(/<li><figure/g) || []).length === 8 && /sample covers/i.test(txt(gal)) && /not client projects/i.test(txt(gal)) && !/<a href="\/our-portfolio#/.test(gal));
  check('COV.2', 'home hero uses 4 of the new covers (and not the adult-themed one)', (sec(home, 'hero').match(/sample-cover-[a-z-]+\.jpg/g) || []).length === 4 && !/private-lives/.test(sec(home, 'hero')));
  const refd = [...new Set([...home.matchAll(/sample-cover-[a-z-]+\.(?:jpg|webp)/g)].map((m) => m[0]))];
  check('COV.3', 'every cover referenced on the home page exists in the folder (no broken images) and each image has descriptive alt text', refd.length === 16 && refd.every((n) => imgs.includes(n)) && !/<img[^>]*class="book-img[^"]*"[^>]*alt=""/.test(home), String(refd.length));
}

/* ===== C02 (site side), H01 blog, H02 consent, H03 URL ===== */
{
  const allHits = pages.map((p) => ({ p: p.path, m: txt(p.html.replace(/<footer[\s\S]*?<\/footer>/, '')).match(/\$\s?\d[\d,]*|\b\d{1,2}\s?%\s*(?:off|discount)|discount|packages? (?:starting|from)|Publish Your Book on Amazon/i) })).filter((x) => x.m);
  // OWNER-REQUESTED EXCEPTION (2026-10-29): the Ebook Publishing form card is headed "October Discount" with no offer terms shown.
  // The Fix List (C02 step 4) says no discount claims unless a real, dated offer with terms is on the page. Reported as a WARNING, not hidden.
  const accepted = allHits.filter((h) => h.p === '/ebook-publishing-services' && /^discount$/i.test(h.m[0]));
  const hits = allHits.filter((h) => !accepted.includes(h));
  check('C02.1', 'site shows no price, discount or "Publish Your Book on Amazon" claim anywhere (except the owner-requested exception below)', hits.length === 0, hits.map((h) => h.p + ':' + h.m[0]).slice(0, 5).join('; '));
  if (accepted.length) console.log('WARN    C02.1  owner-requested "October Discount" heading on /ebook-publishing-services has no dated offer terms; Fix List C02 step 4 warns discount claims need them.');
  const bl = page('/blog'); const arts = pages.filter((p) => p.path.startsWith('/articles/'));
  check('H01.1', 'blog index has no "drafts pending editorial approval" notice', !/drafts? pending editorial|Sample articles? (?:is|are)|Sample article:/i.test(txt(bl)));
  check('H01.2', 'all 6 articles: no draft notice; byline "By the amazonselfpublishers editorial team · October 2026"; datePublished in structured data', arts.length === 6 && arts.every((a) => !/draft pending|Sample article/i.test(txt(a.html)) && txt(a.html).includes('By the amazonselfpublishers editorial team \u00b7 October 2026') && /"datePublished":"2026-10"/.test(a.html)), String(arts.length));
  const priv = page('/privacy-policy');
  check('H02.2', 'Privacy Policy sentence replaced with the required wording; old "ticked by default / untick it" wording gone', txt(priv).includes('and they include a checkbox, which you must tick to submit, acknowledging this Privacy Policy and our Terms and that we may contact you about your inquiry.') && !/ticked by default|You can untick it|left ticked/.test(txt(priv)));
  const ids = { '/': ['quick-form', 'home-form', 'quote-modal'], '/contact-us': ['contact-form', 'quote-modal'], '/book-formatting': ['svc-hero-form', 'svc-form', 'quote-modal'] };
  let ok = true, why = '';
  for (const [p, list] of Object.entries(ids)) for (const id of list) { const m = page(p).match(new RegExp(`<input id="${id}-consent"[^>]*>`)); if (!m || /checked/.test(m[0]) || !/required/.test(m[0])) { ok = false; why += ` ${p}#${id}-consent`; } }
  check('H02.1', 'named consent inputs (svc-hero-form-consent, svc-form-consent, quote-modal-consent, home/contact equivalents) have no `checked` and are `required`', ok, why);
  check('LEGAL.1', 'both legal pages: "Last Updated: October 28, 2026", real address shown, no draft notice, Amazon non-affiliation + KDP sentence', ['/privacy-policy', '/terms-and-conditions'].every((p) => { const t = txt(page(p)); return t.includes('Last Updated: October 28, 2026') && t.includes('811 W. 7th St., Suite 1149, Los Angeles, CA 90017') && !/Draft text for review/i.test(t) && t.includes('not owned by, endorsed by, or officially affiliated with Amazon') && t.includes('Authors can publish on Amazon KDP directly and free of charge'); }));
  const oldLinks = pages.filter((p) => /href="\/book-publishing-services"/.test(p.html)).map((p) => p.path);
  check('H03.1', 'no internal link points at the old /book-publishing-services path', oldLinks.length === 0, oldLinks.join(', '));
  const idx = page('/');
  const menu = (idx.match(/<div class="mega"[\s\S]*?<\/div><\/div><\/div>/) || [''])[0];
  const cards = [...idx.matchAll(/class="feat" href="([^"]+)"/g)].map((m) => m[1]);
  const foot = (idx.match(/<footer[\s\S]*?<\/footer>/) || [''])[0];
  check('H03.2', 'Services menu, homepage service card and footer all link Book Publishing to /publishing-services', /<a href="\/publishing-services"><span class="mm-n">01<\/span>Book Publishing<\/a>/.test(menu) && cards.includes('/publishing-services') && foot.includes('href="/publishing-services">Book Publishing</a>'), cards.join(','));
  const sm = existsSync(join(DIR, 'sitemap.xml')) ? readFileSync(join(DIR, 'sitemap.xml'), 'utf8') : '';
  check('H03.3', 'sitemap lists /publishing-services and not the old path; canonical on the new page is the new URL', sm.includes('amazonselfpublishers.co/publishing-services</loc>') && !/\.co\/book-publishing-services</.test(sm) && LP.includes('rel="canonical" href="https://amazonselfpublishers.co/publishing-services"'));
  const ht = existsSync(join(DIR, '.htaccess')) ? readFileSync(join(DIR, '.htaccess'), 'utf8') : '';
  const i301 = ht.indexOf('RewriteRule ^book-publishing-services/?$ /publishing-services [R=301,L]');
  check('H03.4', '301 rule for the old path exists in .htaccess and runs before the generic .html rewrite (cannot be exercised without Apache)', i301 > -1 && i301 < ht.indexOf('Serve /path from path.html'));
  check('H03.5', 'old path does not generate a page of its own (only a redirect)', page('/book-publishing-services').length === 0);
}

/* ===== Amazon Publishing Support: normal service page ===== */
{
  const am = page('/amazon-publishing-services');
  const q1 = [...am.matchAll(/<summary>([\s\S]*?)<span class="plus"[\s\S]*?<div class="ans"><p>([\s\S]*?)<\/p>/g)].map((m) => [txt(m[1]), txt(m[2])])[0];
  check('AMZ.1', 'Amazon Publishing Support is a NORMAL service page (standard hero form, no landing template), same URL', /class="svc-hero/.test(am) && !/lp-hero|lp-card/.test(am) && txt(am).includes('Amazon Publishing Support'));
  check('AMZ.2', 'its FAQ 1 is "Can I publish on Amazon myself?" with the exact answer', q1 && q1[0] === 'Can I publish on Amazon myself?' && q1[1] === KDP_ANSWER);
  check('AMZ.3', 'KDP-is-free disclosure near BOTH forms (and in the hero)', (am.match(/<p class="form-disclosure">/g) || []).length === 3 && /class="hero-disclosure"/.test(am));
  const order = ['svc-hero', 'overview', 'deliver', 'journey', 'benefits', 'faq', 'related', 'cta-band'].map((m) => am.search(new RegExp(`<section class="[^"]*${m}`)));
  check('AMZ.4', 'standard section order like the other service pages', order.every((v, i) => v > -1 && (i === 0 || v > order[i - 1])), order.join(','));
}

/* ===== Backend (in the deliverable) ===== */
{
  const cp = existsSync(join(DIR, 'backend/contact.php')) ? readFileSync(join(DIR, 'backend/contact.php'), 'utf8') : '';
  check('BE.1', 'contact.php requires consent, phone, name and email; service/message optional', cp.includes("errors['consent']") && cp.includes("errors['phone']") && cp.includes("errors['name']") && cp.includes("errors['email']") && !cp.includes("Please choose a service."));
  check('BE.2', 'deliverable has the SMTP .env, blocks it via backend/.htaccess, and carries no test files', existsSync(join(DIR, 'backend/.env')) && /\\\.env/.test(readFileSync(join(DIR, 'backend/.htaccess'), 'utf8')) && !files.some((f) => /smtp-received|rl_[0-9a-f]+\.json|secret\.key|test\.env/.test(f)));
}

const failed = R.filter((r) => !r.ok);
for (const r of R) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.id.padEnd(7)} ${r.label}${r.ok || !r.detail ? '' : '\n         -> ' + r.detail}`);
console.log(`\n${R.length - failed.length}/${R.length} checks passed against ${DIR}`);
process.exit(failed.length ? 1 : 0);
