/* Christian Jewish Believers — demo interactions */

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

// ════════ Mobile menu ════════
const mobileToggle = $('#mobileToggle');
const mobileMenu = $('#mobileMenu');
if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden', open);
    mobileToggle.setAttribute('aria-expanded', String(!open));
  });
}

// ════════ Reveal on scroll ════════
const reveals = $$('.reveal');
if (reveals.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => io.observe(el));
}

// ════════ Toast ════════
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  $('#toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2400);
}

// ════════ Live viewer counter (home) ════════
const liveCounter = $('#liveCount');
if (liveCounter) {
  let n = 412;
  setInterval(() => {
    n += Math.floor(Math.random() * 5) - 2;
    if (n < 380) n = 380;
    if (n > 460) n = 460;
    liveCounter.textContent = n.toLocaleString();
  }, 2200);
}

// ════════ Newsletter ════════
const newsForm = $('#newsletterForm');
if (newsForm) {
  newsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsForm.querySelector('input[type="email"]').value.trim();
    if (!email) return;
    newsForm.reset();
    toast('Thank you — you\'re subscribed.');
  });
}

// ════════ SERMONS PAGE ════════
const sermonGrid = $('#sermonGrid');
if (sermonGrid) {
  const sermons = [
    { title: 'Walking In Purpose',           speaker: 'Pastor M. Owusu',  series: 'Identity', date: 'May 4, 2026',  duration: '38:14', views: '1.2k' },
    { title: 'The Power of Covenant',        speaker: 'Pastor M. Owusu',  series: 'Foundations', date: 'Apr 27, 2026', duration: '42:08', views: '986' },
    { title: 'Roots of Faith — Part III',    speaker: 'Rabbi D. Levi',    series: 'Roots',    date: 'Apr 20, 2026', duration: '51:22', views: '2.1k' },
    { title: 'Hearing God in the Silence',   speaker: 'Pastor M. Owusu',  series: 'Spiritual Life', date: 'Apr 13, 2026', duration: '36:45', views: '1.8k' },
    { title: 'A House of Prayer',            speaker: 'Sister R. Cohen',  series: 'Prayer',   date: 'Apr 6, 2026',  duration: '29:50', views: '744' },
    { title: 'Yeshua the Cornerstone',       speaker: 'Rabbi D. Levi',    series: 'Roots',    date: 'Mar 30, 2026', duration: '47:11', views: '3.4k' },
    { title: 'Faith That Works',             speaker: 'Pastor M. Owusu',  series: 'Foundations', date: 'Mar 23, 2026', duration: '40:02', views: '1.0k' },
    { title: 'The Festivals of the Lord',    speaker: 'Rabbi D. Levi',    series: 'Feasts',   date: 'Mar 16, 2026', duration: '55:18', views: '2.7k' },
    { title: 'Belonging to the Family',      speaker: 'Sister R. Cohen',  series: 'Identity', date: 'Mar 9, 2026',  duration: '33:40', views: '892' },
  ];

  let activeFilter = 'All';
  let searchQuery = '';

  function render() {
    const filtered = sermons.filter(s =>
      (activeFilter === 'All' || s.series === activeFilter) &&
      (!searchQuery || (s.title + ' ' + s.speaker).toLowerCase().includes(searchQuery))
    );
    if (!filtered.length) {
      sermonGrid.innerHTML = `<div class="col-span-full text-center text-gray-500 py-16 text-sm">No sermons match your search.</div>`;
      return;
    }
    sermonGrid.innerHTML = filtered.map(s => `
      <article class="sermon-card reveal">
        <div class="sermon-thumb">
          <div class="sermon-play"></div>
          <div class="sermon-duration">${s.duration}</div>
        </div>
        <div class="p-5">
          <span class="sermon-tag">${s.series}</span>
          <h3 class="font-display text-lg text-white font-semibold mt-3 leading-snug">${s.title}</h3>
          <div class="text-xs text-gray-500 mt-2">${s.speaker}</div>
          <div class="flex items-center justify-between mt-4 text-xs text-gray-500">
            <span>${s.date}</span>
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              ${s.views}
            </span>
          </div>
        </div>
      </article>
    `).join('');
    // re-observe newly added reveals
    $$('.sermon-card.reveal').forEach(el => {
      el.classList.add('is-visible');
    });
    // make cards clickable
    $$('.sermon-card').forEach((card, i) => {
      card.addEventListener('click', () => openPlayer(filtered[i]));
    });
  }

  // Filters
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  $('#sermonSearch')?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    render();
  });

  // Player modal
  function openPlayer(s) {
    $('#playerTitle').textContent = s.title;
    $('#playerMeta').textContent = `${s.speaker} · ${s.series} · ${s.date}`;
    $('#playerModal').classList.add('show');
  }
  $('#playerModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'playerModal' || e.target.dataset.closePlayer !== undefined) {
      $('#playerModal').classList.remove('show');
    }
  });

  render();
}

// ════════ GIVE PAGE ════════
const giveForm = $('#giveForm');
if (giveForm) {
  let amount = 100;
  let fund = 'General Fund';
  let frequency = 'one-time';

  const amountField = $('#amountValue');
  const summaryAmount = $('#summaryAmount');
  const summaryFund = $('#summaryFund');
  const summaryFreq = $('#summaryFreq');
  const submitAmount = $('#submitAmount');

  function updateSummary() {
    amountField.value = amount;
    summaryAmount.textContent = '$' + amount.toLocaleString();
    summaryFund.textContent = fund;
    summaryFreq.textContent = frequency === 'monthly' ? 'Monthly recurring' : 'One-time gift';
    submitAmount.textContent = '$' + amount.toLocaleString();
  }

  // Amount chips
  $$('.amount-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.amount-chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      amount = Number(chip.dataset.amount);
      updateSummary();
    });
  });

  // Custom input
  amountField.addEventListener('input', () => {
    const v = Number(amountField.value);
    if (v > 0) {
      amount = v;
      $$('.amount-chip').forEach(c => c.classList.remove('is-active'));
      summaryAmount.textContent = '$' + amount.toLocaleString();
      submitAmount.textContent = '$' + amount.toLocaleString();
    }
  });

  // Fund pills
  $$('.fund-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('.fund-pill').forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      fund = pill.dataset.fund;
      updateSummary();
    });
  });

  // Frequency
  $$('input[name="freq"]').forEach(r => {
    r.addEventListener('change', () => {
      frequency = r.value;
      updateSummary();
    });
  });

  updateSummary();

  // Submit → 3-stage flow: form → processing → success
  giveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (amount <= 0) { toast('Please enter an amount'); return; }

    $('#giveStep1').classList.add('hidden');
    $('#giveStep2').classList.remove('hidden');

    setTimeout(() => {
      $('#giveStep2').classList.add('hidden');
      $('#giveStep3').classList.remove('hidden');
      $('#successAmount').textContent = '$' + amount.toLocaleString();
      $('#successFund').textContent = fund;
      $('#successFreq').textContent = frequency === 'monthly' ? 'monthly' : 'one-time';
      $('#receiptId').textContent = 'CJB-' + Math.floor(Math.random() * 900000 + 100000);
    }, 1800);
  });

  // "Give again" button
  $('#giveAgain')?.addEventListener('click', () => {
    $('#giveStep3').classList.add('hidden');
    $('#giveStep1').classList.remove('hidden');
    giveForm.reset();
  });
}
