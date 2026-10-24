/* ──────────────────────────────────────────────────────────────────────────
   Trinity 2018 — data layer
   Registration + signup counter.

   Deliberately has NO dependencies and NO imports. Not GSAP, not Lenis,
   not Three.js, not even supabase-js — just fetch(). The entire point of
   this site is collecting signups, so the form must keep working if every
   CDN on the internet goes down. Animation lives in motion.js and cannot
   reach anything in here.
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────────────────────
     This key is a PUBLIC key and is meant to be visible here. Security is
     enforced in the database, not by hiding it: the anon role can INSERT
     five columns into signups and nothing else — no SELECT, so nobody can
     read the list, and no UPDATE/DELETE. Verified by live test, 24 Oct 2026.
     ──────────────────────────────────────────────────────────────────────── */
  var SUPABASE_URL = 'https://zucshjzqydbyceayoxnz.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_unIvM1GJ839lZyWM9g1kqA_R0ny4NrM';

  /* Break-even headcount. Stays null until the venue cost is known.
     null  → "47 signed up"
     60    → "47 of the 60 we need for this to happen" + progress bar  */
  var SIGNUP_TARGET = null;

  var SHARE_URL  = 'https://trinity-2018.netlify.app/';
  var SHARE_TEXT = "Trinity School Bexley, Year 11, Class of 2018 — someone's actually organising the reunion. It's free to sign up:";

  var REST = SUPABASE_URL + '/rest/v1';
  var HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json'
  };

  var $ = function (id) { return document.getElementById(id); };

  /* ── fetch with timeout + one retry ─────────────────────────────────── */
  function request(path, options, timeoutMs) {
    options = options || {};
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs || 12000);

    return fetch(REST + path, {
      method: options.method || 'GET',
      headers: Object.assign({}, HEADERS, options.headers || {}),
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    }).then(function (res) {
      clearTimeout(timer);
      return res;
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  function requestWithRetry(path, options) {
    return request(path, options).catch(function () {
      // One quiet retry — mobile data drops a request far more often than a server fails
      return new Promise(function (resolve) { setTimeout(resolve, 1200); })
        .then(function () { return request(path, options); });
    });
  }

  /* ════════════════════════════ COUNTER ════════════════════════════ */

  function renderCount(n) {
    var valueEl = $('counter-value');
    var numberEl = $('counter-number');
    if (!valueEl || !numberEl) return;

    numberEl.setAttribute('data-count', String(n));

    if (SIGNUP_TARGET && SIGNUP_TARGET > 0) {
      var pct = Math.min(100, Math.round((n / SIGNUP_TARGET) * 100));
      var progress = $('counter-progress');
      var fill = $('counter-fill');
      var goal = $('counter-goal');
      var hint = $('counter-hint');

      if (progress) progress.hidden = false;
      if (fill) fill.style.width = pct + '%';
      if (goal) goal.textContent = 'of the ' + SIGNUP_TARGET + ' we need for this to happen';
      if (hint && n < SIGNUP_TARGET) {
        hint.textContent = (SIGNUP_TARGET - n) + ' more and it happens.';
      } else if (hint) {
        hint.textContent = "We've hit the number. This is happening.";
      }
    }

    /* Hand off to motion.js for the count-up, if it loaded. If it didn't,
       show the real number immediately — never leave a dash on screen. */
    var animated = false;
    try {
      animated = !!window.__trinityMotion && window.__trinityMotion.countUp(valueEl, n);
    } catch (e) { /* motion is optional; ignore entirely */ }

    if (!animated) valueEl.textContent = String(n);
  }

  function loadCount() {
    return requestWithRetry('/rpc/signup_count', { method: 'POST', body: {} })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (n) {
        if (typeof n === 'number') renderCount(n);
        else hideCounter();
      })
      .catch(hideCounter);
  }

  function hideCounter() {
    // Better to show nothing than a broken zero that undersells the thing
    var section = $('counter');
    if (section) section.setAttribute('data-unavailable', 'true');
  }

  /* ════════════════════════════ FORM ════════════════════════════ */

  var form = $('signup-form');
  var submitBtn = $('submit-btn');
  var statusEl = $('form-status');
  var submitting = false;

  var FIELDS = ['first_name', 'last_name', 'email', 'confirmed_year_group'];

  function setError(name, message) {
    var el = document.querySelector('[data-error-for="' + name + '"]');
    var input = $(name);
    if (el) el.textContent = message || '';
    if (input) {
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        input.closest('.field').classList.add('is-invalid');
      } else {
        input.removeAttribute('aria-invalid');
        input.closest('.field').classList.remove('is-invalid');
      }
    }
  }

  function clearErrors() {
    FIELDS.concat(['memory']).forEach(function (n) { setError(n, ''); });
    setStatus('', '');
  }

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.className = 'form__status' + (kind ? ' is-' + kind : '');
  }

  function validEmail(value) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
  }

  function validate(data) {
    var ok = true;

    if (!data.first_name) { setError('first_name', 'What should I call you?'); ok = false; }
    if (!data.last_name)  { setError('last_name', 'Last name too, so I know which one you are.'); ok = false; }

    if (!data.email) {
      setError('email', 'I need an email to tell you the date.');
      ok = false;
    } else if (!validEmail(data.email)) {
      setError('email', "That doesn't look like an email address.");
      ok = false;
    }

    if (!data.confirmed_year_group) {
      setError('confirmed_year_group', 'This one is strictly for our year — tick to confirm.');
      ok = false;
    }

    if (data.memory && data.memory.length > 1000) {
      setError('memory', 'A bit long — keep it under 1000 characters.');
      ok = false;
    }

    return ok;
  }

  function setLoading(on) {
    submitting = on;
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.classList.toggle('is-loading', on);
    var label = submitBtn.querySelector('.btn__label');
    if (label) label.textContent = on ? 'Signing you up...' : 'Count me in';
  }

  function showSuccess(firstName) {
    var success = $('success');
    var title = $('success-title');
    if (title && firstName) title.textContent = "You're in, " + firstName + '.';
    if (form) form.hidden = true;
    if (success) {
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    loadCount();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    clearErrors();

    // Honeypot — a bot filled a field no human can see. Pretend it worked.
    var hp = $('website');
    if (hp && hp.value.trim() !== '') { showSuccess(''); return; }

    var data = {
      first_name: ($('first_name').value || '').trim(),
      last_name: ($('last_name').value || '').trim(),
      email: ($('email').value || '').trim(),
      memory: ($('memory').value || '').trim(),
      confirmed_year_group: $('confirmed_year_group').checked
    };

    if (!validate(data)) {
      var firstInvalid = document.querySelector('.field.is-invalid input, .field.is-invalid textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (!data.memory) delete data.memory;

    setLoading(true);
    setStatus('', '');

    requestWithRetry('/signups', {
      method: 'POST',
      headers: { 'Prefer': 'return=minimal' },
      body: data
    })
      .then(function (res) {
        if (res.status === 201) { showSuccess(data.first_name); return; }

        return res.json().then(function (body) { return body; }, function () { return {}; })
          .then(function (body) {
            if (res.status === 409 || body.code === '23505') {
              // Already registered. Not an error worth alarming anyone about.
              setStatus("You're already on the list — nothing more to do. See you there.", 'ok');
              return;
            }
            if (body.code === '23514') {
              setError('email', "That email was rejected as invalid — mind checking it?");
              return;
            }
            setStatus("Something went wrong saving that. Try again in a moment, or message me directly.", 'error');
          });
      })
      .catch(function () {
        setStatus("Couldn't reach the server — check your connection and try once more.", 'error');
      })
      .finally(function () { setLoading(false); });
  }

  /* ════════════════════════════ SHARE ════════════════════════════ */

  function initShare() {
    var wa = $('share-whatsapp');
    if (wa) {
      wa.href = 'https://wa.me/?text=' + encodeURIComponent(SHARE_TEXT + ' ' + SHARE_URL);
      wa.target = '_blank';
    }

    var copy = $('share-copy');
    if (copy) {
      copy.addEventListener('click', function () {
        var done = function () {
          copy.textContent = 'Link copied';
          setTimeout(function () { copy.textContent = 'Copy link'; }, 2200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(SHARE_URL).then(done, done);
        } else {
          var tmp = document.createElement('input');
          tmp.value = SHARE_URL;
          document.body.appendChild(tmp);
          tmp.select();
          try { document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(tmp);
          done();
        }
      });
    }
  }

  /* ════════════════════════════ WIRE UP ════════════════════════════ */

  function init() {
    if (form) {
      form.addEventListener('submit', handleSubmit);

      // Clear a field's error as soon as the person starts fixing it
      FIELDS.forEach(function (name) {
        var el = $(name);
        if (!el) return;
        var evt = el.type === 'checkbox' ? 'change' : 'input';
        el.addEventListener(evt, function () { setError(name, ''); });
      });
    }

    var memory = $('memory');
    var memoryCount = $('memory-count');
    if (memory && memoryCount) {
      memory.addEventListener('input', function () {
        memoryCount.textContent = String(memory.value.length);
      });
    }

    initShare();
    loadCount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
