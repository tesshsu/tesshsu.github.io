// ── Persist inputs to localStorage ──────────────────────────
const PERSIST_IDS = [
  's1-name','s1-init','s1-cur','s1-tick',
  's2-name','s2-init','s2-cur','s2-tick',
  's3-name','s3-init','s3-cur','s3-tick',
  'emission-date','obs-start-date','final-date','initial-capital',
  'annual-coupon','cap-barrier','autocall-t1','autocall-t2','issuer'
];

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];

  // Version bump clears stale form values (NOT price history cache)
  const VERSION = '8';
  if (localStorage.getItem('invest_version') !== VERSION) {
    PERSIST_IDS.forEach(id => localStorage.removeItem('invest_' + id));
    localStorage.setItem('invest_version', VERSION);
  }

  PERSIST_IDS.forEach(id => {
    const saved = localStorage.getItem('invest_' + id);
    if (saved !== null && saved !== '') document.getElementById(id).value = saved;
  });

  document.getElementById('sim-date').value = today;

  PERSIST_IDS.forEach(id => {
    document.getElementById(id).addEventListener('input', e => {
      localStorage.setItem('invest_' + id, e.target.value);
    });
  });

  // Refresh cache badges on ticker change
  [1, 2, 3].forEach(n => {
    document.getElementById(`s${n}-tick`).addEventListener('input', () => updateCacheStatus(n));
    updateCacheStatus(n);
  });

  // Sync "Investissement total" header input ↔ Capital initial field
  const capDisplay = document.getElementById('display-capital');
  const capInput   = document.getElementById('initial-capital');
  capDisplay.value = capInput.value;
  capDisplay.addEventListener('input', () => {
    capInput.value = capDisplay.value;
    localStorage.setItem('invest_initial-capital', capDisplay.value);
  });
  capDisplay.addEventListener('change', () => {
    if (!document.getElementById('results').classList.contains('hidden')) calculate();
  });
  capInput.addEventListener('input', () => { capDisplay.value = capInput.value; });
});

let perfChart = null;

// ── Utilities ────────────────────────────────────────────────
const fmt     = d => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtEur  = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const fmtPct  = (n, digits = 2) => (n >= 0 ? '+' : '') + n.toFixed(digits) + '%';
const toISO   = d => d.toISOString().split('T')[0];

function paymentDate(obsDate) {
  const d = new Date(obsDate);
  let biz = 0;
  while (biz < 5) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) biz++;
  }
  return d;
}

function nextBizDay(date) {
  const d = new Date(date);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d;
}

function obsSchedule(firstObsDate, fnDate) {
  // Quarterly from firstObsDate; each date is rolled to the next business day.
  // The fnDate (maturity) is always appended if not already the last entry.
  const list = [];
  const cur  = new Date(firstObsDate);
  const end  = new Date(fnDate);
  while (cur <= end) {
    list.push(nextBizDay(new Date(cur)));
    cur.setMonth(cur.getMonth() + 3);
  }
  const adjEnd = nextBizDay(new Date(end));
  if (!list.length) {
    list.push(adjEnd);
  } else if (toISO(list[list.length - 1]) !== toISO(adjEnd)) {
    list.push(adjEnd);
  }
  return list;
}

// ── Price history cache ──────────────────────────────────────
// Architecture: one bulk Yahoo Finance API call fetches the full OHLCV history
// (period1 → period2) in a single request. Past prices are immutable so we cache
// them permanently in localStorage. Only today's price may need a refresh.
// Key: inv_ph_{TICKER}  Value: { ticker, fetched_at, prices: { "YYYY-MM-DD": close } }

const cacheKey = ticker => `inv_ph_${ticker}`;

function getHistory(ticker) {
  const raw = localStorage.getItem(cacheKey(ticker));
  return raw ? JSON.parse(raw) : null;
}

/**
 * Lookup closing price for a given date.
 * Falls back up to 5 prior trading days (covers long weekends & holidays).
 */
function getCachedPrice(ticker, isoDate) {
  const cache = getHistory(ticker);
  if (!cache) return null;
  if (cache.prices[isoDate] != null) return cache.prices[isoDate];
  const d = new Date(isoDate);
  for (let i = 1; i <= 5; i++) {
    d.setDate(d.getDate() - 1);
    const s = toISO(d);
    if (cache.prices[s] != null) return cache.prices[s];
  }
  return null;
}

