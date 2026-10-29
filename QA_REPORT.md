# QA report (2026-10-16)

Environment: local PHP 8.0.30 built-in server with a router mimicking `.htaccess`, in the Claude desktop built-in browser (Chromium). Nothing was tested on Hostinger.

## Passed (actually performed)
| Check | Result |
| --- | --- |
| `node tools/audit.mjs`: 34 HTML pages, 3,484 internal href/src/srcset refs | All files exist; every page has unique title and description, exactly one `<h1>`, a canonical, no duplicate ids, no `img` without alt, no reference/competitor/localhost domains in output |
| All 25 required routes + blog articles + legal + 404 return 200 / 404 correctly | Built and loaded in the layout run below |
| Horizontal overflow and broken images: 29 routes x 5 widths (320, 375, 768, 1024, 1440) = 145 checks | 0 overflows, 0 broken images (hidden iframe test) |
| Mega-menu (desktop): opens on hover/click, two columns (10 + 9 links), correct hrefs, Esc/outside-click close | Pass. Hover + click conflict found and fixed |
| Mobile menu at 375px: opens, Services submenu expands (19 links), body scroll locked | Pass |
| Quote popup: opens from header CTA, focus goes to name, empty submit shows 4 field errors and focuses first invalid field, valid submit shows success, close button works | Pass |
| Backend: bad Origin 403; bad token 400; too-fast 429; validation 422 with per-field errors; honeypot silent; success 200 | Pass |
| SMTP: message delivered to LOCAL fake SMTP server with correct fields, service label, form source, page URL, utm_*/gclid | Pass (local only) |
| Landing page attribution: utm_source/medium/campaign + gclid captured, stored in sessionStorage, preselected service, delivered in email | Pass |
| Portfolio: 4 books, category filter (Memoir = 1, All = 4), detail dialog populates and closes | Pass |
| Blog: search ("launch" = 1, no match shows message), topic filter (Formatting = 2) | Pass |
| `/backend/lib.php` blocked by dev router (403); `.htaccess` equivalent supplied | Dev router only |
| tel link `tel:+13235093062` present in header, hero, footer, contact, landing | Pass |

## Added after the first round
- 8 books: 8 distinct covers verified on `/`, `/amazon-publishing-services`, `/book-formatting`, `/our-portfolio`; portfolio shows 8 items and 0 broken images; static audit still clean (3,786 refs).
- Amazon landing page now has the full header and Services mega-menu (verified `mega-toggle` present in built HTML).
- Home Services section redesigned (3 featured cards + 3 stage columns); rendered in the browser, layout checked visually at one width only.
- Real SMTP: one test email via smtp.titan.email:465 was ACCEPTED by the server (`SENT OK`). Inbox arrival CONFIRMED by the owner (2026-10-16).

## Not performed / outstanding
- Confirmation that the real test email reached the inbox, and a real form submission on the live domain.
- `.htaccess` rewrite, HTTPS redirect, security headers and deny rules on real Hostinger (only the dev router was exercised).
- Keyboard-only walkthrough (Tab order, focus return from dialogs) and screen-reader testing; code uses native `<dialog>`, `<details>`, labelled controls and `:focus-visible`, but this was not manually verified.
- Cross-browser (Firefox, Safari) and real-device testing; only 1440/1024/768/375 emulation was viewed visually, other widths only checked for overflow.
- Performance/Lighthouse scores, colour-contrast tooling, structured-data validation.
- Reference inspection of 24 of the 27 listed URLs (see PROJECT_STATUS.md).
- Old-vs-new content comparison (no previous site existed).

## Known limitations
- Google Fonts are loaded from fonts.googleapis.com (CSP allows it). Self-host if you prefer no third-party requests.
- Two cover images are low-resolution; they are intentionally not enlarged.
- Colour palette comes from the logo, not the reference site, whose styling could not be read.

