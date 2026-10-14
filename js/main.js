/* ==========================================================
   Открытка ко Дню матери — скрипты
   ========================================================== */
(() => {
  'use strict';

  // ---------- НАСТРОЙКИ (можно спокойно менять) ----------
  const CONFIG = {
    call: 'Мамочка',          // как ты обращаешься к маме (можно добавить имя, например «Мамочка Лена»)
    callLower: 'мамочка',     // то же самое, но с маленькой буквы (для середины предложения)
    signature: 'твой сын',    // подпись в конце открытки
  };

  // ---------- Утилиты ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const TAU = Math.PI * 2;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vibrate = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* не поддерживается */ } };

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  document.documentElement.classList.add('is-locked');

  // ---------- Подстановка текстов из настроек ----------
  $$('[data-call]').forEach((el) => { el.textContent = CONFIG.call; });
  $$('[data-call-lower]').forEach((el) => { el.textContent = CONFIG.callLower; });
  $$('[data-sign]').forEach((el) => { el.textContent = CONFIG.signature; });

  // ---------- Разбивка заголовка на буквы ----------
  function splitLetters(el) {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    let i = 0;
    const words = text.split(' ');
    words.forEach((word, wi) => {
      const w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      [...word].forEach((ch) => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.style.setProperty('--i', i++);
        s.textContent = ch;
        w.appendChild(s);
      });
      el.appendChild(w);
      if (wi < words.length - 1) { el.appendChild(document.createTextNode(' ')); i++; }
    });
  }
  splitLetters($('#heroLine1'));

  // ==========================================================
  //  ЦВЕТЫ (SVG)
  // ==========================================================
  const PALETTES = [
    { a: '#ff8fb1', b: '#ff5c8d', c: '#ffd166' },   // розовый
    { a: '#ffd1dc', b: '#ff9db8', c: '#f6b73c' },   // нежно-розовый
    { a: '#ffffff', b: '#ffdbe6', c: '#ffc531' },   // белая ромашка
    { a: '#e2c6ff', b: '#b58af2', c: '#ffe28a' },   // сиреневый
    { a: '#ffc9a8', b: '#ff9b73', c: '#ffe28a' },   // персиковый
    { a: '#fff08a', b: '#ffc83d', c: '#a8672b' },   // жёлтый
    { a: '#ff7a9c', b: '#e0457b', c: '#ffe28a' },   // малиновый
  ];
  const TULIP_PALETTES = [PALETTES[0], PALETTES[1], PALETTES[3], PALETTES[4], PALETTES[6]];

  function petalRing(n, rx, ry, dist, rot0, fill, cx, cy) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (rot0 + (i * 360) / n).toFixed(1);
      s += `<ellipse cx="${cx}" cy="${cy - dist}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${a} ${cx} ${cy})"/>`;
    }
    return s;
  }

  function headMarkup(type, p, cx, cy) {
    if (type === 'tulip') {
      const dx = cx - 50;
      const dy = cy - 70;
      return `<g class="head"><g transform="translate(${dx} ${dy})">
        <path d="M50 82 C28 78 24 48 33 28 C44 38 51 56 50 82Z" fill="${p.b}"/>
        <path d="M50 82 C72 78 76 48 67 28 C56 38 49 56 50 82Z" fill="${p.b}"/>
        <path d="M50 84 C37 72 37 44 50 22 C63 44 63 72 50 84Z" fill="${p.a}"/>
        <path d="M50 30 C46 46 46 62 50 76" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>
      </g></g>`;
    }
    let petals;
    if (type === 'daisy') {
      petals = petalRing(13, 4.6, 15, 15, 0, p.b, cx, cy) + petalRing(13, 4, 13, 13, 360 / 26, p.a, cx, cy);
    } else {
      petals = petalRing(7, 11, 13.5, 15, 0, p.b, cx, cy) + petalRing(7, 9.5, 11, 11.5, 360 / 14, p.a, cx, cy);
    }
    const dots = [0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i * TAU) / 6;
      return `<circle cx="${(cx + Math.cos(a) * 3.2).toFixed(1)}" cy="${(cy + Math.sin(a) * 3.2).toFixed(1)}" r="1" fill="#fff" fill-opacity=".55"/>`;
    }).join('');
    return `<g class="head"><g class="petals" style="--spin:${rand(40, 90).toFixed(0)}s">${petals}</g>
      <circle cx="${cx}" cy="${cy}" r="6.8" fill="${p.c}"/>
      <circle cx="${cx}" cy="${cy}" r="6.8" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"/>${dots}</g>`;
  }

  function plantMarkup(type, p) {
    const k = rand(-10, 10).toFixed(1);
    const yl = rand(222, 250).toFixed(0);
    const yr = rand(168, 200).toFixed(0);
    const stem = `M50 300 C ${50 + +k} 240, ${50 - +k} 160, 50 82`;
    const leafL = `M50 ${yl} C30 ${yl - 6} 20 ${yl - 26} 22 ${yl - 40} C42 ${yl - 34} 52 ${yl - 14} 50 ${yl}Z`;
    const leafR = `M50 ${yr} C70 ${yr - 6} 80 ${yr - 26} 78 ${yr - 40} C58 ${yr - 34} 48 ${yr - 14} 50 ${yr}Z`;
    return `<svg viewBox="0 0 100 300" aria-hidden="true">
      <path class="stem" d="${stem}" fill="none" stroke="#7fc08f" stroke-width="3.4" stroke-linecap="round"/>
      <path class="leaf leaf--l" d="${leafL}" fill="#8fd0a0"/>
      <path class="leaf leaf--r" d="${leafR}" fill="#6fba85"/>
      ${headMarkup(type, p, 50, 72)}
    </svg>`;
  }

  function bloomMarkup(type, p) {
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${headMarkup(type, p, 50, 50)}</svg>`;
  }

  const hill = (cls, d, fill) =>
    `<svg class="garden__hill ${cls}" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="${fill}"/></svg>`;

  function buildGarden(el) {
    const h = el.clientHeight || 300;
    const w = el.clientWidth || window.innerWidth;
    const n = clamp(Math.round(w / 44), 8, 26);
    const maxW = (h * 1.08) / 3;
    let html = hill('garden__hill--back', 'M0 38 C70 8 140 58 220 28 S350 18 400 44 L400 100 L0 100Z', '#c4e8c9');
    for (let i = 0; i < n; i++) {
      const step = 100 / n;
      const x = clamp((i + 0.5) * step + rand(-0.4, 0.4) * step, 3, 97);
      const pw = rand(0.45, 1) * maxW;
      const r = Math.random();
      const type = r < 0.34 ? 'daisy' : r < 0.74 ? 'bloom' : 'tulip';
      const pal = type === 'tulip' ? pick(TULIP_PALETTES) : pick(PALETTES);
      html += `<div class="plant" style="left:${x.toFixed(1)}%;--w:${pw.toFixed(0)}px;--d:${rand(0, 1.8).toFixed(2)}s;` +
        `--sw:${rand(4.5, 8).toFixed(1)}s;--sd:${(-rand(0, 6)).toFixed(1)}s;z-index:${Math.round(pw)}">${plantMarkup(type, pal)}</div>`;
    }
    html += hill('garden__hill--front', 'M0 62 C90 30 170 84 260 52 S360 48 400 64 L400 100 L0 100Z', '#a8dbb2');
    el.innerHTML = html;
  }

  const garden = $('#garden');
  const gardenFinale = $('#gardenFinale');
  buildGarden(garden);
  buildGarden(gardenFinale);

  // Цветы-украшения рядом с фото
  $$('[data-bloom]').forEach((el) => {
    const type = el.dataset.bloom;
    el.innerHTML = bloomMarkup(type, type === 'tulip' ? pick(TULIP_PALETTES) : pick(PALETTES));
  });

  // Венок вокруг портрета
  const wreath = $('#wreath');
  if (wreath) {
    const count = 12;
    const types = ['daisy', 'bloom', 'bloom', 'daisy'];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU;
      const b = document.createElement('span');
      b.className = 'bloom';
      b.style.left = (50 + 50 * Math.cos(a)).toFixed(2) + '%';
      b.style.top = (50 + 50 * Math.sin(a)).toFixed(2) + '%';
      b.innerHTML = bloomMarkup(types[i % types.length], PALETTES[i % PALETTES.length]);
      wreath.appendChild(b);
    }
  }

  // Мерцающие звёздочки на фоне
  const sparks = $('#sparks');
  const sparkCount = window.innerWidth < 600 ? 22 : 42;
  for (let i = 0; i < sparkCount; i++) {
    const s = document.createElement('i');
    s.className = 'spark';
    const size = rand(2, 5);
    s.style.cssText = `left:${rand(0, 100).toFixed(1)}%;top:${rand(0, 100).toFixed(1)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;` +
      `--t:${rand(3, 7).toFixed(1)}s;--dl:${(-rand(0, 7)).toFixed(1)}s`;
    sparks.appendChild(s);
  }

  // ==========================================================
  //  CANVAS: падающие лепестки и сердечки + взрывы по касанию
  // ==========================================================
  const cvs = $('#fx');
  const ctx = cvs.getContext('2d');
  let W = window.innerWidth;
  let H = window.innerHeight;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cvs.width = Math.round(W * dpr);
    cvs.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 150);
  });

  const COLORS = ['#ffb3c7', '#ff8fb1', '#ffd1dc', '#ffffff', '#ffc6a8', '#e9c6ff', '#ff9db8', '#ffe1ea'];
  const BURST_COLORS = ['#ff5c8d', '#ff8fb1', '#ffb3c7', '#ffd166', '#ffffff', '#c9a0ff', '#ff9a76'];

  function petalPath(s) {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.85, s * 0.55, 0, s);
    ctx.bezierCurveTo(-s * 0.85, s * 0.55, -s * 0.95, -s * 0.55, 0, -s);
    ctx.closePath();
  }
  function heartPath(s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.45);
    ctx.bezierCurveTo(-s * 1.15, -s * 0.3, -s * 0.55, -s * 1.05, 0, -s * 0.35);
    ctx.bezierCurveTo(s * 0.55, -s * 1.05, s * 1.15, -s * 0.3, 0, s * 0.45);
    ctx.closePath();
  }
  function starPath(s) {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(0, 0, s, 0);
    ctx.quadraticCurveTo(0, 0, 0, s);
    ctx.quadraticCurveTo(0, 0, -s, 0);
    ctx.quadraticCurveTo(0, 0, 0, -s);
    ctx.closePath();
  }
  function drawShape(kind, s) {
    if (kind === 'heart') heartPath(s);
    else if (kind === 'star') starPath(s * 1.3);
    else petalPath(s);
    ctx.fill();
  }

  function newFaller(initial) {
    return {
      x: rand(0, W),
      y: initial ? rand(-H * 0.2, H) : rand(-60, -10),
      s: rand(5, 11),
      vy: rand(24, 52),
      sway: rand(14, 38),
      ph: rand(0, TAU),
      rot: rand(0, TAU),
      vr: rand(-1.4, 1.4),
      flip: rand(0, TAU),
      vf: rand(1.5, 3.5),
      color: pick(COLORS),
      alpha: rand(0.55, 0.92),
      kind: Math.random() < 0.16 ? 'heart' : 'petal',
    };
  }

  const fallerCount = reduceMotion ? 8 : clamp(Math.round(W / 15), 18, 44);
  const fallers = Array.from({ length: fallerCount }, () => newFaller(true));
  const parts = [];

  function burst(x, y, n = 18, power = 1) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const sp = rand(90, 340) * power;
      parts.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - rand(60, 170),
        s: rand(5, 11),
        rot: rand(0, TAU),
        vr: rand(-7, 7),
        life: 0,
        max: rand(1.2, 2.5),
        kind: pick(['heart', 'heart', 'petal', 'star', 'petal']),
        color: pick(BURST_COLORS),
      });
    }
    if (parts.length > 520) parts.splice(0, parts.length - 520);
  }

  function sparkle(x, y) {
    parts.push({
      x, y, vx: rand(-25, 25), vy: rand(-40, 10), s: rand(3, 6), rot: 0, vr: rand(-3, 3),
      life: 0, max: rand(0.6, 1.1), kind: 'star', color: pick(BURST_COLORS),
    });
  }

  function fireworks(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => burst(rand(W * 0.12, W * 0.88), rand(H * 0.12, H * 0.55), 28, 1.15), i * 380);
    }
  }

  // ==========================================================
  //  БАБОЧКИ
  // ==========================================================
  const BF_COLORS = [['#ff8fb1', '#ffd1dc'], ['#b98af0', '#e6d4ff'], ['#ffb36b', '#ffe0b8']];

  function butterflyMarkup(c1, c2) {
    const wing = `<path d="M30 25 C22 2 3 0 5 16 C6 27 19 30 30 26Z" fill="${c1}"/>
      <path d="M30 27 C19 31 10 46 18 47 C27 47 30 37 30 27Z" fill="${c2}"/>
      <circle cx="14" cy="14" r="3.4" fill="#fff" opacity=".7"/>
      <circle cx="20" cy="38" r="2.2" fill="#fff" opacity=".6"/>`;
    return `<svg viewBox="0 0 60 50">
      <g class="wing wing-l">${wing}</g>
      <g class="wing wing-r"><g transform="translate(60 0) scale(-1 1)">${wing}</g></g>
      <ellipse cx="30" cy="26" rx="1.9" ry="9" fill="#5a3148"/>
      <path d="M29.2 17 C26 10 24 8 22 8 M30.8 17 C34 10 36 8 38 8" stroke="#5a3148" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  const bfLayer = $('#butterflies');
  const normAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  let attractor = null;

  const butterflies = reduceMotion ? [] : Array.from({ length: W < 600 ? 3 : 4 }, (_, i) => {
    const el = document.createElement('div');
    el.className = 'bf';
    el.innerHTML = butterflyMarkup(...BF_COLORS[i % BF_COLORS.length]);
    bfLayer.appendChild(el);
    return {
      el,
      x: rand(0, W), y: rand(H * 0.3, H),
      a: rand(0, TAU), t: rand(0, 50), seed: rand(0, 10),
      speed: rand(60, 100), scale: rand(0.8, 1.3),
    };
  });

  function updateButterfly(b, dt, now) {
    b.t += dt;
    b.a += (Math.sin(b.t * 1.7 + b.seed) * 1.1 + Math.sin(b.t * 0.6 + b.seed * 2) * 0.8) * dt;

    let target = null;
    if (attractor && now < attractor.until) {
      target = attractor;
    } else {
      const m = 70;
      if (b.x < m || b.x > W - m || b.y < m || b.y > H - m) target = { x: W / 2, y: H / 2 };
    }
    if (target) {
      const dx = target.x - b.x;
      const dy = target.y - b.y;
      if (Math.hypot(dx, dy) > 45) {
        b.a += normAngle(Math.atan2(dy, dx) - b.a) * Math.min(1, 2.6 * dt);
      }
    }
    const sp = b.speed * (1 + 0.35 * Math.sin(b.t * 7));
    b.x = clamp(b.x + Math.cos(b.a) * sp * dt, -60, W + 60);
    b.y = clamp(b.y + Math.sin(b.a) * sp * dt + Math.sin(b.t * 9) * 18 * dt, -60, H + 60);
    b.el.style.transform =
      `translate3d(${(b.x - 23).toFixed(1)}px,${(b.y - 20).toFixed(1)}px,0) rotate(${(b.a + Math.PI / 2).toFixed(3)}rad) scale(${b.scale.toFixed(2)})`;
  }

  // ---------- Главный цикл ----------
  let last = performance.now();
  let looping = false;

  function frame(now) {
    if (document.hidden) { looping = false; return; }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, W, H);

    // падающие лепестки
    for (const p of fallers) {
      p.ph += dt * 1.2;
      p.y += p.vy * dt;
      p.x += Math.sin(p.ph) * p.sway * dt;
      p.rot += p.vr * dt;
      p.flip += p.vf * dt;
      if (p.y > H + 30) Object.assign(p, newFaller(false));
      if (p.x < -30) p.x = W + 30; else if (p.x > W + 30) p.x = -30;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(Math.max(0.25, Math.abs(Math.cos(p.flip))), 1);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      drawShape(p.kind, p.s);
      ctx.restore();
    }

    // всплески от касаний
    const drag = Math.pow(0.4, dt);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt;
      if (p.life >= p.max) { parts.splice(i, 1); continue; }
      p.vy += 280 * dt;
      p.vx *= drag;
      p.vy *= Math.pow(0.7, dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const k = p.life / p.max;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - k * k);
      ctx.fillStyle = p.color;
      drawShape(p.kind, p.s * (1 - k * 0.25));
      ctx.restore();
    }

    // бабочки
    for (const b of butterflies) updateButterfly(b, dt, now);

    requestAnimationFrame(frame);
  }

  function startLoop() {
    if (looping) return;
    looping = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) startLoop(); });
  startLoop();

  // ==========================================================
  //  ВЗАИМОДЕЙСТВИЕ
  // ==========================================================
  let opened = false;

  window.addEventListener('pointerdown', (e) => {
    if (!opened) return;
    burst(e.clientX, e.clientY, 11, 0.75);
    attractor = { x: e.clientX, y: e.clientY, until: performance.now() + 2600 };
  }, { passive: true });

  let lastTrail = 0;
  window.addEventListener('pointermove', (e) => {
    if (!opened || e.pointerType !== 'mouse') return;
    const now = performance.now();
    if (now - lastTrail < 45) return;
    lastTrail = now;
    sparkle(e.clientX, e.clientY);
  }, { passive: true });

  // Открытие открытки
  const intro = $('#intro');
  const openBtn = $('#openBtn');
  const hero = $('#hero');

  function openIntro() {
    if (opened) return;
    opened = true;
    const r = openBtn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 44, 1.5);
    setTimeout(() => burst(W * 0.2, H * 0.55, 26, 1.2), 220);
    setTimeout(() => burst(W * 0.8, H * 0.55, 26, 1.2), 380);
    vibrate(25);

    intro.classList.add('is-gone');
    document.documentElement.classList.remove('is-locked');
    document.body.classList.remove('is-locked');
    hero.classList.add('is-on');
    garden.classList.add('is-on');
    butterflies.forEach((b, i) => setTimeout(() => b.el.classList.add('on'), 600 + i * 500));
    setTimeout(() => { intro.hidden = true; }, 1600);
  }
  openBtn.addEventListener('click', openIntro);

  // Финальное сердечко
  const finale = $('#finale');
  const bigHeart = $('#bigHeart');
  bigHeart.addEventListener('click', () => {
    const first = !finale.classList.contains('is-open');
    const r = bigHeart.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 38, 1.35);
    vibrate([30, 50, 30]);
    if (!first) return;
    finale.classList.add('is-open');
    gardenFinale.classList.add('is-on');
    fireworks(7);
    setTimeout(() => {
      const y = bigHeart.getBoundingClientRect().top + window.scrollY - H * 0.1;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }, 500);
  });

  // ---------- Появление блоков при прокрутке ----------
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // ---------- Полоска прогресса ----------
  const progress = $('#progress');
  let ticking = false;
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    progress.style.transform = `scaleX(${p.toFixed(4)})`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });

  console.log('💐 Открытка готова. С Днём матери!');
})();
