/* ──────────────────────────────────────────────────────────────────────────
   Trinity 2018 — scroll-scatter photo stage

   A tall track with a sticky stage. Photos start as a fanned pile in the
   middle and scatter out to the perimeter as you scroll, while the centre
   copy fades up through the gap they leave. Once settled, they drift with
   the pointer.

   No dependencies - not GSAP, not Lenis. This renders the photos, so it must
   not be able to fail just because a CDN did. Interpolation is done in CSS
   from a single --p custom property; this file only has to keep --p honest.

   Exposes window.__trinityScatter.setPhotos(urls), called by app.js once the
   approved-photo feed resolves.
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ══════════════════════════ CONFIG ══════════════════════════ */

  var COPY = {
    heading: 'Everyone has one.',
    sub: "A corridor, a classroom, somebody's camera roll from 2018. Add yours and it goes up here with the rest.",
    cta: 'Add your photos',
    ctaHref: '#register',
    note: 'Free, and it takes about a minute.'
  };

  /* Eight resting places around the edge, leaving the middle clear for the
     copy. x in vw, y in svh, rotation in deg, scale unitless.
     mx/my/mr are the phone layout: two bands, top and bottom, so nothing
     ever lands on top of the text. */
  /* Eight resting places, laid out so nothing can ever land on the copy.

     Desktop: the copy column is 26rem wide and roughly 300px tall, which on a
     1024px screen is half the viewport. Every slot therefore sits at |dx| >= 31vw
     - clearing it vertically is impossible, because a card plus the copy is
     taller than the stage. Sides alternate so a small number of photos still
     spreads across both.

     Phone: two bands instead, top and bottom, each far enough out that a card
     plus its caption clears the copy block on a short screen. */
  var SLOTS = [
    { dx: -37, dy: -26, dr: -7, dsc: 1.00, mx: -24, my: -34, mr:  -8 },
    { dx:  36, dy: -28, dr:  8, dsc: 0.94, mx:  22, my: -30, mr:   7 },
    { dx: -31, dy:  -4, dr:  4, dsc: 1.03, mx:  -6, my: -27, mr:  -4 },
    { dx:  43, dy:  -6, dr: -4, dsc: 0.92, mx:  26, my:  29, mr:   6 },
    { dx: -40, dy:  17, dr: -5, dsc: 0.97, mx: -22, my:  33, mr:  -7 },
    { dx:  32, dy:  14, dr:  6, dsc: 1.02, mx:   8, my:  30, mr:   5 },
    { dx: -33, dy:  27, dr:  5, dsc: 0.95, mx: -28, my: -31, mr:   4 },
    { dx:  38, dy:  28, dr: -8, dsc: 1.00, mx:  28, my:  35, mr:  -6 }
  ];

  var MAX_CARDS   = 8;
  var SETTLED_AT  = 0.985;   // beyond this the pointer drift switches on
  var DRIFT_PX    = 26;      // how far a card can wander with the pointer
  var SCATTER_END = 0.86;    // cards have fully scattered by this progress

  /* ══════════════════════════ SETUP ══════════════════════════ */

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  var section, track, stage, cardsBox;
  var cards = [];
  var pendingUrls = null;
  var rafId = null;
  var target = 0, cur = 0;
  var mouseX = 0, mouseY = 0;      // smoothed
  var targetMouseX = 0, targetMouseY = 0;
  var started = false;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function buildCards(items) {
    cardsBox.textContent = '';
    cards = [];

    var n = Math.min(items.length, MAX_CARDS);

    for (var i = 0; i < n; i++) {
      // Spread across the eight slots rather than filling 1,2,3 and leaving
      // one corner crowded when there are only a few photos.
      var slot = SLOTS[Math.floor(i * (SLOTS.length / n)) % SLOTS.length];

      var card = document.createElement('figure');
      card.className = 'scatter__card';

      // Start: a loose fanned pile, near enough dead centre
      var sx = (i - (n - 1) / 2) * 1.6;
      var sy = (i % 2 ? 1 : -1) * (0.6 + i * 0.3);
      var sr = (i - (n - 1) / 2) * 5.5;

      card.style.setProperty('--sx', sx.toFixed(2) + 'vw');
      card.style.setProperty('--sy', sy.toFixed(2) + 'svh');
      card.style.setProperty('--sr', sr.toFixed(2) + 'deg');
      card.style.setProperty('--dx', slot.dx + 'vw');
      card.style.setProperty('--dy', slot.dy + 'svh');
      card.style.setProperty('--dr', slot.dr + 'deg');
      card.style.setProperty('--dsc', slot.dsc);
      card.style.setProperty('--mx', slot.mx + 'vw');
      card.style.setProperty('--my', slot.my + 'svh');
      card.style.setProperty('--mr', slot.mr + 'deg');
      card.style.zIndex = String(10 + i);

      var item = items[i];

      var img = document.createElement('img');
      img.src = item.url;
      img.alt = item.caption ? String(item.caption) : 'A photo from 2018';
      img.decoding = 'async';
      // Blob URLs are already in memory: lazy buys nothing and costs loads
      img.loading = 'eager';
      card.appendChild(img);

      var cap = document.createElement('figcaption');
      cap.className = 'scatter__card-name';
      // textContent: other people wrote this
      cap.textContent = item.name || '';
      card.appendChild(cap);

      cardsBox.appendChild(card);
      cards.push({ el: card, phase: Math.random() * Math.PI * 2 });
    }

    section.hidden = false;
  }

  function applyDrift() {
    if (!finePointer || reduced) return;

    // Ease toward the pointer, so switching drift on at the settle point
    // glides in instead of snapping
    mouseX += (targetMouseX - mouseX) * 0.07;
    mouseY += (targetMouseY - mouseY) * 0.07;

    var settled = cur > SETTLED_AT ? 1 : 0;
    for (var i = 0; i < cards.length; i++) {
      var depth = 0.4 + (i % 4) * 0.22;   // parallax: not every card moves alike
      cards[i].el.style.setProperty('--px', (mouseX * DRIFT_PX * depth * settled).toFixed(2) + 'px');
      cards[i].el.style.setProperty('--py', (mouseY * DRIFT_PX * depth * settled).toFixed(2) + 'px');
    }
  }

  function measure() {
    var rect = track.getBoundingClientRect();
    var scrollable = rect.height - window.innerHeight;
    if (scrollable <= 0) return 1;
    return clamp01(-rect.top / scrollable);
  }

  function frame() {
    rafId = requestAnimationFrame(frame);

    target = measure();
    cur += (target - cur) * 0.12;
    if (Math.abs(target - cur) < 0.0005) cur = target;

    var p = easeOutCubic(clamp01(cur / SCATTER_END));
    stage.style.setProperty('--p', p.toFixed(4));

    // Centre copy arrives through the gap the photos leave behind
    var copyIn = clamp01((cur - 0.30) / 0.35);
    stage.style.setProperty('--copy', copyIn.toFixed(4));
    stage.classList.toggle('copy-in', copyIn > 0.15);

    // Scroll cue goes almost immediately

    applyDrift();
  }

  function start() {
    if (started) return;
    started = true;

    if (reduced) {
      // Everything at rest, nothing animating, no dead scroll to wade through
      stage.style.setProperty('--p', '1');
      stage.style.setProperty('--copy', '1');
      stage.classList.add('copy-in');
      section.classList.add('is-static');
      return;
    }

    frame();

    if (finePointer) {
      window.addEventListener('mousemove', function (e) {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
      }, { passive: true });
    }

    // Stop burning frames when the stage is nowhere near the viewport
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (rafId === null) frame();
          } else if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      }, { rootMargin: '200px' }).observe(track);
    }
  }

  /* ══════════════════════════ PUBLIC ══════════════════════════ */

  window.__trinityScatter = {
    setPhotos: function (items) {
      if (!items || !items.length) return;
      if (!section) { pendingUrls = items; return; }
      buildCards(items);
      start();
    }
  };

  function init() {
    section  = document.getElementById('scatter');
    track    = document.getElementById('scatter-track');
    stage    = document.getElementById('scatter-stage');
    cardsBox = document.getElementById('scatter-cards');

    if (!section || !track || !stage || !cardsBox) return;

    // Copy lives in CONFIG so it can be changed without digging through markup
    var set = function (id, text) {
      var el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    set('scatter-heading', COPY.heading);
    set('scatter-sub', COPY.sub);
    set('scatter-note', COPY.note);

    var cta = document.getElementById('scatter-cta');
    if (cta) {
      cta.textContent = COPY.cta;
      cta.setAttribute('href', COPY.ctaHref);
    }

    if (pendingUrls) {
      buildCards(pendingUrls);
      pendingUrls = null;
      start();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
