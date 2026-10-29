// Static site generator -> ../site (plain HTML/CSS/JS output; no runtime framework).
// Usage: node tools/build.mjs
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, nav } from './data/config.mjs';
import { services, bySlug } from './data/services.mjs';
import { books, homeFaqs, processSteps, blogPosts, testimonials } from './data/misc.mjs';
import { privacy, terms, legalUpdated } from './data/legal.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const ver = (rel) => createHash('md5').update(readFileSync(join(OUT, rel))).digest('hex').slice(0, 8); // cache-busting hash of file contents
const pages = []; // for sitemap

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (p) => (p === '/' ? site.domain + '/' : site.domain + p);
const num = (i) => String(i + 1).padStart(2, '0');
const A = (s) => s.route || '/' + s.slug; // some services publish at a neutral route (see services.mjs `route`)
// Mandatory third-party disclosure (Microsoft Ads fix list C01): shown under every submit button and in the landing hero.
const DISCLOSURE_TEXT = 'Independent service: we are not affiliated with or endorsed by Amazon. You can publish on Amazon KDP yourself for free at kdp.amazon.com. We charge only for the optional services you choose.';
const DISCLOSURE_HTML = 'Independent service: we are not affiliated with or endorsed by Amazon. You can publish on Amazon KDP yourself for free at <a href="https://kdp.amazon.com" target="_blank" rel="noopener nofollow">kdp.amazon.com</a>. We charge only for the optional services you choose.';

