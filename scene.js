/* ──────────────────────────────────────────────────────────────────────────
   Trinity 2018 — the memory corridor
   A field of empty photo frames suspended in the dark. Scroll flies the
   camera through them.

   Loaded dynamically by motion.js, and only on devices that passed the
   capability gate. Deliberately asset-free: the frames start empty, so this
   ships today with no photos. When the memories wall lands, real photos drop
   straight into these frames and the scene gets better on its own.

   Exports createCorridor(canvas) -> { setProgress, setActive, dispose } | null
   ────────────────────────────────────────────────────────────────────────── */

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const INK = 0x07080b;
const GOLD = 0xe9b949;

export async function createCorridor(canvas) {
  let THREE;
  try {
    THREE = await import(THREE_URL);
  } catch (err) {
    return null; // CDN unreachable — motion.js shows the CSS fallback
  }

  const mobile = window.matchMedia('(max-width: 48rem)').matches;
  const FRAME_COUNT = mobile ? 20 : 34;
  const DEPTH = 120;
  const START_Z = 12;

  /* ── Renderer ──────────────────────────────────────────────────────── */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !mobile,
      powerPreference: 'low-power'
    });
  } catch (err) {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(INK, 18, 95);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
  camera.position.set(0, 0, START_Z);

  /* ── Frames ────────────────────────────────────────────────────────────
     Each is a thin gold-ish border with a darker pane inside. Scattered in a
     ring around the camera path so the camera flies between them, never
     through one. */
  const frames = [];
  const borderMat = new THREE.MeshBasicMaterial({
    color: GOLD,
    transparent: true,
    opacity: 0.26,
    fog: true
  });
  const paneMat = new THREE.MeshBasicMaterial({
    color: 0x11141c,
    transparent: true,
    opacity: 0.85,
    fog: true
  });

  const borderGeo = new THREE.PlaneGeometry(1, 1);
  const paneGeo = new THREE.PlaneGeometry(1, 1);

  for (let i = 0; i < FRAME_COUNT; i++) {
    const group = new THREE.Group();

    // Portrait or landscape, like a real pile of photos
    const w = 1.6 + Math.random() * 1.5;
    const h = Math.random() > 0.45 ? w * 1.32 : w * 0.74;

    const border = new THREE.Mesh(borderGeo, borderMat);
    border.scale.set(w, h, 1);

    const pane = new THREE.Mesh(paneGeo, paneMat);
    pane.scale.set(w * 0.93, h * 0.93, 1);
    pane.position.z = 0.01;

    group.add(border, pane);

    // Ring placement: keep a clear tunnel down the middle
    const angle = Math.random() * Math.PI * 2;
    const radius = 3.4 + Math.random() * 5.6;
    group.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.62,
      -(i / FRAME_COUNT) * DEPTH - Math.random() * 3
    );

    group.rotation.set(
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.22
    );

    group.userData.drift = {
      speed: 0.12 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      amp: 0.1 + Math.random() * 0.22
    };

    frames.push(group);
    scene.add(group);
  }

  /* ── Dust ──────────────────────────────────────────────────────────── */
  const dustCount = mobile ? 260 : 520;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 34;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 22;
    dustPos[i * 3 + 2] = -Math.random() * DEPTH;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.055,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
    fog: true
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* ── Resize ────────────────────────────────────────────────────────── */
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  };
  window.addEventListener('resize', onResize);

  /* ── Loop ──────────────────────────────────────────────────────────── */
  let progress = 0;
  let targetProgress = 0;
  let active = true;
  let rafId = null;
  let disposed = false;
  const clock = new THREE.Clock();

  function render() {
    rafId = requestAnimationFrame(render);
    if (disposed) return;

    const t = clock.getElapsedTime();

    // Ease toward the scroll position so flicks feel weighted, not twitchy
    progress += (targetProgress - progress) * 0.075;

    camera.position.z = START_Z - progress * (DEPTH + START_Z + 8);
    // Slow drift so it never feels locked to a rail
    camera.position.x = Math.sin(t * 0.14) * 0.5;
    camera.position.y = Math.cos(t * 0.11) * 0.34;
    camera.lookAt(0, 0, camera.position.z - 10);

    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      const d = f.userData.drift;
      f.position.y += Math.sin(t * d.speed + d.phase) * 0.0014 * d.amp * 10;
      f.rotation.y += 0.00035;
    }

    dust.rotation.z = t * 0.008;

    renderer.render(scene, camera);
  }

  render();

  /* ── Public surface ────────────────────────────────────────────────── */
  return {
    setProgress(p) {
      targetProgress = Math.max(0, Math.min(1, p));
    },

    setActive(on) {
      if (disposed || on === active) return;
      active = on;
      if (on) {
        clock.start();
        if (rafId === null) render();
      } else if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },

    dispose() {
      disposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      borderGeo.dispose();
      paneGeo.dispose();
      borderMat.dispose();
      paneMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
    }
  };
}
