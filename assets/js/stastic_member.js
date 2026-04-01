/* ── stastic_member.js ───────────────────────────────────────── */
'use strict';

const STORE_KEY = 'grp_hub_v2';

// ── Chart instances (tracked for destroy-before-rerender) ──────
let _chartTech   = null;
let _chartInvest = null;
let _chartCity   = null;
let _chartStatus = null;

// ── Color palette matching invest.html ────────────────────────
const PALETTE = [
  '#1d4ed8', '#059669', '#d97706', '#7c3aed', '#be123c',
  '#0e7490', '#15803d', '#b45309', '#1a5f7a', '#64748b'
];

// ── Utilities ─────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showToast(msg, ms = 2800) {
  let el = document.getElementById('sm-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sm-toast';
    el.className = 'sm-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms);
}

// ── State persistence ─────────────────────────────────────────
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { members: [], surveys: [], sharings: [] };
    const p = JSON.parse(raw);
    if (!p || typeof p !== 'object') return { members: [], surveys: [], sharings: [] };
    return {
      members:  Array.isArray(p.members)  ? p.members  : [],
      surveys:  Array.isArray(p.surveys)  ? p.surveys  : [],
      sharings: Array.isArray(p.sharings) ? p.sharings : []
    };
  } catch (_) {
    return { members: [], surveys: [], sharings: [] };
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

const state = loadState();

// ── Seed surveys (WhatsApp legacy data) ───────────────────────
function ensureSeed() {
  const ids = state.surveys.map(s => s.id);

  // ── Seed or patch seed_s1_tech (tech domain — WhatsApp Jan 2026) ──
  const _s1_options = [
    { id: 'Backend Dev',         label: 'Backend Developer' },
    { id: 'Frontend Dev',        label: 'Frontend Developer' },
    { id: 'Full Stack',          label: 'Full Stack Developer' },
    { id: 'DevOps/SRE/Cloud',    label: 'DevOps / SRE / Cloud' },
    { id: 'Data/AI/ML',          label: 'Data / AI / ML' },
    { id: 'Mobile',              label: 'Mobile (iOS / Android)' },
    { id: 'QA/Test',             label: 'QA / Test / Automation' },
    { id: 'Security/Cybersec',   label: 'Security / Cybersecurity' },
    { id: 'Architect/Tech Lead', label: 'Architect / Tech Lead' },
    { id: 'PM',                  label: 'PM (Product / Project)' },
    { id: 'Designer',            label: 'Designer' },
    { id: 'Biz Manager',         label: 'Business Manager' },
    { id: 'Others',         label: 'Others' },
  ];
  const _s1_counts = {
    'Backend Dev': 3, 'Frontend Dev': 2, 'Full Stack': 2,
    'DevOps/SRE/Cloud': 2, 'Data/AI/ML': 11, 'Mobile': 1,
    'QA/Test': 1, 'Security/Cybersec': 1, 'Architect/Tech Lead': 2,
    'PM': 10, 'Designer': 1, 'Biz Manager': 4, 'Others': 14
  };
  if (!ids.includes('seed_s1_tech')) {
    state.surveys.push({
      id: 'seed_s1_tech',
      title: '你的主要技術領域是？（可複選）',
      titleFr: 'Quel est votre domaine technique principal ? (choix multiple)',
      description: '來自 WhatsApp 社群調查 / Sondage WhatsApp communautaire',
      type: 'multi', privacy: 'count_only', status: 'closed',
      isLegacy: true, source: 'WhatsApp',
      createdAt: '2026-01-15T13:44:00.000Z',
      closedAt:  '2026-01-20T10:00:00.000Z',
      options: _s1_options,
      votesByMember: {},
      legacyCounts: _s1_counts
    });
  } else {
    // Migration: patch counts + add Designer/Business Manager if missing
    const s1 = state.surveys.find(s => s.id === 'seed_s1_tech');
    if (s1 && !s1.options.find(o => o.id === 'Others')) {
      s1.options      = _s1_options;
      s1.legacyCounts = _s1_counts;
    }
  }

  if (!ids.includes('seed_s2_invest')) {
    state.surveys.push({
      id: 'seed_s2_invest',
      title: '是否有興趣交流「在法國投資/長期發展」？',
      titleFr: 'Êtes-vous intéressé(e) par les échanges sur l\'investissement / développement long terme en France ?',
      description: '來自 WhatsApp 社群調查 / Sondage WhatsApp communautaire',
      type: 'multi',
      privacy: 'count_only',
      status: 'closed',
      isLegacy: true,
      source: 'WhatsApp',
      createdAt: '2024-10-01T10:00:00.000Z',
      closedAt: '2024-10-20T10:00:00.000Z',
      options: [
        { id: '不感興趣',             label: '不感興趣 (Pas intéressé(e))' },
        { id: '有興趣但無額外資金',     label: '有興趣但無額外資金 (Intéressé mais sans fonds)' },
        { id: '有興趣且已在投資',       label: '有興趣且已在投資 (Intéressé et déjà investi)' },
        { id: '很有興趣願增加',         label: '很有興趣願增加 (Très intéressé, prêt à augmenter)' },
        { id: '有興趣但不方便GMeet',    label: '有興趣但不方便GMeet (Intéressé mais pas dispo GMeet)' },
        { id: '有興趣可參加GMeet',      label: '有興趣可參加GMeet (Intéressé et dispo GMeet)' }
      ],
      votesByMember: {},
      legacyCounts: {
        '不感興趣': 0,
        '有興趣但無額外資金': 5,
        '有興趣且已在投資': 4,
        '很有興趣願增加': 0,
        '有興趣但不方便GMeet': 0,
        '有興趣可參加GMeet': 11
      }
    });
  }

  // ── Seed seed_s3_city (city/location — WhatsApp Jan 2026) ────────
  if (!ids.includes('seed_s3_city')) {
    state.surveys.push({
      id: 'seed_s3_city',
      title: '你目前主要所在城市是？（可複選）',
      titleFr: 'Dans quelle ville êtes-vous principalement basé(e) ?',
      description: '來自 WhatsApp 社群調查 / Sondage WhatsApp communautaire',
      type: 'single', privacy: 'count_only', status: 'closed',
      isLegacy: true, source: 'WhatsApp',
      createdAt: '2026-01-15T13:42:00.000Z',
      closedAt:  '2026-01-20T10:00:00.000Z',
      options: [
        { id: 'Paris',       label: 'Paris / Île-de-France' },
        { id: 'Lyon',        label: 'Lyon' },
        { id: 'Toulouse',    label: 'Toulouse' },
        { id: 'Bordeaux',    label: 'Bordeaux' },
        { id: 'Lille',       label: 'Lille' },
        { id: 'Strasbourg',  label: 'Strasbourg' },
        { id: 'Nice',        label: 'Nice / Sophia Antipolis' },
        { id: 'Taiwan',      label: '台灣（計畫來法國 / Prévu de venir en France）' },
        { id: 'Autres',      label: '其他城市（請留言 / Autre ville）' }
      ],
      votesByMember: {},
      legacyCounts: {
        'Paris': 38, 'Lyon': 5, 'Toulouse': 0, 'Bordeaux': 2,
        'Lille': 0, 'Strasbourg': 0, 'Nice': 2, 'Taiwan': 8, 'Autres': 8
      }
    });
  }

  // ── Seed seed_s4_status (job status — WhatsApp Jan 2026) ─────────
  if (!ids.includes('seed_s4_status')) {
    state.surveys.push({
      id: 'seed_s4_status',
      title: '你目前的狀態是？',
      titleFr: 'Quel est votre statut professionnel actuel ?',
      description: '想了解大家目前的狀態，方便未來分享 job / mission 或協助媒合。來自 WhatsApp 社群調查 / Sondage WhatsApp communautaire',
      type: 'multi', privacy: 'count_only', status: 'closed',
      isLegacy: true, source: 'WhatsApp',
      createdAt: '2026-01-15T13:35:00.000Z',
      closedAt:  '2026-01-20T10:00:00.000Z',
      options: [
        { id: 'CDI',        label: '已在法國工作（CDI）' },
        { id: 'Freelance',  label: 'Freelance / Consultant' },
        { id: 'Searching',  label: '正在找新機會 (En recherche active)' },
        { id: 'Stable',     label: '目前穩定，但願意了解機會 (Stable, ouvert aux opportunités)' },
        { id: 'Hiring',     label: '公司有職缺，可分享資訊 (Mon entreprise recrute)' },
        { id: 'NewArrival', label: '剛到法國 / 準備來法國發展 (Nouvel arrivant / En préparation)' }
      ],
      votesByMember: {},
      legacyCounts: {
        'CDI': 17, 'Freelance': 4, 'Searching': 37,
        'Stable': 7, 'Hiring': 2, 'NewArrival': 10
      }
    });
  }

  // ── Seed members — Groupe Général (68 membres, snapshot Jan 2026) ─
  if (state.members.length === 0) {
    const joined = '2026-01-15T00:00:00.000Z';
    const _names = [
      'Chia-Hsin', 'Yu-Peng', 'Sabrina C.', 'Ashley', 'Paul',
      'Amber', 'Catherine', 'Chen-Yu', 'Chi', 'Chi Yun',
      'Chi-Wei', 'Chia Lun', 'Chiawei', 'Chieh Yang', 'Chieh Yu Chen',
      'Chiung-Yueh', 'Chris', 'CJ Eileen', 'EJ', 'Ella Chenyu Chen',
      'Enli Jen', 'Fay', 'Fuwei', 'Houwen', 'HWC',
      'I-Chun', 'IChing (Yi-Jin) Chen', 'James', 'Jenny Yen', 'Johnny',
      'Karen', 'Kevin', 'Kevin (2)', 'Linghan Liao', 'Lu',
      'Manping', 'Miriam C.', 'Miya Lee', 'Nai Chieh Lin', 'Nancy',
      'Peggy Liao', 'Pz', 'S-P', 'Sanny', 'Sheepo',
      'Shuhan Chang (Shelly)', 'Sun', 'Sylvia', 'Tachun Lin', 'Terry TAN',
      'Tina', 'Vivi N', 'W', 'Wallace', 'Wan-Erh (Annie)',
      'Wen', 'Wen (2)', 'Wentzu 文慈', 'Yih-Dar', 'Yochen Shih',
      'Yu Ting Chao', 'Yu-Chuan Cheng', 'Yuhsin', 'Yun-Hsuan',
      'ZHANG ZUO AN (Joanne)', 'Zoe (lo-yi) Wu', 'Zoe T', 'Brett'
    ];
    _names.forEach((name, i) => {
      state.members.push({ id: 'seed_m_' + i, name, joinedAt: joined, note: '' });
    });
  }

  saveState();
}

// ── Compute merged vote counts for a survey ────────────────────
function computeCounts(survey) {
  const counts = {};
  // Start with legacy base counts
  if (survey.legacyCounts) {
    for (const [k, v] of Object.entries(survey.legacyCounts)) {
      counts[k] = (counts[k] || 0) + v;
    }
  }
  // Add live votes by member
  if (survey.votesByMember) {
    for (const votes of Object.values(survey.votesByMember)) {
      for (const optId of votes) {
        counts[optId] = (counts[optId] || 0) + 1;
      }
    }
  }
  return counts;
}

// ── Compute KPIs ───────────────────────────────────────────────
function computeKPIs(st) {
  const totalMembers = st.members.length;
  const openSurveys = st.surveys.filter(s => s.status === 'open').length;

  let totalResponses = 0;
  for (const survey of st.surveys) {
    // Count unique live voters
    totalResponses += Object.keys(survey.votesByMember || {}).length;
    // Add legacy totals (sum of all option counts as proxy for response count)
    if (survey.legacyCounts) {
      const legacyTotal = Object.values(survey.legacyCounts).reduce((a, b) => a + b, 0);
      totalResponses += legacyTotal;
    }
  }

  return { totalMembers, openSurveys, totalResponses };
}

// ── KPI render ─────────────────────────────────────────────────
function renderKPIs() {
  const kpi = computeKPIs(state);
  const elM = document.getElementById('kpi-members');
  const elO = document.getElementById('kpi-open');
  const elR = document.getElementById('kpi-responses');
  if (elM) elM.textContent = kpi.totalMembers;
  if (elO) elO.textContent = kpi.openSurveys;
  if (elR) elR.textContent = kpi.totalResponses;
}

// ── Tab switching ──────────────────────────────────────────────
function setTab(name) {
  document.querySelectorAll('.sm-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === name);
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.dataset.tab === name);
  });

  if (name === 'dashboard') renderDashboard();
  if (name === 'members')   renderMembers();
  if (name === 'surveys')   renderSurveys();
  if (name === 'sharing')   renderSharings();
}

