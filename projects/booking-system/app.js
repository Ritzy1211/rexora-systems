// Vendora — booking system demo
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

// ---------- State ----------
const state = {
  step: 1,
  service: null,
  staff: null,
  date: null,
  time: null,
  customer: { name: '', email: '', phone: '', notes: '' }
};

const SERVICES = [
  { id: 's1', name: 'Signature Haircut', desc: 'Consultation, cut, wash & style', duration: 45, price: 55, icon: '✂️' },
  { id: 's2', name: 'Color & Highlights', desc: 'Full color or balayage with treatment', duration: 120, price: 180, icon: '🎨' },
  { id: 's3', name: 'Beard Trim & Shave', desc: 'Hot towel, line-up, finish', duration: 30, price: 35, icon: '🪒' },
  { id: 's4', name: 'Bridal Package', desc: 'Trial run + day-of styling', duration: 180, price: 320, icon: '💍' },
  { id: 's5', name: 'Deep Conditioning', desc: 'Treatment, mask, scalp massage', duration: 60, price: 75, icon: '💆' },
  { id: 's6', name: 'Kids Cut (under 12)', desc: 'Quick, gentle, fun', duration: 30, price: 28, icon: '🧒' }
];

const STAFF = [
  { id: 't1', name: 'Maya R.', role: 'Senior Stylist', initials: 'MR', rating: 4.9, jobs: 1240 },
  { id: 't2', name: 'Daniel K.', role: 'Color Specialist', initials: 'DK', rating: 4.8, jobs: 890 },
  { id: 't3', name: 'Aisha O.', role: 'Master Stylist', initials: 'AO', rating: 5.0, jobs: 2100 },
  { id: 't4', name: 'Leo P.', role: 'Barber', initials: 'LP', rating: 4.9, jobs: 1560 }
];

const TIMES = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
// fake "taken" slots that vary per date
const takenSlots = (dateStr) => {
  const seed = dateStr.split('-').reduce((a, b) => a + parseInt(b), 0);
  const taken = new Set();
  for (let i = 0; i < 5; i++) taken.add(TIMES[(seed * (i + 3)) % TIMES.length]);
  return taken;
};

