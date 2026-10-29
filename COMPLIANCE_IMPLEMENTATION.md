# Microsoft Advertising compliance: implementation log

Source: `AmazonSelfPublishers_co_MicrosoftAds_Compliance_Check.pdf` (checked 16 Oct 2026, 33 pages crawled). Implemented 2026-10-17.
This log records what was changed and tested. **It does not certify the site as compliant or the legal text as legally approved.**
Legal pages need review by a qualified professional, and several facts must come from the owner (section "Owner input still needed").

## Findings
| ID | Item | Change made | Files | Test performed | Outcome |
|---|---|---|---|---|---|
| G-01 (Critical) | Real bestsellers shown as our work; "Publish a book like this" CTA | The President Is Missing, Bread of Angels and all other old covers removed (incl. files). The 8 owner-supplied covers installed everywhere, but labelled **illustrative / not our client work**. Portfolio page now reads "We are building our showcase" (report wording). Old "showcase", "approved titles" and "client-approved" wording removed. The CTA is hidden unless a title is flagged `client: true` (none are). No blurbs/descriptions. | `tools/data/misc.mjs`, `tools/build.mjs`, `site/assets/js/main.js`, `site/assets/img/books/*` | Searched all built output for old titles, authors and filenames: 0 matches. Loaded `/our-portfolio`: 8 covers, 0 broken images, filter works, dialog shows "Illustrative cover…" note and no CTA. | **Done for the code. Risk remains** until owner confirms each cover is authorised client work or has permission to display it (see below). |
| G-02 (Critical) | Legal pages marked as drafts | Draft line removed from both pages. Both rewritten with substantive sections drawn from what the site actually does (forms, session storage, hashed-IP rate limit, SMTP email, LiveChat, Google Fonts, no ad/analytics tags). Table of contents added. | `tools/data/legal.mjs`, `tools/build.mjs`, CSS | Built and loaded both pages; grep confirms no "draft" text. | **Content done; needs legal review** before relying on it. |
| H-01 (High) | No legal entity name or mailing address | Config fields `legalName` and `address` added; they render automatically in the footer, Contact page, and both legal pages once set. Nothing invented. Phone and info@ email already shown everywhere. | `tools/data/config.mjs`, `tools/build.mjs`, `tools/data/legal.mjs` | Verified fields stay hidden while empty (no placeholders). | **Mailing address added 2026-10-18** (Fine Arts Building, 811 W. 7th St., Suite 1149, Los Angeles, CA 90017): verified in the footer (all pages), Contact page, Privacy Policy and Terms; legal pages' "Last Updated" moved to October 18, 2026. **Legal entity name is still missing**, so H-01 is only partly resolved. |
| H-02 (High) | Missing disclosures | Privacy Policy now covers: advertising/analytics (states none installed today and that the policy will be updated before any is added), cookies/similar tech (LiveChat, session storage, Google Fonts), SMS (site does not collect SMS consent; separate consent promised if ever used; STOP wording), retention, rights and request method, California CCPA/CPRA with "Do Not Share" email route, other states, children under 13, security, third-party links, Amazon non-affiliation, last-updated date. | `tools/data/legal.mjs` | Content cross-checked against code audit (scripts in built HTML: only Google Fonts and LiveChat). | **Done in text; owner must confirm retention, no-sale statement and SMS plans.** |
| H-03 (High) | Consent links point to draft policy | All consent checkboxes already linked to `/privacy-policy`; the target is now the finished page, and a `/terms-and-conditions` link was added to the same label. Checkbox remains `required`; form logic untouched. | `tools/build.mjs` | Counted: every form on home, contact, portfolio, testimonials, landing and service pages has a consent link to `/privacy-policy`. Previously tested submit flow unchanged. | **Done** (links verified in markup). |
| M-01 (Medium) | Logo "Amazon" dominates | The supplied logo artwork cannot be rebalanced without altering or recreating it (not permitted). Mitigation: a small text descriptor "Independent publishing services" beside the header logo on wide screens, an independence statement in the hero, and a larger, higher-contrast footer disclaimer. | `tools/build.mjs`, CSS | Visual check. | **Partly mitigated.** A revised logo file with balanced "Amazon" / "Self Publishers" is still the real fix. |
| M-02 (Medium) | Bare "Amazon Publishing" label | Visible label is now "Amazon Publishing Support" in the mega-menu, mobile menu, every form dropdown, popup dropdown, related-service cards, footer, breadcrumbs and the notification email. The form value (`amazon-publishing-services`) and the route are unchanged. | `tools/data/services.mjs` (flows into `backend/services.json`) | grep: no `>Amazon Publishing<` remains; dropdown option verified. | **Done** |
| M-03 (Medium) | No "Last Updated" | "Last Updated: October 17, 2026" shown under the title of both pages (set in `config.mjs` `legalUpdated`; change it whenever the text changes materially). | `tools/data/config.mjs`, `tools/build.mjs` | grep: present on both pages. | **Done** |