// ── Dashboard ─────────────────────────────────────────────────
function renderDashboard() {
  renderKPIs();
  renderTechChart();
  renderInvestChart();
  renderCityChart();
  renderStatusChart();
}

function renderTechChart() {
  const survey = state.surveys.find(s => s.id === 'seed_s1_tech');
  const canvas = document.getElementById('chart-tech');
  if (!canvas) return;

  if (_chartTech) { _chartTech.destroy(); _chartTech = null; }

  if (!survey) { canvas.parentElement.innerHTML = '<p class="sm-empty" style="padding:1rem;color:#94a3b8;font-size:0.8rem;">Sondage tech introuvable.</p>'; return; }

  const counts = computeCounts(survey);
  const labels = survey.options.map(o => o.label);
  const data   = survey.options.map(o => counts[o.id] || 0);

  _chartTech = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Réponses',
        data,
        backgroundColor: PALETTE.map(c => c + 'cc'),
        borderColor: PALETTE,
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.x} réponse${ctx.parsed.x !== 1 ? 's' : ''}`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1, font: { size: 11 } },
          grid: { color: '#f1f5f9' }
        },
        y: {
          ticks: { font: { size: 10 } }
        }
      }
    }
  });
}

function renderInvestChart() {
  const survey = state.surveys.find(s => s.id === 'seed_s2_invest');
  const canvas = document.getElementById('chart-invest');
  if (!canvas) return;

  if (_chartInvest) { _chartInvest.destroy(); _chartInvest = null; }

  if (!survey) { canvas.parentElement.innerHTML = '<p class="sm-empty" style="padding:1rem;color:#94a3b8;font-size:0.8rem;">Sondage investissement introuvable.</p>'; return; }

  const counts = computeCounts(survey);
  const labels = survey.options.map(o => o.label);
  const data   = survey.options.map(o => counts[o.id] || 0);

  _chartInvest = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: PALETTE.map(c => c + 'cc'),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      cutout: '55%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 10 },
            padding: 10,
            boxWidth: 12
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed} réponse${ctx.parsed !== 1 ? 's' : ''}`
          }
        }
      }
    }
  });
}

