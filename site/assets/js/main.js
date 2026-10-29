/* amazonselfpublishers: vanilla JS (nav, dialogs, forms, filters). No dependencies. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mqMobile = window.matchMedia('(max-width:980px)');

  /* ---------- footer year ---------- */
  $$('#yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* ---------- desktop mega menu ---------- */
  var mt = $('.mega-toggle'), mega = $('#mega-services'), closeT, pinned = false;
  function megaOpen(o) {
    if (!mt || !mega) return;
    mt.setAttribute('aria-expanded', o ? 'true' : 'false');
    if (o) mega.removeAttribute('hidden'); else mega.setAttribute('hidden', '');
  }
  if (mt && mega) {
    var li = mt.parentElement;
    mt.addEventListener('click', function () {
      var open = mt.getAttribute('aria-expanded') === 'true';
      if (open && pinned) { pinned = false; megaOpen(false); } else { pinned = true; megaOpen(true); } // hover opens it; a click pins it
    });
    li.addEventListener('mouseenter', function () { if (!mqMobile.matches) { clearTimeout(closeT); megaOpen(true); } });
    li.addEventListener('mouseleave', function () { if (!mqMobile.matches && !pinned) { closeT = setTimeout(function () { megaOpen(false); }, 180); } });
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) { pinned = false; megaOpen(false); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mt.getAttribute('aria-expanded') === 'true') { pinned = false; megaOpen(false); mt.focus(); } });
    document.addEventListener('click', function (e) { if (!li.contains(e.target)) { pinned = false; megaOpen(false); } });
  }

  /* ---------- mobile nav ---------- */
  var burger = $('.burger'), mnav = $('#mobile-nav');
  function mobileOpen(o) {
    if (!burger || !mnav) return;
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    if (o) mnav.removeAttribute('hidden'); else mnav.setAttribute('hidden', '');
    document.body.style.overflow = o ? 'hidden' : '';
  }
  if (burger) {
    burger.addEventListener('click', function () { mobileOpen(burger.getAttribute('aria-expanded') !== 'true'); });
    $$('.m-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        var sub = document.getElementById(b.getAttribute('aria-controls')), open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', open); if (open) sub.removeAttribute('hidden'); else sub.setAttribute('hidden', '');
      });
    });
    $$('#mobile-nav a').forEach(function (a) { a.addEventListener('click', function () { mobileOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') mobileOpen(false); });
    mqMobile.addEventListener('change', function (e) { if (!e.matches) mobileOpen(false); });
  }

  /* ---------- campaign attribution (UTM / click IDs) ---------- */
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'];
  var attr = {};
  try { attr = JSON.parse(sessionStorage.getItem('asp_attr') || '{}'); } catch (e) { attr = {}; }
  var qs = new URLSearchParams(location.search), fresh = false;
  KEYS.forEach(function (k) { var v = qs.get(k); if (v) { attr[k] = v.slice(0, 200); fresh = true; } });
  if (!attr.referrer && document.referrer && document.referrer.indexOf(location.host) === -1) { attr.referrer = document.referrer.slice(0, 300); fresh = true; }
  if (fresh) { try { sessionStorage.setItem('asp_attr', JSON.stringify(attr)); } catch (e) { /* storage unavailable */ } }

  /* ---------- CSRF / timing token ---------- */
  var tokenP = null;
  // After any response, fetch a fresh token right away so a quick resubmit or a second form is not rejected by the 3-second timing check.
  function refreshToken() { tokenP = null; getToken().catch(function () { tokenP = null; }); }
  function getToken() {
    if (!tokenP) tokenP = fetch(window.SITE.tokenEndpoint, { credentials: 'same-origin', cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('token'); return r.json(); });
    return tokenP;
  }

  /* ---------- forms ---------- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setErr(field, msg) {
    var f = field.closest('.field'); if (!f) return;
    var old = f.querySelector('.err'); if (old) old.remove();
    field.removeAttribute('aria-invalid'); field.removeAttribute('aria-describedby'); f.classList.remove('invalid');
    if (msg) {
      var p = document.createElement('p'); p.className = 'err'; p.id = (field.id || field.name) + '-err'; p.textContent = msg;
      f.appendChild(p); field.setAttribute('aria-invalid', 'true'); field.setAttribute('aria-describedby', p.id); f.classList.add('invalid');
    }
  }
  function validate(form) {
    var first = null, ok = true;
    function bad(el, m) { setErr(el, m); ok = false; if (!first) first = el; }
    var n = form.elements.name, em = form.elements.email, sv = form.elements.service, ms = form.elements.message, cs = form.elements.consent, ph = form.elements.phone;
    [n, em, sv, ms, cs, ph].forEach(function (el) { if (el) setErr(el, ''); });
    if (!n.value.trim() || n.value.trim().length < 2) bad(n, 'Please enter your full name.');
    if (!em.value.trim()) bad(em, 'Please enter your email address.'); else if (!EMAIL.test(em.value.trim())) bad(em, 'Please enter a valid email address.');
    // Required: name, email, phone and the (unticked-by-default) privacy/terms acknowledgement. Service and project details are optional.
    if (cs && !cs.checked) bad(cs, 'Please tick the box to continue.');
    var digits = ph ? ph.value.replace(/\D/g, '').length : 0;
    if (ph) {
      if (!ph.value.trim()) bad(ph, 'Please enter your phone number.');
      else if (!/^[0-9+()\-.\s]{7,30}$/.test(ph.value.trim()) || digits < 7 || digits > 15) bad(ph, 'Please enter a valid phone number (7 to 15 digits).');
    }
    if (first) first.focus();
    return ok;
  }
  function fillHidden(form) {
    KEYS.concat(['referrer']).forEach(function (k) { if (form.elements[k] && attr[k]) form.elements[k].value = attr[k]; });
    if (form.elements.page_url) form.elements.page_url.value = location.pathname + (location.search ? '?' + location.search.slice(1, 200) : '');
  }
  $$('form.lead-form').forEach(function (form) {
    fillHidden(form);
    var status = $('.form-status', form), btn = $('button[type=submit]', form), label = $('.btn-label', form), orig = label.textContent;
    form.addEventListener('focusin', function () { getToken().then(function (t) { form.elements.csrf_token.value = t.token; form.elements.form_ts.value = t.ts; }).catch(function () {}); }, { once: true });
    $$('input,select,textarea', form).forEach(function (el) { el.addEventListener('input', function () { if (el.closest('.invalid')) setErr(el, ''); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (btn.disabled) return; // duplicate-submission guard
      status.className = 'form-status'; status.textContent = '';
      if (!validate(form)) return;
      btn.disabled = true; label.textContent = 'Sending…';
      fillHidden(form);
      getToken().then(function (t) {
        form.elements.csrf_token.value = t.token; form.elements.form_ts.value = t.ts;
        return fetch(form.action, { method: 'POST', body: new FormData(form), credentials: 'same-origin', headers: { 'Accept': 'application/json' } });
      }).then(function (r) { return r.json().catch(function () { return { ok: false, message: 'Unexpected server response.' }; }).then(function (j) { j.status = r.status; return j; }); })
        .then(function (j) {
          if (j.ok) {
            status.className = 'form-status ok'; status.textContent = j.message || 'Thank you. We have received your inquiry and will be in touch shortly.';
            form.reset(); fillHidden(form); refreshToken(); label.textContent = 'Sent'; setTimeout(function () { btn.disabled = false; label.textContent = orig; }, 6000);
          } else {
            if (j.errors) Object.keys(j.errors).forEach(function (k) { if (form.elements[k]) setErr(form.elements[k], j.errors[k]); });
            status.className = 'form-status bad'; status.textContent = j.message || 'Sorry, something went wrong. Please try again or call ' + window.SITE.phone + '.';
            refreshToken(); btn.disabled = false; label.textContent = orig;
          }
        })
        .catch(function () {
          status.className = 'form-status bad'; status.textContent = 'We could not send your message. Please check your connection and try again, or call ' + window.SITE.phone + '.';
          refreshToken(); btn.disabled = false; label.textContent = orig;
        });
    });
  });

  if ($('form.lead-form').length) { getToken().catch(function () { tokenP = null; }); } // prefetch so the timing check passes for fast users

  /* ---------- quote dialog ---------- */
  var qd = $('#quote-dialog');
  function openQuote(service) {
    if (!qd) return;
    if (burger) mobileOpen(false);
    var sel = qd.querySelector('select[name=service]');
    if (sel && service) sel.value = service;
    var st = $('.form-status', qd); if (st) { st.textContent = ''; st.className = 'form-status'; }
    chatAside(true);
    if (typeof qd.showModal === 'function') qd.showModal(); else qd.setAttribute('open', '');
    var first = qd.querySelector('input[name=name]'); if (first) setTimeout(function () { first.focus(); }, 30);
  }
  // The chat widget floats above everything, so tuck it away while the popup is open (it would sit on top of the form's disclosure text), then restore it.
  var chatWas = null;
  function chatAside(hide) {
    var w = window.LiveChatWidget; if (!w) return;
    try {
      if (hide) { chatWas = (w.get('state') || {}).visibility || 'minimized'; w.call('hide'); }
      else if (chatWas) { w.call(chatWas === 'maximized' ? 'maximize' : 'minimize'); chatWas = null; }
    } catch (e) { /* widget not ready: nothing to adjust */ }
  }
  if (qd) qd.addEventListener('close', function () { chatAside(false); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-quote]');
    if (t) { e.preventDefault(); openQuote(t.getAttribute('data-quote') || ''); }
  });
  $$('dialog').forEach(function (d) {
    // every close path (X button, backdrop click, Escape, close event) restores the chat bubble; chatAside(false) is idempotent
    function closeIt() { d.close(); if (d === qd) chatAside(false); }
    d.addEventListener('click', function (e) { if (e.target === d) closeIt(); });
    d.addEventListener('cancel', function () { if (d === qd) setTimeout(function () { chatAside(false); }, 0); });
    $$('[data-close]', d).forEach(function (b) { b.addEventListener('click', closeIt); });
  });

  /* ---------- portfolio ---------- */
  var bd = $('#book-dialog');
  if (bd && window.BOOKS) {
    $$('[data-book]').forEach(function (b) {
      b.addEventListener('click', function () {
        var d = window.BOOKS[b.getAttribute('data-book')], id = b.getAttribute('data-book');
        $('#bd-title', bd).textContent = d.title; $('#bd-sub', bd).textContent = d.sub; $('#bd-author', bd).textContent = 'by ' + d.author;
        $('#bd-cat', bd).textContent = d.client ? 'Client project' : d.cat;
        $('#bd-author', bd).hidden = !d.author;
        // Honest labelling: only confirmed client projects get a project CTA; everything else is an illustrative cover.
        $('#bd-note', bd).textContent = d.client ? '' : 'Illustrative cover shown for design reference. Not our client work. The title and cover belong to the author and publisher.';
        $('#bd-cta', bd).hidden = !d.client;
        var art = $('.bd-art', bd); art.innerHTML = '';
        var img = new Image(); img.src = '/assets/img/books/' + id + '.jpg'; img.width = d.w; img.height = d.h; img.alt = d.alt; img.style.maxWidth = Math.round(d.w * 1.3) + 'px'; img.style.width = '100%'; img.style.height = 'auto';
        art.appendChild(img); bd.showModal();
      });
    });
  }
  if (location.hash && $(location.hash.replace(/[^#\w-]/g, ''))) { /* anchor handled by browser */ }

  /* ---------- filters (portfolio + blog) ---------- */
  var chips = $$('.chip[data-filter]');
  if (chips.length) {
    var cur = 'all', search = $('#blog-search');
    var items = $$('.pf-grid > li').concat($$('.post[data-cat]'));
    var none = $('#no-posts');
    var apply = function () {
      var q = search ? search.value.trim().toLowerCase() : '', shown = 0;
      items.forEach(function (it) {
        var ok = (cur === 'all' || it.getAttribute('data-cat') === cur) && (!q || (it.getAttribute('data-text') || '').indexOf(q) > -1);
        if (ok) { it.removeAttribute('hidden'); shown++; } else it.setAttribute('hidden', '');
      });
      if (none) none.hidden = shown > 0;
    };
    chips.forEach(function (c) { c.addEventListener('click', function () { cur = c.getAttribute('data-filter'); chips.forEach(function (x) { var on = x === c; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); apply(); }); });
    if (search) search.addEventListener('input', apply);
  }

  /* ---------- reveal on scroll ---------- */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('.sec-head,.steps li,.dgrid li,.drows li,.post,.rel li,.idx-group,.ed-card,.strip-grid>div').forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.top < window.innerHeight) return; el.classList.add('rv'); io.observe(el);
    });
  }
})();

/* ---------- keep the footer's legal links clear of the open LiveChat window ---------- */
(function () {
  'use strict';
  var root = document.documentElement;
  function set(v) { root.classList.toggle('chat-open', v === 'maximized'); }
  if (!window.LiveChatWidget) return;
  try {
    window.LiveChatWidget.on('visibility_changed', function (d) { set(d && d.visibility); });
    window.LiveChatWidget.on('ready', function () { try { set(window.LiveChatWidget.get('state').visibility); } catch (e) { /* ignore */ } });
  } catch (e) { /* widget API unavailable: nothing to adjust */ }
})();
