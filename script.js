// Rexora Systems — minimal interactions

// ════════════ NAV: scroll state, scroll-spy, mobile toggle ════════════
(function navInit() {
  const header   = document.getElementById('siteHeader');
  const navLinks = [...document.querySelectorAll('#primaryNav .nav-pill')];
  const mobLinks = [...document.querySelectorAll('.mobile-link')];
  const indicator = document.getElementById('navIndicator');
  const toggle   = document.getElementById('mobileToggle');
  const menu     = document.getElementById('mobileMenu');
  const iMenu    = document.getElementById('iconMenu');
  const iClose   = document.getElementById('iconClose');

  // Scrolled style
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Slide indicator behind active pill
  const moveIndicator = (link) => {
    if (!indicator || !link) return;
    const navRect  = link.parentElement.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    indicator.style.left  = (linkRect.left - navRect.left) + 'px';
    indicator.style.width = linkRect.width + 'px';
    indicator.classList.add('is-visible');
  };
  const hideIndicator = () => indicator && indicator.classList.remove('is-visible');

  // Scroll-spy via IntersectionObserver
  const sections = navLinks
    .map(l => document.getElementById(l.dataset.spy))
    .filter(Boolean);
  let activeId = null;

  const setActive = (id) => {
    if (id === activeId) return;
    activeId = id;
    let activeLink = null;
    navLinks.forEach(l => {
      const on = l.dataset.spy === id;
      l.classList.toggle('is-active', on);
      if (on) activeLink = l;
    });
    mobLinks.forEach(l => l.classList.toggle('is-active', l.dataset.spyM === id));
    if (activeLink) moveIndicator(activeLink); else hideIndicator();
  };

  if (sections.length) {
    const spy = new IntersectionObserver((entries) => {
      // Pick the entry closest to the top of the viewport that is intersecting
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id);
    }, {
      rootMargin: '-30% 0px -55% 0px',
      threshold: 0,
    });
    sections.forEach(s => spy.observe(s));
  }

  // Reposition indicator on resize
  window.addEventListener('resize', () => {
    const active = navLinks.find(l => l.classList.contains('is-active'));
    if (active) moveIndicator(active);
  });

  // Hover preview indicator
  navLinks.forEach(l => {
    l.addEventListener('mouseenter', () => moveIndicator(l));
    l.addEventListener('mouseleave', () => {
      const active = navLinks.find(x => x.classList.contains('is-active'));
      if (active) moveIndicator(active); else hideIndicator();
    });
  });

  // Mobile menu toggle
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = !menu.classList.contains('hidden');
      menu.classList.toggle('hidden', open);
      toggle.setAttribute('aria-expanded', String(!open));
      iMenu.classList.toggle('hidden', !open);
      iClose.classList.toggle('hidden', open);
    });
    mobLinks.forEach(l => l.addEventListener('click', () => {
      menu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
      iMenu.classList.remove('hidden');
      iClose.classList.add('hidden');
    }));
  }
})();

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

/* ===========================================================
   Contact form (Formspree AJAX)
   =========================================================== */
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const success = document.getElementById('contactSuccess');
  const btn = document.getElementById('contactSubmit');
  const btnText = document.getElementById('contactBtnText');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.action.includes('YOUR_FORM_ID')) {
      btnText.textContent = 'Demo mode � wire up Formspree';
      btn.disabled = true;
      btn.style.opacity = '0.6';
      return;
    }
    btn.disabled = true;
    btnText.textContent = 'Sending�';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        form.classList.add('hidden');
        success.classList.remove('hidden');
      } else { throw new Error('send failed'); }
    } catch (err) {
      btnText.textContent = 'Couldn\u2019t send \u2014 try WhatsApp instead';
      btn.style.background = '#f87171';
    }
  });
})();