function renderCityChart() {
  const survey = state.surveys.find(s => s.id === 'seed_s3_city');
  const canvas  = document.getElementById('chart-city');
  if (!canvas) return;
  if (_chartCity) { _chartCity.destroy(); _chartCity = null; }
  if (!survey) return;

  const counts = computeCounts(survey);
  const labels = survey.options.map(o => o.label);
  const data   = survey.options.map(o => counts[o.id] || 0);

  _chartCity = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Membres',
        data,
        backgroundColor: PALETTE.map(c => c + 'cc'),
        borderColor: PALETTE,
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x} membre${ctx.parsed.x !== 1 ? 's' : ''}` } }
      },
      scales: {
        x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#f1f5f9' } },
        y: { ticks: { font: { size: 10 } } }
      }
    }
  });
}

function renderStatusChart() {
  const survey = state.surveys.find(s => s.id === 'seed_s4_status');
  const canvas  = document.getElementById('chart-status');
  if (!canvas) return;
  if (_chartStatus) { _chartStatus.destroy(); _chartStatus = null; }
  if (!survey) return;

  const counts = computeCounts(survey);
  const labels = survey.options.map(o => o.label);
  const data   = survey.options.map(o => counts[o.id] || 0);

  _chartStatus = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: PALETTE.map(c => c + 'cc'),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      cutout: '55%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 10, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed} réponse${ctx.parsed !== 1 ? 's' : ''}` } }
      }
    }
  });
}

// ── Members tab ────────────────────────────────────────────────
function renderMembers(filter = '') {
  const container = document.getElementById('members-grid');
  if (!container) return;

  const query = (filter || document.getElementById('member-search')?.value || '').toLowerCase();
  const list = state.members.filter(m =>
    !query || m.name.toLowerCase().includes(query) || (m.note || '').toLowerCase().includes(query)
  );

  if (list.length === 0) {
    container.innerHTML = `
      <div class="sm-empty" style="grid-column:1/-1;">
        <i class="fas fa-users"></i>
        <h3>Aucun membre${query ? ' trouvé' : ''}</h3>
        <p>${query ? 'Essayez un autre terme de recherche.' : 'Cliquez sur « + Ajouter membre » pour commencer.'}</p>
      </div>`;
    return;
  }

  container.innerHTML = list.map(m => {
    const initials = m.name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return `
      <div class="sm-member-card" data-id="${escHtml(m.id)}" onclick="openMemberModal('${escHtml(m.id)}')">
        <div class="sm-member-avatar">${escHtml(initials)}</div>
        <div class="sm-member-name">${escHtml(m.name)}</div>
        <div class="sm-member-joined"><i class="fas fa-calendar-alt" style="margin-right:0.3rem;opacity:0.5;"></i>${fmtDate(m.joinedAt)}</div>
        ${m.note ? `<div class="sm-member-note">${escHtml(m.note)}</div>` : ''}
      </div>`;
  }).join('');
}

