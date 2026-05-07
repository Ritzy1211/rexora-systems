// Rexora Systems — minimal interactions

// Smooth-scroll for in-page anchors (graceful enhancement over CSS smooth scroll)
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// Reveal-on-scroll using IntersectionObserver
const revealTargets = document.querySelectorAll('section h2, section h3, section p, section ul, section .grid > *');
revealTargets.forEach((el) => el.classList.add('reveal'));

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealTargets.forEach((el) => io.observe(el));

/* ===========================================================
   Animated number counters (hero stats)
   =========================================================== */
const counters = document.querySelectorAll('[data-counter]');

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

const animateCounter = (el) => {
  const target  = parseInt(el.dataset.target || '0', 10);
  const suffix  = el.dataset.suffix || '';
  const prefix  = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();

  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(easeOutQuart(progress) * target);
    el.textContent = `${prefix}${value}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
counters.forEach((el) => counterObserver.observe(el));

/* ===========================================================
   Draw-on-scroll line icons (work sections)
   =========================================================== */
const drawIcons = document.querySelectorAll('.draw-icon');

drawIcons.forEach((svg) => {
  const paths = svg.querySelectorAll('path, polyline, line, circle');
  paths.forEach((p) => {
    // Skip filled circles (they're dots/markers)
    if (p.getAttribute('fill') && p.getAttribute('fill') !== 'none') return;
    try {
      const len = p.getTotalLength ? p.getTotalLength() : 200;
      p.style.strokeDasharray  = len;
      p.style.strokeDashoffset = len;
      p.style.transition       = 'stroke-dashoffset 1.4s ease-out';
    } catch (_) { /* element doesn't support getTotalLength */ }
  });
});

const drawObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const paths = entry.target.querySelectorAll('path, polyline, line, circle');
        paths.forEach((p, i) => {
          if (p.getAttribute('fill') && p.getAttribute('fill') !== 'none') return;
          setTimeout(() => { p.style.strokeDashoffset = 0; }, i * 120);
        });
        drawObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);
drawIcons.forEach((svg) => drawObserver.observe(svg));

/* ===========================================================
   Floating WhatsApp chat bubble
   =========================================================== */
(() => {
  const tip   = document.getElementById('chatBubbleTip');
  const close = document.getElementById('chatBubbleClose');
  if (!tip) return;

  const STORAGE_KEY = 'rexora_chat_tip_dismissed';

  const showTip = () => {
    tip.classList.remove('opacity-0', 'translate-y-2');
    tip.classList.add('opacity-100', 'translate-y-0');
  };

  const hideTip = () => {
    tip.classList.add('opacity-0', 'translate-y-2');
    tip.classList.remove('opacity-100', 'translate-y-0');
  };

  // Auto-show after 6s (unless previously dismissed this session)
  if (!sessionStorage.getItem(STORAGE_KEY)) {
    setTimeout(showTip, 6000);
  }

  close?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    hideTip();
    sessionStorage.setItem(STORAGE_KEY, '1');
  });
})();
