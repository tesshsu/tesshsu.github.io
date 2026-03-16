// ── Persist inputs to localStorage (all except Prix actuel) ──
const PERSIST_IDS = [
  's1-name','s1-init','s1-tick',
  's2-name','s2-init','s2-tick',
  's3-name','s3-init','s3-tick',
  'emission-date','final-date','initial-capital',
  'annual-coupon','cap-barrier','autocall-t1','autocall-t2','issuer'
];

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];

  // Version bump clears stale localStorage from older code
  const VERSION = '2';
  if (localStorage.getItem('invest_version') !== VERSION) {
    PERSIST_IDS.forEach(id => localStorage.removeItem('invest_' + id));
    localStorage.setItem('invest_version', VERSION);
  }

  // Restore saved values (only if non-empty)
  PERSIST_IDS.forEach(id => {
    const saved = localStorage.getItem('invest_' + id);
    if (saved !== null && saved !== '') document.getElementById(id).value = saved;
  });

  // Set sim-date to today (always fresh, not persisted)
  document.getElementById('sim-date').value = today;

  // Save on every change
  PERSIST_IDS.forEach(id => {
    document.getElementById(id).addEventListener('input', e => {
      localStorage.setItem('invest_' + id, e.target.value);
    });
  });
});

let perfChart = null;

// ── Utilities ──────────────────────────────────────────────
const fmt = d => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtEur = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const fmtPct = (n, digits = 2) => (n >= 0 ? '+' : '') + n.toFixed(digits) + '%';

function paymentDate(obsDate) {
  const d = new Date(obsDate);
  d.setDate(d.getDate() + 16);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d;
}

function obsSchedule(emDate, fnDate) {
  const list = [];
  const cur = new Date(emDate);
  const end = new Date(fnDate);
  cur.setMonth(cur.getMonth() + 3);
  while (cur <= end) { list.push(new Date(cur)); cur.setMonth(cur.getMonth() + 3); }
  // Ensure final observation is exactly the final date
  if (!list.length || list[list.length - 1].getTime() !== end.getTime()) {
    if (list.length && list[list.length - 1].getTime() !== end.getTime()) list.push(end);
    else if (!list.length) list.push(end);
  }
  return list;
}

// ── Fetch price from Yahoo Finance via allorigins proxy ────
async function fetchPrice(n) {
  const ticker = document.getElementById(`s${n}-tick`).value.trim();
  if (!ticker) { alert('Entrez un ticker Yahoo Finance (ex: MC.PA)'); return; }
  const icon = document.getElementById(`s${n}-icon`);
  icon.className = 'fas fa-spinner fa-spin';
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (!price) throw new Error('No price');
    document.getElementById(`s${n}-cur`).value = price.toFixed(2);
    icon.className = 'fas fa-check';
    setTimeout(() => { icon.className = 'fas fa-sync-alt'; }, 2500);
  } catch {
    icon.className = 'fas fa-times';
    setTimeout(() => { icon.className = 'fas fa-sync-alt'; }, 2500);
    alert(`Prix non disponible pour ${ticker}. Entrez-le manuellement.`);
  }
}