// ---------- Toast ----------
function toast(msg) {
  const t = $('#toast');
  $('#toastMsg').textContent = msg;
  t.classList.add('is-show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('is-show'), 2400);
}

// ---------- View switching ----------
function switchView(view) {
  $$('.view-tab').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  $('#customerView').classList.toggle('hidden', view !== 'customer');
  $('#dashboardView').classList.toggle('hidden', view !== 'dashboard');
}

// ---------- Step rendering ----------
function setStep(n) {
  state.step = n;
  $$('.step').forEach((el, i) => {
    el.classList.toggle('is-active', i + 1 === n);
    el.classList.toggle('is-done', i + 1 < n);
  });
  $$('.step-panel').forEach((el, i) => el.classList.toggle('hidden', i + 1 !== n));
  window.scrollTo({ top: $('#bookingApp').offsetTop - 80, behavior: 'smooth' });
  updateSummary();
}

function updateSummary() {
  const s = state.service;
  $('#sumService').textContent = s ? s.name : '—';
  $('#sumDuration').textContent = s ? `${s.duration} min` : '—';
  $('#sumStaff').textContent = state.staff ? state.staff.name : '—';
  $('#sumDate').textContent = state.date ? formatDate(state.date) : '—';
  $('#sumTime').textContent = state.time || '—';
  const total = s ? s.price : 0;
  const deposit = total ? Math.round(total * 0.25) : 0;
  $('#sumTotal').textContent = total ? `$${total}` : '—';
  $('#sumDeposit').textContent = deposit ? `$${deposit}` : '—';
}

function formatDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ---------- Step 1: Services ----------
function renderServices() {
  const grid = $('#serviceGrid');
  grid.innerHTML = SERVICES.map(s => `
    <div class="service-card" data-id="${s.id}">
      <div class="service-icon text-2xl">${s.icon}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-3 mb-1">
          <h4 class="font-semibold text-white">${s.name}</h4>
          <div class="text-brandGreen font-semibold">$${s.price}</div>
        </div>
        <p class="text-xs text-gray-500 mb-2">${s.desc}</p>
        <div class="flex items-center gap-1.5 text-xs text-gray-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${s.duration} min
        </div>
      </div>
    </div>
  `).join('');
  grid.addEventListener('click', e => {
    const card = e.target.closest('.service-card');
    if (!card) return;
    state.service = SERVICES.find(s => s.id === card.dataset.id);
    $$('#serviceGrid .service-card').forEach(c => c.classList.toggle('is-selected', c === card));
    $('#step1Next').disabled = false;
  });
}

// ---------- Step 2: Staff ----------
function renderStaff() {
  const grid = $('#staffGrid');
  grid.innerHTML = `
    <div class="staff-card" data-id="any">
      <div class="staff-avatar" style="background:rgba(255,255,255,0.06);color:#cbd5e1;">?</div>
      <div class="font-semibold text-white text-sm mb-0.5">Any available</div>
      <div class="text-xs text-gray-500">Soonest opening</div>
    </div>
  ` + STAFF.map(t => `
    <div class="staff-card" data-id="${t.id}">
      <div class="staff-avatar">${t.initials}</div>
      <div class="font-semibold text-white text-sm mb-0.5">${t.name}</div>
      <div class="text-xs text-gray-500 mb-2">${t.role}</div>
      <div class="text-xs text-gray-400 flex items-center justify-center gap-1">
        <span class="text-yellow-400">★</span> ${t.rating} · ${t.jobs.toLocaleString()} jobs
      </div>
    </div>
  `).join('');
  grid.addEventListener('click', e => {
    const card = e.target.closest('.staff-card');
    if (!card) return;
    if (card.dataset.id === 'any') {
      state.staff = { id: 'any', name: 'Any available', initials: '?' };
    } else {
      state.staff = STAFF.find(t => t.id === card.dataset.id);
    }
    $$('#staffGrid .staff-card').forEach(c => c.classList.toggle('is-selected', c === card));
    $('#step2Next').disabled = false;
  });
}

// ---------- Step 3: Date & Time ----------
function renderCalendar() {
  const grid = $('#calGrid');
  const today = new Date();
  let html = '';
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 3);
    const num = d.getDate();
    const isSunday = d.getDay() === 0;
    html += `<div class="cal-day ${isSunday ? 'is-disabled' : ''}" data-date="${iso}">
      <span class="cal-dow">${dow}</span>
      <span class="cal-num">${num}</span>
    </div>`;
  }
  grid.innerHTML = html;
  grid.addEventListener('click', e => {
    const day = e.target.closest('.cal-day');
    if (!day || day.classList.contains('is-disabled')) return;
    state.date = day.dataset.date;
    state.time = null;
    $$('#calGrid .cal-day').forEach(d => d.classList.toggle('is-selected', d === day));
    renderTimes();
    $('#timeSection').classList.remove('hidden');
    $('#step3Next').disabled = true;
  });
}

function renderTimes() {
  if (!state.date) return;
  const taken = takenSlots(state.date);
  const grid = $('#timeGrid');
  const today = new Date(); today.setHours(0,0,0,0);
  const selected = new Date(state.date);
  const isToday = selected.toDateString() === today.toDateString();
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  let availableCount = 0;
  grid.innerHTML = TIMES.map(t => {
    const [h, m] = t.split(':').map(Number);
    const slotMin = h * 60 + m;
    const isPast = isToday && slotMin <= nowMin;
    const isTaken = taken.has(t);
    const cls = isPast ? 'is-past' : (isTaken ? 'is-taken' : '');
    if (!isPast && !isTaken) availableCount++;
    const title = isPast ? 'Time has already passed' : (isTaken ? 'Already booked — pick another time' : `${t} available`);
    return `<button class="time-slot ${cls}" data-time="${t}" data-state="${cls || 'open'}" title="${title}">${t}</button>`;
  }).join('');

  $('#availCount').textContent = availableCount;
  $('#availTotal').textContent = TIMES.length;
  $('#availBar').style.width = (availableCount / TIMES.length * 100) + '%';

  grid.onclick = e => {
    const btn = e.target.closest('.time-slot');
    if (!btn) return;
    if (btn.classList.contains('is-taken')) { toast('That slot is already booked — please pick another'); return; }
    if (btn.classList.contains('is-past')) { toast('That time has already passed today'); return; }
    state.time = btn.dataset.time;
    $$('#timeGrid .time-slot').forEach(b => b.classList.toggle('is-selected', b === btn));
    $('#step3Next').disabled = false;
  };
}

// ---------- Step 4: Customer info ----------
function bindCustomerForm() {
  const form = $('#customerForm');
  const validate = () => {
    state.customer.name = $('#cName').value.trim();
    state.customer.email = $('#cEmail').value.trim();
    state.customer.phone = $('#cPhone').value.trim();
    state.customer.notes = $('#cNotes').value.trim();
    const ok = state.customer.name.length > 1 && /\S+@\S+\.\S+/.test(state.customer.email) && state.customer.phone.length >= 7;
    $('#step4Next').disabled = !ok;
  };
  form.addEventListener('input', validate);
}

