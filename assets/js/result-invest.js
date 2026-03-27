/* ── result-invest.js ───────────────────────────────────────── */
'use strict';

// ── Constants ─────────────────────────────────────────────────
const STORE_KEY = 'invest_results_v1';

const RESULT_TYPES = {
  rappel_anticipe: { label: 'Rappel anticipé',  icon: 'fa-bell',           band: 'type-rappel',   pill: 'rappel'   },
  coupon_paye:     { label: 'Coupon payé',        icon: 'fa-coins',          band: 'type-coupon',   pill: 'coupon'   },
  maturity:        { label: 'Maturité',           icon: 'fa-flag-checkered', band: 'type-maturity', pill: 'maturity' },
  perte_capital:   { label: 'Perte partielle',    icon: 'fa-exclamation',    band: 'type-perte',    pill: 'perte'    },
};

// ── Utilities ─────────────────────────────────────────────────
const fmt        = iso => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
const fmtEur     = n   => new Intl.NumberFormat('fr-FR', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n);
const fmtPct     = n   => (n >= 0 ? '+' : '') + n.toFixed(3) + ' %';
const uid        = ()  => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/**
 * Returns { months, days, totalDays, totalMonths } between two ISO date strings.
 * Uses calendar months first, then remaining days.
 */
function computeDuration(startISO, endISO) {
  if (!startISO || !endISO) return null;
  const start = new Date(startISO + 'T00:00:00');
  const end   = new Date(endISO   + 'T00:00:00');
  if (isNaN(start) || isNaN(end) || end <= start) return null;

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const pivot = new Date(start);
  pivot.setMonth(pivot.getMonth() + months);
  let days = Math.round((end - pivot) / 86400000);
  if (days < 0) { months--; pivot.setMonth(pivot.getMonth() - 1); days = Math.round((end - pivot) / 86400000); }

  const totalDays   = Math.round((end - start) / 86400000);
  const totalMonths = totalDays / 30.4375;
  return { months, days, totalDays, totalMonths };
}


/** Human-readable duration string */
function fmtDuration(dur) {
  if (!dur) return '—';
  const parts = [];
  if (dur.months > 0) parts.push(`${dur.months} mois`);
  if (dur.days   > 0) parts.push(`${dur.days} j`);
  return parts.length ? parts.join(' ') + ` (${dur.totalDays} j)` : `${dur.totalDays} j`;
}

// ── Persistence ───────────────────────────────────────────────
function loadResults() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}

function saveResults(results) {
  localStorage.setItem(STORE_KEY, JSON.stringify(results));
}

// ── Seed data — first confirmed result from Barclays / Athena ─
const SEED_RESULT = {
  id:              'seed_athena_barclays_2026',
  type:            'rappel_anticipe',
  productName:     'Athena on SAN FP, MC FP and STMPA FP',
  isin:            'XS3111146380',
  issuer:          'Barclays Bank PLC',
  startDate:       '2025-10-14',   // date d'émission du produit
  observationDate: '2026-03-23',
  paymentDate:     '2026-04-08',
  totalPct:        103.675,
  couponPct:       3.675,
  capital:         248000,
  currency:        'EUR',
  notes:           'Produit rappelé par anticipation à T1 (6 mois). Barrière autocall 100% atteinte sur les 3 sous-jacents (SAN.PA, MC.PA, STMPA.PA). Coupon mémoire unique de 3,675% payé.',
  createdAt:       '2026-03-27T00:00:00.000Z',
};

function ensureSeed() {
  let results = loadResults();
  const idx = results.findIndex(r => r.id === SEED_RESULT.id);
  if (idx === -1) {
    results.unshift(SEED_RESULT);
  } else if (!results[idx].startDate) {
    // Patch existing seed with startDate (migration)
    results[idx] = { ...results[idx], startDate: SEED_RESULT.startDate };
  }
  saveResults(results);
  return loadResults();
}

// ── KPI Summary ───────────────────────────────────────────────
function computeKPIs(results) {
  const totalCapital  = results.reduce((s, r) => s + (r.capital || 0), 0);
  const totalGain     = results.reduce((s, r) => {
    const gross = r.capital * (r.totalPct / 100);
    return s + (gross - r.capital);
  }, 0);
  const avgReturn     = results.length
    ? results.reduce((s, r) => s + r.couponPct, 0) / results.length
    : 0;
  return { totalCapital, totalGain, avgReturn, count: results.length };
}

// ── Render KPI bar ────────────────────────────────────────────
function renderKPIs(results) {
  const kpi = computeKPIs(results);
  document.getElementById('kpi-count').textContent    = kpi.count;
  document.getElementById('kpi-capital').textContent  = fmtEur(kpi.totalCapital);
  document.getElementById('kpi-gain').textContent     = (kpi.totalGain >= 0 ? '+' : '') + fmtEur(kpi.totalGain);
  document.getElementById('kpi-avgret').textContent   = fmtPct(kpi.avgReturn);

  const gainEl = document.getElementById('kpi-gain');
  gainEl.className = 'kpi-value ' + (kpi.totalGain >= 0 ? 'green' : 'kpi-value');
}

