'use strict';
const { jsonOut, makeToken } = require('./_lib');

module.exports = (req, res) => {
  if (req.method !== 'GET') return jsonOut(res, 405, { ok: false });
  try { return jsonOut(res, 200, makeToken(req)); } catch (e) { console.error('[amazonselfpublishers] token failure:', e.message); return jsonOut(res, 500, { ok: false }); }
};