// ---------- Step 5: Payment ----------
function bindPayment() {
  $('#payBtn').addEventListener('click', () => {
    $('#payBtn').disabled = true;
    $('#payBtn').innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Processing…';
    setTimeout(() => {
      // Render confirmation
      const ref = 'VND-' + Math.floor(100000 + Math.random() * 900000);
      $('#confRef').textContent = ref;
      $('#confService').textContent = state.service.name;
      $('#confStaff').textContent = state.staff.name;
      $('#confDateTime').textContent = `${formatDate(state.date)} · ${state.time}`;
      $('#confEmail').textContent = state.customer.email;
      $('#confTotal').textContent = `$${state.service.price}`;
      $('#confDeposit').textContent = `$${Math.round(state.service.price * 0.25)}`;
      setStep(6);
      toast('Booking confirmed — receipt sent');
    }, 1600);
  });
}

// ---------- Reset ----------
function resetBooking() {
  state.step = 1; state.service = null; state.staff = null; state.date = null; state.time = null;
  state.customer = { name: '', email: '', phone: '', notes: '' };
  $$('.service-card, .staff-card, .cal-day, .time-slot').forEach(el => el.classList.remove('is-selected'));
  $('#customerForm').reset();
  $('#timeSection').classList.add('hidden');
  ['step1Next','step2Next','step3Next','step4Next'].forEach(id => $('#'+id).disabled = true);
  $('#payBtn').disabled = false;
  $('#payBtn').innerHTML = 'Pay deposit & confirm';
  setStep(1);
}

// ---------- Dashboard ----------
const TODAY_BOOKINGS = [
  { time: '09:00', client: 'Sarah Chen', service: 'Signature Haircut', staff: 'Maya R.', status: 'completed' },
  { time: '10:00', client: 'James Okafor', service: 'Beard Trim & Shave', staff: 'Leo P.', status: 'completed' },
  { time: '11:30', client: 'Rachel Adeyemi', service: 'Color & Highlights', staff: 'Daniel K.', status: 'confirmed' },
  { time: '13:00', client: 'Tunde B.', service: 'Signature Haircut', staff: 'Aisha O.', status: 'confirmed' },
  { time: '14:00', client: 'Emma L.', service: 'Bridal Package', staff: 'Aisha O.', status: 'confirmed' },
  { time: '15:30', client: 'Kayode A.', service: 'Beard Trim & Shave', staff: 'Leo P.', status: 'confirmed' },
  { time: '16:00', client: 'Priscilla N.', service: 'Deep Conditioning', staff: 'Maya R.', status: 'pending' },
  { time: '17:00', client: 'David M.', service: 'Signature Haircut', staff: 'Daniel K.', status: 'pending' }
];

function renderDashboard() {
  const list = $('#bookingList');
  list.innerHTML = TODAY_BOOKINGS.map(b => `
    <div class="booking-row">
      <div class="b-time">${b.time}</div>
      <div>
        <div class="text-white text-sm font-medium">${b.client}</div>
        <div class="text-xs text-gray-500">${b.service} · ${b.staff}</div>
      </div>
      <div class="b-status ${b.status}">${b.status[0].toUpperCase() + b.status.slice(1)}</div>
      <button class="text-gray-500 hover:text-white p-1" title="More">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
      </button>
    </div>
  `).join('');
}

// ---------- Reveal ----------
function initReveal() {
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('is-visible')), { threshold: 0.1 });
  $$('.reveal').forEach(el => io.observe(el));
}

// ---------- Mobile menu ----------
function initMobile() {
  const t = $('#mobileToggle'), m = $('#mobileMenu');
  if (!t) return;
  t.addEventListener('click', () => m.classList.toggle('hidden'));
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  initMobile();
  initReveal();
  renderServices();
  renderStaff();
  renderCalendar();
  bindCustomerForm();
  bindPayment();
  renderDashboard();

  // Step nav
  $('#step1Next').addEventListener('click', () => setStep(2));
  $('#step2Next').addEventListener('click', () => setStep(3));
  $('#step3Next').addEventListener('click', () => setStep(4));
  $('#step4Next').addEventListener('click', () => setStep(5));
  $$('.step-back').forEach(b => b.addEventListener('click', () => setStep(state.step - 1)));
  $('#bookAnother').addEventListener('click', resetBooking);

  // View tabs
  $$('.view-tab').forEach(b => b.addEventListener('click', () => switchView(b.dataset.view)));

  setStep(1);
});
