# PROJECT STATUS: amazonselfpublishers

Last updated: 2026-10-16. Not deployed. Not live.

## Important context
The redesign brief described an existing working site. **No such site existed in the project folder**
(it held only the old logo PNG), and nothing had been built earlier. With the owner's confirmation, the site was
built **from scratch** in HTML/CSS/vanilla JS + PHP, applying the redesign brief's requirements.
Therefore no "before/after" comparison of old content, old forms or old SMTP settings was possible.

## Deliverable
`site/` is the upload folder for `public_html`. See README.md and HOSTINGER_DEPLOYMENT.md.

## Reference research (what was and was not inspected)
Fetched as text only (no screenshots, CSS or colours were available; each URL was requested once):
- https://amazonselfpublish.com/ (home): inspected
- https://www.amazonpublisherservice.com/lp/publishing (without tracking query string): inspected
- https://kdppublishingdominion.com/ (home): inspected
NOT inspected: the other 24 reference URLs (the 19 service pages, portfolio, testimonials, about, blog, contact). The reference
site's actual colour palette could not be read, so the palette is derived from the supplied logo (gold/orange on black).
Reference forms/popups: the references showed a hero lead form, a 50%-discount popup and floating live-chat/phone buttons; this
site implements a hero-strip form, a service-aware quote popup and a mobile call bar. No live chat or discount popup was copied.

## Pages (all built; automated checks only, see QA_REPORT.md)
- [x] 1 Home `/`
- [x] 2-20 Services (19), exact paths from the brief. `/amazon-publishing-services` uses a separate landing-page template
- [x] 21 `/our-portfolio`  [x] 22 `/client-testimonials`  [x] 23 `/about-us`  [x] 24 `/blog` (+6 article routes)  [x] 25 `/contact-us`
- [x] Extra: `/privacy-policy`, `/terms-and-conditions` (substantive content, last updated October 17, 2026; legal review still required), `/404`

## Logo
New logo (stacked book + quill, black background) is used in header, footer, mobile menu, landing header/footer, favicon, apple-touch icon
and OG image. The old rejected logo is kept only at `_backup_original_assets/old-rejected-logo.png` and is referenced nowhere.
The artwork is unmodified except trimming empty black margin. The logo has an opaque black background, so header/footer are black.

## Books (replaced 2026-10-17)
The earlier 8 covers (incl. The President Is Missing and Bread of Angels) were REMOVED. The 8 covers supplied by the owner now appear
everywhere, labelled as illustrative and not our client work. Full list, files and rights flag: **BOOK_ASSET_INVENTORY.md**.

## Home hero (new composition)
Dark editorial headline left, layered fan of the four approved covers right, with a separate overlapping "free consultation" strip below.

## Amazon Publishing landing page structure
Compact header (logo, anchor links, phone, CTA) > centred hero > overlapping two-column form card > trust strip > service overview >
scope grid > process > book shelf > related services > benefits > FAQ > final form band > minimal footer with disclaimer.
Captures utm_*, gclid, gbraid, wbraid and referrer into hidden fields (sessionStorage) and includes them in the email.

## Forms and email
- Fields shared across all forms; PHP endpoint `backend/contact.php`; token endpoint `backend/token.php`.
- Server-side validation, signed HMAC timing/CSRF token (IP-bound), honeypot, same-origin check, 5/hour/IP rate limit, header-injection stripping.
- SMTP via built-in client reading `site/backend/.env` (gitignored, web-blocked). Configured with the supplied Titan mailbox
  info@amazonselfpublishers.co (smtp.titan.email, port 465 SSL); MAIL_TO is the same address. The password lives only in that file.
- The full form pipeline was tested against a LOCAL fake SMTP server. One real test message was sent through Titan and the server accepted it
  ("250") and the owner confirmed it arrived in info@amazonselfpublishers.co. A form submission on the live domain is still untested.
- Production domain set to `https://amazonselfpublishers.co` (no www); info@amazonselfpublishers.co is shown publicly in footer/contact.

## Compliance round (Microsoft Ads report, 2026-10-17)
All 8 findings were actioned; see **COMPLIANCE_IMPLEMENTATION.md** for the finding-by-finding log, tests and the owner-input list.
Blocked on the owner: legal entity name (H-01; mailing address was added 2026-10-18), governing state, retention period, no-sale confirmation,
and confirmation of which covers (if any) are authorised client work. Logo (M-01) is only partly mitigated; a rebalanced logo file is needed.
Label "Amazon Publishing" is now "Amazon Publishing Support" everywhere (form values and route unchanged).
The Amazon page now uses the standard header with the full Services menu and the standard footer.