## Non-affiliation disclosure placement
Footer (every page), home hero, Amazon Publishing Support hero, Contact page, Privacy Policy, Terms, FAQ answer. Checked in the built HTML.

## Functionality preserved
Form field names/IDs, hidden attribution fields, SMTP configuration, `backend/` code, routes, LiveChat widget and security headers are unchanged. Service **values** are unchanged; only visible labels changed.

## Owner input still needed (nothing was invented)
1. **Exact legal entity name**: set `legalName` in `tools/data/config.mjs`, rebuild, re-upload. (Still blocks full H-01.)
2. ~~Mailing address~~: supplied and live (confirm it matches your Microsoft Advertising verification documents exactly).
3. **Governing state**: Terms currently say "laws of the United States and of the U.S. state in which we are established". Name the state once known.
4. **Confirm** the statement "We do not sell personal information collected through this website" and the California section.
5. **Retention**: policy says "as needed to respond, then a reasonable period for business records, deleted earlier on request". Define the real period and any deletion routine, then update the text. No automatic deletion exists.
6. **SMS**: the policy says the site does not collect SMS consent. If you will text leads, add a separate unticked SMS consent checkbox and update the policy first.
7. **Advertising tools**: none installed. Before adding Microsoft UET, Google Ads/Analytics or Meta Pixel, update the Advertising and Cookies sections, and add a consent/opt-out mechanism if needed. No banner was added because no tracking tag needs one today (assessment: US audience, only the LiveChat widget and Google Fonts load).
8. **Each of the 8 covers**: tell me which are authorised client projects (then set `client: true` and add the author's permission), or remove them. Until then the portfolio is honest but still shows third-party covers.
9. **Legal review** of both pages, and confirm the sales/refund/payment terms that live in your written quotes (not on the site).
10. Consider whether the LiveChat widget needs a cookie notice for visitors outside the U.S.

## Update 2026-10-18: M-01 logo
The owner supplied a revised logo with more balanced "Amazon" / "Self Publishers" prominence and it is now used site-wide (header, footer, favicon, social image).
The header descriptor text was removed at the owner's request. M-01 is now addressed by the logo itself; whether Microsoft considers the balance sufficient is not something we can verify.
Tested: header layout at 10 widths x 4 pages (40 checks): no overlaps, no cut-off, no horizontal overflow, logo proportions preserved.

## Update 2026-10-21: form changes requested by the owner (affects H-03 and H-02)
Owner instructions, implemented in `tools/build.mjs`, `site/assets/js/main.js`, `site/backend/contact.php`, `tools/data/legal.mjs`:
- **Only Name, Email and Phone are required** on every form. Phone was optional before. Service, project details and the disclaimer checkbox are now optional (client and server).
- **The disclaimer checkbox ("I agree to be contacted about my inquiry and accept the Privacy Policy and Terms") is pre-ticked, can be unticked, and no longer blocks submission.** It was previously a required tick-box (the earlier H-03 safeguard). The inquiry email records "Disclaimer checkbox: checked/unchecked".
- Consent assessment: this checkbox is a general acknowledgement for answering the person's own inquiry by email or phone. It is **not** marketing or SMS consent and must not be treated as such. The site collects no SMS consent and the Privacy Policy says so; if you ever text leads you must add a separate, UNticked SMS opt-in checkbox and update the policy first.
- Risk to note: the original report (H-03) valued an affirmative consent tick. A pre-ticked, non-required box is weaker evidence of consent, and a Microsoft reviewer may or may not accept it. Phone is now mandatory, and the policy states that we may call. If review pushes back, the fix is to make the box unticked and required again (one line in `form()`).
- Privacy Policy updated to match (phone required, pre-ticked optional checkbox); "Last Updated" moved to October 21, 2026.

---
# Strike fix list (account F1131RQS), implemented 2026-10-28
Source: `AmazonSelfPublishers_co_Strike_FixList.pdf` and `Revised Landing Page Content.docx`. Statuses below are what was actually verified; "owner" items cannot be done in the code.
**Not certified:** this does not guarantee reinstatement. Microsoft reviews the whole domain and the new ads.

| ID | Requirement | What was done | Verified by | Status |
|---|---|---|---|---|
| C01 | Disclosure under every form button, in the landing hero, FAQ 1 on landing + Amazon page, KDP sentence in footer | Shared `form()` prints the exact disclosure under every submit button (79 forms); landing/Amazon heroes show it above the buttons; FAQ 1 "Can I publish on Amazon myself?" on `/publishing-services`, `/amazon-publishing-services` (and home); footer/legal disclaimer extended | `audit-forms` (disclosure directly after button on 79/79), browser run (79/79 present, 13.6px+, dark text), mobile probe (not covered by sticky bar/chat) | Done |
| C02 | Ads: delete struck campaign, no $499/50%/"Publish Your Book on Amazon" | Site shows no price or discount. **The campaign must be rebuilt by you/marketing; not a code task.** | n/a | **Owner** |
| C03 | Remove cover gallery from landing + 19 service pages; Portfolio placeholder; delete image files | Gallery section deleted from the template; Portfolio = "Our Work" with the exact placeholder text; the eight third-party cover files deleted; only 8 new SAMPLE covers remain, on the home page, labelled "not client projects" | `audit` policy check (no cover references outside home), layout sweep | Done; **see covers question** |
| H01 | Draft blog notices | Both notices removed; byline "By the amazonselfpublishers editorial team · October 2026" and `datePublished` added to each article. Blog stays in the menu (you must confirm the articles are final) | `audit` policy check, DOM check | Done; **owner to confirm articles are final** |
| H02 | Consent unticked and required; Privacy Policy sentence | Checkbox unticked + `required` on every form (client and server reject without it); label now "...acknowledge the Privacy Policy and Terms"; Privacy Policy sentence replaced with the Fix List wording; legal pages' Last Updated = October 28, 2026. **This reverses your earlier request for a ticked, optional box.** | backend 40/40, browser 79/79 ("valid fields but unticked" rejected) | Done |
| H03 | New neutral URL, 301 from old, menus/cards updated | New page at `/publishing-services`; old `/book-publishing-services` 301s (production `.htaccess`, dev router); menu, home cards, footer, related links, sitemap and canonical use the new path; page order and copy follow the docx | curl 301 test, link audit (3,357 refs), 91 internal links to the new path | Done; **301 on Hostinger untested** |
| Docx 12 | Mobile: disclosures not hidden by sticky bar/chat | Chat bubble is hidden while the quote popup is open and restored on every close path; footer legal block already shifts clear of an open chat | mobile probe at 375px, popup close paths (X, backdrop, Escape, chat-was-open) | Done |

## Page structure now
- `/publishing-services` (Book Publishing): the dedicated LANDING-PAGE design (dark centred hero, overlapping form card, trust strip; `landing: true` in services.mjs), using the docx copy exactly: hero + disclosure + two buttons, form card, strip, Overview ("What Is Included?" panel), Deliverables (6), black Process section (4 steps), black Benefits (5), FAQ (KDP question first), Related (4), bottom CTA, footer.
- `/amazon-publishing-services`: normal service page (same URL, same template as the other 17 pages), KDP FAQ first, disclosure under both forms.

## Owner items still open
1. Rebuild the Microsoft Ads campaign from the Fix List's "Replace with" column (C02), then ask support to reinstate. Final URL: `/publishing-services`.
2. ~~Confirm the 8 home-page sample covers are your own sample designs~~ CONFIRMED by the owner on 2026-10-28; keep the "sample covers, not client projects" label.
3. Confirm the 6 blog articles are final (they are original, unreviewed sample text); otherwise hide the Blog.
4. Legal business name (H-01 from the October report) is still missing; governing state, retention period and no-sale confirmation remain owner decisions. Legal pages still need professional review.
5. Provide the final landing-page copy only if the docx is not the final version.