// ── Main calculation ───────────────────────────────────────
function calculate() {
  const stocks = [1, 2, 3].map(n => ({
    name:    document.getElementById(`s${n}-name`).value.trim() || `Stock ${n}`,
    initial: parseFloat(document.getElementById(`s${n}-init`).value),
    current: parseFloat(document.getElementById(`s${n}-cur`).value),
  })).filter(s => !isNaN(s.initial) && !isNaN(s.current) && s.initial > 0);

  if (!stocks.length) { alert('Veuillez renseigner au moins un sous-jacent (niveau initial + prix actuel).'); return; }

  const emDate     = new Date(document.getElementById('emission-date').value);
  const fnDate     = new Date(document.getElementById('final-date').value);
  const capital    = parseFloat(document.getElementById('initial-capital').value) || 248000;
  const annRate    = parseFloat(document.getElementById('annual-coupon').value) / 100;
  const capBarPct  = parseFloat(document.getElementById('cap-barrier').value) / 100;
  const acT1       = parseFloat(document.getElementById('autocall-t1').value) / 100;
  const acT2       = parseFloat(document.getElementById('autocall-t2').value) / 100;
  const issuer     = document.getElementById('issuer').value || '—';

  const qCoupon    = annRate / 4;
  const todayReal  = new Date();
  const simDateVal = document.getElementById('sim-date').value;
  const simDate    = simDateVal ? new Date(simDateVal) : new Date(todayReal);
  const years      = (fnDate - emDate) / (365.25 * 86400000);
  const simYears   = (simDate - emDate) / (365.25 * 86400000);

  // Per-stock metrics
  stocks.forEach(s => {
    s.perf       = (s.current - s.initial) / s.initial;
    s.capBarrier = s.initial * capBarPct;
    s.distBar    = (s.current - s.capBarrier) / s.capBarrier;
  });
  const worstPerf = Math.min(...stocks.map(s => s.perf));

  // ── Update header ──
  document.getElementById('display-capital').textContent      = fmtEur(capital);
  document.getElementById('display-product-name').textContent = `Athena sur ${stocks.map(s => s.name).join(' / ')}`;

  // ── Metric cards ──
  document.getElementById('r-coupon-rate').textContent  = `${(annRate * 100).toFixed(2)}% p.a.`;
  document.getElementById('r-quarter-coupon').textContent = `${(qCoupon * 100).toFixed(2)}%`;
  const simLabel = simDate < fnDate
    ? `Simulation : ${(simYears * 12).toFixed(0)} mois`
    : `Maturité : ${years.toFixed(0)} ans`;
  document.getElementById('r-maturity').textContent    = simLabel;
  document.getElementById('r-emission').textContent    = fmt(emDate);
  document.getElementById('r-simdate').textContent     = fmt(simDate);
  document.getElementById('r-final').textContent       = fmt(fnDate);
  document.getElementById('r-protection').textContent  = `${(capBarPct * 100).toFixed(0)}% Européenne`;
  document.getElementById('r-issuer').textContent      = issuer;

  const breached = stocks.some(s => s.current < s.capBarrier);
  const bStatus  = document.getElementById('r-barrier-status');
  bStatus.textContent  = breached ? '⚠️ FRANCHIE' : '✓ Sécurisé';
  bStatus.className    = breached ? 'font-semibold text-red-600' : 'font-semibold text-emerald-600';

  // ── Sous-jacents table ──
  const rowColors = ['bg-blue-50', 'bg-gray-50', 'bg-white'];
  document.getElementById('stocks-tbody').innerHTML = stocks.map((s, i) => {
    const pC = s.perf >= 0 ? 'text-emerald-600' : 'text-red-600';
    const dC = s.distBar > 0.2 ? 'text-emerald-600' : s.distBar > 0 ? 'text-yellow-600' : 'text-red-600';
    return `<tr class="border-b border-gray-100 ${rowColors[i]} hover:brightness-95">
      <td class="px-4 py-3 font-medium">${s.name}</td>
      <td class="px-4 py-3 text-right">${s.initial.toFixed(2)}</td>
      <td class="px-4 py-3 text-right font-semibold ${pC}">${fmtPct(s.perf * 100)}</td>
      <td class="px-4 py-3 text-right">${s.current.toFixed(2)}</td>
      <td class="px-4 py-3 text-right">${s.capBarrier.toFixed(2)}</td>
      <td class="px-4 py-3 text-right font-semibold ${dC}">${fmtPct(s.distBar * 100)}</td>
      <td class="px-4 py-3 text-right">${s.initial.toFixed(2)}</td>
    </tr>`;
  }).join('');

  // ── Chronologie ──
  const obs = obsSchedule(emDate, fnDate);
  let memCoupons = 0;
  let simQtrs = 0;
  let chronoHTML = '';

  obs.forEach((d, idx) => {
    const isFinal    = idx === obs.length - 1;
    const isReached  = d <= simDate;
    const isSimEdge  = isReached && (idx === obs.length - 1 || obs[idx + 1] > simDate);
    const acLevel    = idx === 0 ? acT1 : acT2;
    const payD       = paymentDate(d);
    memCoupons      += qCoupon;
    if (isReached) simQtrs++;

    let icon, rowBg, statut, statColor, amount;

    if (isReached && isFinal) {
      icon = '<i class="fas fa-flag-checkered text-purple-500 text-base"></i>';
      rowBg = 'bg-purple-50';
      statut = 'Maturité';
      statColor = 'text-purple-700 font-semibold';
      amount = `${(memCoupons * 100).toFixed(2)}%`;
    } else if (isReached) {
      icon = '<i class="fas fa-play-circle text-gray-400 text-base"></i>';
      rowBg = isSimEdge ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50';
      statut = isSimEdge ? '◀ Simulation' : 'Mémoire';
      statColor = isSimEdge ? 'text-blue-600 font-bold' : 'text-orange-500 font-medium';
      amount = `${(memCoupons * 100).toFixed(2)}%`;
    } else if (isFinal) {
      icon = '<i class="fas fa-flag-checkered text-purple-500 text-base"></i>';
      rowBg = 'bg-purple-50';
      statut = 'Maturité';
      statColor = 'text-purple-700 font-semibold';
      amount = `${(memCoupons * 100).toFixed(2)}%`;
    } else {
      icon = '<i class="fas fa-play-circle text-blue-500 text-base"></i>';
      rowBg = '';
      statut = '—';
      statColor = 'text-gray-400';
      amount = `${(memCoupons * 100).toFixed(2)}%`;
    }

    chronoHTML += `<tr class="border-b border-gray-100 ${rowBg} hover:bg-gray-50">
      <td class="px-2 py-1.5 text-center">${icon}</td>
      <td class="px-2 py-1.5">${fmt(d)}</td>
      <td class="px-2 py-1.5">${fmt(payD)}</td>
      <td class="px-2 py-1.5 text-right">${(acLevel * 100).toFixed(0)}%</td>
      <td class="px-2 py-1.5 text-right">N/A</td>
      <td class="px-2 py-1.5 ${statColor}">${statut}</td>
      <td class="px-2 py-1.5 text-right font-medium">${amount}</td>
    </tr>`;
  });
  document.getElementById('chrono-tbody').innerHTML = chronoHTML;

  // ── Summary — based on simDate cutoff ──
  const totalQtrs     = obs.length;
  const totalCouponR  = qCoupon * totalQtrs;
  const simCouponR    = qCoupon * simQtrs;
  const totalCouponE  = capital * totalCouponR;
  const simCouponE    = capital * simCouponR;
  const totalReturnE  = capital + totalCouponE;
  const simReturnE    = capital + simCouponE;
  const annualReturn  = simQtrs > 0 && simYears > 0
    ? simCouponR / simYears
    : totalCouponR / years;

  const simLabel2 = simDate < fnDate ? `à la simulation (${fmt(simDate)})` : 'à maturité';
  document.getElementById('sum-capital').textContent = fmtEur(capital);
  document.getElementById('sum-coupons').textContent = `${fmtEur(simCouponE)} (${(simCouponR * 100).toFixed(1)}%) ${simLabel2}`;
  document.getElementById('sum-total').textContent   = `${fmtEur(simReturnE)} (${fmtPct(simCouponR * 100)})`;
  document.getElementById('sum-annual').textContent  = `~${(annualReturn * 100).toFixed(2)}% / an`;

  // Scenarios
  const fav2  = capital * (1 + 2 * qCoupon);
  const wRet  = capital * (1 + worstPerf);
  document.getElementById('scen-fav').textContent = `${fmtEur(fav2)} (${fmtPct(2 * qCoupon * 100)} en 6 mois)`;
  document.getElementById('scen-neu').textContent = `${fmtEur(totalReturnE)} (${fmtPct(totalCouponR * 100)} en ${years.toFixed(0)} ans)`;
  document.getElementById('scen-def').textContent = `${fmtEur(wRet)} (${fmtPct(worstPerf * 100)} worst-of)`;

  // ── Chart ──
  renderChart(stocks, emDate, fnDate, capBarPct, acT2, simDate);

  // Show results
  document.getElementById('results').classList.remove('hidden');
  document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// ── Chart ──────────────────────────────────────────────────
function renderChart(stocks, emDate, fnDate, capBarPct, acLevel, simDate) {
  const ctx = document.getElementById('perf-chart').getContext('2d');
  if (perfChart) { perfChart.destroy(); perfChart = null; }

  const endD = simDate < fnDate ? simDate : fnDate;
  const labels  = [];
  const cur     = new Date(emDate);
  while (cur <= endD) {
    labels.push(fmt(new Date(cur)));
    cur.setMonth(cur.getMonth() + 1);
  }
  const n = labels.length;

  const palette = [
    { border: '#93c5fd', bg: 'rgba(147,197,253,0.15)' },
    { border: '#fcd34d', bg: 'rgba(252,211,77,0.15)'  },
    { border: '#f9a8d4', bg: 'rgba(249,168,212,0.15)' },
  ];

  const datasets = stocks.map((s, i) => ({
    label: s.name,
    data: labels.map((_, j) => parseFloat((100 + s.perf * 100 * (j / (n - 1 || 1))).toFixed(2))),
    borderColor: palette[i].border,
    backgroundColor: palette[i].bg,
    borderWidth: 2,
    pointRadius: 0,
    tension: 0.4,
    fill: false,
  }));

  datasets.push(
    { label: `Barrière capital (${(capBarPct * 100).toFixed(0)}%)`, data: labels.map(() => capBarPct * 100),
      borderColor: 'rgba(239,68,68,0.7)', borderDash: [6,3], borderWidth: 1.5, pointRadius: 0, fill: false },
    { label: `Autocall (${(acLevel * 100).toFixed(0)}%)`, data: labels.map(() => acLevel * 100),
      borderColor: 'rgba(59,130,246,0.7)', borderDash: [6,3], borderWidth: 1.5, pointRadius: 0, fill: false },
    { label: 'Prix vente (100%)', data: labels.map(() => 100),
      borderColor: 'rgba(0,0,0,0.5)', borderDash: [3,3], borderWidth: 1.5, pointRadius: 0, fill: false }
  );

  perfChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 10 } } },
      },
      scales: {
        x: { ticks: { maxTicksLimit: 8, font: { size: 10 } } },
        y: { ticks: { callback: v => v + '%', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
      }
    }
  });
}
