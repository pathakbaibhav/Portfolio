/* ============================================================
   script.js — particles, typing, theme toggle, reveal, h-scroll
   ============================================================ */

/* 1) Theme Toggle (light/dark via data-theme on <html>) */
(function themeToggle(){
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  const root = document.documentElement;

  // Persist choice in localStorage
  const stored = localStorage.getItem('theme');
  if (stored) root.setAttribute('data-theme', stored);

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const next = root.getAttribute('data-theme') === 'light' ? '' : 'light';
    if (next) root.setAttribute('data-theme', next);
    else root.removeAttribute('data-theme');
    localStorage.setItem('theme', next);
  });
})();

/* 2) Reveal-on-scroll (adds .visible when card enters viewport) */
(function revealOnScroll(){
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting){
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, {threshold: 0.1});
  els.forEach(el => io.observe(el));
})();

/* 3) Typing effect in hero (simple loop of phrases) */
(function typingEffect(){
  const el = document.getElementById('typed');
  if (!el) return;
  const phrases = [
    'Turning signals into software',
    'IoT • AI/ML • Cloud',
    'C++ / SystemC • React • Node • SQL'
  ];
  let i = 0, j = 0, deleting = false;

  function tick(){
    const word = phrases[i];
    if (!deleting){
      el.textContent = word.slice(0, ++j);
      if (j === word.length){ deleting = true; setTimeout(tick, 1100); return; }
    } else {
      el.textContent = word.slice(0, --j);
      if (j === 0){ deleting = false; i = (i+1) % phrases.length; }
    }
    setTimeout(tick, deleting ? 35 : 55);
  }
  tick();
})();

/* 4) Background particles (lightweight) */
(function particles(){
  const c = document.getElementById('bg-particles');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, dots;

  function resize(){
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    dots = Array.from({length: Math.min(120, Math.floor(w*h/25000))}, ()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-0.5)*0.4,
      vy: (Math.random()-0.5)*0.4,
      r: Math.random()*1.4 + 0.4
    }));
  }

  function step(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (const d of dots){
      d.x += d.vx; d.y += d.vy;
      if (d.x<0||d.x>w) d.vx*=-1;
      if (d.y<0||d.y>h) d.vy*=-1;
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize(); step();
})();

/* 5) Projects — Horizontal scroll controls
   - Arrow buttons nudge the track by one card width
   - Keyboard Left/Right when track is focused
*/
(function initProjectHScroll(){
  const track = document.querySelector('.project-track[data-hscroll]');
  if (!track) return;

  const prev = document.querySelector('.hscroll-controls .prev');
  const next = document.querySelector('.hscroll-controls .next');

  // Calculate one “step” (card width + gap)
  function measureStep(){
    const card = track.querySelector('.project-card');
    const gap = parseInt(getComputedStyle(track).gap || '18', 10);
    return card ? (card.getBoundingClientRect().width + gap) : 360;
  }

  function scrollByStep(dir){
    const step = measureStep();
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  prev?.addEventListener('click', () => scrollByStep(-1));
  next?.addEventListener('click', () => scrollByStep(1));

  // Keyboard support when the track is focused
  track.setAttribute('tabindex', '0');
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollByStep(1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollByStep(-1); }
  });
})();

/* ---------------------------------------------
   Achievements: tap/keyboard expand for mobile
   - On touch/click, toggle .is-active and aria-expanded
   - Ensures accessibility beyond hover-only
----------------------------------------------*/
(function initAchievements(){
  const cards = document.querySelectorAll('.achievements .achieve-card');
  if (!cards.length) return;

  cards.forEach(card => {
    // Toggle with Enter/Space
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const active = card.classList.toggle('is-active');
        card.setAttribute('aria-expanded', String(active));
      }
    });

    // Toggle on tap/click (mobile)
    card.addEventListener('click', (e) => {
      // Ignore clicks on links inside
      if (e.target && e.target.closest && e.target.closest('a')) return;
      const active = card.classList.toggle('is-active');
      card.setAttribute('aria-expanded', String(active));
    });
  });
})();

/* ---------------------------------------------
   Contact: Copy email to clipboard with feedback
----------------------------------------------*/
(function contactCopy(){
  const btn = document.getElementById('copyEmailBtn');
  if (!btn) return;
  const targetSel = btn.getAttribute('data-copy');
  const node = targetSel ? document.querySelector(targetSel) : null;

  btn.addEventListener('click', async () => {
    const text = node ? (node.textContent || '').trim() : '';
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      const prev = btn.textContent;
      btn.textContent = 'Copied!';
      btn.disabled = true;
      setTimeout(()=>{ btn.textContent = prev; btn.disabled = false; }, 1200);
    } catch {
      // Fallback if clipboard API unavailable
      const textarea = document.createElement('textarea');
      textarea.value = text; document.body.appendChild(textarea);
      textarea.select(); document.execCommand('copy'); document.body.removeChild(textarea);
      const prev = btn.textContent;
      btn.textContent = 'Copied!';
      btn.disabled = true;
      setTimeout(()=>{ btn.textContent = prev; btn.disabled = false; }, 1200);
    }
  });
})();

/* ---------------------------------------------
   Footer
----------------------------------------------*/
(function footerUtils(){
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  const btn = document.getElementById('backToTop');
  const ring = btn ? btn.querySelector('.progress-circle') : null;
  const R = 18, C = 2 * Math.PI * R;
  if (!btn || !ring) return;

  // Initialize ring
  ring.style.strokeDasharray = `${C} ${C}`;
  ring.style.strokeDashoffset = String(C);

  function getScrollProgress(){
    const doc = document.documentElement;
    const top = doc.scrollTop || document.body.scrollTop;
    const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
    return Math.min(1, Math.max(0, top / max));
  }
  function onScroll(){
    const p = getScrollProgress();
    ring.style.strokeDashoffset = String(C * (1 - p));
    // Always visible
    btn.classList.add('visible');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   Back-to-Top with Circular Progress 
   ============================================================ */
(function initScrollRing(){
  const btn = document.getElementById('toTop');
  if (!btn) return;

  const path = btn.querySelector('#progress');
  const box = { size: 36, cx: 18, cy: 18, r: 15 }; // keep 1.5px spacing from edge

  const d = [
    `M ${box.cx} ${box.cy - box.r}`,
    `a ${box.r} ${box.r} 0 1 1 0 ${2*box.r}`,
    `a ${box.r} ${box.r} 0 1 1 0 ${-2*box.r}`
  ].join(' ');
  path.setAttribute('d', d);

  // Compute circumference and set dash pattern
  const C = 2 * Math.PI * box.r;
  path.style.strokeDasharray = `${C} ${C}`;
  path.style.strokeDashoffset = String(C); // start empty

  function getScrollProgress(){
    const doc = document.documentElement;
    const top = doc.scrollTop || document.body.scrollTop;
    const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
    return Math.min(1, Math.max(0, top / max));
  }

  function onScroll(){
    const p = getScrollProgress();
    path.style.strokeDashoffset = String(C * (1 - p)); // fill as you scroll down
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   Auto Year in Footer
   ============================================================ */
(function footerYear(){
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