const ICON = {
  arrow: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  phone: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3h3l1.4 4-2 1.3a11 11 0 005.7 5.7l1.3-2 4 1.4v3A2.5 2.5 0 0117.5 21 15.5 15.5 0 013 6.5 2.5 2.5 0 015.5 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  close: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  chev: '<svg class="ic chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* ---------- shared fragments ---------- */
const logoImg = (cls = '', h = 68) =>
  `<img class="logo-img ${cls}" src="/assets/img/brand/logo-trimmed-v3.webp" width="720" height="617" alt="amazonselfpublishers logo" style="height:${h}px;width:auto" decoding="async">`;

function bookImg(b, { eager = false, cls = '' } = {}) {
  const cap = Math.round(b.w * 1.3);
  return `<picture><source srcset="/assets/img/books/${b.id}.webp" type="image/webp"><img class="book-img ${cls}" src="/assets/img/books/${b.id}.jpg" width="${b.w}" height="${b.h}" style="max-width:min(100%,${cap}px)" alt="Book cover: ${esc(b.title)}${b.subtitle ? ', ' + esc(b.subtitle) : ''}${b.author ? ', by ' + esc(b.author) : ''}"${b.lang ? ' lang="' + b.lang + '"' : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}

const capOf = (b, cat = false) => `<span class="cap"><strong>${esc(b.title)}</strong>${b.author ? `<em>${esc(b.author)}</em>` : ''}${cat ? `<small>${esc(b.client ? 'Client project' : b.cat)}</small>` : ''}</span>`;

const serviceOptions = (sel = '') =>
  `<option value="">Select a service</option>` +
  services.map((s) => `<option value="${s.slug}"${s.slug === sel ? ' selected' : ''}>${esc(s.menu)}</option>`).join('') +
  `<option value="not-sure"${sel === 'not-sure' ? ' selected' : ''}>Not sure yet</option>`;

/** Lead form. Same field names across all instances; processed by backend/contact.php */
function form(id, { service = '', variant = 'full', cta = 'Request a free consultation', source = id } = {}) {
  const full = variant === 'full', hero = variant === 'svchero';
  return `<form class="lead-form ${variant}" id="${id}" method="post" action="${site.formEndpoint}" novalidate data-form-source="${esc(source)}">
  <div class="fgrid">
    <div class="field"><label for="${id}-name">Full Name <span class="req" aria-hidden="true">*</span></label><input id="${id}-name" name="name" type="text" autocomplete="name" required maxlength="100"></div>
    <div class="field"><label for="${id}-email">Email <span class="req" aria-hidden="true">*</span></label><input id="${id}-email" name="email" type="email" autocomplete="email" required maxlength="150"></div>
    <div class="field"><label for="${id}-phone">Phone <span class="req" aria-hidden="true">*</span></label><input id="${id}-phone" name="phone" type="tel" autocomplete="tel" required maxlength="30"></div>
    <div class="field"><label for="${id}-service">Service Needed <span class="opt">(optional)</span></label><select id="${id}-service" name="service">${serviceOptions(service)}</select></div>
    ${full ? `<div class="field"><label for="${id}-title">Book title <span class="opt">(optional)</span></label><input id="${id}-title" name="book_title" type="text" maxlength="150"></div>
    <div class="field"><label for="${id}-status">Manuscript status</label><select id="${id}-status" name="manuscript_status"><option value="">Select status</option><option>Idea only</option><option>Partial draft</option><option>Complete draft</option><option>Edited manuscript</option><option>Already published</option></select></div>
    <div class="field wide"><label for="${id}-msg">Tell us about your project <span class="opt">(optional)</span></label><textarea id="${id}-msg" name="message" rows="4" maxlength="3000" placeholder="Genre, approximate length, timeline, and anything else we should know"></textarea></div>` : ''}
    ${hero ? `<div class="field wide"><label for="${id}-msg">Project Details <span class="opt">(optional)</span></label><textarea id="${id}-msg" name="message" rows="3" maxlength="3000" placeholder="Genre, length, timeline, anything else we should know"></textarea></div>` : ''}
    <div class="field wide check"><input id="${id}-consent" name="consent" type="checkbox" value="yes" required><label for="${id}-consent">I agree to be contacted about my inquiry and acknowledge the <a href="/privacy-policy">Privacy Policy</a> and <a href="/terms-and-conditions">Terms</a>. <span class="req" aria-hidden="true">*</span></label></div>
  </div>
  <div class="hp" aria-hidden="true"><label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
  <input type="hidden" name="csrf_token" value="">
  <input type="hidden" name="form_ts" value="">
  <input type="hidden" name="form_source" value="${esc(source)}">
  <input type="hidden" name="page_url" value="">
  <input type="hidden" name="utm_source" value=""><input type="hidden" name="utm_medium" value=""><input type="hidden" name="utm_campaign" value=""><input type="hidden" name="utm_term" value=""><input type="hidden" name="utm_content" value=""><input type="hidden" name="gclid" value=""><input type="hidden" name="gbraid" value=""><input type="hidden" name="wbraid" value=""><input type="hidden" name="referrer" value="">
  <button class="btn btn-gold" type="submit"><span class="btn-label">${esc(cta)}</span>${ICON.arrow}</button>
  <p class="form-disclosure">${DISCLOSURE_HTML}</p>
  <p class="form-status" role="status" aria-live="polite"></p>
</form>`;
}

function megaMenu() {
  const col = (n) => services.filter((s) => s.col === n).map((s) => `<li><a href="${A(s)}"><span class="mm-n">${num(services.indexOf(s))}</span>${esc(s.menu)}</a></li>`).join('');
  return `<div class="mega" id="mega-services" hidden><div class="mega-inner"><div class="mega-head"><strong>Publishing services</strong><a href="/contact-us">Not sure where to start? Talk to us ${ICON.arrow}</a></div><div class="mega-cols"><ul>${col(1)}</ul><ul>${col(2)}</ul></div></div></div>`;
}

function header(path) {
  const items = nav.map((n) => {
    if (n.mega) return `<li class="has-mega"><button class="nav-link mega-toggle" type="button" aria-expanded="false" aria-controls="mega-services">${n.label}${ICON.chev}</button>${megaMenu()}</li>`;
    const cur = n.href === path || (n.href !== '/' && path.startsWith(n.href)) ? ' aria-current="page"' : '';
    return `<li><a class="nav-link" href="${n.href}"${cur}>${n.label}</a></li>`;
  }).join('');
  const mobSvc = services.map((s) => `<li><a href="${A(s)}">${esc(s.menu)}</a></li>`).join('');
  const mobItems = nav.map((n) => n.mega
    ? `<li><button class="m-toggle" type="button" aria-expanded="false" aria-controls="m-services">Services ${ICON.chev}</button><ul id="m-services" class="m-sub" hidden>${mobSvc}</ul></li>`
    : `<li><a href="${n.href}">${n.label}</a></li>`).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header" id="top"><div class="hdr-inner container">
<a class="brand" href="/" aria-label="amazonselfpublishers home">${logoImg('', 72)}</a>
<nav class="primary" aria-label="Main"><ul>${items}</ul></nav>
<div class="hdr-cta"><a class="hdr-phone" href="${site.phoneHref}">${ICON.phone}<span><small>Call us</small>${site.phone}</span></a><button class="btn btn-gold btn-sm" type="button" data-quote>Free consultation</button></div>
<button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span><span></span></button>
</div>
<div class="mobile-nav" id="mobile-nav" hidden><div class="mobile-nav-inner"><ul>${mobItems}</ul><div class="m-cta"><a class="btn btn-gold" href="${site.phoneHref}">${ICON.phone}Call ${site.phone}</a><button class="btn btn-ghost-dark" type="button" data-quote>Request a quote</button></div></div></div>
</header>`;
}

function landingHeader() {
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header lp-header"><div class="hdr-inner container">
<a class="brand" href="/" aria-label="amazonselfpublishers home">${logoImg('', 60)}</a>
<nav class="lp-links" aria-label="On this page"><a href="#services">Services</a><a href="#process">Process</a><a href="#titles">Titles</a><a href="#faq">FAQ</a></nav>
<div class="hdr-cta"><a class="hdr-phone" href="${site.phoneHref}">${ICON.phone}<span><small>Call now</small>${site.phone}</span></a><a class="btn btn-gold btn-sm" href="#start">Get started</a></div>
</div></header>`;
}

function footer() {
  const svcs = services.map((s) => `<li><a href="${A(s)}">${esc(s.menu)}</a></li>`);
  const half = Math.ceil(svcs.length / 2);
  const soc = Object.entries(site.social).filter(([, v]) => v).map(([k, v]) => `<li><a href="${esc(v)}" rel="noopener" target="_blank">${k[0].toUpperCase() + k.slice(1)}</a></li>`).join('');
  return `<footer class="site-footer"><div class="container">
<div class="ft-top"><div class="ft-brand"><a href="/" aria-label="amazonselfpublishers home">${logoImg('', 92)}</a><p>Independent publishing services for authors: writing, editing, design, formatting, publishing support and promotion.</p>
${site.legalName ? `<p class="ft-legal"><strong>${esc(site.legalName)}</strong></p>` : ''}<a class="ft-phone" href="${site.phoneHref}">${ICON.phone}${site.phone}</a>${site.email ? `<a class="ft-mail" href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : ''}${site.address ? `<address>${esc(site.address)}</address>` : ''}${site.hours ? `<p class="small">${esc(site.hours)}</p>` : ''}</div>
<div><h2 class="ft-h">Services</h2><ul class="ft-list two">${svcs.slice(0, half).join('')}</ul></div>
<div><h2 class="ft-h">&nbsp;</h2><ul class="ft-list two">${svcs.slice(half).join('')}</ul></div>
<div><h2 class="ft-h">Company</h2><ul class="ft-list"><li><a href="/">Home</a></li><li><a href="/our-portfolio">Portfolio</a></li><li><a href="/client-testimonials">Testimonials</a></li><li><a href="/about-us">About Us</a></li><li><a href="/blog">Blog</a></li><li><a href="/contact-us">Contact Us</a></li></ul>${soc ? `<h2 class="ft-h sp">Follow</h2><ul class="ft-list">${soc}</ul>` : ''}</div></div>
<p class="disclaimer">${esc(site.disclaimer)}</p>
<div class="ft-bot"><nav class="ft-policy" aria-label="Legal"><a href="/privacy-policy">Privacy Policy</a><span aria-hidden="true">&middot;</span><a href="/terms-and-conditions">Terms and Conditions</a></nav><p class="ft-copy">&copy; <span id="yr">2026</span> ${site.name}. All rights reserved.</p></div></div></footer>`;
}

function landingFooter() {
  return `<footer class="site-footer lp-footer"><div class="container"><div class="lp-ft-row"><a href="/" aria-label="amazonselfpublishers home">${logoImg('', 72)}</a><a class="ft-phone" href="${site.phoneHref}">${ICON.phone}${site.phone}</a><span><a href="/privacy-policy">Privacy Policy</a> &middot; <a href="/terms-and-conditions">Terms and Conditions</a> &middot; <a href="/">Full website</a></span></div><p class="disclaimer">${esc(site.disclaimer)}</p><div class="ft-bot"><span>&copy; <span id="yr">2026</span> ${site.name}. All rights reserved.</span></div></div></footer>`;
}

function quoteDialog() {
  return `<dialog class="quote-dialog" id="quote-dialog" aria-labelledby="qd-title"><div class="qd-inner"><button class="qd-close" type="button" aria-label="Close dialog" data-close>${ICON.close}</button>
<div class="qd-side"><p class="kicker">Free consultation</p><h2 id="qd-title">Tell us about your book</h2><p>Share a few details and a member of the team will get back to you. No obligation, no pressure.</p><a class="qd-call" href="${site.phoneHref}">${ICON.phone}${site.phone}</a></div>
<div class="qd-form">${form('quote-modal', { variant: 'compact', cta: 'Send my request', source: 'quote-popup' }).replace('<div class="field wide check">', '<div class="field wide"><label for="quote-modal-msg">Project details <span class="opt">(optional)</span></label><textarea id="quote-modal-msg" name="message" rows="3" maxlength="3000"></textarea></div><div class="field wide check">')}</div></div></dialog>`;
}

function stickyBar() {
  return `<div class="mobile-bar"><a class="btn btn-ghost-dark" href="${site.phoneHref}">${ICON.phone}Call</a><button class="btn btn-gold" type="button" data-quote>Get a quote</button></div>`;
}

const orgLd = () => ({ '@context': 'https://schema.org', '@type': 'ProfessionalService', name: site.name, url: site.domain + '/', telephone: site.phone, logo: site.domain + '/assets/img/brand/logo-trimmed-v3.png', description: 'Independent publishing services for authors.' });

function layout({ path, title, desc, body, ld = [], landing = false, ogType = 'website', noindex = false }) {
  const canon = url(path);
  const ldAll = [orgLd(), ...ld].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="${ogType}"><meta property="og:site_name" content="${site.name}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canon}"><meta property="og:image" content="${site.domain}/assets/img/brand/og-image-v3.jpg">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="theme-color" content="#0b0b0c">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/brand/favicon-32-v3.png"><link rel="apple-touch-icon" href="/assets/img/brand/apple-touch-icon-v3.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/css/styles.css?v=${ver('assets/css/styles.css')}">
${ldAll}
</head><body class="${landing ? 'is-landing' : ''}">
${header(path)}
<main id="main">${body}</main>
${footer()}
${quoteDialog()}
${stickyBar()}
<script>window.SITE={tokenEndpoint:${JSON.stringify(site.tokenEndpoint)},phone:${JSON.stringify(site.phone)}};</script>
<script src="/assets/js/main.js?v=${ver('assets/js/main.js')}" defer></script>
<!-- Start of LiveChat (www.livechat.com) code -->
<script>
window.__lc = window.__lc || {};
window.__lc.license = 19934163;
window.__lc.integration_name = "manual_channels";
window.__lc.product_name = "livechat";
;(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e}(window,document,[].slice))
</script>
<noscript><a href="https://www.livechat.com/chat-with/19934163/" rel="nofollow">Chat with us</a>, powered by <a href="https://www.livechat.com/?welcome" rel="noopener nofollow" target="_blank">LiveChat</a></noscript>
<!-- End of LiveChat code -->
</body></html>`;
}

function write(path, html) {
  const file = path === '/' ? 'index.html' : path.slice(1) + '.html';
  const full = join(OUT, file);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html);
}

function crumbs(items) {
  const html = `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map((c, i) => `<li>${c.href && i < items.length - 1 ? `<a href="${c.href}">${esc(c.label)}</a>` : `<span aria-current="page">${esc(c.label)}</span>`}</li>`).join('')}</ol></nav>`;
  const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: url(c.href || '/') })) };
  return { html, ld };
}

const faqLd = (faqs) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

const faqBlock = (faqs, title = 'Questions authors ask us') => `<section class="sec faq" id="faq"><div class="container narrow"><p class="kicker">FAQ</p><h2>${esc(title)}</h2><div class="acc">${faqs.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}<span class="plus" aria-hidden="true"></span></summary><div class="ans"><p>${esc(a)}</p></div></details>`).join('')}</div></div></section>`;

const ctaBand = ({ title, text, service = '', id, anchor = 'start', kicker = 'Start here', button }) => `<section class="sec cta-band" id="${anchor}"><div class="container cta-grid"><div class="cta-copy"><p class="kicker">${esc(kicker)}</p><h2>${esc(title)}</h2><p>${esc(text)}</p><a class="cta-phone" href="${site.phoneHref}">${ICON.phone}<span><small>Prefer to talk?</small>${site.phone}</span></a></div><div class="cta-form">${form(id, { service, source: id, cta: button })}</div></div></section>`;

/* ---------- HOME ---------- */
function home() {
  const groups = [
    ['Write & edit', ['ebook-writing-services', 'ghost-writing-services', 'article-writing', 'blog-writing', 'copy-writing-services', 'seo-optimized-content-services', 'book-editing-proofreading-services']],
    ['Design & produce', ['book-cover-designing-services', 'book-illustrations-designing-services', 'book-formatting', 'book-printing-services', 'ebook-publishing-services', 'audio-book-services', 'book-trailer']],
    ['Publish & promote', ['book-publishing-services', 'amazon-publishing-services', 'book-marketing-services', 'book-promotion', 'author-website-development-services']],
  ];
  const svcIdx = (slug) => services.findIndex((s) => s.slug === slug);
  const body = `
<section class="hero" aria-labelledby="h1"><div class="container hero-grid">
  <div class="hero-copy"><p class="kicker light">Independent publishing services for authors</p>
  <h1 id="h1">Your book, finished properly and <em>published with care.</em></h1>
  <p class="lede">From the first edit to the final upload, we handle writing, design, formatting and publishing support, so the book you imagined arrives looking the way readers expect.</p>
  <div class="hero-actions"><button class="btn btn-gold" type="button" data-quote>Start my project ${ICON.arrow}</button><a class="btn btn-ghost" href="${site.phoneHref}">${ICON.phone}${site.phone}</a></div>
  <ul class="hero-points"><li>${ICON.check}Authors keep their rights</li><li>${ICON.check}Pay only for the services you need</li><li>${ICON.check}Stage-by-stage approvals</li></ul><p class="hero-disc">Independent publishing-services provider. Not owned by, endorsed by or affiliated with Amazon or Kindle Direct Publishing.</p></div>
  <div class="hero-art" aria-label="Featured book covers"><div class="fan">
    <div class="fan-b fb1">${bookImg(books[0], { eager: true })}</div>
    <div class="fan-b fb2">${bookImg(books[1], { eager: true })}</div>
    <div class="fan-b fb3">${bookImg(books[2], { eager: true })}</div>
    <div class="fan-b fb4">${bookImg(books[3], { eager: true })}</div>
  </div></div>
</div></section>
<section class="quick" aria-label="Quick inquiry"><div class="container"><div class="quick-card"><div class="quick-head"><h2>Free consultation</h2><p>Tell us where your book is today.</p></div>${form('quick-form', { variant: 'inline', cta: 'Request a call back', source: 'home-hero-strip' })}</div></div></section>
<section class="strip" aria-label="How we work"><div class="container strip-grid"><div><strong>Independent</strong><span>Not affiliated with Amazon</span></div><div><strong>Author-owned</strong><span>You retain your rights</span></div><div><strong>À la carte or full-service</strong><span>Hire only what you need</span></div><div><strong>Clear approvals</strong><span>You sign off at each stage</span></div></div></section>
<section class="sec svc-explorer" id="services"><div class="container"><div class="sec-head split"><div><p class="kicker">Our services</p><h2>Everything between a draft and a finished book</h2></div><p>Nineteen services, available separately or as one coordinated project. Start with the three most requested, or browse by stage.</p></div>
<ul class="feat-grid">${['book-publishing-services', 'amazon-publishing-services', 'book-cover-designing-services'].map((sl) => { const s = bySlug[sl]; return `<li><a class="feat" href="${A(s)}"><span class="feat-n">${num(svcIdx(sl))}</span><span class="feat-k">${esc(s.kicker)}</span><h3>${esc(s.menu)}</h3><p>${esc(s.lede.split('. ')[0].replace(/\.$/, ''))}.</p><span class="feat-go">Explore service ${ICON.arrow}</span></a></li>`; }).join('')}</ul>
<div class="stage-cols">${groups.map(([g, list], gi) => `<div class="stage-col"><p class="stage-tag"><span>${gi + 1}</span>${g}</p><ul>${list.map((sl) => { const s = bySlug[sl]; return `<li><a href="${A(s)}"><span class="sc-n">${num(svcIdx(sl))}</span><span class="sc-t">${esc(s.menu)}</span>${ICON.arrow}</a></li>`; }).join('')}</ul></div>`).join('')}</div>
<div class="center"><button class="btn btn-dark" type="button" data-quote>Not sure what you need? Ask us ${ICON.arrow}</button></div></div></section>
<section class="sec journey dark" id="process"><div class="container"><div class="sec-head"><p class="kicker light">The author journey</p><h2>Five steps from manuscript to market</h2></div><ol class="steps">${processSteps.map(([t, d], i) => `<li><span class="sn">${num(i)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol></div></section>
<section class="sec showcase stage"><div class="container"><div class="sec-head split"><div><p class="kicker">Cover gallery</p><h2>Sample covers across genres</h2></div><p>Sample covers that show the range of styles authors choose. They are samples only, not client projects.</p></div><ul class="shelf big">${books.map((b) => `<li><figure class="shelf-item">${bookImg(b)}${capOf(b, true)}</figure></li>`).join('')}</ul><div class="center"><a class="btn btn-dark" href="/our-portfolio">See our work ${ICON.arrow}</a></div></div></section>
<section class="sec editorial"><div class="container ed-grid"><div class="ed-media"><div class="ed-card c1"><span>01</span><p>Rights stay with the author</p></div><div class="ed-card c2"><span>02</span><p>Specialists, one coordinator</p></div></div>
<div class="ed-text"><p class="kicker">Why authors choose us</p><h2>You bring the book. We bring the production team.</h2><p>Publishing a book well takes editors, designers, formatters and people who understand how retailers work. Finding and managing each of them yourself is a project in its own right.</p><p>We put those specialists behind a single point of contact. You make the creative decisions; we make sure they are carried out properly, in the right order, with nothing left to chance.</p><ul class="ticks"><li>${ICON.check}Plain-language guidance at each decision</li><li>${ICON.check}Scope and next steps explained before work begins</li><li>${ICON.check}Honest advice, including when a service is not needed</li></ul><a class="link-arrow" href="/about-us">About amazonselfpublishers ${ICON.arrow}</a></div></div></section>
<section class="sec resources cream"><div class="container"><div class="sec-head split"><div><p class="kicker">Author resources</p><h2>Practical reading before you publish</h2></div><a class="link-arrow" href="/blog">All articles ${ICON.arrow}</a></div><div class="posts">${blogPosts.slice(0, 3).map((p, i) => postCard(p, i)).join('')}</div></div></section>
${faqBlock(homeFaqs)}
${ctaBand({ title: 'Ready to see your idea become a book?', text: 'Tell us about your project. We will reply with honest advice and a clear next step.', id: 'home-form' })}`;
  const ld = [faqLd(homeFaqs)];
  write('/', layout({ path: '/', title: 'amazonselfpublishers | Book Writing, Editing, Design and Publishing Support', desc: 'Independent publishing services for authors: ghostwriting, editing, cover design, formatting, Amazon publishing support, marketing and promotion. Call +1 323 509 3062.', body, ld }));
  pages.push('/');
}

const postCard = (p, i) => `<article class="post"><a href="/articles/${p.slug}" class="post-art a${i % 4}" aria-hidden="true" tabindex="-1"><span>${esc(p.cat)}</span></a><div class="post-b"><p class="meta">${esc(p.cat)} &middot; ${p.mins} min read</p><h3><a href="/articles/${p.slug}">${esc(p.title)}</a></h3><p>${esc(p.excerpt)}</p><a class="link-arrow" href="/articles/${p.slug}">Read article ${ICON.arrow}</a></div></article>`;

/* ---------- SERVICE PAGE (standard; every service uses this one template) ---------- */
function servicePage(s) {
  const i = services.indexOf(s);
  const c = crumbs([{ label: 'Home', href: '/' }, { label: 'Services', href: '/#services' }, { label: s.menu, href: A(s) }]);
  const rel = s.related.map((r) => bySlug[r]);
  const dk = i % 2 ? '' : 'light';
  const sec = {
    overview: () => `<section class="sec overview"><div class="container ov-grid"><div class="ov-main"><p class="kicker">Overview</p><h2>${esc(s.overviewTitle || 'What this service covers')}</h2>${s.overview.map((p) => `<p>${esc(p)}</p>`).join('')}</div><aside class="ov-aside"><h3>${esc(s.asideTitle || 'Who it is for')}</h3><ul class="ticks">${s.audience.map((a) => `<li>${ICON.check}${esc(a)}</li>`).join('')}</ul></aside></div></section>`,
    deliverables: () => s.deliverStyle === 'grid'
      ? `<section class="sec deliver cream"><div class="container"><div class="sec-head"><p class="kicker">${esc(s.deliverKicker || 'What you receive')}</p><h2>Deliverables and scope</h2></div><ul class="dgrid">${s.deliverables.map(([t, d], k) => `<li><span class="dn">${num(k)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ul></div></section>`
      : `<section class="sec deliver"><div class="container"><div class="sec-head"><p class="kicker">${esc(s.deliverKicker || 'What you receive')}</p><h2>Deliverables and scope</h2></div><ol class="drows">${s.deliverables.map(([t, d], k) => `<li><span class="dn">${num(k)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol></div></section>`,
    process: () => `<section class="sec journey ${i % 2 ? 'cream' : 'dark'}" id="process"><div class="container"><div class="sec-head"><p class="kicker ${dk}">${esc(s.processKicker || 'How it works')}</p><h2>${esc(s.processTitle || `Our ${s.menu.toLowerCase()} process`)}</h2>${s.processIntro ? `<p>${esc(s.processIntro)}</p>` : ''}</div><ol class="steps four">${s.process.map(([t, d], k) => `<li><span class="sn">${num(k)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol></div></section>`,
    benefits: () => `<section class="sec benefits dark"><div class="container ben-grid"><div><p class="kicker light">${esc(s.benefitsKicker || 'Why it matters')}</p><h2>Benefits of Working With Us</h2></div><ul class="ben-list">${s.benefits.map((b) => `<li>${ICON.check}<span>${esc(b)}</span></li>`).join('')}</ul></div></section>`,
    faq: () => faqBlock(s.faqs, s.faqTitle || `${s.menu}: frequently asked questions`),
  };
  const related = `<section class="sec related"><div class="container"><div class="sec-head"><p class="kicker">${esc(s.relatedKicker || 'Related services')}</p><h2>${esc(s.relatedTitle || `Often paired with ${s.menu.toLowerCase()}`)}</h2></div><ul class="rel">${rel.map((r) => `<li><a href="${A(r)}"><span class="n">${num(services.indexOf(r))}</span><strong>${esc(r.menu)}</strong><span>${esc((s.relatedBlurbs && s.relatedBlurbs[r.slug]) || r.kicker)}</span>${ICON.arrow}</a></li>`).join('')}</ul></div></section>`;
  const cta = s.cta || { title: `Start your ${s.menu.toLowerCase()} project`, text: 'Share a few details and we will reply with scope, timing and next steps.' };
  const body = `
<section class="svc-hero v${i % 3}"><div class="container svc-hero-grid"><div>${c.html}<p class="kicker">${esc(s.kicker)}</p><h1>${esc(s.h1)}</h1><p class="lede">${esc(s.lede)}</p>${s.heroDisclosure ? `<p class="hero-disclosure">${DISCLOSURE_HTML}</p>` : ''}<div class="hero-actions"><button class="btn btn-gold" type="button" data-quote="${s.slug}">${esc(s.quoteBtn || 'Get a free quote')} ${ICON.arrow}</button><a class="btn btn-ghost-dark" href="${site.phoneHref}">${ICON.phone}${esc(s.callBtn ? s.callBtn + ' ' : '')}${s.callBtn ? '<span class="call-num">' + site.phone + '</span>' : site.phone}</a></div></div>
<div class="svc-hero-form" id="hero-form"><div class="hero-form-card"><h2${s.heroFormCenter ? ' class="ctr"' : ''}>${esc(s.heroFormTitle ||`Get your free ${s.menu.toLowerCase()} quote`)}</h2><p>${esc(s.heroFormText || 'Tell us a little about your book and we will reply with next steps.')}</p>${form('svc-hero-form', { service: s.slug, variant: 'svchero', cta: s.heroFormCta || 'Get my free quote', source: 'hero-' + s.slug })}</div></div></div></section>
${s.order.filter((k) => k !== 'showcase').map((k) => sec[k]()).join('\n')}
${related}
${ctaBand({ title: cta.title, text: cta.text, kicker: cta.kicker, button: cta.button, service: s.slug, id: 'svc-form' })}`;
  write(A(s), layout({ path: A(s), title: s.metaTitle, desc: s.metaDesc, body, ld: [c.ld, faqLd(s.faqs), { '@context': 'https://schema.org', '@type': 'Service', name: s.menu, provider: { '@type': 'ProfessionalService', name: site.name }, description: s.metaDesc, url: url(A(s)) }] }));
  pages.push(A(s));
}

/* ---------- LANDING PAGE (ad destination): dark centred hero, overlapping form card, trust strip. Used by services flagged `landing: true`. ---------- */
function landing(s) {
  const c = crumbs([{ label: 'Home', href: '/' }, { label: s.menu, href: A(s) }]);
  const rel = s.related.map((r) => bySlug[r]);
  const ticks = s.audience.slice(0, 3);
  const body = `
<section class="lp-hero"><div class="container"><p class="kicker light center">${esc(s.kicker)}</p><h1>${esc(s.h1)}</h1><p class="lede center">${esc(s.lede)}</p>
<p class="hero-disclosure">${DISCLOSURE_HTML}</p>
<div class="hero-actions"><a class="btn btn-gold" href="#start">${esc(s.quoteBtn || 'Get a free quote')} ${ICON.arrow}</a><a class="btn btn-ghost" href="${site.phoneHref}">${ICON.phone}${esc(s.callBtn ? s.callBtn + ' ' : '')}<span class="call-num">${site.phone}</span></a></div>
<ul class="lp-chips">${s.chips.map((t) => `<li>${ICON.check}${esc(t)}</li>`).join('')}</ul></div></section>
<section class="lp-form-wrap" id="start"><div class="container"><div class="lp-card"><div class="lp-card-copy"><h2>${esc(s.heroFormTitle)}</h2><p>${esc(s.heroFormText)}</p><ul class="ticks">${ticks.map((t) => `<li>${ICON.check}${esc(t)}</li>`).join('')}</ul><a class="cta-phone" href="${site.phoneHref}">${ICON.phone}<span><small>Prefer to talk?</small>${site.phone}</span></a></div><div class="lp-card-form">${form('lp-form', { service: s.slug, variant: 'svchero', cta: s.heroFormCta, source: 'landing-' + s.slug })}</div></div></div></section>
<section class="strip light"><div class="container strip-grid">${s.strip.map(([a, b]) => `<div><strong>${esc(a)}</strong><span>${esc(b)}</span></div>`).join('')}</div></section>
<section class="sec lp-over"><div class="container ov-grid"><div class="ov-main"><p class="kicker">Overview</p><h2>${esc(s.overviewTitle)}</h2>${s.overview.map((p) => `<p>${esc(p)}</p>`).join('')}</div><aside class="ov-aside"><h3>${esc(s.asideTitle)}</h3><ul class="ticks">${s.audience.map((a) => `<li>${ICON.check}${esc(a)}</li>`).join('')}</ul></aside></div></section>
<section class="sec deliver cream"><div class="container"><div class="sec-head"><p class="kicker">${esc(s.deliverKicker)}</p><h2>Deliverables and Scope</h2></div><ul class="dgrid">${s.deliverables.map(([t, d], k) => `<li><span class="dn">${num(k)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ul><div class="center"><a class="btn btn-dark" href="#start">${esc(s.quoteBtn)} ${ICON.arrow}</a></div></div></section>
<section class="sec journey dark" id="process"><div class="container"><div class="sec-head"><p class="kicker light">${esc(s.processKicker)}</p><h2>${esc(s.processTitle)}</h2><p>${esc(s.processIntro)}</p></div><ol class="steps four">${s.process.map(([t, d], k) => `<li><span class="sn">${num(k)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol></div></section>
<section class="sec benefits dark"><div class="container ben-grid"><div><p class="kicker light">${esc(s.benefitsKicker)}</p><h2>Benefits of Working With Us</h2></div><ul class="ben-list">${s.benefits.map((b) => `<li>${ICON.check}<span>${esc(b)}</span></li>`).join('')}</ul></div></section>
${faqBlock(s.faqs, s.faqTitle)}
<section class="sec related" id="services"><div class="container"><div class="sec-head"><p class="kicker">${esc(s.relatedKicker)}</p><h2>${esc(s.relatedTitle)}</h2></div><ul class="rel">${rel.map((r) => `<li><a href="${A(r)}"><span class="n">${num(services.indexOf(r))}</span><strong>${esc(r.menu)}</strong><span>${esc((s.relatedBlurbs && s.relatedBlurbs[r.slug]) || r.kicker)}</span>${ICON.arrow}</a></li>`).join('')}</ul></div></section>
${ctaBand({ title: s.cta.title, text: s.cta.text, kicker: s.cta.kicker, button: s.cta.button, service: s.slug, id: 'lp-form-final', anchor: 'start-bottom' })}`;
  write(A(s), layout({ path: A(s), title: s.metaTitle, desc: s.metaDesc, body, landing: true, ld: [c.ld, faqLd(s.faqs), { '@context': 'https://schema.org', '@type': 'Service', name: s.menu, provider: { '@type': 'ProfessionalService', name: site.name }, description: s.metaDesc, url: url(A(s)) }] }));
  pages.push(A(s));
}

/* ---------- OTHER PAGES ---------- */
function simpleHero(c, kicker, h1, lede) {
  return `<section class="page-hero"><div class="container">${c.html}<p class="kicker light">${kicker}</p><h1>${h1}</h1><p class="lede">${lede}</p></div></section>`;
}

function portfolio() {
  const c = crumbs([{ label: 'Home', href: '/' }, { label: 'Portfolio', href: '/our-portfolio' }]);
  // Fix List C03: no third-party books here. Honest placeholder until real, author-approved client projects exist.
  const body = `${simpleHero(c, 'OUR PORTFOLIO', 'Our Work', 'Client projects will appear here once they are complete and the author has approved sharing them. Ask us for sample edits, cover concepts and formatting examples.')}
<section class="sec"><div class="container narrow"><div class="notice"><h2>Client projects are coming soon</h2><p>We only show work that is genuinely ours and that the author has approved for sharing. Until then, we are happy to show you what we can do for your own book: sample edits, cover concepts and formatting examples.</p><div class="hero-actions"><a class="btn btn-dark" href="/#services">Explore Our Services ${ICON.arrow}</a> <button class="btn btn-gold" type="button" data-quote>Bring Your Book to Life ${ICON.arrow}</button></div></div></div></section>
${ctaBand({ title: 'Ready to talk about your book?', text: 'Tell us about your manuscript and we will recommend a path to publication.', id: 'pf-form' })}`;
  write('/our-portfolio', layout({ path: '/our-portfolio', title: 'Our Work | amazonselfpublishers', desc: 'Client projects will appear here once they are complete and the author has approved sharing them. Ask us for sample edits, cover concepts and formatting examples.', body, ld: [c.ld] }));
  pages.push('/our-portfolio');
}

function testimonialsPage() {
  const c = crumbs([{ label: 'Home', href: '/' }, { label: 'Testimonials', href: '/client-testimonials' }]);
  const has = testimonials.length > 0;
  const body = `${simpleHero(c, 'Testimonials', 'What authors say about working with us', 'We only publish feedback that comes from real clients who have given permission.')}
<section class="sec"><div class="container narrow">${has ? `<div class="quotes">${testimonials.map((t) => `<blockquote><p>${esc(t.quote)}</p><footer>${esc(t.name)}</footer></blockquote>`).join('')}</div>` : `<div class="notice"><h2>Client feedback is being collected</h2><p>We do not display invented or unverified reviews. Authentic, authorised client testimonials will appear here as they are received.</p><p>In the meantime, you are welcome to ask us any question about our process, see the titles in our <a href="/our-portfolio">portfolio</a>, or speak to us directly on <a href="${site.phoneHref}">${site.phone}</a>.</p></div>`}</div></section>
${ctaBand({ title: 'Start a conversation', text: 'Ask us anything about your book. There is no obligation.', id: 'tm-form' })}`;
  write('/client-testimonials', layout({ path: '/client-testimonials', title: 'Client Testimonials | amazonselfpublishers', desc: 'Read authorised feedback from authors who have worked with amazonselfpublishers, or contact us to discuss your project.', body, ld: [c.ld] }));
  pages.push('/client-testimonials');
}

function about() {
  const c = crumbs([{ label: 'Home', href: '/' }, { label: 'About Us', href: '/about-us' }]);
  const vals = [['Honesty first', 'We tell authors what a book needs and, just as importantly, what it does not. We do not promise bestseller status, rankings or sales.'], ['Authors own their work', 'Your manuscript, your rights, your account. We guide and produce; you remain the publisher of record.'], ['Craft over shortcuts', 'Good editing, careful design and accurate files are what make a book feel professional. We do not cut corners on them.'], ['Plain communication', 'You should always know what is happening, what it costs and what comes next.']];
  const body = `${simpleHero(c, 'About us', 'An independent team for independent authors', 'amazonselfpublishers helps writers turn finished ideas into professional books and put them in front of readers.')}
<section class="sec"><div class="container ed-grid"><div class="ed-text"><p class="kicker">Who we are</p><h2>Publishing support without the jargon</h2><p>Self-publishing gives authors control, and with it a long list of decisions: editing, covers, formats, metadata, pricing and promotion. Most writers have never had to make those choices before.</p><p>We exist to make them easier. Our services range from writing and editing to design, formatting, publishing support and promotion, and you can use as many or as few as your book needs.</p><p>We are an independent business. We are not owned by, endorsed by or officially affiliated with Amazon, and we say so plainly.</p></div><div class="ed-media"><div class="ed-card c1"><span>19</span><p>services, available separately or together</p></div><div class="ed-card c2"><span>01</span><p>point of contact for your project</p></div></div></div></section>
<section class="sec cream"><div class="container"><div class="sec-head"><p class="kicker">What we stand for</p><h2>Principles we work by</h2></div><ul class="dgrid">${vals.map(([t, d], k) => `<li><span class="dn">${num(k)}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ul></div></section>
${ctaBand({ title: 'Let\'s talk about your book', text: 'Tell us where you are in the process and we will suggest what to do next.', id: 'ab-form' })}`;
  write('/about-us', layout({ path: '/about-us', title: 'About Us | amazonselfpublishers', desc: 'Learn about amazonselfpublishers, an independent publishing-services team supporting authors with writing, editing, design and publishing.', body, ld: [c.ld] }));
  pages.push('/about-us');
}

function blogIndex() {
  const c = crumbs([{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }]);
  const cats = [...new Set(blogPosts.map((p) => p.cat))];
  const body = `${simpleHero(c, 'The blog', 'Advice for authors', 'Practical articles on editing, formatting, launching and promoting your book.')}
<section class="sec"><div class="container"><div class="blog-tools"><label class="sr" for="blog-search">Search articles</label><input id="blog-search" type="search" placeholder="Search articles" autocomplete="off"><div class="filters" role="group" aria-label="Filter by topic"><button type="button" class="chip on" data-filter="all" aria-pressed="true">All</button>${cats.map((x) => `<button type="button" class="chip" data-filter="${esc(x)}" aria-pressed="false">${esc(x)}</button>`).join('')}</div></div>
<div class="posts" id="posts">${blogPosts.map((p, i) => postCard(p, i).replace('<article class="post"', `<article class="post" data-cat="${esc(p.cat)}" data-text="${esc((p.title + ' ' + p.excerpt).toLowerCase())}"`)).join('')}</div><p class="empty" id="no-posts" hidden>No articles match your search.</p>
</div></section>
${ctaBand({ title: 'Have a question the blog does not answer?', text: 'Ask us directly and we will point you in the right direction.', id: 'bl-form' })}`;
  write('/blog', layout({ path: '/blog', title: 'Blog: Publishing Advice for Authors | amazonselfpublishers', desc: 'Articles on editing, formatting, book descriptions, launches and author websites from the amazonselfpublishers team.', body, ld: [c.ld] }));
  pages.push('/blog');
  blogPosts.forEach((p, idx) => {
    const path = '/articles/' + p.slug;
    const cc = crumbs([{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: p.title, href: path }]);
    const rel = blogPosts.filter((x) => x !== p).slice(0, 3);
    const art = { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.excerpt, datePublished: '2026-10', dateModified: '2026-10', author: { '@type': 'Organization', name: site.name }, publisher: { '@type': 'Organization', name: site.name }, mainEntityOfPage: url(path), image: site.domain + '/assets/img/brand/og-image-v3.jpg' };
    const bd = `<section class="page-hero"><div class="container narrow">${cc.html}<p class="kicker light">${esc(p.cat)} &middot; ${p.mins} min read</p><h1>${esc(p.title)}</h1><p class="lede">${esc(p.excerpt)}</p><p class="byline">By the amazonselfpublishers editorial team &middot; October 2026</p></div></section>
<article class="sec prose"><div class="container narrow">${p.body.map(([t, x]) => `<${t}>${esc(x)}</${t}>`).join('')}<div class="inline-cta"><h2>Need help with this?</h2><p>Our team can take it from here.</p><button class="btn btn-gold" type="button" data-quote>Talk to us ${ICON.arrow}</button></div></div></article>
<section class="sec cream"><div class="container"><div class="sec-head"><p class="kicker">Keep reading</p><h2>Related articles</h2></div><div class="posts">${rel.map((r, i) => postCard(r, i + idx)).join('')}</div></div></section>`;
    write(path, layout({ path, title: `${p.title} | amazonselfpublishers`, desc: p.excerpt, body: bd, ld: [cc.ld, art], ogType: 'article' }));
    pages.push(path);
  });
}

function contact() {
  const c = crumbs([{ label: 'Home', href: '/' }, { label: 'Contact Us', href: '/contact-us' }]);
  const body = `${simpleHero(c, 'Contact us', 'Let\'s talk about your book', 'Call us, or send a few details and we will get back to you.')}
<section class="sec"><div class="container contact-grid"><div class="contact-info"><h2>Get in touch</h2>${site.legalName ? `<p><strong>${esc(site.legalName)}</strong></p>` : ''}<a class="big-phone" href="${site.phoneHref}">${ICON.phone}<span><small>Call us</small>${site.phone}</span></a>${site.email ? `<p><strong>Email</strong><br><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>` : ''}${site.address ? `<p><strong>Address</strong><br>${esc(site.address)}</p>` : ''}${site.hours ? `<p><strong>Hours</strong><br>${esc(site.hours)}</p>` : ''}<p>Tell us about your manuscript, your timeline and the services you are interested in. We will reply with honest advice and a clear next step.</p><p class="fine">${esc(site.disclaimer)}</p></div><div class="contact-form"><h2>Send an inquiry</h2>${form('contact-form', { source: 'contact-page' })}</div></div></section>`;
  write('/contact-us', layout({ path: '/contact-us', title: 'Contact Us | amazonselfpublishers', desc: 'Contact amazonselfpublishers on +1 323 509 3062 or send an inquiry about writing, editing, design, formatting and publishing services.', body, ld: [c.ld] }));
  pages.push('/contact-us');
}

function legal() {
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const mk = (path, doc) => {
    const c = crumbs([{ label: 'Home', href: '/' }, { label: doc.title, href: path }]);
    const toc = `<nav class="toc" aria-label="Contents"><h2>Contents</h2><ol>${doc.sections.map((s) => `<li><a href="#${slug(s.h)}">${esc(s.h)}</a></li>`).join('')}</ol></nav>`;
    const secs = doc.sections.map((s) => `<section class="legal-sec" id="${slug(s.h)}"><h2>${esc(s.h)}</h2>${(s.p || []).map((p) => `<p>${esc(p)}</p>`).join('')}${s.ul ? `<ul>${s.ul.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}${s.after ? `<p>${esc(s.after)}</p>` : ''}</section>`).join('');
    const body = `<section class="page-hero"><div class="container">${c.html}<p class="kicker light">Legal</p><h1>${esc(doc.title)}</h1><p class="lede"><strong>Last Updated: ${legalUpdated}</strong></p></div></section><article class="sec prose legal"><div class="container narrow"><p>${doc.intro}</p>${toc}${secs}</div></article>`;
    write(path, layout({ path, title: `${doc.title} | amazonselfpublishers`, desc: `${doc.title} for amazonselfpublishers.co. Last updated ${legalUpdated}.`, body, ld: [c.ld] }));
    pages.push(path);
  };
  mk('/privacy-policy', privacy);
  mk('/terms-and-conditions', terms);
}

function notFound() {
  const body = `<section class="page-hero"><div class="container"><p class="kicker light">Error 404</p><h1>We could not find that page</h1><p class="lede">The page may have moved. Try the links below or call us.</p><div class="hero-actions"><a class="btn btn-gold" href="/">Back to home ${ICON.arrow}</a><a class="btn btn-ghost" href="${site.phoneHref}">${ICON.phone}${site.phone}</a></div></div></section><section class="sec"><div class="container"><ul class="rel">${services.slice(0, 8).map((r) => `<li><a href="${A(r)}"><span class="n">${num(services.indexOf(r))}</span><strong>${esc(r.menu)}</strong><span>${esc(r.kicker)}</span>${ICON.arrow}</a></li>`).join('')}</ul></div></section>`;
  write('/404', layout({ path: '/404', title: 'Page not found | amazonselfpublishers', desc: 'The page you requested could not be found.', body, noindex: true }));
}

function seoFiles() {
  const today = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `<url><loc>${url(p)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`;
  writeFileSync(join(OUT, 'sitemap.xml'), xml);
  writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /backend/\n\nSitemap: ${site.domain}/sitemap.xml\n`);
  // service slug -> label map for server-side form validation
  mkdirSync(join(OUT, 'backend'), { recursive: true });
  writeFileSync(join(OUT, 'backend', 'services.json'), JSON.stringify(Object.fromEntries(services.map((s) => [s.slug, s.menu])), null, 2));
  writeFileSync(join(OUT, '.htaccess'), `# amazonselfpublishers: Apache rules for Hostinger (LiteSpeed/Apache)
Options -Indexes -MultiViews
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
RewriteEngine On
# Force HTTPS
RewriteCond %{HTTPS} !=on
RewriteCond %{HTTP:X-Forwarded-Proto} !https
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
# Old Book Publishing landing path moved (Microsoft Ads fix list H03)
RewriteRule ^book-publishing-services/?$ /publishing-services [R=301,L]
# Strip .html from public URLs
RewriteCond %{THE_REQUEST} \\s/+(.+?)\\.html[\\s?] [NC]
RewriteRule ^ /%1 [R=301,L,NE]
# Strip trailing slash (except real directories)
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.+)/$ /$1 [R=301,L]
# Serve /path from path.html
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.+)$ /$1.html [L]
</IfModule>

<IfModule mod_headers.c>
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains" env=HTTPS
Header always set Content-Security-Policy "default-src 'self'; img-src 'self' data: https://*.livechatinc.com https://*.livechat.com https://*.livechat-files.com; style-src 'self' https://fonts.googleapis.com https://*.livechatinc.com 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com https://*.livechatinc.com; script-src 'self' 'unsafe-inline' https://*.livechatinc.com https://*.livechat.com; connect-src 'self' https://*.livechatinc.com https://*.livechat.com wss://*.livechatinc.com wss://*.livechat.com; frame-src https://*.livechatinc.com https://*.livechat.com; media-src https://*.livechatinc.com https://*.livechat-files.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
</IfModule>

<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType image/webp "access plus 1 year"
ExpiresByType image/jpeg "access plus 1 year"
ExpiresByType image/png "access plus 1 year"
ExpiresByType text/css "access plus 1 month"
ExpiresByType application/javascript "access plus 1 month"
</IfModule>
<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>
`);
}

/* ---------- run ---------- */
home();
services.forEach((s) => (s.landing ? landing(s) : servicePage(s)));
portfolio(); testimonialsPage(); about(); blogIndex(); contact(); legal(); notFound(); seoFiles();
console.log(`Built ${pages.length} indexable pages -> ${OUT}`);