// ── Surveys tab ────────────────────────────────────────────────
function renderSurveys() {
  const container = document.getElementById('surveys-list');
  if (!container) return;

  if (state.surveys.length === 0) {
    container.innerHTML = `
      <div class="sm-empty">
        <i class="fas fa-poll"></i>
        <h3>Aucun sondage</h3>
        <p>Créez votre premier sondage via l'onglet « + Créer sondage ».</p>
      </div>`;
    return;
  }

  container.innerHTML = state.surveys.map(survey => buildSurveyCard(survey)).join('');

  // Bind action buttons
  container.querySelectorAll('[data-action="vote"]').forEach(btn => {
    btn.addEventListener('click', () => openVoteModal(btn.dataset.sid));
  });
  container.querySelectorAll('[data-action="toggle"]').forEach(btn => {
    btn.addEventListener('click', () => toggleSurveyStatus(btn.dataset.sid));
  });
  container.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => deleteSurvey(btn.dataset.sid));
  });
}

function buildSurveyCard(survey) {
  const counts = computeCounts(survey);
  const total  = Object.values(counts).reduce((a, b) => a + b, 0);
  const isOpen = survey.status === 'open';

  const optBars = survey.options.map((opt, i) => {
    const count = counts[opt.id] || 0;
    const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
    const colorCls = 'color-' + (i % 9);

    let votersHtml = '';
    if (!survey.isLegacy && survey.privacy === 'show_voters') {
      const voters = Object.entries(survey.votesByMember || {})
        .filter(([, v]) => v.includes(opt.id))
        .map(([name]) => escHtml(name));
      votersHtml = voters.length
        ? `<div class="sm-option-voters">${voters.join(', ')}</div>`
        : '';
    }

    return `
      <div class="sm-option-row">
        <div class="sm-option-label-row">
          <span class="sm-option-label">${escHtml(opt.label)}</span>
          <span class="sm-option-count">${count} <span style="font-weight:400;color:#94a3b8;">(${pct}%)</span></span>
        </div>
        <div class="sm-bar-track">
          <div class="sm-bar-fill ${colorCls}" style="width:${pct}%;"></div>
        </div>
        ${votersHtml}
      </div>`;
  }).join('');

  const legacyBadge = survey.isLegacy
    ? `<span class="sm-badge sm-badge-legacy"><i class="fab fa-whatsapp"></i> WhatsApp (importé)</span>`
    : '';

  const toggleLabel = isOpen ? 'Clôturer' : 'Ré-ouvrir';
  const toggleIcon  = isOpen ? 'fa-lock' : 'fa-lock-open';

  const liveVoters = Object.keys(survey.votesByMember || {}).length;
  const footerInfo = survey.isLegacy
    ? `<span style="font-size:0.68rem;color:#94a3b8;margin-right:auto;">Total réponses : ${total}</span>`
    : `<span style="font-size:0.68rem;color:#94a3b8;margin-right:auto;">${liveVoters} votant${liveVoters !== 1 ? 's' : ''} · ${total} vote${total !== 1 ? 's' : ''}</span>`;

  return `
    <div class="sm-survey-card">
      <div class="sm-survey-header">
        <div class="sm-survey-title">${escHtml(survey.title)}</div>
        ${survey.titleFr ? `<div class="sm-survey-title-fr">${escHtml(survey.titleFr)}</div>` : ''}
        <div class="sm-survey-badges">
          ${legacyBadge}
          <span class="sm-badge ${isOpen ? 'sm-badge-open' : 'sm-badge-closed'}">
            <i class="fas ${isOpen ? 'fa-circle' : 'fa-check-circle'}"></i>
            ${isOpen ? 'Ouvert' : 'Clôturé'}
          </span>
          <span class="sm-badge ${survey.type === 'multi' ? 'sm-badge-multi' : 'sm-badge-single'}">
            ${survey.type === 'multi' ? 'Choix multiple' : 'Choix unique'}
          </span>
          <span class="sm-badge ${survey.privacy === 'show_voters' ? 'sm-badge-named' : 'sm-badge-anon'}">
            <i class="fas ${survey.privacy === 'show_voters' ? 'fa-eye' : 'fa-eye-slash'}"></i>
            ${survey.privacy === 'show_voters' ? 'Noms visibles' : 'Anonyme'}
          </span>
        </div>
        ${survey.description ? `<div style="font-size:0.75rem;color:#64748b;margin-top:0.25rem;">${escHtml(survey.description)}</div>` : ''}
        <div style="font-size:0.65rem;color:#94a3b8;margin-top:0.1rem;">
          Créé : ${fmtDate(survey.createdAt)}
          ${survey.closedAt ? ` · Clôturé : ${fmtDate(survey.closedAt)}` : ''}
          ${survey.source ? ` · Source : ${escHtml(survey.source)}` : ''}
        </div>
      </div>
      <div class="sm-options-list">${optBars}</div>
      <div class="sm-survey-footer">
        ${footerInfo}
        ${isOpen ? `<button class="sm-btn-sm vote" data-action="vote" data-sid="${survey.id}"><i class="fas fa-vote-yea"></i> Voter</button>` : ''}
        <button class="sm-btn-sm" data-action="toggle" data-sid="${survey.id}"><i class="fas ${toggleIcon}"></i> ${escHtml(toggleLabel)}</button>
        <button class="sm-btn-sm danger" data-action="delete" data-sid="${survey.id}"><i class="fas fa-trash"></i> Supprimer</button>
      </div>
    </div>`;
}

