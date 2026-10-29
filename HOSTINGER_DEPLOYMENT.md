# Hostinger deployment guide

Nothing has been deployed. These are the steps for when you decide to publish.
Do not change DNS or overwrite a live site without a backup.

## 1. Requirements
- Hostinger shared/Business hosting with **PHP 8.0 or newer** (hPanel > Advanced > PHP Configuration) and Apache/LiteSpeed (`.htaccess` supported).
- A mailbox on your domain (hPanel > Emails) to send inquiry emails through.
- Node.js 18+ on your computer only if you want to edit content and rebuild. The server needs no Node.

## 2. Before uploading
1. The production domain in `tools/data/config.mjs` (`site.domain`) is `https://amazonselfpublishers.co`; change it there if it differs.
2. Add address/hours/social links there if you want them shown.
3. Run 
ode tools/build.mjs` then 
ode tools/audit.mjs` (must print "No problems found").

## 3. Upload
Upload the **contents** of the `site/` folder to `public_html/` (File Manager or FTP). Include hidden files:
`.htaccess` (root), `backend/.htaccess` and `backend/storage/.htaccess`.
Do not upload `tools/`, `_backup_original_assets/` or this documentation.

## 4. Email / SMTP configuration
**Already prepared:** `site/backend/.env` exists locally with the Titan settings (smtp.titan.email, 465/SSL, info@amazonselfpublishers.co).
It is uploaded with the rest of `site/`; keep it private (never email or commit it). The steps below are for changing it.
The site is configured for `https://amazonselfpublishers.co`; hosting needs PHP so that `backend/*.php` runs on that domain.
1. In `public_html/backend/`, copy `.env.example` to `.env` and fill in:
   - `MAIL_TO` the inbox that receives inquiries
   - `SMTP_HOST=smtp.hostinger.com`, `SMTP_PORT=465`, `SMTP_SECURE=ssl`
   - `SMTP_USER` / `MAIL_FROM` the full mailbox address; `SMTP_PASS` its password
   - `APP_SECRET` a random string (`php -r "echo bin2hex(random_bytes(32));"`)
2. Better: place `.env` one level **above** `public_html` (the code checks there too).
3. Never commit or share `.env`. `backend/.htaccess` blocks web access to it.

## 5. Domain and HTTPS
Point the domain to the hosting, enable the free SSL (hPanel > SSL), then confirm that `http://` redirects to `https://`
(`.htaccess` forces it). Set `ALLOWED_HOSTS` in `.env` if the form must also accept a second hostname.

## 6. Routing
The old landing path `/book-publishing-services` is permanently redirected (301) to `/publishing-services` by the `.htaccess` in this folder. After uploading, open `/book-publishing-services` and confirm it lands on `/publishing-services`; Google Search Console should be told about the new URL, and the ad's final URL must be the new one.

`.htaccess` serves `/book-formatting` from `book-formatting.html`, removes `.html` and trailing slashes,
and uses `404.html` for unknown URLs. If URLs 404 on refresh, check that `mod_rewrite` is enabled and `.htaccess` was uploaded.

## 7. Test after upload
1. Open every route in the checklist in `QA_REPORT.md`.
2. Submit the contact form and the popup form; confirm the email arrives at `MAIL_TO`.
3. Open `/amazon-publishing-services?utm_source=test&gclid=abc` and submit; the email should list the Utm_source and Gclid lines.
4. Visit `/backend/.env` and `/backend/lib.php`; both must return 403/404.
5. Submit sitemap.xml in Google Search Console.

## 8. Troubleshooting
| Symptom | Fix |
| --- | --- |
| Form: "session expired" | `/backend/token.php` unreachable; check PHP version and upload |
| Form: "could not send" | Wrong SMTP values; check `error_log` in hPanel; port 465 needs `SMTP_SECURE=ssl`, 587 needs `tls` |
| Email lands in spam | Use a mailbox on your own domain as `MAIL_FROM` and add SPF/DKIM in hPanel |
| Old look after an update | CSS/JS links carry a version tag that changes on every build; if a page still looks old, purge the Hostinger cache (hPanel > Cache Manager) and hard-refresh. Brand images are renamed (-v3) when the logo changes |

## 9. Future updates
Edit files under `tools/data/`, rebuild, audit, then re-upload the changed files in `site/`. Keep `.env` on the server.

