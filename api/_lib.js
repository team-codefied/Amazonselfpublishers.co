// Shared helpers for the Vercel endpoints (port of site/backend/lib.php). Files starting with "_" are not routes.
'use strict';
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const env = (k, d = '') => (process.env[k] !== undefined && process.env[k] !== '' ? process.env[k].trim() : d);

function jsonOut(res, code, data) {
  res.status(code);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.send(JSON.stringify(data));
}

function clientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || (req.socket && req.socket.remoteAddress) || '0.0.0.0';
}

function secret() {
  const s = env('APP_SECRET');
  if (!s) throw new Error('APP_SECRET is not set');
  return s;
}

const sign = (ts, ip) => crypto.createHmac('sha256', secret()).update(ts + '|' + ip).digest('hex');
const makeToken = (req) => { const ts = Math.floor(Date.now() / 1000); return { token: sign(ts, clientIp(req)), ts }; };
function checkToken(req, token, ts) {
  if (!(ts > 0) || !token) return false;
  const a = Buffer.from(sign(ts, clientIp(req))), b = Buffer.from(String(token));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Best-effort limiter: memory is per serverless instance, so it slows bursts but is not a hard global cap.
const hitsByIp = new Map();
function rateLimited(req, max, windowSec) {
  const ip = clientIp(req), now = Date.now() / 1000;
  const hits = (hitsByIp.get(ip) || []).filter((t) => t > now - windowSec);
  if (hits.length >= max) { hitsByIp.set(ip, hits); return true; }
  hits.push(now); hitsByIp.set(ip, hits);
  return false;
}

function sameOrigin(req) {
  const host = String(req.headers.host || '').toLowerCase();
  const allowed = env('ALLOWED_HOSTS').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
  allowed.push(host);
  for (const h of ['origin', 'referer']) {
    if (req.headers[h]) {
      try { return allowed.includes(new URL(String(req.headers[h])).host.toLowerCase()); } catch (e) { return false; }
    }
  }
  return false; // browsers send Origin/Referer on form POSTs; reject if neither is present
}

const cleanLine = (s, max = 200) => String(s == null ? '' : s).replace(/[\x00-\x1F\x7F]+/g, ' ').trim().slice(0, max);
const cleanText = (s, max = 3000) => String(s == null ? '' : s).replace(/\r\n/g, '\n').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, max);

async function sendMail({ to, subject, text, replyTo, replyName }) {
  const host = env('SMTP_HOST'), port = parseInt(env('SMTP_PORT', '587'), 10), secure = env('SMTP_SECURE', 'tls').toLowerCase();
  const user = env('SMTP_USER'), pass = env('SMTP_PASS');
  const from = env('MAIL_FROM', user), fromName = env('MAIL_FROM_NAME', 'amazonselfpublishers website');
  if (!host || !from || !to) throw new Error('SMTP not configured');
  const transport = nodemailer.createTransport({
    host, port, secure: secure === 'ssl', requireTLS: secure === 'tls', ignoreTLS: secure === 'none',
    auth: user ? { user, pass } : undefined,
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
  });
  await transport.sendMail({ from: { name: fromName, address: from }, to, replyTo: { name: replyName, address: replyTo }, subject, text });
}

module.exports = { env, jsonOut, makeToken, checkToken, rateLimited, sameOrigin, cleanLine, cleanText, sendMail };