// ── Survey actions ─────────────────────────────────────────────
function toggleSurveyStatus(sid) {
  const survey = state.surveys.find(s => s.id === sid);
  if (!survey) return;
  if (survey.status === 'open') {
    survey.status = 'closed';
    survey.closedAt = new Date().toISOString();
  } else {
    survey.status = 'open';
    survey.closedAt = null;
  }
  saveState();
  renderSurveys();
  renderKPIs();
  showToast(survey.status === 'open' ? 'Sondage ré-ouvert.' : 'Sondage clôturé.');
}

function deleteSurvey(sid) {
  if (!confirm('Supprimer ce sondage et tous ses votes ?')) return;
  const idx = state.surveys.findIndex(s => s.id === sid);
  if (idx < 0) return;
  state.surveys.splice(idx, 1);
  saveState();
  renderSurveys();
  renderKPIs();
  showToast('Sondage supprimé.');
}

// ── Create survey ──────────────────────────────────────────────
function initCreateTab() {
  const addOptBtn = document.getElementById('add-option-btn');
  const createBtn = document.getElementById('create-survey-btn');
  if (addOptBtn) addOptBtn.addEventListener('click', addOptionRow);
  if (createBtn) createBtn.addEventListener('click', handleCreateSurvey);

  // Add two default option rows
  addOptionRow();
  addOptionRow();
}

function addOptionRow(value = '') {
  const builder = document.getElementById('option-builder');
  if (!builder) return;
  const row = document.createElement('div');
  row.className = 'sm-option-row-build';
  row.innerHTML = `
    <input type="text" class="sm-input builder-opt" placeholder="Libellé de l'option" value="${escHtml(value)}" style="flex:1;">
    <button class="sm-btn-remove" type="button"><i class="fas fa-times"></i></button>`;
  row.querySelector('.sm-btn-remove').addEventListener('click', () => row.remove());
  builder.appendChild(row);
}