// ── Render board ──────────────────────────────────────────────
function renderBoard(filter = 'all') {
  let results = loadResults();
  if (filter !== 'all') results = results.filter(r => r.type === filter);

  renderKPIs(loadResults()); // always use full list for KPIs

  const board = document.getElementById('results-board');
  if (!results.length) {
    board.innerHTML = `<div class="empty-state">
      <i class="fas fa-folder-open"></i>
      <h3>Aucun résultat enregistré</h3>
      <p>Cliquez sur <strong>+ Nouveau résultat</strong> pour saisir votre premier événement de produit structuré.</p>
    </div>`;
    return;
  }

  board.innerHTML = results.map(r => buildCard(r)).join('');
}

// ── Build single card HTML ─────────────────────────────────────
function buildCard(r) {
  const typeMeta  = RESULT_TYPES[r.type] || RESULT_TYPES.rappel_anticipe;
  const grossAmt  = r.capital * (r.totalPct / 100);
  const gain      = grossAmt - r.capital;
  const isNeg     = gain < 0;
  const dur           = computeDuration(r.startDate, r.observationDate);
  const gainPerMonth  = (dur && dur.totalMonths > 0) ? gain / dur.totalMonths : null;

  return `
  <div class="result-card" data-id="${r.id}">
    <div class="card-band ${typeMeta.band}">
      <div class="card-band-icon"><i class="fas ${typeMeta.icon}"></i></div>
      <div>
        <div>${typeMeta.label}</div>
        <div style="font-size:0.6rem;opacity:0.7;font-weight:500;margin-top:2px;">
          ${r.isin ? 'ISIN: ' + r.isin : ''}
        </div>
      </div>
      <div class="total-badge">
        <div class="total-label">Total payé</div>
        <div class="total-value">${r.totalPct.toFixed(3)}%*</div>
      </div>
    </div>

    <div class="card-body">
      <div class="card-product-name">${r.productName}</div>

      <div class="card-meta-grid">
        <div class="card-meta-item">
          <span class="card-meta-label">Émetteur</span>
          <span class="card-meta-value">${r.issuer || '—'}</span>
        </div>
        <div class="card-meta-item">
          <span class="card-meta-label">Devise</span>
          <span class="card-meta-value">${r.currency || 'EUR'}</span>
        </div>
        <div class="card-meta-item">
          <span class="card-meta-label">Date d'observation</span>
          <span class="card-meta-value">${fmt(r.observationDate)}</span>
        </div>
        <div class="card-meta-item">
          <span class="card-meta-label">Date de paiement</span>
          <span class="card-meta-value" style="color:#2563eb;">${fmt(r.paymentDate)}</span>
        </div>
        <div class="card-meta-item">
          <span class="card-meta-label">Durée de détention</span>
          <span class="card-meta-value" style="color:#7c3aed;">${dur ? fmtDuration(dur) : '—'}</span>
        </div>
        <div class="card-meta-item">
          <span class="card-meta-label">Rendement / mois</span>
          <span class="card-meta-value" style="color:#d97706;">${gainPerMonth !== null ? (gainPerMonth >= 0 ? '+' : '') + fmtEur(gainPerMonth) + ' / ' + fmtDuration(dur) : '—'}</span>
        </div>
        <div class="card-meta-item">
          <span class="card-meta-label">Coupon versé</span>
          <span class="card-meta-value" style="color:#059669;">${fmtPct(r.couponPct)}</span>
        </div>
        <div class="card-meta-item">
          <span class="card-meta-label">Rendement brut</span>
          <span class="card-meta-value">${r.totalPct.toFixed(3)}%</span>
        </div>
      </div>

      <div class="card-allocation">
        <span class="card-allocation-label">Allocation</span>
        <span class="card-allocation-amount">${r.currency || 'EUR'} ${new Intl.NumberFormat('fr-FR').format(r.capital)}</span>
      </div>

      <div class="card-gain ${isNeg ? 'negative' : ''}">
        <span class="card-gain-label">${isNeg ? 'Perte nette' : 'Gain net'}</span>
        <span class="card-gain-amount">${isNeg ? '' : '+'}${fmtEur(gain)} (${r.couponPct.toFixed(3)}%)</span>
      </div>

      ${r.notes ? `<div style="font-size:0.72rem;color:#475569;line-height:1.5;background:#f8fafc;border-radius:6px;padding:0.5rem 0.6rem;">${r.notes}</div>` : ''}

      <div class="card-footnote">
        * Taux de Rendement bruts calculés sur la base de cette valeur nominale. Pour plus d'informations, veuillez vous référer à la documentation de ce produit.<br>
        Enregistré le ${new Date(r.createdAt).toLocaleDateString('fr-FR')}.
      </div>
    </div>

    <div class="card-actions">
      <button class="btn-card-action" onclick="openEditModal('${r.id}')">
        <i class="fas fa-pen"></i> Modifier
      </button>
      <button class="btn-card-action danger" onclick="deleteResult('${r.id}')">
        <i class="fas fa-trash-alt"></i> Supprimer
      </button>
    </div>
  </div>`;
}

