/* ──────────────────────────────────────────────────────────────────────────
   Trinity 2018 — motion layer
   Lenis smooth scroll + GSAP/ScrollTrigger reveals + the 3D corridor gate.

   Strictly decorative. Knows nothing about the form and shares no state with
   app.js. If GSAP never arrives this file bails immediately and the page
   renders as plain, fully visible HTML — the signup still works.
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Bail-out guard ─────────────────────────────────────────────────── */
  if (!window.gsap || !window.ScrollTrigger) {
    showCorridorFallback();
    return;
  }

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  var ScrollTrigger = window.ScrollTrigger;

  /* Only now is it safe to let CSS hide things for reveal */
  html.classList.add('motion-on');

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ════════════════════════ Public API for app.js ════════════════════════
     One-way only: app.js may ask for a count-up. Nothing flows back. */
  window.__trinityMotion = {
    countUp: function (el, target) {
      if (!el || reduced) return false;
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: Math.min(2.2, 0.6 + target * 0.035),
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: function () { el.textContent = String(Math.round(obj.v)); },
        onComplete: function () { el.textContent = String(target); }
      });
      return true;
    }
  };

  /* ════════════════════════════ Loader ════════════════════════════ */

  function runLoader() {
    var loader = $('#loader');
    if (!loader) return Promise.resolve();
    var bar = $('i', loader);

    return new Promise(function (resolve) {
      var pct = 0;
      var step = function () {
        pct = Math.min(100, pct + 18 + Math.random() * 22);
        if (bar) bar.style.width = pct + '%';
        if (pct < 100) {
          setTimeout(step, 110);
        } else {
          setTimeout(function () {
            loader.classList.add('is-done');
            setTimeout(resolve, 480);
          }, 180);
        }
      };
      setTimeout(step, 90);
    });
  }

  /* ════════════════════════ Lenis smooth scroll ════════════════════════ */

  function initLenis() {
    if (reduced || !window.Lenis) return null;

    var lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      syncTouch: false // native momentum feels better than emulated on phones
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // Keep anchor links working under smooth scroll
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: 0, duration: 1.3 });
      });
    });

    return lenis;
  }

  /* ════════════════════════ Word splitting ════════════════════════
     Walks text nodes so <strong> and <em> inside the copy survive intact. */

  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(function (node) {
      if (!node.textContent.trim()) return;
      var frag = document.createDocumentFragment();

      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (part === '') return;
        if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
        var wrap = document.createElement('span');
        wrap.className = 'word-wrap';
        var word = document.createElement('span');
        word.className = 'word';
        word.textContent = part;
        wrap.appendChild(word);
        frag.appendChild(wrap);
      });

      node.parentNode.replaceChild(frag, node);
    });

    return $$('.word', el);
  }

  /* ════════════════════════ Reveals ════════════════════════ */

  function initReveals() {
    // Simple fade-ups. Hero elements are excluded — initHero runs them on a
    // timeline after the loader, and two animations on one element would let
    // the hero appear before the loader has finished clearing.
    $$('[data-reveal]').filter(function (el) {
      return !el.closest('.hero');
    }).forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // Line-by-line copy reveals
    $$('[data-split]').forEach(function (el) {
      var words = splitWords(el);
      gsap.to(words, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.012,
        scrollTrigger: { trigger: el, start: 'top 82%', once: true }
      });
    });
  }

  function initHero() {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero .eyebrow', { opacity: 1, y: 0, duration: 0.8 })
      .to('.hero__title .line', { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 }, '-=0.45')
      .to('.hero__sub', { opacity: 1, y: 0, duration: 0.9 }, '-=0.6')
      .to('.hero__actions', { opacity: 1, y: 0, duration: 0.9 }, '-=0.65');

    if (reduced) return;

    // Depth: ghost year drifts slower than the page
    gsap.to('.hero__ghost', {
      yPercent: 22,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__inner', {
      yPercent: 11,
      opacity: 0.25,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  function initMagnetic() {
    if (reduced || window.matchMedia('(hover: none)').matches) return;

    $$('[data-magnetic]').forEach(function (el) {
      var strength = 0.22;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - (r.left + r.width / 2)) * strength,
          y: (e.clientY - (r.top + r.height / 2)) * strength,
          duration: 0.5,
          ease: 'power3.out'
        });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ════════════════════════ The 3D corridor ════════════════════════ */

  function showCorridorFallback() {
    var fb = document.getElementById('corridor-fallback');
    if (fb) fb.classList.add('is-live');
  }

  /* Can this device afford WebGL without hurting the thing that matters?
     Signups are the point — a janky hero costs more than a missing one. */
  function canAfford3D() {
    if (reduced) return false;

    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      if (conn.saveData) return false;
      if (/(^|-)2g$/.test(conn.effectiveType || '')) return false;
    }

    if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency < 4) return false;
    if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4) return false;

    try {
      var c = document.createElement('canvas');
      var gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return false;
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    } catch (e) {
      return false;
    }

    return true;
  }

  function initCorridor() {
    var section = $('#corridor');
    var canvas = $('#corridor-canvas');
    if (!section || !canvas) return;

    if (!canAfford3D()) { showCorridorFallback(); return; }

    var scene = null;

    // Only fetch Three.js when the section is genuinely close to the viewport
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom+=50%',
      once: true,
      onEnter: function () {
        import('./scene.js')
          .then(function (mod) { return mod.createCorridor(canvas); })
          .then(function (instance) {
            if (!instance) { showCorridorFallback(); return; }
            scene = instance;
            canvas.classList.add('is-live');

            ScrollTrigger.create({
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              onUpdate: function (self) { scene.setProgress(self.progress); }
            });
            ScrollTrigger.refresh();
          })
          .catch(function () {
            // Three.js unavailable or threw — fall back silently, lose nothing
            showCorridorFallback();
          });
      }
    });

    // Stop rendering when the section is off screen; no point burning battery
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: function (self) { if (scene) scene.setActive(self.isActive); }
    });
  }

  /* ════════════════════════════ Boot ════════════════════════════ */

  function boot() {
    initLenis();
    initReveals();
    initCorridor();
    initMagnetic();

    runLoader().then(initHero);

    // Fonts land after first paint and change text height; re-measure triggers
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