function handleCreateSurvey() {
  const title   = document.getElementById('c-title')?.value.trim();
  const titleFr = document.getElementById('c-title-fr')?.value.trim();
  const desc    = document.getElementById('c-desc')?.value.trim();
  const type    = document.getElementById('c-type')?.value || 'multi';
  const privacy = document.getElementById('c-privacy')?.value || 'count_only';

  if (!title) { showToast('Veuillez saisir un titre.'); return; }

  const optEls = document.querySelectorAll('.builder-opt');
  const options = Array.from(optEls)
    .map(el => el.value.trim())
    .filter(Boolean)
    .map(label => ({ id: uid(), label }));

  if (options.length < 2) { showToast('Ajoutez au moins 2 options.'); return; }

  const survey = {
    id: uid(),
    title,
    titleFr: titleFr || '',
    description: desc || '',
    type,
    privacy,
    status: 'open',
    isLegacy: false,
    source: 'Manual',
    createdAt: new Date().toISOString(),
    closedAt: null,
    options,
    votesByMember: {},
    legacyCounts: {}
  };

  state.surveys.unshift(survey);
  saveState();

  // Reset form
  ['c-title', 'c-title-fr', 'c-desc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const builder = document.getElementById('option-builder');
  if (builder) builder.innerHTML = '';
  addOptionRow();
  addOptionRow();

  showToast('Sondage créé !');
  renderKPIs();
  setTab('surveys');
}

// ── Vote modal ─────────────────────────────────────────────────
let _voteModalSid = null;

function openVoteModal(sid) {
  const survey = state.surveys.find(s => s.id === sid);
  if (!survey || survey.status !== 'open') {
    showToast('Ce sondage est clôturé.');
    return;
  }
  _voteModalSid = sid;

  const overlay = document.getElementById('vote-modal');
  const title   = document.getElementById('vote-modal-title');
  const opts    = document.getElementById('vote-modal-options');
  const nameEl  = document.getElementById('vote-member-name');
  const datalist = document.getElementById('vote-member-datalist');

  if (title) title.textContent = survey.title;

  // Populate member datalist
  if (datalist) {
    datalist.innerHTML = state.members.map(m =>
      `<option value="${escHtml(m.name)}">`
    ).join('');
  }

  if (nameEl) nameEl.value = '';

  // Build option inputs
  if (opts) {
    const inputType = survey.type === 'single' ? 'radio' : 'checkbox';
    opts.innerHTML = survey.options.map(opt => `
      <label class="sm-vote-option">
        <input type="${inputType}" name="vote-opt" value="${escHtml(opt.id)}">
        ${escHtml(opt.label)}
      </label>`).join('');
  }

  if (overlay) overlay.classList.remove('hidden');
}

function closeVoteModal() {
  _voteModalSid = null;
  const overlay = document.getElementById('vote-modal');
  if (overlay) overlay.classList.add('hidden');
}

function submitVote() {
  if (!_voteModalSid) return;
  const survey = state.surveys.find(s => s.id === _voteModalSid);
  if (!survey || survey.status !== 'open') {
    showToast('Sondage clôturé.');
    closeVoteModal();
    return;
  }

  const nameEl = document.getElementById('vote-member-name');
  const name = nameEl?.value.trim();
  if (!name) { showToast('Veuillez saisir votre nom.'); return; }

  const checked = Array.from(document.querySelectorAll('#vote-modal-options input:checked'))
    .map(el => el.value);

  if (checked.length === 0) { showToast('Sélectionnez au moins une option.'); return; }

  survey.votesByMember[name] = checked;
  saveState();
  closeVoteModal();
  renderSurveys();
  renderKPIs();
  showToast(`Vote de ${name} enregistré !`);
}

// ── Member modal ───────────────────────────────────────────────
let _memberModalId = null;

function openMemberModal(id = null) {
  _memberModalId = id;
  const overlay  = document.getElementById('member-modal');
  const title    = document.getElementById('member-modal-title');
  const nameEl   = document.getElementById('m-name');
  const joinEl   = document.getElementById('m-joined');
  const noteEl   = document.getElementById('m-note');
  const delBtn   = document.getElementById('member-modal-delete');

  if (id) {
    const m = state.members.find(x => x.id === id);
    if (!m) return;
    if (title)  title.textContent = 'Modifier le membre';
    if (nameEl) nameEl.value = m.name;
    if (joinEl) joinEl.value = m.joinedAt ? m.joinedAt.slice(0, 10) : '';
    if (noteEl) noteEl.value = m.note || '';
    if (delBtn) delBtn.classList.remove('hidden');
  } else {
    if (title)  title.textContent = 'Ajouter un membre';
    if (nameEl) nameEl.value = '';
    if (joinEl) joinEl.value = new Date().toISOString().slice(0, 10);
    if (noteEl) noteEl.value = '';
    if (delBtn) delBtn.classList.add('hidden');
  }

  if (overlay) overlay.classList.remove('hidden');
}

function closeMemberModal() {
  _memberModalId = null;
  const overlay = document.getElementById('member-modal');
  if (overlay) overlay.classList.add('hidden');
}

function saveMember() {
  const nameEl = document.getElementById('m-name');
  const joinEl = document.getElementById('m-joined');
  const noteEl = document.getElementById('m-note');

  const name   = nameEl?.value.trim();
  const joined = joinEl?.value;
  const note   = noteEl?.value.trim();

  if (!name) { showToast('Le nom est obligatoire.'); return; }

  if (_memberModalId) {
    const m = state.members.find(x => x.id === _memberModalId);
    if (m) {
      m.name = name;
      m.joinedAt = joined ? new Date(joined).toISOString() : m.joinedAt;
      m.note = note;
    }
    showToast('Membre mis à jour.');
  } else {
    state.members.push({
      id: uid(),
      name,
      joinedAt: joined ? new Date(joined).toISOString() : new Date().toISOString(),
      note
    });
    showToast('Membre ajouté.');
  }

  saveState();
  closeMemberModal();
  renderMembers();
  renderKPIs();
}

function deleteMember() {
  if (!_memberModalId) return;
  if (!confirm('Supprimer ce membre ?')) return;
  const idx = state.members.findIndex(x => x.id === _memberModalId);
  if (idx >= 0) state.members.splice(idx, 1);
  saveState();
  closeMemberModal();
  renderMembers();
  renderKPIs();
  showToast('Membre supprimé.');
}

// ── Sharing tab ────────────────────────────────────────────────
const TAG_COLORS = {
  'Finance':  { bg: '#d1fae5', color: '#065f46' },
  'Tech':     { bg: '#dbeafe', color: '#1d4ed8' },
  'Visa':     { bg: '#ede9fe', color: '#5b21b6' },
  'Vie':      { bg: '#fef3c7', color: '#92400e' },
  'Carrière': { bg: '#fce7f3', color: '#9d174d' },
  'Autre':    { bg: '#f1f5f9', color: '#475569' }
};

function toEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    // Google Drive file: .../file/d/ID/view → .../file/d/ID/preview
    const driveFile = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (driveFile) {
      return `https://drive.google.com/file/d/${driveFile[1]}/preview`;
    }
    // Google Docs: /document/d/ID/...
    const gDoc = u.pathname.match(/\/document\/d\/([^/]+)/);
    if (gDoc) {
      return `https://docs.google.com/document/d/${gDoc[1]}/preview`;
    }
    // Google Slides: /presentation/d/ID/...
    const gSlides = u.pathname.match(/\/presentation\/d\/([^/]+)/);
    if (gSlides) {
      return `https://docs.google.com/presentation/d/${gSlides[1]}/preview`;
    }
    // Google Sheets: /spreadsheets/d/ID/...
    const gSheets = u.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
    if (gSheets) {
      return `https://docs.google.com/spreadsheets/d/${gSheets[1]}/preview`;
    }
    return null;
  } catch (_) {
    return null;
  }
}

function renderSharings() {
  const container = document.getElementById('sharing-list');
  if (!container) return;

  if (state.sharings.length === 0) {
    container.innerHTML = `
      <div class="sm-empty">
        <i class="fas fa-lightbulb"></i>
        <h3>Aucun partage</h3>
        <p>Cliquez sur « + Nouveau partage » pour ajouter une session.</p>
      </div>`;
    return;
  }

  const sorted = [...state.sharings].sort((a, b) => new Date(b.date) - new Date(a.date));
  container.innerHTML = sorted.map(sh => buildSharingCard(sh)).join('');

  // Bind edit buttons
  container.querySelectorAll('[data-action="edit-sharing"]').forEach(btn => {
    btn.addEventListener('click', () => openSharingModal(btn.dataset.sid));
  });

  // Notes auto-save on blur
  container.querySelectorAll('.sm-sharing-notes-input').forEach(ta => {
    ta.addEventListener('blur', () => {
      const sh = state.sharings.find(s => s.id === ta.dataset.sid);
      if (sh && sh.notes !== ta.value) {
        sh.notes = ta.value;
        saveState();
        showToast('Notes sauvegardées.', 1500);
      }
    });
  });

  // Embed toggle buttons
  container.querySelectorAll('[data-action="toggle-embed"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sid = btn.dataset.sid;
      const frameWrap = document.getElementById('embed-' + sid);
      if (!frameWrap) return;
      const isHidden = frameWrap.style.display === 'none' || !frameWrap.style.display;
      frameWrap.style.display = isHidden ? 'block' : 'none';
      btn.innerHTML = isHidden
        ? '<i class="fas fa-compress-alt"></i> Masquer l\'aperçu'
        : '<i class="fas fa-expand-alt"></i> Aperçu';
    });
  });
}