// ── Modal handling ────────────────────────────────────────────
function openModal(result = null) {
  const modal = document.getElementById('modal-overlay');
  const form  = document.getElementById('result-form');
  const title = document.getElementById('modal-title');

  form.reset();
  document.getElementById('form-id').value = result ? result.id : '';

  if (result) {
    title.textContent = 'Modifier le résultat';
    document.getElementById('form-type').value            = result.type;
    document.getElementById('form-product-name').value    = result.productName;
    document.getElementById('form-isin').value            = result.isin || '';
    document.getElementById('form-issuer').value          = result.issuer || '';
    document.getElementById('form-start-date').value      = result.startDate || '';
    document.getElementById('form-obs-date').value        = result.observationDate;
    document.getElementById('form-pay-date').value        = result.paymentDate;
    document.getElementById('form-total-pct').value       = result.totalPct;
    document.getElementById('form-coupon-pct').value      = result.couponPct;
    document.getElementById('form-capital').value         = result.capital;
    document.getElementById('form-currency').value        = result.currency || 'EUR';
    document.getElementById('form-notes').value           = result.notes || '';
  } else {
    title.textContent = 'Nouveau résultat';
    document.getElementById('form-type').value = 'rappel_anticipe';
    document.getElementById('form-currency').value = 'EUR';
  }
  updateDurationPreview();

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function openEditModal(id) {
  const results = loadResults();
  const result  = results.find(r => r.id === id);
  if (result) openModal(result);
}

function deleteResult(id) {
  if (!confirm('Supprimer ce résultat ?')) return;
  const results = loadResults().filter(r => r.id !== id);
  saveResults(results);
  renderBoard(currentFilter());
}

// ── Form submit ───────────────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();
  const id      = document.getElementById('form-id').value;
  const results = loadResults();

  const entry = {
    id:              id || uid(),
    type:            document.getElementById('form-type').value,
    productName:     document.getElementById('form-product-name').value.trim(),
    isin:            document.getElementById('form-isin').value.trim(),
    issuer:          document.getElementById('form-issuer').value.trim(),
    startDate:       document.getElementById('form-start-date').value || null,
    observationDate: document.getElementById('form-obs-date').value,
    paymentDate:     document.getElementById('form-pay-date').value,
    totalPct:        parseFloat(document.getElementById('form-total-pct').value),
    couponPct:       parseFloat(document.getElementById('form-coupon-pct').value),
    capital:         parseFloat(document.getElementById('form-capital').value),
    currency:        document.getElementById('form-currency').value,
    notes:           document.getElementById('form-notes').value.trim(),
    createdAt:       id ? (results.find(r => r.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
  };

  if (isNaN(entry.totalPct) || isNaN(entry.couponPct) || isNaN(entry.capital)) {
    alert('Veuillez renseigner les champs numériques (capital, coupons).');
    return;
  }

  if (id) {
    const idx = results.findIndex(r => r.id === id);
    if (idx >= 0) results[idx] = entry; else results.unshift(entry);
  } else {
    results.unshift(entry);
  }

  saveResults(results);
  closeModal();
  renderBoard(currentFilter());
}

// ── Filter state ──────────────────────────────────────────────
function currentFilter() {
  const active = document.querySelector('.filter-btn.active');
  return active ? active.dataset.filter : 'all';
}

function setFilter(btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBoard(btn.dataset.filter);
}

// ── Live duration preview in modal ───────────────────────────
function updateDurationPreview() {
  const preview  = document.getElementById('form-duration-preview');
  if (!preview) return;
  const start    = document.getElementById('form-start-date').value;
  const obsDate  = document.getElementById('form-obs-date').value;
  const couponEl = document.getElementById('form-coupon-pct');
  const coupon   = parseFloat(couponEl?.value);
  const dur      = computeDuration(start, obsDate);
  if (dur) {
    const capital = parseFloat(document.getElementById('form-capital')?.value);
    const gain    = (!isNaN(coupon) && !isNaN(capital)) ? capital * (coupon / 100) : null;
    const gpm     = (gain !== null && dur.totalMonths > 0) ? gain / dur.totalMonths : null;
    preview.textContent = `⏱ ${fmtDuration(dur)}${gpm !== null ? '  ·  +' + fmtEur(gpm) + ' / mois' : ''}`;
  } else {
    preview.textContent = '';
  }
}

// ── Close on overlay click ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ensureSeed();
  renderBoard();

  document.getElementById('result-form').addEventListener('submit', handleFormSubmit);

  // Live duration preview
  ['form-start-date', 'form-obs-date', 'form-coupon-pct', 'form-capital'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateDurationPreview);
  });

  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});