## Compliance round (2026-10-17)
Performed:
- Static audit `node tools/audit.mjs`: 34 pages, 3,873 refs, no problems.
- Searched all built output for the 8 old titles/authors/filenames: 0 matches; searched for "draft text", "client-approved", bare "Amazon Publishing" label: none.
- Layout sweep: 29 routes x 320/768/1440px = 87 checks, 0 horizontal overflow, 0 broken images (lazy images forced to load).
- Portfolio: 8 covers, 6 category chips, Romance filter = 1, detail dialog shows illustrative note, no CTA; author line hidden when the cover prints none.
- Amazon landing page: full mega-menu header and standard footer present; service dropdown shows "Amazon Publishing Support" with value unchanged; consent link /privacy-policy; UTM values captured.
- One real end-to-end form submission through the live SMTP account (subject mentions a compliance test) returned success. Arrival of that email was not checked by me.
Not performed: legal review; keyboard/screen-reader checks; real-host header/rewrite behaviour; testing on 375/1024 widths this round.

## Required-fields audit (2026-10-22)
Scope: every form in the built site. Discovered: 79 `<form>` elements on 34 pages, all produced by the single `form()` generator and handled by one JS handler and one PHP endpoint. Instances: quote-modal x34 (one per page), svc-hero-form x18, svc-form x18, quick-form, home-form, lp-form, lp-form-final, pf-form, tm-form, ab-form, bl-form, contact-form. No dynamically created forms exist in the JavaScript.
Performed:
- `node tools/audit-forms.mjs` on the build AND on the extracted deliverable zip: all 79 forms have required name/email/phone (correct input types, associated labels, visible required markers), no other required field, pre-checked non-required disclaimer, honeypot/token/tracking fields, privacy link.
- `node tools/test-backend.mjs`: 38/38 server-side checks (missing/blank/whitespace/invalid name, email, phone; international phone formats accepted; unknown service rejected; optional fields blank accepted; origin, forged token, honeypot, instant-submit and GET protections; exactly the 12 accepted submissions were emailed to the local sink).
- Browser run over all 79 forms, 10 checks each (empty, no name, no email, no phone, whitespace name, invalid email, two invalid phones, Enter-style submit, valid 3 fields with all optionals blank): 790/790 passed; rejected submissions made 0 network posts.
- Real keyboard Enter on the Contact page: rejected with the phone empty (message shown, focus moved to phone, nothing sent); accepted with valid fields and received by the sink.
Not tested: delivery to the real mailbox for these runs (local sink used); the live Hostinger copy; third-party LiveChat pre-chat form (configured in the LiveChat dashboard, not in this code).

## Strike fix-list round (2026-10-28)
Performed (all against the final build; real servers/fake SMTP unless stated):
- `node tools/audit.mjs`: 34 pages, 3,357 internal refs OK; policy checks (no draft notices, no cover images/gallery outside home, footer KDP sentence, no pre-ticked consent, FAQ 1) pass; `audit-forms`: 79 forms on 34 pages all require name/email/phone/consent, unticked, disclosure directly under the button.
- `node tools/test-backend.mjs`: 40/40 (includes consent missing/empty/"no" rejected, 11 accepted submissions emailed to the local sink, origin/token/honeypot/rate protections).
- Browser run over ALL 79 forms x 11 checks each (empty, each field missing, whitespace name, invalid email, two invalid phones, valid-but-consent-unticked, Enter-style submit, valid success): 869/869 passed; rejected submissions made 0 network posts; consent reset to unticked after each success.
- Layout sweep: 14 pages x 5 widths (320/375/768/1024/1440) = 70 checks: 0 overflow, 0 broken images, hero form stacks on tablet/phone, 8 home covers, no gallery on Portfolio.
- Mobile 375px: hero paragraph disclosure, hero-form and bottom-form disclosure each 13.6px or larger, dark text, not covered by the sticky bar or chat bubble; popup hides the chat bubble and restores it on X, backdrop click, Escape and when the chat had been open.
- 301: `/book-publishing-services` -> `/publishing-services` confirmed with curl on the local router (the production rule is in the generated `.htaccess` but was not run on Apache).
- One real submission through the live SMTP settings from the new landing page was accepted by the mail server; arrival in the inbox not confirmed by me (look for "LANDING PAGE TEST (please ignore)").
Not performed: Apache/`.htaccess` behaviour on Hostinger; Microsoft Ads editorial review; keyboard-only/screen-reader pass; cross-browser testing.
Bugs found and fixed during this round: chat bubble was not restored after closing the popup (close event unreliable) - now restored explicitly from every close path.