function buildSharingCard(sh) {
  const tagStyle = sh.tag && TAG_COLORS[sh.tag]
    ? `background:${TAG_COLORS[sh.tag].bg};color:${TAG_COLORS[sh.tag].color};`
    : 'background:#f1f5f9;color:#475569;';

  const tagBadge = sh.tag
    ? `<span class="sm-sharing-tag" style="${tagStyle}">${escHtml(sh.tag)}</span>`
    : '';

  const dateStr = sh.date
    ? new Date(sh.date).toLocaleString('fr-FR', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
    : '—';

  const descHtml = sh.description
    ? `<div class="sm-sharing-desc">${escHtml(sh.description)}</div>`
    : '';

  // Doc section
  let docSection = '';
  if (sh.docUrl) {
    const embedUrl = toEmbedUrl(sh.docUrl);
    const embedBtn = embedUrl
      ? `<button class="sm-sharing-embed-toggle" data-action="toggle-embed" data-sid="${sh.id}">
           <i class="fas fa-expand-alt"></i> Aperçu
         </button>`
      : '';
    const embedFrame = embedUrl
      ? `<div id="embed-${sh.id}" class="sm-sharing-embed-frame" style="display:none;">
           <iframe src="${escHtml(embedUrl)}" allowfullscreen loading="lazy"></iframe>
         </div>`
      : '';
    docSection = `
      <div class="sm-sharing-section">
        <div class="sm-sharing-section-label"><i class="fas fa-file-alt"></i> Document</div>
        <div class="sm-sharing-doc-row">
          <a class="sm-sharing-doc-btn" href="${escHtml(sh.docUrl)}" target="_blank" rel="noopener">
            <i class="fas fa-external-link-alt"></i> Ouvrir le document
          </a>
          ${embedBtn}
        </div>
        ${embedFrame}
      </div>`;
  }

  // Notes section (always visible)
  const notesSection = `
    <div class="sm-sharing-section">
      <div class="sm-sharing-section-label"><i class="fas fa-sticky-note"></i> Notes</div>
      <textarea class="sm-sharing-notes-input" data-sid="${sh.id}"
                placeholder="Ajouter des notes sur cette session… (sauvegarde automatique)"
                rows="3">${escHtml(sh.notes || '')}</textarea>
    </div>`;

  return `
    <div class="sm-sharing-card">
      <div class="sm-sharing-head">
        <div class="sm-sharing-meta">
          <span class="sm-sharing-date"><i class="fas fa-calendar-alt"></i>${dateStr}</span>
          <span class="sm-sharing-host"><i class="fas fa-user"></i>${escHtml(sh.host)}</span>
          ${tagBadge}
        </div>
        <div class="sm-sharing-title">${escHtml(sh.title)}</div>
        ${descHtml}
      </div>
      ${docSection}
      ${notesSection}
      <div class="sm-sharing-footer">
        <span class="sm-sharing-created">Ajouté le ${fmtDate(sh.createdAt)}</span>
        <button class="sm-btn-sm" data-action="edit-sharing" data-sid="${sh.id}">
          <i class="fas fa-edit"></i> Modifier
        </button>
      </div>
    </div>`;
}

// ── Sharing modal ──────────────────────────────────────────────
let _sharingModalId = null;

function openSharingModal(id = null) {
  _sharingModalId = id;
  const overlay = document.getElementById('sharing-modal');
  const titleEl = document.getElementById('sharing-modal-title');
  const delBtn  = document.getElementById('sharing-modal-delete');
  const datalist = document.getElementById('sh-host-datalist');

  // Populate member datalist for host field
  if (datalist) {
    datalist.innerHTML = state.members.map(m =>
      `<option value="${escHtml(m.name)}">`
    ).join('');
  }

  if (id) {
    const sh = state.sharings.find(s => s.id === id);
    if (!sh) return;
    if (titleEl) titleEl.textContent = 'Modifier le partage';
    if (delBtn)  delBtn.classList.remove('hidden');
    _fillSharingForm(sh);
  } else {
    if (titleEl) titleEl.textContent = 'Nouveau partage';
    if (delBtn)  delBtn.classList.add('hidden');
    _clearSharingForm();
  }

  if (overlay) overlay.classList.remove('hidden');
}

function _fillSharingForm(sh) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('sh-title', sh.title);
  // datetime-local expects "YYYY-MM-DDTHH:MM"
  set('sh-date', sh.date ? sh.date.slice(0, 16) : '');
  set('sh-host', sh.host);
  set('sh-tag',  sh.tag || '');
  set('sh-desc', sh.description || '');
  set('sh-doc',  sh.docUrl || '');
}

function _clearSharingForm() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  set('sh-title', '');
  // Default to now
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  set('sh-date', local);
  set('sh-host', '');
  set('sh-tag', '');
  set('sh-desc', '');
  set('sh-doc', '');
}

function closeSharingModal() {
  _sharingModalId = null;
  const overlay = document.getElementById('sharing-modal');
  if (overlay) overlay.classList.add('hidden');
}

