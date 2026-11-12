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

  /* ════════════════════════════ ANALYTICS ════════════════════════════
     First-party, no cookies, no device storage, no personal data.

     SESSION_ID is generated in memory on each page load and forgotten when the
     tab closes. Nothing is written to localStorage, sessionStorage or a cookie,
     which is precisely why this site needs no cookie banner.

     Every call here is fire-and-forget and swallows its own errors. Analytics
     must never be able to interfere with a signup. */

  var SESSION_ID = (function () {
    try {
      if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
      if (window.crypto && window.crypto.getRandomValues) {
        var b = new Uint8Array(16);
        window.crypto.getRandomValues(b);
        b[6] = (b[6] & 0x0f) | 0x40;
        b[8] = (b[8] & 0x3f) | 0x80;
        var h = Array.prototype.map.call(b, function (x) {
          return ('0' + x.toString(16)).slice(-2);
        }).join('');
        return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) +
               '-' + h.slice(16, 20) + '-' + h.slice(20);
      }
    } catch (e) { /* fall through */ }
    return null; // no usable randomness: log nothing rather than log something fake
  })();

  var tracked = {};

  function track(name, once) {
    try {
      if (!SESSION_ID) return;
      if (once) {
        if (tracked[name]) return;
        tracked[name] = true;
      }

      fetch(REST + '/events', {
        method: 'POST',
        headers: Object.assign({}, HEADERS, { 'Prefer': 'return=minimal' }),
        body: JSON.stringify({
          name: name,
          session_id: SESSION_ID,
          referrer: (document.referrer || '').slice(0, 300) || null,
          path: (location.pathname || '/').slice(0, 200),
          screen_w: window.innerWidth || null
        }),
        keepalive: true // survives the page being closed mid-request
      }).catch(function () { /* never surfaces */ });
    } catch (e) { /* never surfaces */ }
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

  /* ════════════════════════ MEMORIES WALL ════════════════════════
     Two feeds, one grid. approved_memories() returns text; approved_photos()
     returns a display name, caption and storage path. Neither can return an
     email or a full surname - that is enforced in the functions, not here.

     Photos live in a PRIVATE bucket, so they cannot be dropped into an <img
     src>. Each one is fetched with the public key (storage RLS only releases
     it once approved), turned into a blob URL, and rendered from that. An
     unapproved photo is unreadable even by someone holding its exact URL. */

  var PHOTO_BUCKET = 'memories';
  var photoObjectUrls = [];

  function storageUrl(path) {
    return SUPABASE_URL + '/storage/v1/object/' + PHOTO_BUCKET + '/' + encodeURIComponent(path);
  }

  function fetchPhotoUrl(path) {
    return fetch(storageUrl(path), {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    }).then(function (res) {
      if (!res.ok) throw new Error('photo ' + res.status);
      return res.blob();
    }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      photoObjectUrls.push(url);
      return url;
    });
  }

  function textCard(row) {
    var card = document.createElement('figure');
    card.className = 'memory';

    var quote = document.createElement('blockquote');
    quote.className = 'memory__text';
    quote.textContent = row.memory;    // textContent: other people wrote this

    var name = document.createElement('figcaption');
    name.className = 'memory__name';
    name.textContent = row.display_name || '';

    card.appendChild(quote);
    card.appendChild(name);
    return card;
  }

  function renderWall(memories, photoPairs) {
    var section = $('wall');
    var grid = $('wall-grid');
    var textBlock = $('wall-text');
    if (!section || !grid) return;

    var photos = photoPairs || [];
    var texts = (memories || []).filter(function (r) { return r && r.memory; });

    if (!photos.length && !texts.length) { section.hidden = true; return; }

    /* Photos go to the scroll-scatter stage, not into this grid. The grid is
       now text memories only, and hides itself when there are none rather
       than leaving "Add yours when you sign up." floating on its own. */
    grid.textContent = '';
    texts.forEach(function (row, i) {
      var card = textCard(row);
      card.style.transitionDelay = Math.min(i * 70, 700) + 'ms';
      grid.appendChild(card);
    });
    if (textBlock) textBlock.hidden = texts.length === 0;

    section.hidden = false;
    track('wall_view', true);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { section.classList.add('is-ready'); });
    });
  }

  function loadWall() {
    var memories = requestWithRetry('/rpc/approved_memories', { method: 'POST', body: {} })
      .then(function (res) { return res.ok ? res.json() : []; })
      .catch(function () { return []; });

    var photos = requestWithRetry('/rpc/approved_photos', { method: 'POST', body: {} })
      .then(function (res) { return res.ok ? res.json() : []; })
      .catch(function () { return []; })
      .then(function (rows) {
        if (!rows || !rows.length) return [];
        // Settle individually: one unreadable photo must not sink the wall
        return Promise.all(rows.map(function (row) {
          return fetchPhotoUrl(row.storage_path)
            .then(function (url) { return { row: row, url: url }; })
            .catch(function () { return null; });
        })).then(function (pairs) {
          return pairs.filter(Boolean);
        });
      });

    return Promise.all([memories, photos]).then(function (out) {
      var pairs = out[1];
      renderWall(out[0], pairs);

      /* The privacy notice promises photos appear with a first name and last
         initial, so the scatter cards get the attribution, not just the image. */
      var items = pairs.map(function (pair) {
        return {
          url: pair.url,
          name: pair.row.display_name || '',
          caption: pair.row.caption || ''
        };
      });

      // Hand the photos to the scatter stage. One-way and optional: it
      // cannot report a problem back here, and it failing would not affect
      // the signup form.
      try {
        if (items.length && window.__trinityScatter) {
          window.__trinityScatter.setPhotos(items);
        }
      } catch (e) { /* presentation only */ }
    });
  }

  /* ════════════════════════ PHOTO UPLOAD ════════════════════════
     Resizing happens in the browser before anything is sent. A phone photo is
     3-6MB; this lands around 200-400KB, which is the difference between an
     upload that finishes on mobile data and one that is abandoned.

     Re-encoding through a canvas also drops every EXIF field, so GPS
     coordinates from someone's camera roll never leave their device. */

  var MAX_PHOTOS = 3;
  var MAX_DIM = 1600;
  var JPEG_QUALITY = 0.82;
  var MAX_SOURCE_BYTES = 25 * 1024 * 1024;

  var selectedPhotos = [];
  var previewUrls = [];

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    var b = new Uint8Array(16);
    window.crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    var h = Array.prototype.map.call(b, function (x) {
      return ('0' + x.toString(16)).slice(-2);
    }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) +
           '-' + h.slice(16, 20) + '-' + h.slice(20);
  }

  function downscale(file) {
    return new Promise(function (resolve, reject) {
      if (file.size > MAX_SOURCE_BYTES) { reject(new Error('too big')); return; }

      var url = URL.createObjectURL(file);
      var img = new Image();

      img.onload = function () {
        URL.revokeObjectURL(url);
        var w = img.naturalWidth, h = img.naturalHeight;
        if (!w || !h) { reject(new Error('decode')); return; }

        var scale = Math.min(1, MAX_DIM / Math.max(w, h));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(function (blob) {
          if (blob) resolve(blob); else reject(new Error('encode'));
        }, 'image/jpeg', JPEG_QUALITY);
      };

      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('decode'));
      };

      img.src = url;
    });
  }

  function uploadPhoto(blob) {
    var name = uuid() + '.jpg';
    return fetch(storageUrl(name), {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'false'
      },
      body: blob
    }).then(function (res) {
      if (!res.ok) throw new Error('upload ' + res.status);
      return name;
    });
  }

  function savePhotoRows(paths, first, last, caption) {
    if (!paths.length) return Promise.resolve();
    return request('/memory_photos', {
      method: 'POST',
      headers: { 'Prefer': 'return=minimal' },
      body: paths.map(function (path) {
        return {
          first_name: first,
          last_name: last,
          storage_path: path,
          caption: caption || null
        };
      })
    }, 30000);
  }

  function renderPreviews() {
    var box = $('photo-previews');
    var drop = $('drop');
    if (!box) return;

    previewUrls.forEach(function (u) { URL.revokeObjectURL(u); });
    previewUrls = [];
    box.textContent = '';

    selectedPhotos.forEach(function (file, idx) {
      var url = URL.createObjectURL(file);
      previewUrls.push(url);

      var item = document.createElement('div');
      item.className = 'preview';

      var img = document.createElement('img');
      img.src = url;
      img.alt = '';
      item.appendChild(img);

      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'preview__remove';
      remove.setAttribute('aria-label', 'Remove this photo');
      remove.textContent = '×';
      remove.addEventListener('click', function () {
        selectedPhotos.splice(idx, 1);
        renderPreviews();
      });
      item.appendChild(remove);

      box.appendChild(item);
    });

    if (drop) drop.classList.toggle('has-files', selectedPhotos.length > 0);
    var title = drop && drop.querySelector('.drop__title');
    if (title) {
      title.textContent = selectedPhotos.length
        ? selectedPhotos.length + ' photo' + (selectedPhotos.length > 1 ? 's' : '') +
          ' ready' + (selectedPhotos.length < MAX_PHOTOS ? ' — tap to add another' : '')
        : 'Tap to add photos';
    }
  }

  function initPhotoPicker() {
    var input = $('photos');
    if (!input) return;

    input.addEventListener('change', function () {
      setError('photos', '');
      var incoming = Array.prototype.slice.call(input.files || []);

      var rejected = 0;
      incoming.forEach(function (f) {
        if (selectedPhotos.length >= MAX_PHOTOS) { rejected++; return; }
        if (!/^image\//.test(f.type)) { rejected++; return; }
        selectedPhotos.push(f);
      });

      if (rejected) {
        setError('photos', selectedPhotos.length >= MAX_PHOTOS
          ? 'Three photos is the limit for one go — you can always come back and add more.'
          : 'Some of those weren\'t images, so they were skipped.');
      }

      input.value = '';   // so picking the same file again still fires change
      renderPreviews();
      track('form_start', true);
    });
  }

  function processAndUploadPhotos() {
    if (!selectedPhotos.length) return Promise.resolve([]);

    var total = selectedPhotos.length;
    var done = 0;
    setStatus('Preparing ' + total + ' photo' + (total > 1 ? 's' : '') + '...', '');

    return selectedPhotos.reduce(function (chain, file) {
      return chain.then(function (paths) {
        return downscale(file)
          .then(uploadPhoto)
          .then(function (path) {
            done++;
            setStatus('Uploaded ' + done + ' of ' + total + '...', '');
            return paths.concat([path]);
          })
          .catch(function () {
            done++;
            return paths;   // skip the bad one, keep the rest
          });
      });
    }, Promise.resolve([]));
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

  function showSuccess(firstName, photoCount) {
    var success = $('success');
    var title = $('success-title');
    if (title && firstName) title.textContent = "You're in, " + firstName + '.';

    var note = $('success-photos');
    if (note) {
      if (photoCount) {
        note.textContent = photoCount > 1
          ? 'Your ' + photoCount + ' photos are in the queue — they go up on the wall once I\u2019ve had a look.'
          : 'Your photo is in the queue — it goes up on the wall once I\u2019ve had a look.';
        note.hidden = false;
      } else {
        note.hidden = true;
      }
    }
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
    track('form_submit');

    var uploadedPaths = [];

    /* Photos go up first. If the signup then turns out to be a duplicate we
       still want the photos, and an orphaned object in a private bucket with
       no row pointing at it is unreadable by anyone - so nothing leaks. */
    processAndUploadPhotos()
      .then(function (paths) {
        uploadedPaths = paths;
        if (paths.length) track('photo_upload');
        setStatus(paths.length ? 'Saving...' : '', '');

        return requestWithRetry('/signups', {
          method: 'POST',
          headers: { 'Prefer': 'return=minimal' },
          body: data
        });
      })
      .then(function (res) {
        if (res.status === 201) {
          return savePhotoRows(uploadedPaths, data.first_name, data.last_name, data.memory)
            .catch(function () { /* signup already succeeded; don't fail them for this */ })
            .then(function () {
              track('form_success');
              showSuccess(data.first_name, uploadedPaths.length);
            });
        }

        return res.json().then(function (body) { return body; }, function () { return {}; })
          .then(function (body) {
            if (res.status === 409 || body.code === '23505') {
              /* Already on the list. The photos are still wanted - this is the
                 only route for anyone who signed up before photos existed. */
              track('form_duplicate');
              if (uploadedPaths.length) {
                return savePhotoRows(uploadedPaths, data.first_name, data.last_name, data.memory)
                  .then(function () {
                    setStatus("You were already on the list — your photo" +
                      (uploadedPaths.length > 1 ? 's are' : ' is') +
                      " added and waiting to go up on the wall.", 'ok');
                    selectedPhotos = [];
                    renderPreviews();
                  })
                  .catch(function () {
                    setStatus("You're already on the list, but the photos didn't save. Try once more?", 'error');
                  });
              }
              setStatus("You're already on the list — nothing more to do. See you there.", 'ok');
              return;
            }
            if (body.code === '23514') {
              setError('email', "That email was rejected as invalid — mind checking it?");
              return;
            }
            track('form_error');
            setStatus("Something went wrong saving that. Try again in a moment, or message me directly.", 'error');
          });
      })
      .catch(function () {
        track('form_error');
        setStatus("Couldn't reach the server — check your connection and try once more.", 'error');
      })
      .finally(function () { setLoading(false); });
  }

  /* ════════════════════════════ SHARE ════════════════════════════ */

  function initShare() {
    var wa = $('share-whatsapp');
    if (wa) {
      wa.addEventListener('click', function () { track('share_click'); });
      wa.href = 'https://wa.me/?text=' + encodeURIComponent(SHARE_TEXT + ' ' + SHARE_URL);
      wa.target = '_blank';
    }

    var copy = $('share-copy');
    if (copy) {
      copy.addEventListener('click', function () {
        track('share_click');
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

    // First interaction with any form field, once per page load
    if (form) {
      ['focusin', 'input'].forEach(function (evt) {
        form.addEventListener(evt, function () { track('form_start', true); }, { once: false });
      });
    }

    initPhotoPicker();
    initShare();
    track('page_view');
    loadCount();
    loadWall();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
