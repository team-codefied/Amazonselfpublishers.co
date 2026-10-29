// Inquiry endpoint (port of site/backend/contact.php): validates server-side, then delivers by SMTP.
// Reports success only if SMTP accepted the message.
'use strict';
const { env, jsonOut, checkToken, rateLimited, sameOrigin, cleanLine, cleanText, sendMail } = require('./_lib');
const services = Object.assign({}, require('./_services.json'), { 'not-sure': 'Not sure yet' });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return jsonOut(res, 405, { ok: false, message: 'Method not allowed.' });
  if (!sameOrigin(req)) return jsonOut(res, 403, { ok: false, message: 'Request origin not allowed.' });
  const b = req.body && typeof req.body === 'object' ? req.body : {};

  // Honeypot: pretend success so bots learn nothing.
  if (b.website) return jsonOut(res, 200, { ok: true, message: 'Thank you. We will be in touch shortly.' });

  const ts = parseInt(b.form_ts, 10) || 0;
  let valid = false;
  try { valid = checkToken(req, String(b.csrf_token || ''), ts); } catch (e) { console.error('[amazonselfpublishers] config failure:', e.message); return jsonOut(res, 500, { ok: false, message: 'We could not send your message right now. Please call us on ' + env('PHONE_DISPLAY', '+1 323 509 3062') + '.' }); }
  if (!valid) return jsonOut(res, 400, { ok: false, message: 'Your session expired. Please refresh the page and try again.' });
  const age = Math.floor(Date.now() / 1000) - ts;
  if (age < 3) return jsonOut(res, 429, { ok: false, message: 'That was very fast. Please check your details and try again.' });
  if (age > 7200) return jsonOut(res, 400, { ok: false, message: 'Your session expired. Please refresh the page and try again.' });

  if (rateLimited(req, Math.max(1, parseInt(env('RATE_LIMIT_MAX', '5'), 10) || 5), 3600)) return jsonOut(res, 429, { ok: false, message: 'Too many requests. Please try again later or call us.' });

  const name = cleanLine(b.name, 100), email = cleanLine(b.email, 150), phone = cleanLine(b.phone, 30);
  const service = cleanLine(b.service, 80), title = cleanLine(b.book_title, 150), status = cleanLine(b.manuscript_status, 60);
  const msg = cleanText(b.message), source = cleanLine(b.form_source, 60);

  const errors = {};
  if (name.length < 2) errors.name = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';
  const digits = phone.replace(/\D/g, '').length;
  if (phone === '') errors.phone = 'Please enter your phone number.';
  else if (!/^[0-9+()\-.\s]{7,30}$/.test(phone) || digits < 7 || digits > 15) errors.phone = 'Please enter a valid phone number (7 to 15 digits).';
  if (service !== '' && !Object.prototype.hasOwnProperty.call(services, service)) errors.service = 'Please choose a valid service.';
  // The privacy/terms acknowledgement must be ticked by the visitor (the box is unticked by default).
  if (b.consent !== 'yes') errors.consent = 'Please tick the box to continue.';
  if (Object.keys(errors).length) return jsonOut(res, 422, { ok: false, message: 'Please correct the highlighted fields.', errors });

  const lines = [
    'New website inquiry', '-'.repeat(40),
    'Name: ' + name, 'Email: ' + email, 'Phone: ' + (phone || '-'),
    'Service: ' + (service !== '' ? services[service] : 'Not specified'), 'Book title: ' + (title || '-'), 'Manuscript status: ' + (status || '-'),
    '', 'Message:', msg || '-', '', '-'.repeat(40),
    'Privacy and terms acknowledged: ticked', 'Form: ' + source, 'Page: ' + cleanLine(b.page_url, 300),
  ];
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'referrer']) {
    const v = cleanLine(b[k], 300);
    if (v) lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ': ' + v);
  }
  lines.push('Received: ' + new Date().toISOString());

  try {
    await sendMail({ to: env('MAIL_TO'), subject: 'New inquiry: ' + (service !== '' ? services[service] : 'Not specified') + ' (' + name + ')', text: lines.join('\n'), replyTo: email, replyName: name });
  } catch (e) {
    console.error('[amazonselfpublishers] mail failure:', e.message); // no personal data is logged
    return jsonOut(res, 502, { ok: false, message: 'We could not send your message right now. Please call us on ' + env('PHONE_DISPLAY', '+1 323 509 3062') + '.' });
  }
  return jsonOut(res, 200, { ok: true, message: 'Thank you. We have received your inquiry and will be in touch shortly.' });
};