## Not done / needs input
- Confirm MAIL_TO should be info@ (change in `.env`), and rotate the SMTP password since it was shared in chat.
- No address, hours or social links were supplied, so none are shown.
- There was no "old website" in this project, so domain/SMTP came from the details you typed in chat.
- Testimonials: none supplied; the page honestly says feedback is being collected. Add real, authorised ones in `tools/data/misc.mjs`.
- About page contains no invented history, team or statistics.
- Blog articles are original samples marked "draft pending editorial approval"; no publish dates shown.
- Legal pages are drafts; have them reviewed. Trademark/brand-name use ("Amazon" in the name and logo) needs legal review; the site carries a non-affiliation disclaimer.
- Not tested: Safari/Firefox/real devices, screen readers, Lighthouse/performance scores, live HTTPS/.htaccess behaviour on Hostinger.
- Competitor-inspired ideas used only structurally (index-style service list, process steps, landing page form-first layout); no text/images/code copied.

## Next steps
1. Supply SMTP details, MAIL_TO, domain, contact email/address/socials, and real testimonials.
2. Rebuild (`node tools/build.mjs`), upload `site/`, run the checks in HOSTINGER_DEPLOYMENT.md section 7.


## Logo v2 (2026-10-18)
The owner supplied a revised logo with "Amazon" and "Self Publishers" at closer visual weight (feather + open book, gold lettering). It replaces
the previous logo everywhere (header, footer, mobile menu, favicon, apple-touch icon, social/OG image). The previous brand files are kept in
`_backup_original_assets/brand-v1/`. The "Independent publishing services" header descriptor added earlier was removed at the owner's request.
Regenerate assets from a new source file with `node tools/logo-v2.js <file>` (then update the width/height in `logoImg` in `tools/build.mjs` if the aspect ratio changes).

Note 2026-10-18: brand image files were renamed with a -v2 suffix (e.g. logo-trimmed-v2.webp) because browsers cache images for a year under the old names. When you change the logo again, use a new filename (-v3) or add a version query.

## Logo v3 (2026-10-18)
The owner supplied a third logo version; it replaces v2 everywhere (files now end in -v3; v1 and v2 originals are in _backup_original_assets/brand-v1 and brand-v2). Regenerate with: node tools/logo-update.js <source image>, then update the file suffix and width/height (720x617) in tools/build.mjs if they change.

## Revisions 2026-10-21
1. Footer: Privacy Policy and Terms links are centred (copyright below), with extra bottom padding so the floating chat button never sits on them. When the chat window is open on tablet/desktop, the footer's legal block shifts left, clear of it (uses LiveChat's visibility event). On phones LiveChat opens full-screen and locks scroll; the visitor closes it to reach the footer.
2. Forms: only Name, Email, Phone are required everywhere (client + server). Service/message/checkbox optional.
3. Service pages: the hero image and the big decorative number were replaced by a working form on all 18 service pages (not Amazon Publishing, which keeps its own hero form). The form pre-selects that service. Old hero art markup/CSS removed; the cover images in the page-lower "Cover gallery" are unchanged and no image files were deleted.
4. Disclaimer checkbox pre-ticked on all forms; see COMPLIANCE_IMPLEMENTATION.md for the consent caveat.
5. Bug fixes found while testing: (a) LiveChat snippet had `e.h` instead of `e._h`, which silently disabled its JavaScript API; corrected to the official form. (b) The form token is now refreshed after every response so a quick resubmit is not rejected by the 3-second anti-bot timing check.
Dev-only: `SITE_ENV_FILE` env var (backend/lib.php) lets tests point at a fake SMTP; `RATE_LIMIT_MAX` env var (default 5/hour) is configurable.

## Portfolio copy revision 2026-10-22
Portfolio hero, gallery heading/description, gallery disclaimer and the two CTA labels were replaced with owner-supplied text (tools/build.mjs, portfolio()). The Book Cover Design page's cover-gallery disclaimer paragraph was removed for that page only (showcaseStrip(note=false)); the other 17 service pages, home and the Amazon page keep their note. Note: the Book Cover Design page now shows the cover gallery without any 'for inspiration only' label other than its heading.

2026-10-22 (later): the gallery disclaimer paragraph was removed from the Portfolio page at the owner's request. Per-book 'Illustrative cover...' note inside the cover popup remains.

2026-10-22 (later): the cover-gallery disclaimer paragraph (illustrative covers / not client work) was removed from all 19 individual service pages and then from the home page, so it now appears on no page of the site. The Portfolio page has no gallery disclaimer (removed at the owner's earlier request); its cover popup still shows a short per-cover note.


## Strike fix list round (2026-10-28)
Book Publishing moved to `/publishing-services` (301 from the old path) using the revised docx copy; Amazon Publishing Support is a normal service page again; cover gallery removed from all service pages and the Portfolio (placeholder text); 8 new sample covers installed on the home page only and the old covers deleted; blog draft notices removed and bylines added; consent box unticked + required everywhere; KDP-is-free disclosure under every form button, in the landing hero, FAQ 1 and the footer. Details and the owner-action list: COMPLIANCE_IMPLEMENTATION.md. Covers: BOOK_ASSET_INVENTORY.md.

2026-10-28 (later): Book Publishing at /publishing-services now uses the dedicated landing-page template again (landing() in tools/build.mjs, enabled per service with landing: true), filled with the revised docx copy. The sticky mobile bar is hidden on this page by design. Tested: 3 forms 8/8, layout at 5 widths, section order per docx.