function updateCacheStatus(n) {
  const el = document.getElementById(`s${n}-cache-status`);
  if (!el) return;
  const ticker = document.getElementById(`s${n}-tick`).value.trim();
  if (!ticker) { el.textContent = ''; return; }
  const cache = getHistory(ticker);
  if (!cache) {
    el.textContent = 'Pas de cache — cliquez ↻ pour charger l\'historique';
    el.className   = 'text-xs text-yellow-400 mt-1 col-span-12';
  } else {
    const count   = Object.keys(cache.prices).length;
    const stale   = cache.fetched_at < toISO(new Date());
    const warning = stale ? ' ⚠ cours du jour peut être obsolète' : '';
    const src     = cache.source ? ` · source : ${cache.source}` : '';
    el.textContent = `✓ ${count} séances en cache — actualisé le ${cache.fetched_at}${src}${warning}`;
    el.className   = `text-xs ${stale ? 'text-yellow-400' : 'text-emerald-400'} mt-1 col-span-12`;
  }
}

// ── Fetch full price history — fallback chain ────────────────
// Source 1: Yahoo Finance v8 via allorigins.win
// Source 2: Yahoo Finance v8 via corsproxy.io  (different proxy, avoids allorigins rate limit)
// Source 3: Stooq CSV API                      (completely different provider, free, no key, supports .PA)

async function _tryYahoo(ticker, period1, period2, proxyPrefix) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}`
            + `?interval=1d&period1=${period1}&period2=${period2}`;
  const res = await fetch(proxyPrefix + encodeURIComponent(url));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error('No chart result');
  const timestamps = result.timestamp || [];
  const closes     = result.indicators?.quote?.[0]?.close || [];
  const prices = {};
  timestamps.forEach((ts, i) => {
    if (closes[i] != null)
      prices[toISO(new Date(ts * 1000))] = parseFloat(closes[i].toFixed(4));
  });
  if (!Object.keys(prices).length) throw new Error('Empty result');
  return { prices, latestClose: closes.filter(Boolean).at(-1) };
}

async function _tryStooq(ticker, fromDate, toDate) {
  // Stooq uses lowercase tickers with dots (MC.PA → mc.pa) — same convention as Yahoo .PA
  const d1  = toISO(fromDate).replace(/-/g, '');
  const d2  = toISO(toDate).replace(/-/g, '');
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(ticker.toLowerCase())}&d1=${d1}&d2=${d2}&i=d`;
  // Use corsproxy for Stooq to keep it independent from allorigins rate bucket
  const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(url));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('No CSV rows');
  const header   = lines[0].toLowerCase().split(',');
  const dateIdx  = header.indexOf('date');
  const closeIdx = header.indexOf('close');
  if (dateIdx < 0 || closeIdx < 0) throw new Error('Unexpected CSV format');
  const prices = {};
  let latestClose = null;
  // Stooq returns oldest→newest; iterate in order so latestClose ends up as the last entry
  for (let i = 1; i < lines.length; i++) {
    const cols  = lines[i].split(',');
    const date  = cols[dateIdx]?.trim();
    const close = parseFloat(cols[closeIdx]);
    if (date && !isNaN(close)) {
      prices[date] = parseFloat(close.toFixed(4));
      latestClose  = close;
    }
  }
  if (!Object.keys(prices).length) throw new Error('No valid rows');
  return { prices, latestClose };
}

async function fetchPrice(n) {
  const ticker = document.getElementById(`s${n}-tick`).value.trim();
  if (!ticker) { alert('Entrez un ticker (ex: MC.PA)'); return; }

  const icon = document.getElementById(`s${n}-icon`);
  icon.className = 'fas fa-spinner fa-spin';

  const obsStartVal = document.getElementById('obs-start-date').value;
  const fromDate    = obsStartVal
    ? (() => { const d = new Date(obsStartVal); d.setMonth(d.getMonth() - 3); return d; })()
    : (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 2); return d; })();
  const toDate  = new Date();
  const period1 = Math.floor(fromDate.getTime() / 1000);
  const period2 = Math.floor(toDate.getTime()   / 1000);

  const sources = [
    { label: 'Yahoo/allorigins',  fn: () => _tryYahoo(ticker, period1, period2, 'https://api.allorigins.win/raw?url=') },
    { label: 'Yahoo/corsproxy',   fn: () => _tryYahoo(ticker, period1, period2, 'https://corsproxy.io/?') },
    { label: 'Stooq',             fn: () => _tryStooq(ticker, fromDate, toDate) },
  ];

  let result = null;
  let usedSource = '';
  for (const src of sources) {
    try {
      result     = await src.fn();
      usedSource = src.label;
      break;
    } catch (err) {
      console.warn(`[fetchPrice] ${src.label} failed for ${ticker}:`, err.message);
    }
  }

  if (!result) {
    icon.className = 'fas fa-times';
    setTimeout(() => { icon.className = 'fas fa-sync-alt'; }, 2500);
    alert(`Prix non disponible pour ${ticker} (Yahoo + Stooq ont échoué).\nEntrez le cours manuellement.`);
    return;
  }

  localStorage.setItem(cacheKey(ticker), JSON.stringify({
    ticker,
    fetched_at: toISO(new Date()),
    source: usedSource,
    prices: result.prices
  }));

  if (result.latestClose) {
    const v = result.latestClose.toFixed(2);
    document.getElementById(`s${n}-cur`).value = v;
    localStorage.setItem(`invest_s${n}-cur`, v);
  }

  icon.className = 'fas fa-check';
  setTimeout(() => { icon.className = 'fas fa-sync-alt'; }, 2500);
  updateCacheStatus(n);
}

