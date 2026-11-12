/* ──────────────────────────────────────────────────────────────────────────
   Trinity 2018 — motion layer
   Lenis smooth scroll + GSAP/ScrollTrigger reveals.

   Strictly decorative. Knows nothing about the form and shares no state with
   app.js. If GSAP never arrives this file bails immediately and the page
   renders as plain, fully visible HTML — the signup still works.
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Bail-out guard ─────────────────────────────────────────────────── */
  if (!window.gsap || !window.ScrollTrigger) return;

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
    /* The photograph has its own authored moment - it resolves out of blur as
       it decodes. The words follow it in; nothing else in the hero animates,
       and there is no scroll parallax. One moment, not a pile of effects. */
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to('.hero__title',   { opacity: 1, y: 0, duration: 1.0 })
      .to('.hero__sub',     { opacity: 1, y: 0, duration: 0.9 }, '-=0.62')
      .to('.hero__actions', { opacity: 1, y: 0, duration: 0.9 }, '-=0.66');
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

  /* ════════════════════════════ Boot ════════════════════════════ */

  function boot() {
    initLenis();
    initReveals();
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