function saveSharing() {
  const get = id => document.getElementById(id)?.value.trim() || '';
  const title = get('sh-title');
  const date  = get('sh-date');
  const host  = get('sh-host');
  if (!title) { showToast('Veuillez saisir un titre.'); return; }
  if (!date)  { showToast('Veuillez saisir une date.'); return; }
  if (!host)  { showToast('Veuillez saisir un hôte.'); return; }

  const docUrl = get('sh-doc');
  const tag    = get('sh-tag');
  const desc   = get('sh-desc');

  if (_sharingModalId) {
    const sh = state.sharings.find(s => s.id === _sharingModalId);
    if (sh) {
      sh.title       = title;
      sh.date        = new Date(date).toISOString();
      sh.host        = host;
      sh.tag         = tag;
      sh.description = desc;
      sh.docUrl      = docUrl;
    }
    showToast('Partage mis à jour.');
  } else {
    state.sharings.unshift({
      id:          uid(),
      title,
      date:        new Date(date).toISOString(),
      host,
      tag,
      description: desc,
      docUrl,
      notes:       '',
      createdAt:   new Date().toISOString()
    });
    showToast('Partage ajouté !');
  }

  saveState();
  closeSharingModal();
  renderSharings();
}

function deleteSharing() {
  if (!_sharingModalId) return;
  if (!confirm('Supprimer ce partage ?')) return;
  const idx = state.sharings.findIndex(s => s.id === _sharingModalId);
  if (idx >= 0) state.sharings.splice(idx, 1);
  saveState();
  closeSharingModal();
  renderSharings();
  showToast('Partage supprimé.');
}

// ── Import / Export JSON ───────────────────────────────────────
function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `grp-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Export JSON téléchargé.');
}

function triggerImport() {
  document.getElementById('import-file')?.click();
}

function handleImport(evt) {
  const file = evt.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object') throw new Error('Format invalide');
      if (Array.isArray(data.members))  state.members  = data.members;
      if (Array.isArray(data.surveys))  state.surveys  = data.surveys;
      if (Array.isArray(data.sharings)) state.sharings = data.sharings;
      saveState();
      setTab('dashboard');
      renderKPIs();
      showToast('Import réussi !');
    } catch (_) {
      showToast('Erreur : fichier JSON invalide.');
    } finally {
      evt.target.value = '';
    }
  };
  reader.readAsText(file);
}

// ── Init ───────────────────────────────────────────────────────
function init() {
  ensureSeed();
  renderKPIs();

  // Tab buttons
  document.querySelectorAll('.sm-tab').forEach(btn => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab));
  });

  // Default tab
  setTab('dashboard');

  // Member search
  const searchEl = document.getElementById('member-search');
  if (searchEl) {
    searchEl.addEventListener('input', () => renderMembers());
  }

  // Add member button
  const addMemberBtn = document.getElementById('add-member-btn');
  if (addMemberBtn) addMemberBtn.addEventListener('click', () => openMemberModal());

  // Export / import
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importFile = document.getElementById('import-file');
  if (exportBtn)  exportBtn.addEventListener('click', exportJSON);
  if (importBtn)  importBtn.addEventListener('click', triggerImport);
  if (importFile) importFile.addEventListener('change', handleImport);

  // Vote modal buttons
  const voteClose  = document.getElementById('vote-modal-close');
  const voteCancel = document.getElementById('vote-modal-cancel');
  const voteSubmit = document.getElementById('vote-modal-submit');
  if (voteClose)  voteClose.addEventListener('click', closeVoteModal);
  if (voteCancel) voteCancel.addEventListener('click', closeVoteModal);
  if (voteSubmit) voteSubmit.addEventListener('click', submitVote);

  // Vote modal backdrop click
  const voteOverlay = document.getElementById('vote-modal');
  if (voteOverlay) {
    voteOverlay.addEventListener('click', e => {
      if (e.target === voteOverlay) closeVoteModal();
    });
  }

  // Member modal buttons
  const memberClose  = document.getElementById('member-modal-close');
  const memberCancel = document.getElementById('member-modal-cancel');
  const memberSave   = document.getElementById('member-modal-save');
  const memberDelete = document.getElementById('member-modal-delete');
  if (memberClose)  memberClose.addEventListener('click', closeMemberModal);
  if (memberCancel) memberCancel.addEventListener('click', closeMemberModal);
  if (memberSave)   memberSave.addEventListener('click', saveMember);
  if (memberDelete) memberDelete.addEventListener('click', deleteMember);

  // Member modal backdrop
  const memberOverlay = document.getElementById('member-modal');
  if (memberOverlay) {
    memberOverlay.addEventListener('click', e => {
      if (e.target === memberOverlay) closeMemberModal();
    });
  }

  // Add sharing button
  const addSharingBtn = document.getElementById('add-sharing-btn');
  if (addSharingBtn) addSharingBtn.addEventListener('click', () => openSharingModal());

  // Sharing modal buttons
  const sharingClose  = document.getElementById('sharing-modal-close');
  const sharingCancel = document.getElementById('sharing-modal-cancel');
  const sharingSave   = document.getElementById('sharing-modal-save');
  const sharingDelete = document.getElementById('sharing-modal-delete');
  if (sharingClose)  sharingClose.addEventListener('click', closeSharingModal);
  if (sharingCancel) sharingCancel.addEventListener('click', closeSharingModal);
  if (sharingSave)   sharingSave.addEventListener('click', saveSharing);
  if (sharingDelete) sharingDelete.addEventListener('click', deleteSharing);

  // Sharing modal backdrop
  const sharingOverlay = document.getElementById('sharing-modal');
  if (sharingOverlay) {
    sharingOverlay.addEventListener('click', e => {
      if (e.target === sharingOverlay) closeSharingModal();
    });
  }

  // Close modals on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeVoteModal();
      closeMemberModal();
      closeSharingModal();
    }
  });

  // Create tab
  initCreateTab();
}

document.addEventListener('DOMContentLoaded', init);