// ── Main calculation ─────────────────────────────────────────
function calculate() {
  const stocks = [1, 2, 3].map(n => ({
    _n:      n,
    name:    document.getElementById(`s${n}-name`).value.trim() || `Stock ${n}`,
    initial: parseFloat(document.getElementById(`s${n}-init`).value),
    current: parseFloat(document.getElementById(`s${n}-cur`).value),
    ticker:  document.getElementById(`s${n}-tick`).value.trim(),
  })).filter(s => !isNaN(s.initial) && !isNaN(s.current) && s.initial > 0);

  if (!stocks.length) {
    alert('Veuillez renseigner au moins un sous-jacent (niveau initial + prix actuel).');
    return;
  }

  const emDate       = new Date(document.getElementById('emission-date').value);
  const obsStartVal  = document.getElementById('obs-start-date').value;
  const firstObsDate = obsStartVal ? new Date(obsStartVal) : emDate;
  const fnDate       = new Date(document.getElementById('final-date').value);
  const capital      = parseFloat(document.getElementById('initial-capital').value) || 248000;
  const annRate      = parseFloat(document.getElementById('annual-coupon').value) / 100;
  const capBarPct    = parseFloat(document.getElementById('cap-barrier').value) / 100;
  const acT1         = parseFloat(document.getElementById('autocall-t1').value) / 100;
  const acT2         = parseFloat(document.getElementById('autocall-t2').value) / 100;
  const issuer       = document.getElementById('issuer').value || '—';

  const qCoupon   = annRate / 4;
  const simDateV  = document.getElementById('sim-date').value;
  const simDate   = simDateV ? new Date(simDateV) : new Date();
  const years     = (fnDate - emDate)  / (365.25 * 86400000);
  const simYears  = (simDate - emDate) / (365.25 * 86400000);

  stocks.forEach(s => {
    s.perf       = (s.current - s.initial) / s.initial;
    s.capBarrier = s.initial * capBarPct;
    s.autocallT2 = s.initial * acT2;
    s.distBar    = (s.current - s.capBarrier) / s.capBarrier;
  });
  const worstPerf = Math.min(...stocks.map(s => s.perf));
  const currentAutocallEligible = worstPerf >= (acT2 - 1);

  // ── Header ──
  document.getElementById('display-capital').value            = capital;
  document.getElementById('display-product-name').textContent = `${issuer} Athena sur ${stocks.map(s => s.name).join(' / ')} · XS3317204454`;

  // ── Metric cards ──
  document.getElementById('r-coupon-rate').textContent    = `${(annRate * 100).toFixed(2)}% p.a.`;
  document.getElementById('r-quarter-coupon').textContent = `${(qCoupon * 100).toFixed(2)}%`;
  const simLabel = simDate < fnDate
    ? `Simulation : ${(simYears * 12).toFixed(0)} mois`
    : `Maturité : ${years.toFixed(0)} ans`;
  document.getElementById('r-maturity').textContent   = simLabel;
  document.getElementById('r-emission').textContent   = fmt(emDate);
  document.getElementById('r-simdate').textContent    = fmt(simDate);
  document.getElementById('r-final').textContent      = fmt(fnDate);
  document.getElementById('r-protection').textContent = `${(capBarPct * 100).toFixed(0)}% Européenne`;
  document.getElementById('r-issuer').textContent     = issuer;

  const breached = stocks.some(s => s.current < s.capBarrier);
  const bStatus  = document.getElementById('r-barrier-status');
  bStatus.textContent = breached ? 'Sous 60% au spot' : 'Au-dessus au spot';
  bStatus.className   = breached ? 'font-semibold text-red-600' : 'font-semibold text-emerald-600';

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
      <td class="px-4 py-3 text-right">${s.autocallT2.toFixed(2)}</td>
    </tr>`;
  }).join('');

  // ── Chronologie — real historical prices when available ──
  const obs = obsSchedule(firstObsDate, fnDate);
  let accruedQtrs  = 0;
  let paidQtrs     = 0;
  let lastObsDate  = null;
  let autocallIdx  = -1;   // first index at which an autocall was triggered
  let maturityPayoffR = null;
  let chronoHTML   = '';

  obs.forEach((d, idx) => {
    // Once autocall fired, remaining dates are moot
    if (autocallIdx >= 0 && idx > autocallIdx) return;

    const isFinal   = idx === obs.length - 1;
    const isReached = d <= simDate;
    const acLevel   = idx === 0 ? acT1 : acT2;  // T1 uses stricter 100% barrier
    const payD      = paymentDate(d);
    const dateStr   = toISO(d);

    accruedQtrs++;
    if (isReached) lastObsDate = d;

    // ── Try real historical prices from localStorage cache ──
    // All 3 stocks must have data for the date to be considered "real"
    const actualPrices  = stocks.map(s => getCachedPrice(s.ticker, dateStr));
    const hasRealData   = isReached && actualPrices.every(p => p !== null);

    let actualWorstPerf = null;
    let wasAutocalled   = false;
    let conditionMet    = false;

    if (hasRealData) {
      const actualPerfs = stocks.map((s, i) => (actualPrices[i] - s.initial) / s.initial);
      actualWorstPerf   = Math.min(...actualPerfs);
      // Autocall: worst-of >= autocall level (expressed relative to initial = 1.0)
      // acLevel=1.0 means all stocks at 100%+; acLevel=0.80 means all stocks at 80%+.
      conditionMet = actualWorstPerf >= (acLevel - 1);
    } else if (isReached && idx === 0) {
      conditionMet = worstPerf >= (acT1 - 1);
      actualWorstPerf = worstPerf;
    } else if (isReached) {
      conditionMet = currentAutocallEligible;
      actualWorstPerf = worstPerf;
    }

    wasAutocalled = !isFinal && isReached && conditionMet;
    if (wasAutocalled) {
      autocallIdx = idx;
      paidQtrs = accruedQtrs;
    }

    if (isFinal && isReached) {
      if (conditionMet) {
        paidQtrs = accruedQtrs;
        maturityPayoffR = 1 + paidQtrs * qCoupon;
      } else if (actualWorstPerf >= (capBarPct - 1)) {
        maturityPayoffR = 1;
      } else {
        maturityPayoffR = 1 + actualWorstPerf;
      }
    }

    const isSimEdge = isReached && !wasAutocalled && (idx === obs.length - 1 || obs[idx + 1] > simDate);

    // ── Row styling & status ──
    let icon, rowBg, statut, statColor;

    if (wasAutocalled) {
      icon      = '<i class="fas fa-bolt text-blue-500 text-base"></i>';
      rowBg     = 'bg-blue-100 border-l-4 border-blue-600';
      statut    = 'Autocall';
      statColor = 'text-blue-700 font-bold';
    } else if (isReached && isFinal) {
      icon      = '<i class="fas fa-flag-checkered text-purple-500 text-base"></i>';
      rowBg     = 'bg-purple-50';
      statut    = conditionMet ? 'Maturité + coupons' : 'Maturité';
      statColor = 'text-purple-700 font-semibold';
    } else if (isReached) {
      icon      = '<i class="fas fa-play-circle text-gray-400 text-base"></i>';
      rowBg     = isSimEdge ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50';
      statut    = isSimEdge ? 'Simulation' : (conditionMet ? 'Condition OK' : 'Non rappelé');
      statColor = isSimEdge ? 'text-blue-600 font-bold'
                : conditionMet ? 'text-emerald-600 font-medium'
                : 'text-orange-500 font-medium';
    } else if (isFinal) {
      icon      = '<i class="fas fa-flag-checkered text-purple-500 text-base"></i>';
      rowBg     = 'bg-purple-50';
      statut    = 'Maturité';
      statColor = 'text-purple-700 font-semibold';
    } else {
      icon      = '<i class="fas fa-play-circle text-blue-500 text-base"></i>';
      rowBg     = '';
      statut    = '—';
      statColor = 'text-gray-400';
    }

    // Worst-of column: real data badge or placeholder
    const worstCell = hasRealData
      ? `<span class="font-semibold ${actualWorstPerf >= 0 ? 'text-emerald-600' : 'text-red-500'}">${fmtPct(actualWorstPerf * 100)}</span>`
      : isReached
        ? `<span class="font-semibold ${actualWorstPerf >= 0 ? 'text-emerald-600' : 'text-red-500'}">${fmtPct(actualWorstPerf * 100)}</span>`
        : `<span class="text-gray-300 text-xs italic">—</span>`;

    let amountLabel = `${(accruedQtrs * qCoupon * 100).toFixed(2)}% potentiel`;
    if (wasAutocalled) {
      amountLabel = `${(accruedQtrs * qCoupon * 100).toFixed(2)}% + capital`;
    } else if (isFinal && isReached && maturityPayoffR !== null) {
      amountLabel = maturityPayoffR >= 1
        ? `${((maturityPayoffR - 1) * 100).toFixed(2)}% + capital`
        : `${(maturityPayoffR * 100).toFixed(2)}% du capital`;
    }

    chronoHTML += `<tr class="border-b border-gray-100 ${rowBg} hover:bg-gray-50">
      <td class="px-2 py-1.5 text-center">${icon}</td>
      <td class="px-2 py-1.5">${fmt(d)}</td>
      <td class="px-2 py-1.5">${fmt(payD)}</td>
      <td class="px-2 py-1.5 text-right">${(acLevel * 100).toFixed(0)}%</td>
      <td class="px-2 py-1.5 text-right">${worstCell}</td>
      <td class="px-2 py-1.5 ${statColor}">${statut}</td>
      <td class="px-2 py-1.5 text-right font-medium">${amountLabel}</td>
    </tr>`;
  });
  document.getElementById('chrono-tbody').innerHTML = chronoHTML;

  // ── Summary ──
  const totalQtrs    = obs.length;
  const totalCouponR = qCoupon * totalQtrs;
  const simCouponR   = qCoupon * paidQtrs;
  const totalCouponE = capital * totalCouponR;
  const simCouponE   = capital * simCouponR;
  const totalReturnE = capital + totalCouponE;
  const simReturnE   = maturityPayoffR !== null ? capital * maturityPayoffR : capital + simCouponE;
  const lastObsYears = lastObsDate ? (lastObsDate - emDate) / (365.25 * 86400000) : simYears;
  const annualReturn = paidQtrs > 0 && lastObsYears > 0
    ? simCouponR / lastObsYears
    : totalCouponR / years;

  // ── Coupons encaissés ──
  document.getElementById('sum-capital').textContent = fmtEur(capital);
  if (paidQtrs === 0) {
    const firstObsStr = obs.length ? ` — 1ʳᵉ obs. le ${fmt(obs[0])}` : '';
    document.getElementById('sum-coupons').textContent = `0 € — aucun coupon payé à ce jour${firstObsStr}`;
  } else if (autocallIdx >= 0) {
    document.getElementById('sum-coupons').textContent = `${fmtEur(simCouponE)} (${(simCouponR * 100).toFixed(1)}%) — autocall ${fmt(obs[autocallIdx])}`;
  } else {
    document.getElementById('sum-coupons').textContent = `${fmtEur(simCouponE)} (${(simCouponR * 100).toFixed(1)}%) — ${paidQtrs} trimestre(s)`;
  }

  // ── Capital + coupons ──
  if (paidQtrs === 0 && maturityPayoffR === null) {
    document.getElementById('sum-total').textContent = `${fmtEur(capital)} — produit actif, avant 1ʳᵉ observation`;
  } else {
    document.getElementById('sum-total').textContent = `${fmtEur(simReturnE)} (${fmtPct((simReturnE / capital - 1) * 100)})`;
  }

  // ── Taux : contractuel si rien payé, réalisé si coupons encaissés ──
  if (paidQtrs === 0) {
    document.getElementById('sum-annual-label').textContent = 'Taux contractuel (conditionnel)';
    document.getElementById('sum-annual').textContent = `${(annRate * 100).toFixed(2)}% / an`;
  } else {
    document.getElementById('sum-annual-label').textContent = 'Rendement annualisé réalisé';
    document.getElementById('sum-annual').textContent = `~${(annualReturn * 100).toFixed(2)}% / an`;
  }

  // ── Scénario favorable : T1 + T2 avec statut actuel ──
  const fav1 = capital * (1 + qCoupon);
  const fav2 = capital * (1 + 2 * qCoupon);
  const t1Met  = worstPerf >= (acT1 - 1);   // worst-of ≥ 100% initial
  const t2Met  = worstPerf >= (acT2 - 1);   // worst-of ≥ 80% initial
  const t1Tag  = t1Met  ? '✓ cond. remplie' : `✗ worst-of à ${fmtPct(worstPerf * 100)} / seuil 0%`;
  const t2Tag  = t2Met  ? '✓ cond. remplie' : `✗ worst-of à ${fmtPct(worstPerf * 100)} / seuil -20%`;
  document.getElementById('scen-fav-desc').textContent =
    `T1 (3m, 100%) : ${t1Tag} · T2 (6m, 80%) : ${t2Tag}`;
  document.getElementById('scen-fav').textContent =
    `T2: ${fmtEur(fav2)} (${fmtPct(2 * qCoupon * 100)}) · T1: ${fmtEur(fav1)} (${fmtPct(qCoupon * 100)})`;

  // ── Scénario neutre : maturité complète ──
  document.getElementById('scen-neu').textContent =
    `${fmtEur(totalReturnE)} (+${(totalCouponR * 100).toFixed(2)}% total sur ${years.toFixed(0)} ans = ${(annRate * 100).toFixed(2)}%/an)`;

  // ── Scénario défavorable : barrière 60% franchie à maturité ──
  // La barrière européenne est observée UNIQUEMENT à maturité.
  // Si worst-of < -40% (soit < 60% initial) → perte 1:1 sur worst-of.
  // Si worst-of entre -40% et 0% → capital intégralement protégé (mais 0 coupon si < 80%).
  const barrierBreachPerf  = capBarPct - 1;                   // -40% pour barrière 60%
  const wRet = capital * capBarPct;                            // 337 000 × 60% = perte max à barrière
  document.getElementById('scen-def-desc').textContent =
    `Worst-of < ${(capBarPct * 100).toFixed(0)}% à maturité. Actuel : ${fmtPct(worstPerf * 100)} `
    + (worstPerf >= barrierBreachPerf ? '→ capital protégé au spot' : '→ SOUS la barrière au spot');
  document.getElementById('scen-def').textContent =
    `${fmtEur(wRet)} (${fmtPct(barrierBreachPerf * 100)} si barrière exactement touchée)`;

  renderChart(stocks, emDate, fnDate, capBarPct, acT2, simDate);

  document.getElementById('results').classList.remove('hidden');
  document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// ── Chart ────────────────────────────────────────────────────
function renderChart(stocks, emDate, fnDate, capBarPct, acLevel, simDate) {
  const ctx = document.getElementById('perf-chart').getContext('2d');
  if (perfChart) { perfChart.destroy(); perfChart = null; }

  const endD   = simDate < fnDate ? simDate : fnDate;
  const labels = [];
  const cur    = new Date(emDate);
  while (cur <= endD) { labels.push(fmt(new Date(cur))); cur.setMonth(cur.getMonth() + 1); }
  const n = labels.length;

  const palette = [
    { border: '#93c5fd', bg: 'rgba(147,197,253,0.15)' },
    { border: '#fcd34d', bg: 'rgba(252,211,77,0.15)'  },
    { border: '#f9a8d4', bg: 'rgba(249,168,212,0.15)' },
  ];

  const datasets = stocks.map((s, i) => ({
    label:           s.name,
    data:            labels.map((_, j) => parseFloat((100 + s.perf * 100 * (j / (n - 1 || 1))).toFixed(2))),
    borderColor:     palette[i].border,
    backgroundColor: palette[i].bg,
    borderWidth:     2,
    pointRadius:     0,
    tension:         0.4,
    fill:            false,
  }));

  datasets.push(
    { label: `Barrière capital (${(capBarPct * 100).toFixed(0)}%)`,
      data: labels.map(() => capBarPct * 100),
      borderColor: 'rgba(239,68,68,0.7)', borderDash: [6,3], borderWidth: 1.5, pointRadius: 0, fill: false },
    { label: `Autocall (${(acLevel * 100).toFixed(0)}%)`,
      data: labels.map(() => acLevel * 100),
      borderColor: 'rgba(59,130,246,0.7)', borderDash: [6,3], borderWidth: 1.5, pointRadius: 0, fill: false },
    { label: 'Prix vente (100%)',
      data: labels.map(() => 100),
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
