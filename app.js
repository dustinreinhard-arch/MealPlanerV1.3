'use strict';
// Kraftkost (früher MealPrep Tracker) – Oberfläche. Der Server liefert nach jeder Aktion den kompletten Zustand (S).

const $ = (s, el = document) => el.querySelector(s);
const WEB = typeof window.mpCall === 'function'; // Handy-Version: Logik läuft im Browser
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let S = null;
const ui = { view: 'dashboard', day: null, week: null, shop: null, swap: null, extraOpen: false, editLot: null, perPortion: false, modal: null };

const ICONS = {
  dumbbell: '<path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11"/>',
  flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 3 .5-3-.5-5.5 1-8.5z"/>',
  grip: '<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8.5 20h7"/>',
  clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
  scan: '<path d="M4 7V5a1 1 0 011-1h2M17 4h2a1 1 0 011 1v2M20 17v2a1 1 0 01-1 1h-2M7 20H5a1 1 0 01-1-1v-2M7 8v8M10 8v8M13 8v8M16 8v8"/>',
  chef: '<path d="M7 14h10v6H7zM7 14a4 4 0 01-1-7.9A4 4 0 0112 4a4 4 0 016 2.1A4 4 0 0117 14"/>',
  home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>',
  box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8"/>',
  cart: '<path d="M3 4h2l2.5 11h10L20 7H6.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 14.5h2M3 10h18"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  pot: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM2 10h20M9 6c0-1.5 1-1.5 1-3M14 6c0-1.5 1-1.5 1-3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  alert: '<path d="M12 4l9 16H3zM12 10v4M12 17.5v.5"/>',
  snow: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>',
  skip: '<circle cx="12" cy="12" r="9"/><path d="M6 18L18 6"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  chart: '<path d="M4 4v16h16M7.5 14l3.5-4 3 2.5L19 7"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  share: '<path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  flag: '<path d="M5 21V4h12l-2 4 2 4H5"/>',
};
const ic = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

// ---------- Datum & Format ----------
const D = s => new Date(s + 'T12:00:00');
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (s, n) => { const d = D(s); d.setDate(d.getDate() + n); return iso(d); };
const diffDays = (a, b) => Math.round((D(b) - D(a)) / 864e5);
const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WDL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const dm = s => { const d = D(s); return `${d.getDate()}.${d.getMonth() + 1}.`; };
const wdShort = s => WD[D(s).getDay()];
const fmtShort = s => `${wdShort(s)}, ${dm(s)}`;
const fmtLong = s => D(s).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
const mondayOf = s => addDays(s, -((D(s).getDay() + 6) % 7));
const budgetMonday = s => mondayOf(addDays(s, 2));
function rel(s) {
  const n = diffDays(S.today, s);
  if (n === 0) return 'heute';
  if (n === 1) return 'morgen';
  if (n === -1) return 'gestern';
  return n > 0 ? `in ${n} Tagen` : `vor ${-n} Tagen`;
}
const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
const eurF = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const num = x => nf0.format(x);
const eur = x => eurF.format(x);
const ingById = id => S.ingredients.find(i => i.id === id);
const recipeById = id => S.recipes.find(r => r.id === id);
const batchById = id => S.batches.find(b => b.id === id);
const niceG = g => (g >= 50 ? Math.round(g / 5) * 5 : Math.round(g));
function amt(ingId, g, nice) {
  const i = ingById(ingId);
  const grams = nice ? niceG(g) : Math.round(g);
  if (i && i.pieceG) {
    const n = Math.round((g / i.pieceG) * 2) / 2;
    return `${nf1.format(n)} ${i.pieceName || 'Stück'}`;
  }
  return grams >= 1000 ? `${nf1.format(grams / 1000)} kg` : `${num(grams)} g`;
}
const curWeek = () => Math.min(Math.max(S.planWeek, 1), S.numWeeks);
const SLOT = { mittag: 'Mittag', abend: 'Abend', snack: 'Snack' };

// ---------- Server ----------
async function call(path, body, raw) {
  const url = path + (path.includes('?') ? '&' : '?') + 'day=' + encodeURIComponent(ui.day || '');
  let res;
  if (WEB) {
    try {
      const r = await window.mpCall(body === undefined ? 'GET' : 'POST', url, body === undefined ? '' : (raw ? body : JSON.stringify(body)));
      res = { ok: r.status < 400, json: async () => JSON.parse(r.body) };
    } catch (e) { toast('Interner Fehler: ' + e.message, true); return null; }
  } else try {
    res = await fetch(url, body === undefined ? {} : {
      method: 'POST', headers: { 'X-MealPrep': '1', 'Content-Type': 'application/json' }, body: raw ? body : JSON.stringify(body),
    });
  } catch (e) {
    $('#offline').hidden = false;
    return null;
  }
  const data = await res.json().catch(() => ({ error: 'Unerwartete Antwort vom Programm.' }));
  if (!res.ok) { toast(data.error || 'Das hat nicht geklappt.', true); return null; }
  if (data.state) S = data.state;
  if (data.report) showSyncReport(data.report, data.undo);
  else if (ui.modal && ui.modal.type === 'gym' && !data.undo) { /* im Gym-Modus keine Meldung über den Knöpfen */ }
  else if (data.msg || data.undo) toast(data.msg || UNDO_MSG[path] || 'Erledigt.', false, data.undo);
  if (data.state) render();
  return data;
}
let toastTimer = 0;
function toast(msg, err, undoTok) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>${undoTok ? `<button class="toast-undo" data-act="undo" data-tok="${undoTok}">Rückgängig</button>` : ''}`;
  t.className = 'toast' + (err ? ' err' : '') + (undoTok ? ' has-undo' : '');
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, err ? 6500 : undoTok ? 7000 : 4200);
}
// Hinweistexte für Aktionen ohne eigene Meldung (damit „Rückgängig“ erscheint)
const UNDO_MSG = { '/api/meal/status': 'Gespeichert.', '/api/shake': 'Shake gespeichert.', '/api/meal/swap': 'Getauscht.', '/api/extra/delete': 'Eintrag gelöscht.', '/api/lot/delete': 'Posten entfernt.' };

// ---------- Rahmen ----------
const PRIMARY = { dashboard: 'Überblick', training: 'Training', kalorien: 'Essen', einkauf: 'Einkauf' }; // untere Leiste am Handy
const NAV = [
  ['dashboard', 'home', 'Überblick'], ['training', 'dumbbell', 'Training'], ['kalorien', 'flame', 'Kalorien'], ['plan', 'cal', 'Wochenplan'],
  ['einkauf', 'cart', 'Einkauf'], ['vorrat', 'box', 'Vorrat'], ['rezepte', 'book', 'Rezepte'], ['budget', 'wallet', 'Budget'],
  ['gewicht', 'chart', 'Gewicht'], ['einstellungen', 'gear', 'Einstellungen'],
];
// Erweiterungspunkte für gym.js
const MODALS = {}, CHANGE = {}, INPUT = {};
const expiring = () => S.lots.filter(l => l.hasMhd && !l.frozen && l.daysLeft <= 2);
function shopRelevant() {
  const l = S.shopping[curWeek() - 1];
  return l && l.open > 0 && S.planWeek <= S.numWeeks ? l : null;
}
function renderNav() {
  const counts = { vorrat: expiring().length, einkauf: (shopRelevant() || { items: [] }).items.length, training: S.gym.active ? 1 : 0 };
  $('#nav').innerHTML = `
    <div class="brand"><img src="icon.svg" alt=""><div>Kraftkost<small>Essen &amp; Training</small></div></div>
    ${NAV.map(([v, i, t]) => `<button class="nav-btn ${PRIMARY[v] ? 'prim' : ''} ${ui.view === v ? 'on' : ''}" data-act="nav" data-view="${v}" title="${t}">${ic(i)}<span data-short="${PRIMARY[v] || t}">${t}</span>${counts[v] ? `<i class="count">${counts[v]}</i>` : ''}</button>`).join('')}
    <button class="nav-btn more-btn ${PRIMARY[ui.view] ? '' : 'on'}" data-act="more" title="Mehr">${ic('menu')}<span data-short="Mehr">Mehr</span>${backupDue() ? '<i class="count">1</i>' : ''}</button>
    <div class="spacer"></div>
    <button class="nav-btn" data-act="theme" title="Hell/Dunkel">${ic(S.settings.theme === 'dark' ? 'sun' : 'moon')}<span>${S.settings.theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'}</span></button>
    <div class="side-foot">Version ${esc(S.version)} · Daten ${WEB ? 'auf diesem Handy' : 'lokal'}</div>`;
}
// Handy: Erinnerung, regelmäßig ein Backup zu teilen (Daten liegen nur auf dem Gerät)
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* egal */ } }
function backupDue() {
  if (!WEB || !S) return false;
  const last = lsGet('mealprep-lastexport') || lsGet('mealprep-firstuse');
  if (!last) { lsSet('mealprep-firstuse', S.today); return false; }
  return diffDays(last, S.today) >= 7;
}
async function exportWeb() {
  const r = await window.mpCall('GET', '/api/export?sync=1', '');
  const name = `kraftkost-sync-handy-${S.today}.json`;
  const file = new File([r.body], name, { type: 'application/json' });
  const done = msg => { lsSet('mealprep-lastexport', S.today); toast(msg); render(); };
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Kraftkost Sync-Datei' }); call('/api/state'); return done('Sync-Datei geteilt. Am PC einfach ins Fenster ziehen.'); }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  call('/api/state');
  done('Sync-Datei gespeichert – du findest sie bei deinen Downloads.');
}
let lastView = '';
function render() {
  if (!S) return;
  document.documentElement.dataset.theme = S.settings.theme;
  if (WEB) { lsSet('mealprep-theme', S.settings.theme); const tc = document.querySelector('meta[name=theme-color]'); if (tc) tc.content = S.settings.theme === 'dark' ? '#0e1113' : '#f3f5f4'; }
  document.body.classList.toggle('is-quick', !!ui.quick);
  renderNav();
  const main = $('#view'), key = ui.quick ? 'q-' + ui.quick : ui.view;
  const top = lastView === key ? main.scrollTop : 0;
  main.innerHTML = ui.quick ? `<div class="q q-${ui.quick}">${ui.quick === 'heute' ? quickHeute() : quickEinkauf()}</div>` : (VIEWS[ui.view] || VIEWS.dashboard)();
  main.scrollTop = top;
  lastView = key;
  renderModal();
}
const head = (title, sub, right = '') => `<header class="page-head"><div><h1>${title}</h1><p>${sub}</p></div><div>${right}</div></header>`;

// ---------- Dashboard ----------
function planStatusText() {
  const ps = S.settings.planStart;
  if (S.today < ps) return `Plan startet ${fmtLong(ps)} (${rel(ps)})`;
  if (S.today > S.planEnd) return 'Plan abgeschlossen – plane die nächste Woche';
  const wd = D(S.today).getDay();
  return wd === 0 || wd === 6 ? `Wochenende vor Planwoche ${curWeek()}` : `Planwoche ${S.planWeek} von ${S.numWeeks}`;
}
function gauge(label, eaten, planned, unit, lo, hi) {
  const max = Math.max((hi || lo) * 1.25, planned, eaten, 1);
  const pct = v => Math.min(100, (v / max) * 100).toFixed(1);
  let cls = '', note;
  if (hi) {
    cls = eaten > hi ? 'red' : '';
    if (planned > hi) note = `Plan liegt ${num(planned - hi)} ${unit} über dem Ziel`;
    else if (planned < lo) note = `Plan liegt ${num(lo - planned)} ${unit} unter dem Ziel`;
    else note = 'Plan liegt im Ziel';
  } else {
    note = planned >= lo ? 'Plan erreicht das Ziel' : `Plan liegt ${num(lo - planned)} ${unit} unter dem Ziel`;
  }
  const rest = Math.max(0, planned - eaten);
  return `<div class="gauge">
    <div class="gauge-top"><div><b>${num(eaten)}</b> <span>${unit} ${label}</span></div><span>geplant ${num(planned)} · offen ${num(rest)}</span></div>
    <div class="bar">
      ${hi ? `<div class="zone" style="left:${pct(lo)}%;width:${(pct(hi) - pct(lo)).toFixed(1)}%"></div>` : ''}
      <div class="plan" style="width:${pct(planned)}%"></div>
      <div class="fill ${cls}" style="width:${pct(eaten)}%"></div>
      ${hi ? '' : `<div class="mark" style="left:${pct(lo)}%"></div>`}
    </div>
    <div class="gauge-foot"><span>${note}</span><span>Ziel ${hi ? `${num(lo)}–${num(hi)}` : `mind. ${num(lo)}`} ${unit}</span></div>
  </div>`;
}
function mealRow(m) {
  const eaten = m.status === 'gegessen', skipped = m.status === 'ausgelassen';
  const tags = [];
  if (m.batch && !m.batchCooked && !skipped) tags.push('<span class="tag warn">noch nicht gekocht</span>');
  if (skipped) tags.push('<span class="tag">ausgelassen</span>');
  return `<div class="row ${eaten ? 'done' : ''} ${skipped ? 'skipped' : ''}">
    <button class="check ${eaten ? 'on' : ''}" data-act="meal-eat" data-id="${m.id}" title="${eaten ? 'Doch nicht gegessen' : 'Als gegessen abhaken'}" aria-label="${esc(m.short)} abhaken">${ic('check')}</button>
    <div class="body"><span class="slot">${SLOT[m.slot]}</span>
      <div class="title"><button data-act="recipe" data-id="${m.recipe}">${esc(m.short)}</button></div>
      <div class="meta">${num(m.kcal)} kcal · ${num(m.protein)} g Protein</div></div>
    ${tags.join('')}
    ${eaten ? '' : `<button class="icon-btn" data-act="meal-swap" data-id="${m.id}" title="Mit einem anderen Tag tauschen">${ic('swap')}</button>
    <button class="icon-btn" data-act="meal-skip" data-id="${m.id}" title="${skipped ? 'Wieder einplanen' : 'Heute auslassen'}">${ic(skipped ? 'plus' : 'skip')}</button>`}
  </div>`;
}
function todayCard() {
  const d = S.day, set = S.settings, isToday = d.date === S.today;
  const rows = [`<div class="row ${d.shake ? 'done' : ''}">
      <button class="check ${d.shake ? 'on' : ''}" data-act="shake" title="Shake abhaken" aria-label="Shake abhaken">${ic('check')}</button>
      <div class="body"><span class="slot">Frühstück</span><div class="title">Proteinshake</div>
      <div class="meta">${num(set.shakeKcal)} kcal · ${num(set.shakeProtein)} g Protein</div></div></div>`];
  d.meals.forEach(m => rows.push(mealRow(m)));
  d.extras.forEach(e => rows.push(`<div class="row done"><span class="check on" style="cursor:default">${ic('check')}</span>
      <div class="body"><span class="slot">Extra</span><div class="title">${esc(e.name)}</div><div class="meta">${num(e.kcal)} kcal · ${num(e.protein)} g Protein</div></div>
      <button class="icon-btn" data-act="extra-del" data-id="${e.id}" title="Eintrag löschen">${ic('trash')}</button></div>`));
  const extra = ui.extraOpen
    ? `<form class="form-row" data-form="extra-add" style="margin-top:12px">
        <label class="f grow">Was? <input type="text" name="name" placeholder="z. B. Banane, Restaurant" required></label>
        <label class="f" style="width:90px">kcal <input type="number" name="kcal" min="0" step="1" required></label>
        <label class="f" style="width:100px">Protein (g) <input type="number" name="protein" min="0" step="0.1" value="0" required></label>
        <button class="btn primary">Speichern</button><button type="button" class="btn ghost" data-act="extra-toggle">Abbrechen</button></form>`
    : `${quickExtraChips(d.date)}<button class="link" data-act="extra-toggle" style="margin-top:12px">+ Etwas anderes gegessen</button>`;
  const empty = d.meals.length ? '' : `<p class="empty">Für diesen Tag ist kein Gericht geplant. Du kannst trotzdem Shake und Extras eintragen.</p>`;
  return `<section class="card c-7">
    <div class="card-head"><div><h2>${isToday ? 'Heute' : fmtLong(d.date)}</h2><span class="sub">${isToday ? fmtLong(d.date) : rel(d.date)}</span></div>
      <div class="daynav">${isToday ? `<button class="btn sm" data-act="quick" data-q="heute">Schnellansicht</button>` : '<button class="btn sm" data-act="day-set" data-date="">Heute</button>'}
        <button class="icon-btn" data-act="day-move" data-n="-1" title="Vorheriger Tag">${ic('left')}</button>
        <button class="icon-btn" data-act="day-move" data-n="1" title="Nächster Tag">${ic('right')}</button></div></div>
    <div class="rows">${rows.join('')}</div>${empty}${extra}</section>`;
}
function tasks() {
  const out = [], t = S.today, tomorrow = addDays(t, 1);
  (S.thaw || []).forEach(h => out.push(`<div class="task ${h.now ? 'bad' : 'warn'}"><div class="dot">${ic('snow')}</div><div class="body"><b>${h.now ? 'Jetzt auftauen' : 'Heute Abend auftauen'}: ${esc(h.name)} (${amt(h.ing, h.g)})</b><span>Für ${esc(h.for)} ${h.now ? 'heute' : 'morgen'} – nur eingefroren im Vorrat. ${h.now ? 'Am schnellsten im kalten Wasserbad oder per Auftaufunktion.' : 'Über Nacht im Kühlschrank auftauen lassen.'}</span></div></div>`));
  const cookTask = (b, cls, label) => out.push(`<div class="task ${cls}"><div class="dot">${ic('pot')}</div>
      <div class="body"><b>${label}: ${esc(b.short)} ×${b.portions}</b><span>ca. ${b.minutes} Min.${b.missing.length ? ' · fehlt im Vorrat: ' + esc(b.missing.map(m => m.name).join(', ')) : ''}</span></div>
      <button class="btn sm ghost" data-act="cookmode" data-id="${b.recipe}" data-batch="${b.id}">Kochmodus</button>
      <button class="btn sm primary" data-act="cook" data-id="${b.id}" data-cooked="1">Gekocht</button></div>`);
  if (addDays(S.today, 5) >= S.nextMonday) out.push(`<div class="task info"><div class="dot">${ic('flag')}</div><div class="body"><b>${S.today > S.planEnd ? 'Dein Plan ist durch' : 'Ab ' + fmtShort(S.nextMonday) + ' ist noch nichts geplant'}</b><span>Lass dir die nächste Woche vorschlagen – passend zu Zielen, Budget und Vorrat.</span></div><button class="btn sm primary" data-act="gen">Planen</button></div>`);
  const shop = shopRelevant();
  if (syncAge() !== null && syncAge() >= 3) out.push(`<div class="task warn"><div class="dot">${ic('share')}</div><div class="body"><b>Abgleich mit dem ${WEB ? 'PC' : 'Handy'}</b><span>Letzter Abgleich vor ${syncAge()} Tagen. ${WEB ? 'Teile die Sync-Datei und zieh sie am PC ins Fenster.' : 'Speichere die Sync-Datei oder zieh die Datei vom Handy hier hinein.'}</span></div><button class="btn sm" data-act="sync-out">${WEB ? 'Teilen' : 'Speichern'}</button></div>`);
  else if (backupDue()) out.push(`<div class="task warn"><div class="dot">${ic('share')}</div><div class="body"><b>Backup teilen</b><span>Deine Daten liegen nur auf diesem Handy. Schick dir einmal pro Woche ein Backup, z. B. per Mail.</span></div><button class="btn sm" data-act="export-web">Teilen</button></div>`);
  if (shop && shop.items.length) out.push(`<div class="task warn"><div class="dot">${ic('cart')}</div><div class="body"><b>Einkaufen für Woche ${shop.week}</b><span>${shop.items.length} Artikel fehlen, ca. ${eur(shop.total)}</span></div><button class="btn sm" data-act="nav" data-view="einkauf">Liste</button></div>`);
  S.batches.filter(b => !b.cooked && b.cookDate && b.cookDate < t && b.lastDate >= t).forEach(b => cookTask(b, 'bad', 'Überfällig'));
  S.batches.filter(b => !b.cooked && b.cookDate === t).forEach(b => cookTask(b, 'warn', D(t).getDay() === 0 ? 'Heute vorkochen' : 'Heute kochen'));
  S.lots.filter(l => l.hasMhd && !l.frozen && l.daysLeft <= 2).slice(0, 4).forEach(l => {
    const when = l.daysLeft < 0 ? `seit ${-l.daysLeft} ${l.daysLeft === -1 ? 'Tag' : 'Tagen'} abgelaufen` : l.daysLeft === 0 ? 'läuft heute ab' : `läuft ${rel(l.mhd)} ab`;
    out.push(`<div class="task ${l.daysLeft < 0 || l.hint === 'warn' ? 'bad' : 'warn'}"><div class="dot">${ic('alert')}</div><div class="body"><b>${esc(l.name)} (${amt(l.ing, l.g)}) ${when}</b><span>${hintText(l)}</span></div><button class="btn sm" data-act="nav" data-view="vorrat">Vorrat</button></div>`);
  });
  S.batches.filter(b => b.keepWarn).forEach(b => out.push(`<div class="task warn"><div class="dot">${ic('snow')}</div><div class="body"><b>${esc(b.short)}: eine Portion ist erst nach der Haltbarkeit eingeplant</b><span>Hält bis ${fmtShort(b.expires)}. Portion einfrieren oder Gericht im Wochenplan tauschen.</span></div></div>`));
  S.batches.filter(b => !b.cooked && b.cookDate === tomorrow).forEach(b => out.push(`<div class="task info"><div class="dot">${ic('pot')}</div><div class="body"><b>Morgen kochen: ${esc(b.short)} ×${b.portions}</b><span>ca. ${b.minutes} Min.${b.missing.length ? ' · fehlt noch: ' + esc(b.missing.map(m => m.name).join(', ')) : ' · alles im Vorrat'}</span></div><button class="btn sm ghost" data-act="recipe" data-id="${b.recipe}">Rezept</button></div>`));
  if (!out.length) out.push(`<div class="task"><div class="dot">${ic('check')}</div><div class="body"><b>Nichts zu tun</b><span>Heute muss weder gekocht noch eingekauft werden.</span></div></div>`);
  return out.join('');
}
function hintText(l) {
  if (l.frozen) return 'Eingefroren – am Vorabend zum Auftauen in den Kühlschrank legen.';
  if (l.hint === 'ok') return `Eingeplant: ${fmtShort(l.hintDate)} für ${esc(l.hintDish)}.`;
  if (l.hint === 'warn') return `Erst am ${fmtShort(l.hintDate)} für ${esc(l.hintDish)} eingeplant – vorher einfrieren oder früher kochen.`;
  const r = S.recipes.filter(x => x.ings.some(i => i.ing === l.ing)).slice(0, 2).map(x => x.short);
  return r.length ? `Nicht eingeplant. Passt zum Beispiel in: ${esc(r.join(', '))}.` : 'Nicht eingeplant.';
}
function weekStrip() {
  const w = S.weeks[curWeek() - 1];
  return `<div class="strip">${w.days.map(d => {
    const dots = d.meals.map(m => `<i class="${m.status === 'gegessen' ? 'e' : m.status === 'ausgelassen' ? 's' : ''}"></i>`).join('');
    const cooks = d.cook.map(batchById).filter(b => b && !b.cooked).length;
    return `<button class="${d.date === S.today ? 'today' : ''} ${d.date === S.day.date ? 'sel' : ''}" data-act="day-set" data-date="${d.date}" title="${fmtLong(d.date)}">
      <div class="wd">${wdShort(d.date)}</div><div class="dn">${D(d.date).getDate()}</div><div class="dots">${dots}</div>
      <div class="kc">${d.meals.length ? num(d.plannedKcal) + ' kcal' : cooks ? 'vorkochen' : '–'}</div>${typeof trainMini === 'function' ? trainMini(d) : ''}</button>`;
  }).join('')}</div>`;
}
function budgetCard() {
  const b = S.budget[0];
  const pct = b.budget > 0 ? Math.min(100, (b.spent / b.budget) * 100) : 0;
  return `<section class="card c-4"><div class="card-head"><h2>Budget</h2><span class="sub">${b.n >= 1 && b.n <= S.numWeeks ? 'Woche ' + b.n : 'ab ' + dm(b.monday)}</span></div>
    <div class="big ${b.left < 0 ? 'neg' : ''}">${eur(b.left)}</div><div class="muted small">übrig von ${eur(b.budget)} · ausgegeben ${eur(b.spent)}</div>
    <div class="bar"><div class="fill ${b.left < 0 ? 'red' : pct > 85 ? 'amber' : ''}" style="width:${pct}%"></div></div>
    <button class="link" data-act="nav" data-view="budget">Einkauf eintragen</button></section>`;
}
function pantryCard() {
  const exp = S.lots.filter(l => l.hasMhd && !l.frozen && l.daysLeft <= 4 && !l.staple).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 4);
  const prep = S.batches.filter(b => b.cooked && b.left > 0);
  const n = S.lots.filter(l => !l.staple).length;
  return `<section class="card c-4"><div class="card-head"><h2>Vorrat</h2><span class="sub">${n} Posten</span></div>
    <div class="list">
      ${prep.map(b => `<div class="li"><span class="n">${esc(b.short)}</span><span class="tag ${b.expires < S.today ? 'bad' : 'ok'}">${b.left} ${b.left === 1 ? 'Portion' : 'Portionen'} · bis ${wdShort(b.expires)}</span></div>`).join('')}
      ${exp.map(l => `<div class="li"><span class="n">${esc(l.name)}</span><span class="tag ${l.daysLeft < 0 ? 'bad' : l.daysLeft <= 2 ? 'warn' : ''}">${l.daysLeft < 0 ? 'abgelaufen' : l.daysLeft === 0 ? 'heute' : 'noch ' + l.daysLeft + ' T.'}</span></div>`).join('')}
      ${!prep.length && !exp.length ? `<div class="empty">${n ? 'Nichts läuft in den nächsten Tagen ab.' : 'Noch leer. Buche deinen Einkauf, dann füllt sich der Vorrat von selbst.'}</div>` : ''}
    </div>
    <button class="link" data-act="nav" data-view="vorrat" style="margin-top:10px">Zum Vorrat</button></section>`;
}
function shopCard() {
  const l = S.shopping[curWeek() - 1];
  const done = !l.items.length;
  return `<section class="card c-4"><div class="card-head"><h2>Einkauf</h2><span class="sub">Woche ${l.week}</span></div>
    <div class="big">${done ? 'Alles da' : eur(l.total)}</div>
    <div class="muted small">${done ? (l.open ? 'Für die offenen Gerichte ist alles im Vorrat.' : 'In dieser Woche ist nichts mehr zu kochen.') : `${l.items.length} Artikel fehlen für die offenen Gerichte`}</div>
    <div class="bar"><div class="fill ${l.total > S.budget[0].left && !done ? 'amber' : ''}" style="width:${done ? 100 : Math.min(100, (l.total / Math.max(S.settings.budgetWeek, 1)) * 100)}%"></div></div>
    <button class="link" data-act="nav" data-view="einkauf">Zur Einkaufsliste</button></section>`;
}
const VIEWS = {};
VIEWS.dashboard = () => {
  const h = new Date().getHours();
  const hello = h < 11 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend';
  const d = S.day, set = S.settings;
  return head(hello, `${fmtLong(S.today)} · ${planStatusText()}`) + `<div class="grid dash">
    ${reviewCard()}${todayCard()}
    <section class="card c-5"><div class="card-head"><h2>Tagesbilanz</h2><span class="sub">${d.date === S.today ? 'heute' : fmtShort(d.date)} · inkl. Shake</span></div>
      ${gauge('gegessen', d.eatenKcal, d.plannedKcal, 'kcal', set.kcalMin, set.kcalMax)}
      ${gauge('Protein', d.eatenProtein, d.plannedProtein, 'g', set.proteinMin, 0)}${fillBox()}</section>
    <section class="card c-7"><div class="card-head"><h2>Als Nächstes</h2></div>${tasks()}</section>
    <section class="card c-5"><div class="card-head"><h2>Woche ${curWeek()}</h2><button class="link" data-act="nav" data-view="plan">Wochenplan</button></div>${weekStrip()}</section>
    ${fridgeCard()}${budgetCard()}${pantryCard()}${shopCard()}
  </div>`;
};

// ---------- Wochenplan ----------
function mealCard(m) {
  const eaten = m.status === 'gegessen', skipped = m.status === 'ausgelassen';
  const picked = ui.swap === m.id;
  let cand = false;
  if (ui.swap && !picked && !eaten) {
    const src = findMeal(ui.swap);
    cand = !!src && (src.slot === 'snack') === (m.slot === 'snack');
  }
  const acts = ui.swap ? (picked ? '<span class="tag warn">wird getauscht</span>' : cand ? '<span class="tag warn">hierhin tauschen</span>' : '')
    : `<button class="check ${eaten ? 'on' : ''}" data-act="meal-eat" data-id="${m.id}" title="${eaten ? 'Doch nicht gegessen' : 'Als gegessen abhaken'}" aria-label="${esc(m.short)} abhaken">${ic('check')}</button>
       ${eaten ? '<span class="tag ok">gegessen</span>' : `<button class="icon-btn" data-act="meal-swap" data-id="${m.id}" title="Mit einem anderen Gericht tauschen">${ic('swap')}</button>
       <button class="icon-btn" data-act="meal-skip" data-id="${m.id}" title="${skipped ? 'Wieder einplanen' : 'Auslassen'}">${ic(skipped ? 'plus' : 'skip')}</button>`}`;
  return `<div class="meal ${eaten ? 'eaten' : ''} ${skipped ? 'skipped' : ''} ${picked ? 'pick' : ''} ${cand ? 'cand' : ''}" ${cand ? `data-act="swap-to" data-id="${m.id}"` : ''}>
    <span class="slot">${SLOT[m.slot]}</span>
    <button class="mname" ${cand ? '' : `data-act="recipe" data-id="${m.recipe}"`}>${esc(m.short)}</button>
    <span class="mmeta">${num(m.kcal)} kcal · ${num(m.protein)} g</span>
    <div class="mact">${acts}</div></div>`;
}
function findMeal(id) {
  for (const w of S.weeks) for (const d of w.days) for (const m of d.meals) if (m.id === id) return m;
  return null;
}
function cookChip(b) {
  if (!b) return '';
  if (b.cooked) {
    return `<div class="cook done">${ic('check')}<span><b>${esc(b.short)} ×${b.portions}</b> gekocht · noch ${b.left} ${b.left === 1 ? 'Portion' : 'Portionen'}</span>
      ${b.eaten === 0 ? `<button class="btn sm ghost" data-act="cook" data-id="${b.id}" data-cooked="0">Rückgängig</button>` : ''}</div>`;
  }
  return `<div class="cook">${ic('pot')}<span><b>${esc(b.short)} ×${b.portions}</b> kochen · ${b.minutes} Min.</span>
    ${b.keepWarn ? '<span class="tag warn" title="Eine Portion ist nach der Haltbarkeit eingeplant">Haltbarkeit prüfen</span>' : ''}
    <button class="btn sm ghost" data-act="recipe" data-id="${b.recipe}">Rezept</button>
    <button class="btn sm" data-act="cookmode" data-id="${b.recipe}" data-batch="${b.id}">${ic('chef')} Kochmodus</button>
    <button class="btn sm primary" data-act="cook" data-id="${b.id}" data-cooked="1">Gekocht</button></div>`;
}
VIEWS.plan = () => {
  const wn = ui.week || curWeek();
  const w = S.weeks[wn - 1], set = S.settings;
  const tabs = S.weeks.filter(x => x.n >= curWeek() - 2 || x.n === wn).map(x => `<button class="tab ${x.n === wn ? 'on' : ''}" data-act="week" data-n="${x.n}">Woche ${x.n}${x.n === S.planWeek ? ' · aktuell' : ''}<small>${dm(x.monday)}–${dm(addDays(x.monday, 4))}</small></button>`).join('');
  const days = w.days.map((d, i) => {
    const cooks = d.cook.map(batchById).map(cookChip).join('');
    let main;
    if (i === 0) {
      main = cooks ? `<div class="cooks">${cooks}</div>` : '<p class="empty">Nichts vorzukochen.</p>';
    } else {
      const slots = ['mittag', 'abend', 'snack'].map(sl => {
        const ms = d.meals.filter(m => m.slot === sl);
        return ms.length ? ms.map(mealCard).join('') : `<div class="meal none">kein ${SLOT[sl]}</div>`;
      }).join('');
      main = `${cooks ? `<div class="cooks">${cooks}</div>` : ''}<div class="slots">${slots}</div>`;
    }
    const okK = d.plannedKcal >= set.kcalMin && d.plannedKcal <= set.kcalMax, okP = d.plannedProtein >= set.proteinMin;
    const tot = i === 0 ? '<span class="tag blue">Vorkoch-Tag</span>'
      : `<span class="tag ${okK ? 'ok' : 'warn'}" title="Ziel ${num(set.kcalMin)}–${num(set.kcalMax)} kcal inkl. Shake">${num(d.plannedKcal)} kcal</span><span class="tag ${okP ? 'ok' : 'warn'}" title="Ziel mind. ${num(set.proteinMin)} g inkl. Shake">${num(d.plannedProtein)} g Protein</span>`;
    return `<section class="card day ${d.date === S.today ? 'today' : ''} ${d.date < S.today ? 'past' : ''}">
      <div class="day-info"><div><div class="wd">${WDL[D(d.date).getDay()]}</div><div class="muted small">${dm(d.date)}${d.date === S.today ? ' · heute' : ''}</div></div><div class="tot">${tot}</div></div>
      <div class="day-main">${typeof trainChips === 'function' ? trainChips(d) : ''}${main}</div></section>`;
  }).join('');
  const banner = ui.swap ? `<div class="banner">${ic('swap')}<span>Tauschen: Wähle das Gericht, mit dem <b>${esc((findMeal(ui.swap) || {}).short || '')}</b> den Platz tauschen soll. Du kannst dafür auch die Woche wechseln.</span><button class="btn sm" data-act="swap-cancel">Abbrechen</button></div>` : '';
  return head('Wochenplan', 'Abhaken, auslassen oder Gerichte tauschen. Die Tagessummen enthalten den Shake.', `<div class="form-row head-tools"><button class="btn sm primary" data-act="gen">${ic('spark')} Nächste Woche planen</button></div><div class="tabs">${tabs}</div>`) + banner + days;
};

// ---------- Rezepte ----------
// ---------- Rezepte ----------
const PRESET_TAGS = ['Hähnchen', 'Hack', 'Rind', 'Airfryer', 'Thermomix', 'Ofen', 'Meal-Prep-geeignet', 'High Protein', 'Schnell', 'Vegetarisch'];
const RFILTERS = [['alle', 'Alle'], ['fav', 'Favoriten'], ['eigen', 'Eigene'], ['hp', 'ab 45 g Protein'], ['fit', 'passt ins Ziel'], ['frei', 'ohne Pilze & Fisch']];
ui.rf = { q: '', f: 'alle', tag: '' };
const hardFlags = fl => (fl || []).filter(f => f.kind === 'pilz' || f.kind === 'fisch');
function flagTags(fl) {
  const kinds = [...new Set(hardFlags(fl).map(f => f.kind))];
  const out = kinds.map(k => `<span class="tag bad">${ic('alert')}${k === 'pilz' ? 'Pilze' : 'Fisch'}</span>`);
  if ((fl || []).some(f => f.kind === 'pruefen')) out.push('<span class="tag warn">prüfen</span>');
  return out.join('');
}
function flagBanner(fl) {
  const hard = hardFlags(fl), soft = (fl || []).filter(f => f.kind === 'pruefen');
  if (!hard.length && !soft.length) return '';
  return `${hard.length ? `<div class="banner bad">${ic('alert')}<div><b>Achtung: ${[...new Set(hard.map(f => f.kind === 'pilz' ? 'enthält Pilze' : 'enthält Fisch/Meeresfrüchte'))].join(' und ')}.</b><span>${[...new Set(hard.map(f => esc(f.reason)))].join(' · ')}</span><span class="small">Tipp: Die Zeile im Zutaten-Text ersetzen oder löschen und „Zutaten erkennen“ drücken – dann verschwindet die Warnung.</span></div></div>` : ''}
    ${soft.length ? `<div class="banner warn">${ic('alert')}<div><b>Bitte prüfen</b><span>${[...new Set(soft.map(f => esc(f.reason)))].join(' · ')}</span></div></div>` : ''}`;
}
const costText = r => r.cost > 0 ? `${eur(r.cost)}/Portion${r.costMissing.length ? '*' : ''}` : 'Preis ?';
function recipeMatches(r) {
  const f = ui.rf;
  if (f.f === 'fav' && !r.fav) return false;
  if (f.f === 'eigen' && !r.custom) return false;
  if (f.f === 'hp' && r.protein < 45) return false;
  if (f.f === 'fit' && !(r.fit && r.fit.ok)) return false;
  if (f.f === 'frei' && hardFlags(r.flags).length) return false;
  if (f.tag && !r.showTags.includes(f.tag)) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    const hay = [r.name, r.short, r.cuisine, ...r.showTags, ...r.ings.map(i => (ingById(i.ing) || {}).name || '')].join(' ').toLowerCase();
    if (!q.split(/\s+/).every(w => hay.includes(w))) return false;
  }
  return true;
}
function recipeCard(r) {
  return `<button class="rcard" data-act="recipe" data-id="${r.id}">
    <div class="rcard-top"><span class="slot">${esc(r.cuisine)}</span>${r.fav ? `<span class="heart on" title="Favorit">${ic('heart')}</span>` : ''}</div>
    <h3>${esc(r.name)}</h3>
    <div class="muted small">${r.snack ? 'frisch zubereiten' : `${r.portions} Portionen · ${r.minutes} Min. · hält ${r.keep} Tage`}</div>
    <div class="facts"><span class="tag">${num(r.kcal)} kcal</span><span class="tag ok">${num(r.protein)} g Protein</span>${r.snack ? '' : `<span class="tag">${costText(r)}</span>`}
      ${flagTags(r.flags)}${r.weeks.map(w => `<span class="tag blue">Woche ${w}</span>`).join('')}${S.ratings[r.id] ? `<span class="tag star">${ic('star')}${S.ratings[r.id]}</span>` : ''}</div></button>`;
}
function recipeGrid() {
  const list = S.recipes.filter(recipeMatches).sort((a, b) => (b.fav - a.fav) || ((S.ratings[b.id] || 0) - (S.ratings[a.id] || 0)) || (a.snack - b.snack) || a.name.localeCompare(b.name, 'de'));
  if (!list.length) return `<p class="empty">Kein Rezept passt zu dieser Auswahl. <button class="link" data-act="rf" data-f="alle">Filter zurücksetzen</button></p>`;
  return list.map(recipeCard).join('');
}
VIEWS.rezepte = () => {
  const count = {};
  S.recipes.forEach(r => r.showTags.forEach(t => { count[t] = (count[t] || 0) + 1; }));
  const tags = Object.keys(count).sort((a, b) => count[b] - count[a]).slice(0, 10);
  const chips = RFILTERS.map(([k, t]) => `<button class="chip ${ui.rf.f === k ? 'on' : ''}" data-act="rf" data-f="${k}">${t}</button>`).join('')
    + tags.map(t => `<button class="chip tagchip ${ui.rf.tag === t ? 'on' : ''}" data-act="rtag" data-tag="${esc(t)}">#${esc(t)}</button>`).join('');
  const own = S.recipes.filter(r => r.custom).length;
  return head('Rezepte', `${S.recipes.length} Rezepte${own ? `, davon ${own} eigene` : ''} · Nährwerte und Kosten pro Portion`,
    `<div class="form-row"><button class="btn" data-act="r-suggest">${ic('spark')} Vorschlagen</button><button class="btn" data-act="r-import">${ic('download')} Importieren</button><button class="btn primary" data-act="r-new">${ic('plus')} Neues Rezept</button></div>`)
    + `<div class="rbar"><input type="search" class="rsearch" placeholder="Name, Zutat oder Tag suchen" value="${esc(ui.rf.q)}" data-on="rq" aria-label="Rezepte durchsuchen"><div class="chips">${chips}</div></div>
    <div class="grid recipes" id="rgrid">${recipeGrid()}</div>`;
};
function recipeModal(r) {
  const mult = ui.perPortion ? 1 : r.portions;
  const ings = r.ings.map(i => { const x = ingById(i.ing); return `<li><span>${esc(x ? x.name : i.ing)}${i.alt ? ' <span class="muted">(oder Skyr-Rest)</span>' : ''}</span><span>${amt(i.ing, i.g * mult, true)}</span></li>`; }).join('');
  const spiceLines = (r.lines || []).filter(l => l.status === 'gewuerz').map(l => l.text);
  const spices = r.spices || spiceLines.join(', ');
  const fit = r.fit ? `<div class="fitline ${r.fit.level}">${ic(r.fit.ok ? 'check' : 'alert')}<span>${esc(r.fit.text)}</span></div>` : '';
  const cost = r.snack ? '' : `<div class="muted small">Kosten pro Portion: <b style="color:var(--text)">${r.cost > 0 ? eur(r.cost) : 'unbekannt'}</b> – geschätzt aus deinen Einkäufen (${esc(S.settings.stores[0] || 'Edeka')} zuerst), sonst Richtpreisen${r.costMissing.length ? `. <span class="warn-text">Ohne Preis: ${r.costMissing.map(esc).join(', ')}</span>` : ''}.</div>`;
  const src = r.source && (r.source.url || r.source.attribution) ? `<p class="muted small" style="margin-top:14px">${esc(r.source.attribution || 'Quelle')}${r.source.url ? ` · <a href="${esc(r.source.url)}" target="_blank" rel="noopener">Original ansehen</a>` : ''}</p>` : '';
  const srcNut = r.srcKcal ? `<p class="muted small">Laut Quelle: ${num(r.srcKcal)} kcal / ${num(r.srcProtein)} g Protein pro Portion · die App rechnet mit ${num(r.kcal)} kcal / ${num(r.protein)} g aus deinen Zutaten.</p>` : '';
  return `<div class="sheet"><div class="sheet-head"><div><span class="slot">${esc(r.cuisine)}</span><h2>${esc(r.name)}</h2>
      <p class="muted">${r.snack ? '1 Portion · 2 Min. · frisch zubereiten' : `${r.portions} Portionen · ${r.minutes} Min. · im Kühlschrank ${r.keep} Tage haltbar`}</p></div>
      <div class="head-actions"><button class="icon-btn heart ${r.fav ? 'on' : ''}" data-act="r-fav" data-id="${r.id}" title="${r.fav ? 'Aus Favoriten entfernen' : 'Als Favorit merken'}" aria-pressed="${r.fav}">${ic('heart')}</button>
      <button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div></div>
    ${flagBanner(r.flags)}
    <div class="stars" role="group" aria-label="Bewertung"><span class="muted small">Deine Bewertung</span>${[1, 2, 3, 4, 5].map(n => `<button class="star-btn ${n <= (S.ratings[r.id] || 0) ? 'on' : ''}" data-act="rate" data-id="${r.id}" data-n="${n}" title="${n} von 5 Sternen">${ic('star')}</button>`).join('')}</div>
    <div class="nut"><div><b>${num(r.kcal)}</b><span>kcal</span></div><div><b>${num(r.protein)} g</b><span>Protein</span></div><div><b>${num(r.carbs)} g</b><span>Kohlenhydrate</span></div><div><b>${num(r.fat)} g</b><span>Fett</span></div></div>
    <div class="stack" style="gap:6px;margin-bottom:14px">${fit}${cost}${srcNut}</div>
    ${r.showTags.length ? `<div class="facts" style="margin-bottom:14px">${r.showTags.map(t => `<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}
    <div class="cols"><div>
        <div class="card-head" style="margin-bottom:6px"><h4 style="margin:0">Zutaten ${ui.perPortion ? 'pro Portion' : `für ${r.portions} ${r.portions === 1 ? 'Portion' : 'Portionen'}`}</h4>
          ${r.portions > 1 ? `<button class="link small" data-act="per-portion">${ui.perPortion ? 'ganze Menge' : 'pro Portion'}</button>` : ''}</div>
        <ul class="ings">${ings}</ul>
        ${spices ? `<h4 style="margin-top:16px">Gewürze &amp; Kleinkram</h4><p class="small">${esc(spices)}</p>` : ''}</div>
      <div><h4>Zubereitung</h4>${r.steps.length ? `<ol class="steps">${r.steps.map(s => /:$/.test(s) ? `<li class="sec">${esc(s)}</li>` : `<li>${esc(s)}</li>`).join('')}</ol>` : '<p class="muted">Keine Schritte hinterlegt.</p>'}
        ${r.notes ? `<h4 style="margin-top:14px">Notizen</h4><p class="small">${esc(r.notes)}</p>` : ''}
        ${r.snack ? '' : '<p class="muted small" style="margin-top:14px">Hähnchen immer durchgaren. Vorgekochtes innerhalb von 1 Stunde abkühlen und bei höchstens 4 °C lagern.</p>'}${src}</div></div>
    <div class="sheet-foot">${r.custom && !r.inUse ? `<button class="btn ghost danger" data-act="r-del" data-id="${r.id}">${ic('trash')} Löschen</button>` : ''}<span class="grow"></span>
      <button class="btn" data-act="r-edit" data-id="${r.id}">${ic('edit')} Bearbeiten</button>${(() => { const ob = S.batches.find(b => b.recipe === r.id && !b.cooked && b.lastDate >= S.today); return `<button class="btn" data-act="cookmode" data-id="${r.id}" ${ob ? `data-batch="${ob.id}"` : ''}>${ic('chef')} Kochmodus</button>`; })()}${r.snack ? '' : `<button class="btn primary" data-act="r-plan" data-id="${r.id}">${ic('cal')} Einplanen</button>`}</div></div>`;
}

// ---------- Rezept-Editor ----------
const emptyDraft = () => ({ name: '', short: '', cuisine: '', portions: 3, minutes: 30, keep: 3, tags: [], steps: [], spices: '', notes: '', lines: [], flags: [], suggTags: [], suggest: {} });
function openEditor(d, mode) {
  d.tags = d.tags || []; d.steps = d.steps || []; d.lines = d.lines || []; d.suggest = d.suggest || {}; d.suggTags = d.suggTags || []; d.flags = d.flags || [];
  if (mode === 'import') d.tags = [...new Set([...d.tags, ...d.suggTags])];
  ui.ed = { d, mode, newIngs: {}, form: null, ingText: d.lines.map(l => l.text).join('\n'), off: null, dirty: false };
  ui.modal = { type: 'editor' };
  renderModal();
}
const lineKnown = l => !!(ingById(l.ing) || ui.ed.newIngs[l.ing]);
function lineState(l) {
  if (l.status === 'ignoriert') return ['muted', 'nicht mitgerechnet'];
  if (l.status === 'gewuerz') return ['muted', 'Gewürz – nicht gezählt'];
  if (l.status === 'ok' && lineKnown(l) && l.g > 0) return ['ok', ui.ed.newIngs[l.ing] ? 'neu angelegt' : 'erkannt'];
  if (l.status === 'ok' && lineKnown(l)) return ['warn', 'Menge fehlt'];
  if (l.status === 'neu') return ['warn', 'neu – bestätigen'];
  return ['warn', 'bitte zuordnen'];
}
const lineOpen = l => lineState(l)[0] === 'warn';
function nutOf(key) {
  const i = ingById(key); if (i) return i;
  const n = ui.ed.newIngs[key]; if (n) return { kcal: +n.kcal, p: +n.p, c: +n.c, f: +n.f };
  return null;
}
function edNut() {
  const d = ui.ed.d, n = Math.max(1, +d.portions || 1);
  let k = 0, p = 0, c = 0, f = 0, cost = 0, noPrice = [];
  d.lines.forEach(l => {
    if (l.status !== 'ok' || !(l.g > 0)) return;
    const x = nutOf(l.ing); if (!x) return;
    k += x.kcal * l.g / 100; p += x.p * l.g / 100; c += x.c * l.g / 100; f += x.f * l.g / 100;
    const ing = ingById(l.ing), ni = ui.ed.newIngs[l.ing];
    let ppg = 0;
    if (ing) (ing.packs || []).forEach(pk => { if (pk.price > 0 && pk.g > 0 && (!ppg || pk.price / pk.g < ppg)) ppg = pk.price / pk.g; });
    if (ni && +ni.packPrice > 0 && +ni.packG > 0) ppg = ni.packPrice / ni.packG;
    if (ppg) cost += ppg * l.g; else noPrice.push(ing ? ing.name : ni.name);
  });
  return { k: k / n, p: p / n, c: c / n, f: f / n, cost: cost / n, noPrice };
}
function fitClient(k, p) {
  const s = S.settings, dk = Math.round(s.shakeKcal + 2 * k), dp = Math.round(s.shakeProtein + 2 * p);
  const day = `Shake + 2 Portionen = ${num(dk)} kcal / ${num(dp)} g Protein`;
  if (dp < s.proteinMin) return { level: 'protein', ok: false, text: `Zu wenig Protein: ${day} – Ziel ab ${num(s.proteinMin)} g` };
  if (dk > s.kcalMax) return { level: 'high', ok: false, text: `Zu viel: ${day} – Ziel ${num(s.kcalMin)}–${num(s.kcalMax)} kcal` };
  if (dk < s.kcalMin) return { level: 'low', ok: true, text: `Passt mit Snack: ${day}` };
  return { level: 'ok', ok: true, text: `Passt ins Tagesziel: ${day}` };
}
function mapOptions(l) {
  const cand = l.cand || [];
  const seen = new Set();
  let o = '';
  const known = lineKnown(l) || l.status === 'ignoriert' || l.status === 'gewuerz';
  if (!known) o += `<option value="" selected>– bitte wählen –</option>`;
  const opt = (v, t) => { if (seen.has(v)) return ''; seen.add(v); return `<option value="${esc(v)}" ${l.ing === v && l.status === 'ok' ? 'selected' : ''}>${esc(t)}</option>`; };
  let top = '';
  cand.forEach(c => { if (c.ing && ingById(c.ing)) top += opt(c.ing, ingById(c.ing).name); else if (c.cat && ui.ed.d.suggest['neu:' + c.cat]) top += opt('neu:' + c.cat, `Neu: ${c.cat}`); });
  if (l.ing && l.ing.startsWith('neu:') && !seen.has(l.ing)) top += opt(l.ing, `Neu: ${(ui.ed.newIngs[l.ing] || ui.ed.d.suggest[l.ing] || { name: l.ing.slice(4) }).name}`);
  Object.keys(ui.ed.newIngs).forEach(k => { top += opt(k, `Neu: ${ui.ed.newIngs[k].name}`); });
  if (top) o += `<optgroup label="Vorschläge">${top}</optgroup>`;
  const cats = {};
  S.ingredients.filter(i => !i.untracked).forEach(i => { (cats[i.cat] = cats[i.cat] || []).push(i); });
  o += Object.keys(cats).sort().map(c => `<optgroup label="${esc(c)}">${cats[c].sort((a, b) => a.name.localeCompare(b.name, 'de')).map(i => opt(i.id, i.name)).join('')}</optgroup>`).join('');
  o += `<optgroup label="Sonstiges"><option value="__custom">+ Neue Zutat anlegen …</option><option value="__ignore" ${l.status === 'ignoriert' || l.status === 'gewuerz' ? 'selected' : ''}>Nicht mitrechnen (Gewürz, weglassen)</option></optgroup>`;
  return o;
}
function lineRow(l, i) {
  const [cls, txt] = lineState(l);
  const hard = hardFlags(l.flags);
  const form = ui.ed.form && ui.ed.form.i === i ? niForm() : '';
  return `<div class="eline ${cls}${hard.length ? ' flagged' : ''}">
    <div class="eline-text"><span class="state ${cls}">${txt}</span><span>${esc(l.text)}</span>${flagTags(l.flags)}</div>
    <div class="eline-map"><select data-on="ed-map" data-i="${i}" aria-label="Zuordnung für ${esc(l.text)}">${mapOptions(l)}</select>
      ${l.status === 'ok' || l.status === 'neu' || l.status === 'unklar' ? `<label class="gin"><input type="number" min="0" step="1" value="${l.g > 0 ? Math.round(l.g) : ''}" placeholder="?" data-on="ed-g" data-i="${i}" aria-label="Gramm gesamt"><span>g</span></label>` : ''}</div>
    ${l.note ? `<div class="eline-note">${esc(l.note)}</div>` : ''}${l.status === 'neu' && !form ? `<div class="eline-note">Neue Zutat: im Auswahlfeld „Neu: …“ wählen und Nährwerte/Preis prüfen – oder eine vorhandene Zutat nehmen.</div>` : ''}${form}</div>`;
}
function niForm() {
  const f = ui.ed.form, n = f.ni;
  const offRes = ui.ed.off;
  const res = !offRes ? '' : offRes.loading ? '<p class="muted small">Suche läuft …</p>' : offRes.error ? `<p class="warn-text small">${esc(offRes.error)}</p>`
    : !offRes.items.length ? '<p class="muted small">Nichts gefunden – anderen Begriff versuchen oder Werte von der Packung eintragen.</p>'
    : `<div class="offlist">${offRes.items.map((p, k) => `<button class="offitem" data-act="off-pick" data-k="${k}"><b>${esc(p.name)}</b><span>${esc([p.brand, p.quantity].filter(Boolean).join(' · '))}</span><span>${num(p.kcal)} kcal · ${nf1.format(p.p)} g P / 100 g</span>${flagTags(p.flags)}</button>`).join('')}</div><p class="muted small">Daten von Open Food Facts (Lizenz ODbL).</p>`;
  const v = k => esc(n[k] ?? '');
  return `<div class="niform">
    <div class="niform-head"><b>${f.title}</b><span class="muted small">Nährwerte pro 100 g. Herkunft: ${esc(n.nutSource || 'eigene Angabe')}</span></div>
    <div class="form-row">
      <label class="f grow">Name <input type="text" data-ni="name" value="${v('name')}"></label>
      <label class="f">Bereich <select data-ni="cat">${S.ingCats.map(c => `<option ${n.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label></div>
    <div class="form-row nums">
      <label class="f">kcal <input type="number" step="1" min="0" data-ni="kcal" value="${v('kcal')}"></label>
      <label class="f">Protein g <input type="number" step="0.1" min="0" data-ni="p" value="${v('p')}"></label>
      <label class="f">KH g <input type="number" step="0.1" min="0" data-ni="c" value="${v('c')}"></label>
      <label class="f">Fett g <input type="number" step="0.1" min="0" data-ni="f" value="${v('f')}"></label></div>
    <div class="form-row nums">
      <label class="f">Packung g <input type="number" step="1" min="0" data-ni="packG" value="${v('packG')}"></label>
      <label class="f">Preis € <input type="number" step="0.01" min="0" data-ni="packPrice" value="${n.packPrice ? v('packPrice') : ''}" placeholder="unbekannt"></label>
      <label class="f">1 Stück = g <input type="number" step="1" min="0" data-ni="pieceG" value="${n.pieceG ? v('pieceG') : ''}" placeholder="–"></label></div>
    <div class="form-row"><label class="f grow">In Open Food Facts suchen <input type="search" data-ni-q value="${esc(f.q || n.name || '')}" placeholder="z. B. Feta Gut & Günstig"></label>
      <button class="btn" data-act="off-search">${ic('search')} Suchen</button></div>
    ${res}
    <div class="sheet-foot" style="margin-top:10px"><button class="btn ghost" data-act="ni-cancel">Abbrechen</button><button class="btn primary" data-act="ni-ok">${ic('check')} Zutat übernehmen</button></div></div>`;
}
function editorModal() {
  const e = ui.ed, d = e.d;
  const nut = edNut(), fit = fitClient(nut.k, nut.p);
  const open = d.lines.filter(lineOpen).length;
  const newCount = d.lines.filter(l => l.status === 'neu' && d.suggest[l.ing]).length;
  const tags = [...new Set([...PRESET_TAGS, ...d.tags, ...d.suggTags])];
  const title = e.mode === 'edit' ? 'Rezept bearbeiten' : e.mode === 'import' ? 'Import prüfen' : 'Neues Rezept';
  const srcCmp = d.srcKcal ? (() => {
    const off = Math.abs(nut.k - d.srcKcal) / d.srcKcal > 0.2 || (d.srcProtein && Math.abs(nut.p - d.srcProtein) / d.srcProtein > 0.2);
    return `<p class="small ${off ? 'warn-text' : 'muted'}">Laut Quelle: ${num(d.srcKcal)} kcal / ${num(d.srcProtein)} g Protein pro Portion.${off ? ' Die berechneten Werte weichen deutlich ab – Mengen und Zuordnung prüfen.' : ''}</p>`;
  })() : '';
  return `<div class="sheet wide editor"><div class="sheet-head"><div><span class="slot">${title}</span><h2>${esc(d.name || 'Ohne Namen')}</h2>
      ${d.source && d.source.attribution ? `<p class="muted small">${esc(d.source.attribution)}${d.source.url ? ` · <a href="${esc(d.source.url)}" target="_blank" rel="noopener">Original</a>` : ''}</p>` : ''}</div>
      <button class="icon-btn" data-act="ed-close" title="Schließen">${ic('x')}</button></div>
    ${flagBanner((d.flags || []).concat(...d.lines.map(l => l.flags || [])))}
    <div class="ed-grid">
      <section class="stack">
        <div class="form-row"><label class="f grow">Name <input type="text" data-ed="name" value="${esc(d.name)}" placeholder="z. B. Hähnchen-Gyros-Bowl" required></label></div>
        <div class="form-row nums">
          <label class="f">Portionen <input type="number" min="1" max="12" data-ed="portions" value="${d.portions}"></label>
          <label class="f">Zeit (Min.) <input type="number" min="0" max="600" data-ed="minutes" value="${d.minutes || ''}"></label>
          <label class="f">Hält (Tage) <input type="number" min="1" max="7" data-ed="keep" value="${d.keep || 3}"></label>
          <label class="f grow">Küche <input type="text" data-ed="cuisine" value="${esc(d.cuisine || '')}" placeholder="z. B. mexikanisch"></label></div>
        <div><div class="muted small" style="margin-bottom:6px">Tags ${d.suggTags.length ? '· <span class="sugg-dot"></span> = passt laut Zutaten' : ''}</div>
          <div class="chips">${tags.map(t => `<button class="chip ${d.tags.includes(t) ? 'on' : ''}" data-act="ed-tag" data-tag="${esc(t)}">${d.suggTags.includes(t) ? '<span class="sugg-dot"></span>' : ''}${esc(t)}</button>`).join('')}
            <input type="text" class="chip-input" data-on="ed-tag-input" placeholder="+ eigener Tag" aria-label="Eigenen Tag hinzufügen"></div></div>
        <div class="card-head" style="margin:6px 0 0"><h3 class="h3">Zutaten</h3><span class="sub">für alle ${d.portions} Portionen</span></div>
        <label class="f">Eine Zutat pro Zeile, z. B. „500 g Hähnchenbrust“ oder „1 cup rice“
          <textarea rows="5" data-on="ed-ingtext">${esc(e.ingText)}</textarea></label>
        <div class="form-row"><button class="btn" data-act="ed-parse">${ic('spark')} Zutaten erkennen</button>
          ${newCount ? `<button class="btn" data-act="ed-accept">${ic('check')} ${newCount} neue Zutat${newCount > 1 ? 'en' : ''} aus dem Katalog übernehmen</button>` : ''}</div>
        <div class="elines">${d.lines.length ? d.lines.map(lineRow).join('') : '<p class="empty">Noch keine Zutaten. Trag sie oben ein und klicke „Zutaten erkennen“.</p>'}</div>
      </section>
      <section class="stack">
        <div class="ed-summary"><div class="muted small">Pro Portion (berechnet)</div>
          <div class="nut compact"><div><b>${num(nut.k)}</b><span>kcal</span></div><div><b>${num(nut.p)} g</b><span>Protein</span></div><div><b>${num(nut.c)} g</b><span>KH</span></div><div><b>${num(nut.f)} g</b><span>Fett</span></div></div>
          <div class="fitline ${fit.level}">${ic(fit.ok ? 'check' : 'alert')}<span>${esc(fit.text)}</span></div>
          <p class="muted small">Kosten ca. <b style="color:var(--text)">${nut.cost > 0 ? eur(nut.cost) : '–'}</b> pro Portion${nut.noPrice.length ? ` · <span class="warn-text">ohne Preis: ${nut.noPrice.map(esc).join(', ')}</span>` : ''}</p>
          ${srcCmp}</div>
        <label class="f">Zubereitung – ein Schritt pro Zeile <textarea rows="8" data-ed="steps">${esc(d.steps.join('\n'))}</textarea></label>
        <label class="f">Gewürze &amp; Kleinkram <input type="text" data-ed="spices" value="${esc(d.spices || '')}" placeholder="z. B. 1 TL Paprika, Salz, Pfeffer"></label>
        <label class="f">Notizen <textarea rows="2" data-ed="notes">${esc(d.notes || '')}</textarea></label>
      </section></div>
    <div class="sheet-foot"><span class="grow muted small">${open ? `${ic('alert')} Noch ${open} Zeile${open > 1 ? 'n' : ''} klären (zuordnen, Menge eintragen oder „nicht mitrechnen“).` : 'Alles zugeordnet.'}</span>
      <button class="btn ghost" data-act="ed-close">Abbrechen</button><button class="btn primary" data-act="ed-save" ${open ? 'disabled' : ''}>${ic('check')} Speichern</button></div></div>`;
}
async function edReparse() {
  const e = ui.ed, d = e.d;
  const old = d.lines;
  const lines = e.ingText.split('\n').map(s => s.trim()).filter(Boolean);
  const body = { mode: 'lines', lines, draft: { ...d, lines: [] } };
  const r = await call('/api/recipe/draft', body);
  if (!r) return;
  const nd = r.draft;
  nd.lines.forEach(l => {
    const o = old.find(x => x.text === l.text && x.manual);
    if (o) Object.assign(l, { ing: o.ing, status: o.status, g: o.g, manual: true });
  });
  Object.assign(d, { lines: nd.lines, flags: nd.flags, suggTags: nd.suggTags, suggest: { ...d.suggest, ...nd.suggest } });
  renderModal();
}
function acceptNew(key) {
  const e = ui.ed, sg = e.d.suggest[key];
  if (!sg) return;
  e.newIngs[key] = { ...sg };
  e.d.lines.forEach(l => { if (l.ing === key && (l.status === 'neu' || l.status === 'unklar')) { l.status = 'ok'; l.manual = true; } });
}
function importModal() {
  const m = ui.modal;
  const tab = (k, t) => `<button class="tab ${m.tab === k ? 'on' : ''}" data-act="imp-tab" data-tab="${k}">${t}</button>`;
  const body = m.tab === 'link' ? (S.canFetch
    ? `<label class="f">Link zum Rezept <input type="url" data-imp="url" value="${esc(m.url || '')}" placeholder="https://…" autofocus></label>
       <p class="muted small">Die App ruft genau diese eine Seite ab, liest die strukturierten Rezeptdaten (schema.org) und beachtet die robots.txt der Seite. Sperrt eine Seite den Abruf oder liefert sie keine Rezeptdaten, nutze „Text einfügen“.</p>
       <div class="sheet-foot"><button class="btn primary" data-act="imp-link" ${m.busy ? 'disabled' : ''}>${m.busy ? 'Lädt …' : `${ic('download')} Rezept laden`}</button></div>`
    : `<div class="banner warn">${ic('alert')}<div><b>Auf dem Handy nicht möglich</b><span>Der Handy-Browser blockiert das Abrufen fremder Webseiten. Öffne das Rezept im Browser, kopiere Zutaten und Zubereitung und nutze „Text einfügen“ – oder importiere am PC und übertrage es über Einstellungen → „Rezepte übernehmen“.</span></div></div>`)
    : `<label class="f">Rezepttext <textarea rows="12" data-imp="text" placeholder="Titel&#10;Für 4 Portionen&#10;Zutaten&#10;500 g Hähnchenbrust&#10;…&#10;Zubereitung&#10;1. …">${esc(m.text || '')}</textarea></label>
       <p class="muted small">Am besten mit den Zeilen „Zutaten“ und „Zubereitung“ als Überschriften. Englische Rezepte gehen auch (cups, oz, tbsp werden umgerechnet).</p>
       <div class="sheet-foot"><button class="btn primary" data-act="imp-text" ${m.busy ? 'disabled' : ''}>${m.busy ? 'Erkenne …' : `${ic('spark')} Text erkennen`}</button></div>`;
  return `<div class="sheet narrow import"><div class="sheet-head"><h2>Rezept importieren</h2><button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
    <div class="tabs" style="margin:6px 0 14px">${tab('link', 'Per Link')}${tab('text', 'Text einfügen')}</div>${body}</div>`;
}
function planModal() {
  const m = ui.modal, r = recipeById(m.id);
  if (!r) return '';
  const open = S.batches.filter(b => !b.cooked && b.eaten === 0 && b.week >= 1 && b.week <= S.numWeeks && b.lastDate >= S.today);
  const byWeek = {};
  open.forEach(b => { (byWeek[b.week] = byWeek[b.week] || []).push(b); });
  const list = Object.keys(byWeek).sort((a, b) => a - b).map(w => `<div class="pgroup"><div class="muted small">Woche ${w}</div>${byWeek[w].map(b => `<button class="pbatch ${m.batch === b.id ? 'on' : ''}" data-act="planr-pick" data-b="${b.id}" ${b.recipe === r.id ? 'disabled' : ''}>
      <b>${esc(b.short)} ×${b.portions}</b><span>kochen ${fmtShort(b.cookDate)} · gegessen ${b.firstDate === b.lastDate ? fmtShort(b.firstDate) : `${fmtShort(b.firstDate)} – ${fmtShort(b.lastDate)}`}</span></button>`).join('')}</div>`).join('');
  const pv = m.pv;
  let prev = '';
  if (m.loading) prev = '<p class="muted">Rechne …</p>';
  else if (pv) {
    const diff = pv.shopAfter - pv.shopBefore;
    prev = `<div class="preview">
      <h3 class="h3">Was sich ändert</h3>
      <div class="budgetbox ${pv.fits ? 'ok' : 'bad'}">${ic(pv.fits ? 'check' : 'alert')}<div>
        <b>${pv.fits ? 'Passt ins Budget' : 'Über dem Budget'}: ${eur(pv.projected)} von ${eur(pv.budget)} in Woche ${pv.week}</b>
        <span>Einkauf noch offen: ${eur(pv.shopBefore)} → ${eur(pv.shopAfter)} (${diff >= 0 ? '+' : '−'}${eur(Math.abs(diff))})${pv.spent ? ` · bereits ausgegeben ${eur(pv.spent)}` : ''}</span>
        ${pv.noPrice.length ? `<span class="warn-text">Ohne bekannten Preis (nicht in der Summe): ${pv.noPrice.map(esc).join(', ')}</span>` : ''}</div></div>
      <table class="mini"><thead><tr><th>Tag</th><th class="num">kcal</th><th class="num">Protein</th><th></th></tr></thead><tbody>
      ${pv.days.map(x => `<tr><td>${fmtShort(x.date)}</td><td class="num">${num(x.kcalBefore)} → <b>${num(x.kcalAfter)}</b></td><td class="num">${num(x.proteinBefore)} → <b>${num(x.proteinAfter)} g</b></td><td>${x.ok ? '<span class="tag ok">im Ziel</span>' : '<span class="tag warn">außerhalb</span>'}</td></tr>`).join('')}</tbody></table>
      <p class="muted small">Gekocht wird für ${S.batches.find(b => b.id === pv.batch).portions} Portionen – so viele, wie der Plan an dieser Stelle vorsieht. Das Rezept ist für ${r.portions}.</p>
      ${flagBanner(pv.flags)}</div>`;
  }
  return `<div class="sheet planr"><div class="sheet-head"><div><span class="slot">Einplanen</span><h2>${esc(r.short)}</h2><p class="muted">Welches Gericht soll es ersetzen? Nur noch nicht gekochte Gerichte lassen sich tauschen.</p></div>
      <button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
    <div class="planr-grid"><div class="plist">${list || '<p class="empty">Im Plan ist gerade kein offenes Gericht. Starte den Plan in den Einstellungen neu.</p>'}</div><div>${prev || '<p class="muted">Wähle links ein Gericht. Dann siehst du, was sich bei Einkauf, Budget und Tagesbilanz ändert.</p>'}</div></div>
    <div class="sheet-foot"><button class="btn ghost" data-act="modal-close">Abbrechen</button><button class="btn primary" data-act="planr-ok" ${pv ? '' : 'disabled'}>${ic('swap')} Ersetzen</button></div></div>`;
}
function suggestModal() {
  const m = ui.modal;
  const body = !m.list ? '<p class="muted">Suche passende Rezepte …</p>' : !m.list.length ? '<p class="empty">Keine passenden Rezepte gefunden.</p>'
    : m.list.map(sg => { const r = recipeById(sg.recipe); if (!r) return ''; return `<div class="sugg">
      <div class="sugg-head"><button class="link" data-act="recipe" data-id="${r.id}"><b>${esc(r.name)}</b></button><span class="facts"><span class="tag">${num(r.kcal)} kcal</span><span class="tag ok">${num(r.protein)} g Protein</span><span class="tag">${costText(r)}</span></span></div>
      <ul>${sg.reasons.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <div class="form-row"><button class="btn sm" data-act="recipe" data-id="${r.id}">Ansehen</button><button class="btn sm" data-act="r-plan" data-id="${r.id}">${ic('cal')} Einplanen</button></div></div>`; }).join('');
  return `<div class="sheet narrow"><div class="sheet-head"><div><span class="slot">Vorschläge</span><h2>Was passt jetzt?</h2><p class="muted small">Nach Vorrat, bald ablaufenden Zutaten, Restbudget und dem offenen Protein von heute. Rezepte mit Pilzen oder Fisch sind ausgeschlossen.</p></div>
    <button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div><div class="stack">${body}</div></div>`;
}

// ---------- Vorrat ----------
function mhdTag(l) {
  if (l.frozen) return '<span class="tag blue">eingefroren</span>';
  if (!l.hasMhd) return '<span class="muted">–</span>';
  const cls = l.daysLeft < 0 ? 'bad' : l.daysLeft <= 2 ? 'warn' : '';
  const t = l.daysLeft < 0 ? 'abgelaufen' : l.daysLeft === 0 ? 'heute' : l.daysLeft === 1 ? 'morgen' : `noch ${l.daysLeft} Tage`;
  return `${dm(l.mhd)} <span class="tag ${cls}">${t}</span>`;
}
function ingOptions() {
  const cats = {};
  S.ingredients.forEach(i => { (cats[i.cat] = cats[i.cat] || []).push(i); });
  const order = Object.keys(cats).sort((a, b) => (a === 'Basisvorrat') - (b === 'Basisvorrat') || a.localeCompare(b, 'de'));
  return '<option value="">Zutat wählen …</option>' + order.map(c => `<optgroup label="${esc(c)}">${cats[c].sort((a, b) => a.name.localeCompare(b.name, 'de')).map(i => `<option value="${i.id}">${esc(i.name)}</option>`).join('')}</optgroup>`).join('') + '<option value="__new">+ Eigene Zutat …</option>';
}
VIEWS.vorrat = () => {
  let rows = '', cat = null;
  S.lots.forEach(l => {
    if (l.cat !== cat) { cat = l.cat; rows += `<tr class="cat"><td colspan="5">${esc(cat || 'Sonstiges')}</td></tr>`; }
    if (ui.editLot === l.id) {
      rows += `<tr><td>${esc(l.name)}</td><td colspan="4"><form class="form-row" data-form="lot-edit" data-id="${l.id}">
        <label class="f">Menge (g) <input type="number" name="g" min="1" step="1" value="${l.g}" required></label>
        <label class="f">Haltbar bis <input type="date" name="mhd" value="${esc(l.mhd)}"></label>
        <label class="chk"><input type="checkbox" name="frozen" ${l.frozen ? 'checked' : ''}> eingefroren</label>
        <button class="btn sm primary">Speichern</button><button type="button" class="btn sm ghost" data-act="lot-edit" data-id="0">Abbrechen</button></form></td></tr>`;
    } else {
      const i = ingById(l.ing);
      rows += `<tr><td><b>${esc(l.name)}</b></td><td class="num">${amt(l.ing, l.g)}${i && i.pieceG ? ` <span class="sub">(${num(l.g)} g)</span>` : ''}</td>
        <td>${mhdTag(l)}</td><td class="sub">${l.staple ? '' : hintText(l)}</td>
        <td class="act"><button class="icon-btn" data-act="lot-edit" data-id="${l.id}" title="Bearbeiten">${ic('edit')}</button><button class="icon-btn" data-act="lot-del" data-id="${l.id}" title="Entfernen">${ic('trash')}</button></td></tr>`;
    }
  });
  const prep = S.batches.filter(b => b.cooked && b.left > 0);
  const prepHtml = prep.length ? `<section class="card" style="margin-bottom:16px"><div class="card-head stack-head"><h2>Vorgekocht im Kühlschrank</h2><span class="sub">Portionen anpassen, entfernen oder „Nicht gekocht“, falls aus Versehen abgehakt</span></div><div class="list">${prep.map(b =>
    `<div class="li prep"><span class="n"><b>${esc(b.short)}</b> <span class="muted">· gekocht ${fmtShort(b.cookedAt)}</span>
        <span class="tag ${b.expires < S.today ? 'bad' : 'ok'}">haltbar bis ${fmtShort(b.expires)}</span></span>
      <span class="prep-act"><span class="stepper" role="group" aria-label="Portionen von ${esc(b.short)}">
          <button class="icon-btn" data-act="batch-left" data-id="${b.id}" data-n="${b.left - 1}" title="Eine Portion weniger">–</button>
          <b>${b.left} ${b.left === 1 ? 'Portion' : 'Portionen'}</b>
          <button class="icon-btn" data-act="batch-left" data-id="${b.id}" data-n="${b.left + 1}" title="Eine Portion mehr" ${b.left >= 20 ? 'disabled' : ''}>+</button></span>
        ${b.eaten === 0 ? `<button class="btn sm ghost" data-act="cook" data-id="${b.id}" data-cooked="0" title="Zutaten kommen zurück in den Vorrat">Nicht gekocht</button>` : ''}
        <button class="icon-btn" data-act="batch-left" data-id="${b.id}" data-n="0" title="Aus dem Kühlschrank entfernen (weggeworfen oder aufgegessen)">${ic('trash')}</button></span></div>`).join('')}</div>
    <p class="muted small" style="margin-top:8px">Weniger Portionen: die spätesten geplanten Mahlzeiten dieses Gerichts werden ausgelassen. „Nicht gekocht“ legt die Zutaten zurück in den Vorrat.</p></section>` : '';
  return head('Vorrat', 'Was du dahast – mit Menge und Mindesthaltbarkeit. „Gekocht“ zieht die Zutaten automatisch ab.', `<button class="btn" data-act="scan" data-ctx="vorrat">${ic('scan')} Barcode scannen</button>`) + `
    ${prepHtml}
    <section class="card" style="margin-bottom:16px"><div class="card-head"><h2>Hinzufügen</h2><span class="sub">Tipp: Über „Einkauf“ landet der ganze Wocheneinkauf mit einem Klick hier.</span></div>
      <form class="form-row" data-form="lot-add">
        <label class="f grow">Zutat <select name="ing" data-on="lot-ing" required>${ingOptions()}</select></label>
        <label class="f grow" id="newNameWrap" hidden>Name <input type="text" name="newName" placeholder="z. B. Bananen"></label>
        <label class="f" style="width:120px">Menge (g) <input type="number" name="g" min="1" step="1" required></label>
        <label class="f">Haltbar bis <input type="date" name="mhd"></label>
        <label class="chk"><input type="checkbox" name="frozen"> eingefroren</label>
        <button class="btn primary">${ic('plus')} Hinzufügen</button></form>
      <p class="muted small" id="packHint" style="margin-top:8px"></p></section>
    <section class="card">${S.lots.length ? `<table><thead><tr><th>Zutat</th><th class="num">Menge</th><th>Haltbar bis</th><th>Verwendung</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
      : '<p class="empty">Dein Vorrat ist noch leer. Buche deinen Einkauf über „Einkauf“ oder trage oben einzelne Zutaten ein.</p>'}</section>`;
};

// ---------- Einkauf ----------
function shopState(l) {
  if (!ui.shop || ui.shop.week !== l.week) ui.shop = { week: l.week, off: {}, price: {} };
  return ui.shop;
}
function shopSum(l) {
  const st = shopState(l);
  return l.items.reduce((s, it) => s + (st.off[it.ing] ? 0 : (st.price[it.ing] ?? it.cost)), 0);
}
VIEWS.einkauf = () => {
  const wn = (ui.shop && ui.shop.week) || curWeek();
  const l = S.shopping[wn - 1], st = shopState(l);
  const tabs = S.shopping.map(x => `<button class="tab ${x.week === wn ? 'on' : ''}" data-act="shop-week" data-n="${x.week}">Woche ${x.week}<small>${x.items.length ? `${x.items.length} Artikel · ${eur(x.total)}` : 'alles da'}</small></button>`).join('');
  let rows = '', cat = null;
  [...l.items].sort((a, b) => a.cat.localeCompare(b.cat, 'de') || a.name.localeCompare(b.name, 'de')).forEach(it => {
    if (it.cat !== cat) { cat = it.cat; rows += `<tr class="cat"><td colspan="4">${esc(cat)}</td></tr>`; }
    const packs = it.packs.map(p => `${p.count} × ${esc(p.label)}`).join(' + ');
    rows += `<tr><td style="width:1%"><input type="checkbox" data-on="shop-check" data-ing="${it.ing}" ${st.off[it.ing] ? '' : 'checked'} aria-label="${esc(it.name)} gekauft"></td>
      <td><button class="link strong" data-act="price" data-ing="${esc(it.ing)}">${esc(it.name)}</button>${it.lastStore ? `<span class="sub"> · zuletzt ${esc(it.lastStore)} ${fmtShort(it.lastDate)}${S.prices[it.ing] && S.prices[it.ing].best.store !== it.lastStore ? `, günstiger zuletzt bei ${esc(S.prices[it.ing].best.store)}` : ''}</span>` : ''}<div class="sub">Bedarf ${amt(it.ing, it.need)}${it.have > 0 ? `, vorhanden ${amt(it.ing, it.have)}` : ''} · für ${esc(it.usedIn.join(', '))}</div></td>
      <td>${packs}</td>
      <td class="num"><input type="number" min="0" step="0.01" value="${(st.price[it.ing] ?? it.cost).toFixed(2)}" data-on="shop-price" data-ing="${it.ing}" aria-label="Preis ${esc(it.name)}"> €</td></tr>`;
  });
  const stores = S.settings.stores.map(s => `<option>${esc(s)}</option>`).join('');
  const body = l.items.length ? `<table><thead><tr><th></th><th>Artikel</th><th>Packung</th><th class="num">Preis</th></tr></thead><tbody>${rows}</tbody></table>
      <form class="sumbar" data-form="shop-book" data-week="${l.week}">
        <div class="total"><div class="muted small">Summe der markierten Artikel</div><div class="big" id="shopSum">${eur(shopSum(l))}</div></div>
        <label class="f">Laden <select name="store">${stores}</select></label>
        <label class="f">Datum <input type="date" name="date" value="${S.today}" required></label>
        <button class="btn primary">${ic('check')} Gekauft – in Vorrat &amp; Budget buchen</button></form>
      <p class="muted small" style="margin-top:10px">Preise sind Edeka-Richtwerte (Gut &amp; Günstig). Trag ein, was du wirklich bezahlt hast. Das Mindesthaltbarkeitsdatum wird geschätzt und lässt sich im Vorrat anpassen.</p>`
    : `<p class="empty">${l.open ? 'Für alle offenen Gerichte dieser Woche ist genug im Vorrat.' : 'In dieser Woche ist nichts mehr zu kochen.'}</p>`;
  const staples = l.staples.length ? `<p class="muted small" style="margin-top:12px"><b>Basisvorrat prüfen:</b> ${esc(l.staples.join(', '))} – dazu Gewürze laut Rezept.</p>` : '';
  const tools = `<div class="form-row head-tools"><button class="btn sm" data-act="scan" data-ctx="einkauf">${ic('scan')} Scannen</button><button class="btn sm" data-act="quick" data-q="einkauf">Schnellansicht</button>${l.items.length ? `<button class="btn sm" data-act="q-share" data-week="${l.week}">${ic('share')} Weitergeben</button>` : ''}</div>`;
  return head('Einkauf', 'Die Liste entsteht aus dem Wochenplan minus Vorrat – in echten Packungsgrößen.', `${tools}<div class="tabs">${tabs}</div>`) + `<section class="card">${body}${staples}</section>`;
};

// ---------- Budget ----------
VIEWS.budget = () => {
  const cur = S.budget[0];
  const pct = cur.budget > 0 ? Math.min(100, (cur.spent / cur.budget) * 100) : 0;
  const stores = [...S.settings.stores, 'Sonstiges'].map(s => `<option>${esc(s)}</option>`).join('');
  const thisMon = budgetMonday(S.today);
  const wkLabel = b => (b.n >= 1 && b.n <= S.numWeeks ? `Woche ${b.n}` : 'Woche') + ` · Sa ${dm(addDays(b.monday, -2))} – Fr ${dm(addDays(b.monday, 4))}`;
  const weeks = S.budget.map(b => `<section class="card" style="margin-top:16px"><div class="card-head"><h2>${wkLabel(b)}</h2><span class="sub">ausgegeben ${eur(b.spent)} · <b style="color:${b.left < 0 ? 'var(--red)' : 'var(--accent)'}">${b.left < 0 ? 'überzogen um ' + eur(-b.left) : 'übrig ' + eur(b.left)}</b></span></div>
    ${b.purchases.length ? `<table><tbody>${b.purchases.map(p => `<tr><td style="width:90px">${fmtShort(p.date)}</td><td style="width:110px"><b>${esc(p.store)}</b></td>
      <td class="sub">${esc(p.note || '')}${p.items && p.items.length ? ` <span title="${esc(p.items.map(i => i.name + ' ' + eur(i.price)).join('\n'))}">· ${esc(p.items.slice(0, 4).map(i => i.name).join(', '))}${p.items.length > 4 ? ' …' : ''}</span>` : ''}</td>
      <td class="num"><b>${eur(p.amount)}</b></td><td class="act"><button class="icon-btn" data-act="purchase-del" data-id="${p.id}" title="Einkauf löschen">${ic('trash')}</button></td></tr>`).join('')}</tbody></table>`
      : '<p class="empty">Noch kein Einkauf in dieser Woche.</p>'}</section>`).join('');
  const hist = [...S.budget].sort((a, b) => a.monday.localeCompare(b.monday)).slice(-8);
  const maxV = Math.max(cur.budget, ...hist.map(b => b.spent), 1);
  const bars = hist.length > 1 ? `<section class="card c-12"><div class="card-head"><h2>Verlauf</h2><span class="sub">Ausgaben pro Woche, Budget ${eur(cur.budget)}</span></div>
    <div class="wkbars">${hist.map(b => `<div class="wb"><span>${eur(b.spent)}</span><div class="col ${b.left < 0 ? 'over' : ''}" style="height:${((b.spent / maxV) * 75).toFixed(0)}%"></div><span>${dm(b.monday)}</span></div>`).join('')}</div></section>` : '';
  return head('Budget', 'Eine Budgetwoche läuft von Samstag bis Freitag – der Wochenendeinkauf zählt für die kommende Woche.') + `<div class="grid dash">
    <section class="card c-5"><div class="card-head"><h2>Diese Woche</h2><span class="sub">${wkLabel(cur)}</span></div>
      <div class="big ${cur.left < 0 ? 'neg' : ''}">${eur(cur.left)}</div><div class="muted small">übrig von ${eur(cur.budget)} · ausgegeben ${eur(cur.spent)}</div>
      <div class="bar"><div class="fill ${cur.left < 0 ? 'red' : pct > 85 ? 'amber' : ''}" style="width:${pct}%"></div></div></section>
    <section class="card c-7"><div class="card-head"><h2>Einkauf eintragen</h2></div>
      <form class="form-row" data-form="purchase-add">
        <label class="f" style="width:110px">Betrag (€) <input type="number" name="amount" min="0.01" step="0.01" required></label>
        <label class="f">Laden <select name="store">${stores}</select></label>
        <label class="f">Datum <input type="date" name="date" value="${S.today}" required></label>
        <label class="f">Zählt für <select name="week"><option value="">automatisch</option><option value="${thisMon}">diese Woche</option><option value="${addDays(thisMon, 7)}">nächste Woche</option><option value="${addDays(thisMon, -7)}">letzte Woche</option></select></label>
        <label class="f grow">Artikel / Notiz (optional) <input type="text" name="note" placeholder="z. B. Hähnchen, Quark"></label>
        <button class="btn primary">Speichern</button></form></section>
    ${bars}</div>${weeks}${pricesCard()}`;
};

// ---------- Gewicht ----------
function weightChart(ws) {
  const W = 760, H = 260, L = 44, R = 14, T = 14, B = 30;
  const t0 = D(ws[0].date).getTime(), t1 = Math.max(D(ws[ws.length - 1].date).getTime(), t0 + 6 * 864e5);
  let lo = Math.min(...ws.map(w => w.kg)), hi = Math.max(...ws.map(w => w.kg));
  lo = Math.floor(lo - 0.5); hi = Math.ceil(hi + 0.5);
  const x = d => L + ((D(d).getTime() - t0) / (t1 - t0)) * (W - L - R);
  const y = k => T + ((hi - k) / (hi - lo)) * (H - T - B);
  const step = hi - lo > 8 ? 2 : 1;
  let grid = '';
  for (let k = lo; k <= hi; k += step) grid += `<line x1="${L}" x2="${W - R}" y1="${y(k)}" y2="${y(k)}" class="g"/><text x="${L - 8}" y="${y(k) + 4}" text-anchor="end">${k}</text>`;
  const pts = ws.map(w => `${x(w.date).toFixed(1)},${y(w.kg).toFixed(1)}`).join(' ');
  const dots = ws.map(w => `<circle cx="${x(w.date).toFixed(1)}" cy="${y(w.kg).toFixed(1)}" r="3.5"><title>${fmtShort(w.date)}: ${nf1.format(w.kg)} kg</title></circle>`).join('');
  const lab = [ws[0], ws[ws.length - 1]].filter((w, i, a) => i === 0 || w.date !== a[0].date).map((w, i) => `<text x="${x(w.date)}" y="${H - 8}" text-anchor="${i ? 'end' : 'start'}">${dm(w.date)}</text>`).join('');
  return `<svg class="wchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gewichtsverlauf in kg">${grid}<polyline points="${pts}"/>${dots}${lab}</svg>`;
}
VIEWS.gewicht = () => {
  const ws = S.weights;
  const last = ws[ws.length - 1], first = ws[0];
  const diff = last && first ? last.kg - first.kg : 0;
  const days = last && first ? diffDays(first.date, last.date) : 0;
  const perWeek = days >= 7 ? (diff / days) * 7 : null;
  const stat = (v, l) => `<div><div class="big">${v}</div><div class="muted small">${l}</div></div>`;
  const rows = [...ws].reverse().map(w => `<tr><td>${fmtShort(w.date)}</td><td class="num"><b>${nf1.format(w.kg)} kg</b></td><td class="act"><button class="icon-btn" data-act="weight-del" data-date="${w.date}" title="Eintrag löschen">${ic('trash')}</button></td></tr>`).join('');
  return head('Gewicht', 'Am besten morgens nach dem Aufstehen wiegen – immer zur gleichen Zeit.') + `<div class="grid dash">
    <section class="card c-5"><div class="card-head"><h2>Gewicht eintragen</h2></div>
      <form class="form-row" data-form="weight-add">
        <label class="f grow">Gewicht (kg) <input type="number" name="kg" min="30" max="300" step="0.1" placeholder="${last ? nf1.format(last.kg).replace(',', '.') : '65.0'}" required></label>
        <label class="f grow">Datum <input type="date" name="date" value="${S.today}" max="${S.today}" required></label>
        <button class="btn primary">Speichern</button></form>
      <p class="muted small" style="margin-top:10px">Ein Wert pro Tag. Ein neuer Eintrag am selben Tag ersetzt den alten.</p></section>
    <section class="card c-7"><div class="card-head"><h2>Stand</h2>${last ? `<span class="sub">seit ${dm(first.date)}</span>` : ''}</div>
      ${last ? `<div class="statrow">${stat(nf1.format(last.kg) + ' kg', 'aktuell')}${stat((diff > 0 ? '+' : '') + nf1.format(diff) + ' kg', 'seit dem ersten Eintrag')}${perWeek === null ? '' : stat((perWeek > 0 ? '+' : '') + nf1.format(perWeek) + ' kg', 'pro Woche im Schnitt')}</div>
        ${perWeek !== null && perWeek < -1 ? '<p class="muted small" style="margin-top:10px">Mehr als 1 kg pro Woche ist bei 65 kg viel. Wenn das anhält, iss den Snack an jedem Tag.</p>' : ''}`
      : '<p class="empty">Noch kein Eintrag. Trag dein Startgewicht ein, dann siehst du hier den Verlauf.</p>'}</section>
    ${ws.length >= 2 ? `<section class="card c-12"><div class="card-head"><h2>Verlauf</h2><span class="sub">kg</span></div>${weightChart(ws)}</section>` : ''}
    ${ws.length ? `<section class="card c-12"><div class="card-head"><h2>Einträge</h2></div><table><tbody>${rows}</tbody></table></section>` : ''}</div>`;
};

// ---------- Einstellungen ----------
VIEWS.einstellungen = () => {
  const s = S.settings;
  const base = mondayOf(S.today);
  const mondays = [];
  for (let i = -1; i <= 8; i++) mondays.push(addDays(base, 7 * i));
  if (!mondays.includes(s.planStart)) mondays.unshift(s.planStart);
  return head('Einstellungen', `Ziele, Plan und Daten. Alles bleibt auf diesem ${WEB ? 'Handy' : 'Computer'}.`) + `<div class="grid settings">
    <section class="card"><div class="card-head"><h2>Ziele &amp; Budget</h2></div>
      <form class="stack" data-form="settings">
        <div class="form-row"><label class="f grow">kcal von <input type="number" name="kcalMin" value="${s.kcalMin}" min="800" step="10" required></label>
          <label class="f grow">kcal bis <input type="number" name="kcalMax" value="${s.kcalMax}" min="800" step="10" required></label>
          <label class="f grow">Protein mind. (g) <input type="number" name="proteinMin" value="${s.proteinMin}" min="0" step="1" required></label></div>
        <div class="form-row"><label class="f grow">Budget pro Woche (€) <input type="number" name="budgetWeek" value="${s.budgetWeek}" min="0" step="1" required></label>
          <label class="f grow">Shake kcal <input type="number" name="shakeKcal" value="${s.shakeKcal}" min="0" step="1" required></label>
          <label class="f grow">Shake Protein (g) <input type="number" name="shakeProtein" value="${s.shakeProtein}" min="0" step="1" required></label></div>
        <label class="f">Läden (mit Komma getrennt, dein Lieblingsladen zuerst) <input type="text" name="stores" value="${esc(s.stores.join(', '))}"></label>
        <div><button class="btn primary">Speichern</button></div></form></section>
    <section class="card"><div class="card-head"><h2>4-Wochen-Plan</h2></div>
      <p class="muted" style="margin-bottom:12px">Aktueller Start: <b style="color:var(--text)">${fmtLong(s.planStart)}</b>. Ein Neustart legt den 4-Wochen-Startplan als Vorlage neu an und ersetzt nur offene, noch nicht gekochte Mahlzeiten ab heute. Gegessenes, Ausgelassenes, Gekochtes, Vorrat und Einkäufe bleiben.</p>
      <form class="form-row" data-form="plan-reset"><label class="f grow">Neuer Start (Montag) <select name="start">${mondays.map(m => `<option value="${m}" ${m === s.planStart ? 'selected' : ''}>${fmtLong(m)}${m === s.planStart ? ' (aktuell)' : ''}</option>`).join('')}</select></label>
        <button class="btn">Plan neu starten</button></form></section>
    ${WEB ? `<section class="card"><div class="card-head"><h2>Daten &amp; Backup</h2></div>
      <div class="stack"><p class="muted small">Deine Daten liegen nur auf diesem Handy, im Speicher der App – ohne Konto und ohne Cloud. Löschst du die App oder die Website-Daten, sind sie weg. Teile deshalb regelmäßig ein Backup, zum Beispiel per Mail an dich selbst.</p>
        <div class="muted small">Letztes Backup: <b style="color:var(--text)">${lsGet('mealprep-lastexport') ? fmtShort(lsGet('mealprep-lastexport')) : 'noch keins'}</b>${ui.persisted === undefined ? '' : ` · Speicher ${ui.persisted ? 'geschützt' : 'nicht dauerhaft geschützt – App auf den Startbildschirm legen'}`}</div>
        <p class="muted small">Die Sync-Datei ist zugleich dein Backup – teile sie regelmäßig, z. B. per Mail an dich selbst.</p>
        <details class="restore"><summary>Wiederherstellen</summary>
        <label class="f">Backup vollständig einspielen (ersetzt den aktuellen Stand) <input type="file" accept=".json,application/json" data-on="import"></label>
        <label class="f">Nur Rezepte aus einer Datei übernehmen (alles andere bleibt) <input type="file" accept=".json,application/json" data-on="import-recipes"></label></details></div></section>
    ${syncCard()}
    <section class="card"><div class="card-head"><h2>App</h2></div>
      <div class="stack"><label class="f">Beim Öffnen der App zeigen <select data-on="start-opt">${START_OPTS.map(([v, t]) => `<option value="${v}" ${(lsGet('mealprep-start') || 'normal') === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        <p class="muted small">Direkt-Links: <b>…/heute</b> und <b>…/einkaufsliste</b> öffnen die Schnellansicht. Auf dem iPhone öffnet ein Kurzbefehl die App immer auf ihrer Startseite – dafür ist diese Einstellung da.</p>
        <div class="form-row"><button class="btn" data-act="theme">${ic(s.theme === 'dark' ? 'sun' : 'moon')} ${s.theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'}</button></div>
        <p class="muted small">Kraftkost ${esc(S.version)} (früher MealPrep Tracker) für das Handy · funktioniert auch ohne Internet.</p></div></section>` : `<section class="card"><div class="card-head"><h2>Daten &amp; Backup</h2></div>
      <div class="stack"><div><div class="muted small">Speicherort</div><div class="path">${esc(S.dataDir)}</div></div>
        <p class="muted small">Die App legt bei jedem ersten Start am Tag automatisch eine Sicherung im Unterordner „backups“ an (die letzten 14 bleiben erhalten).</p>
        <div class="form-row"><button class="btn" data-act="backup">Backup jetzt erstellen</button><a class="btn" href="/api/export" download>Export als Datei</a>
          <button class="btn" data-act="open-folder">Datenordner öffnen</button></div>
        <details class="restore"><summary>Wiederherstellen</summary>
        <label class="f">Backup vollständig einspielen (ersetzt den aktuellen Stand) <input type="file" accept=".json,application/json" data-on="import"></label>
        <label class="f">Nur Rezepte aus einer Datei übernehmen (alles andere bleibt) <input type="file" accept=".json,application/json" data-on="import-recipes"></label></details></div></section>
    ${syncCard()}
    <section class="card"><div class="card-head"><h2>App</h2></div>
      <div class="stack"><div class="form-row"><button class="btn" data-act="theme">${ic(s.theme === 'dark' ? 'sun' : 'moon')} ${s.theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'}</button>
        <button class="btn danger" data-act="quit">App beenden</button></div>
        <p class="muted small">Kraftkost ${esc(S.version)} (früher MealPrep Tracker) · kein Konto, keine Cloud. Schließt du das Fenster, beendet sich die App von selbst.</p></div></section>`}</div>`;
};

// ---------- Schnellansicht (Direkt-Links /heute und /einkaufsliste) ----------
// Reihenfolge der Bereiche wie bei einem Gang durch Edeka; Tiefkühl zuletzt.
const AISLE = ['Obst & Gemüse', 'Brot & Backwaren', 'Fleisch', 'Milchprodukte & Eier', 'Trockenware & Konserven', 'Basisvorrat', 'Tiefkühl'];
const aisleIdx = c => { const i = AISLE.indexOf(c); return i < 0 ? 50 : i; };
const byAisle = items => [...items].sort((a, b) => aisleIdx(a.cat) - aisleIdx(b.cat) || a.cat.localeCompare(b.cat, 'de') || a.name.localeCompare(b.name, 'de'));
const packText = it => it.packs && it.packs.length ? it.packs.map(p => `${p.count} × ${p.label}`).join(' + ') : amt(it.ing, it.buyG || it.need);
const cartKey = w => `mealprep-cart:${S.settings.planStart}:${w}`;
function cartGet(w) { try { return new Set(JSON.parse(lsGet(cartKey(w)) || '[]')); } catch (e) { return new Set(); } }
function cartSet(w, set) { lsSet(cartKey(w), JSON.stringify([...set])); }
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = () => navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
const START_OPTS = [['normal', 'Startseite (wie bisher)'], ['heute', 'Schnellansicht Heute'], ['einkauf', 'Schnellansicht Einkaufsliste'], ['wochenende', 'Sa/So Einkaufsliste, sonst Heute']];
function startTarget() {
  const v = lsGet('mealprep-start') || 'normal';
  if (v === 'wochenende') { const wd = new Date().getDay(); return wd === 0 || wd === 6 ? 'einkauf' : 'heute'; }
  return v === 'heute' || v === 'einkauf' ? v : null;
}
// Liest den gewünschten Einstieg aus der Adresse: /heute, /einkaufsliste, ?v=heute, #einkauf …
function routeFromUrl() {
  const map = { heute: 'heute', today: 'heute', einkauf: 'einkauf', einkaufsliste: 'einkauf', liste: 'einkauf' };
  const q = new URLSearchParams(location.search).get('v') || location.hash.replace(/^#\/?/, '');
  let k = map[(q || '').toLowerCase()];
  if (!k) { const p = location.pathname.replace(/(\.html)?\/*$/, '').toLowerCase(); k = p.endsWith('/heute') ? 'heute' : p.endsWith('/einkaufsliste') ? 'einkauf' : null; }
  if (k && (location.search || location.hash)) { try { history.replaceState(null, '', location.pathname.replace(/[^/]*$/, '')); } catch (e) { /* egal */ } }
  return k || null;
}
function enterQuick(k) {
  ui.quick = k; ui.modal = null; ui.swap = null;
  if (k === 'einkauf') ui.qweek = null;
  if (ui.day) { ui.day = null; call('/api/state'); } else if (S) render();
}
function quickShopWeek() {
  if (ui.qweek) return S.shopping[ui.qweek - 1];
  const cw = curWeek(), cur = S.shopping[cw - 1];
  if (cur && cur.items.length) return cur;
  const nxt = S.shopping[cw];
  return nxt && nxt.items.length ? nxt : cur;
}
function safariHint() {
  if (!WEB || !isIOS || standalone() || ui.hintClosed) return '';
  return `<div class="q-hint"><div><b>Du bist im Safari-Tab.</b> Safari und die installierte App haben getrennte Daten. Öffne Kraftkost über das Symbol auf dem Home-Bildschirm.</div><button class="icon-btn" data-act="q-hint-x" title="Hinweis schließen">${ic('x')}</button></div>`;
}
function quickTop(k) {
  const seg = (v, t, i) => `<button class="q-seg ${k === v ? 'on' : ''}" data-act="q-go" data-q="${v}" aria-pressed="${k === v}">${ic(i)}${t}</button>`;
  return `<div class="q-top"><div class="q-segs">${seg('heute', 'Heute', 'home')}${seg('einkauf', 'Einkauf', 'cart')}</div>
    <button class="q-exit" data-act="q-exit">Ganze App</button></div>${safariHint()}`;
}
function qStat(label, val, lo, hi, unit) {
  const max = Math.max((hi || lo) * 1.15, val, 1), pct = Math.min(100, (val / max) * 100);
  const state = hi ? (val > hi ? 'over' : val >= lo ? 'ok' : '') : (val >= lo ? 'ok' : '');
  return `<div class="q-stat ${state}"><div class="q-num"><b>${num(val)}</b><span>${hi ? `von ${num(lo)}–${num(hi)}` : `von mind. ${num(lo)}`} ${unit}</span></div>
    <div class="q-bar"><i style="width:${pct.toFixed(1)}%"></i>${hi ? `<em style="left:${((lo / max) * 100).toFixed(1)}%;width:${(((hi - lo) / max) * 100).toFixed(1)}%"></em>` : `<em class="mark" style="left:${((lo / max) * 100).toFixed(1)}%"></em>`}</div><div class="q-lbl">${label}</div></div>`;
}
function quickHeute() {
  const d = S.day, s = S.settings;
  const kcal = (d.shake ? s.shakeKcal : 0) + d.meals.filter(m => m.status === 'gegessen').reduce((a, m) => a + m.kcal, 0) + d.extras.reduce((a, e) => a + e.kcal, 0);
  const prot = (d.shake ? s.shakeProtein : 0) + d.meals.filter(m => m.status === 'gegessen').reduce((a, m) => a + m.protein, 0) + d.extras.reduce((a, e) => a + e.protein, 0);
  const row = (act, id, on, slot, title, meta, extra = '') => `<button class="q-row ${on ? 'on' : ''}" data-act="${act}" ${id ? `data-id="${id}"` : ''} aria-pressed="${on}">
      <span class="q-check">${ic('check')}</span><span class="q-body"><span class="q-slot">${slot}</span><span class="q-name">${esc(title)}</span><span class="q-meta">${meta}${extra}</span></span></button>`;
  const rows = [row('shake', '', d.shake, 'Frühstück', 'Proteinshake', `${num(s.shakeKcal)} kcal · ${num(s.shakeProtein)} g Protein`)];
  d.meals.forEach(m => {
    if (m.status === 'ausgelassen') return;
    rows.push(row('meal-eat', m.id, m.status === 'gegessen', SLOT[m.slot], m.short, `${num(m.kcal)} kcal · ${num(m.protein)} g Protein`, m.batch && !m.batchCooked && m.status !== 'gegessen' ? ' · <span class="q-warn">noch nicht gekocht</span>' : ''));
  });
  d.extras.forEach(e => rows.push(`<div class="q-row on static"><span class="q-check">${ic('check')}</span><span class="q-body"><span class="q-slot">Extra</span><span class="q-name">${esc(e.name)}</span><span class="q-meta">${num(e.kcal)} kcal · ${num(e.protein)} g Protein</span></span></div>`));
  const skipped = d.meals.filter(m => m.status === 'ausgelassen').length;
  return `${quickTop('heute')}<h1 class="q-title">${esc(fmtLong(d.date))}</h1>
    <div class="q-stats">${qStat('Kalorien', kcal, s.kcalMin, s.kcalMax, 'kcal')}${qStat('Protein', prot, s.proteinMin, 0, 'g')}</div>
    <div class="q-list">${rows.join('')}</div>
    ${d.meals.length ? '' : '<p class="q-empty">Heute ist kein Gericht geplant.</p>'}
    ${fillBox(true)}${quickExtraChips(d.date)}
    ${skipped ? `<p class="q-foot">${skipped === 1 ? 'Ein Gericht ist' : `${skipped} Gerichte sind`} heute ausgelassen.</p>` : ''}
    <p class="q-foot">Antippen hakt ab, nochmal antippen nimmt es zurück. Extras und Tauschen findest du unter „Ganze App“.</p>`;
}
function quickEinkauf() {
  const l = quickShopWeek();
  if (!l) return `${quickTop('einkauf')}<p class="q-empty">Kein Plan vorhanden.</p>`;
  const cart = cartGet(l.week), items = byAisle(l.items);
  const inCart = items.filter(it => cart.has(it.ing));
  const openSum = items.filter(it => !cart.has(it.ing)).reduce((a, it) => a + it.cost, 0);
  const weeks = S.shopping.filter(x => x.items.length || x.week === l.week);
  const wchips = weeks.length > 1 ? `<div class="q-weeks">${weeks.map(x => `<button class="chip ${x.week === l.week ? 'on' : ''}" data-act="q-week" data-n="${x.week}">Woche ${x.week}</button>`).join('')}</div>` : '';
  let body = '', cat = null;
  items.forEach(it => {
    if (it.cat !== cat) { cat = it.cat; body += `<h2 class="q-cat">${esc(cat)}</h2>`; }
    const on = cart.has(it.ing);
    body += `<button class="q-row ${on ? 'on' : ''}" data-act="q-cart" data-ing="${esc(it.ing)}" aria-pressed="${on}">
      <span class="q-check">${ic('check')}</span><span class="q-body"><span class="q-name">${esc(it.name)}</span><span class="q-meta">${esc(packText(it))}</span></span>
      <span class="q-price">${it.noPrice ? 'Preis ?' : eur(it.cost)}</span></button>`;
  });
  const staples = l.staples.length ? `<p class="q-foot"><b>Basisvorrat prüfen:</b> ${esc(l.staples.join(', '))}</p>` : '';
  const empty = `<p class="q-empty">${l.open ? 'Alles für diese Woche ist im Vorrat.' : 'In dieser Woche ist nichts mehr zu kochen.'}</p>`;
  return `${quickTop('einkauf')}<div class="q-titlerow"><h1 class="q-title">Einkauf Woche ${l.week}</h1><button class="btn q-scan" data-act="scan" data-ctx="einkauf">${ic('scan')} Scannen</button></div>${wchips}
    ${items.length ? `<div class="q-sum"><b>${inCart.length} von ${items.length}</b> im Wagen · noch ca. <b>${eur(openSum)}</b></div><div class="q-list">${body}</div>${staples}
    <div class="q-actions"><button class="btn q-big" data-act="q-share">${ic('share')} Weitergeben</button>
      <button class="btn primary q-big" data-act="q-book" ${inCart.length ? '' : 'disabled'}>${ic('check')} Fertig – buchen</button></div>
    <p class="q-foot">Antippen legt in den Wagen. „Fertig – buchen“ trägt die Artikel im Wagen in Vorrat und Budget ein.</p>` : empty}`;
}
// Text für andere Apps
function shopText(l, mode, skipCart) {
  const cart = cartGet(l.week);
  const items = byAisle(l.items).filter(it => !(skipCart && cart.has(it.ing)));
  if (mode === 'lines') return items.map(it => `${it.name} – ${packText(it)}`).join('\n');
  let out = `Einkaufsliste Woche ${l.week} (Kraftkost)`, cat = null;
  items.forEach(it => { if (it.cat !== cat) { cat = it.cat; out += `\n\n${cat}`; } out += `\n- ${it.name}: ${packText(it)}`; });
  if (l.staples.length) out += `\n\nBasisvorrat prüfen: ${l.staples.join(', ')}`;
  return out;
}
async function shareText(text, title) {
  if (navigator.share) {
    try { await navigator.share({ title, text }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(text); toast('Liste kopiert – jetzt in der anderen App einfügen.'); }
  catch (e) { ui.modal = { ...(ui.modal || {}), type: 'qshare', showText: text }; renderModal(); }
}
function shareModal() {
  const m = ui.modal, l = S.shopping[m.week - 1], skip = m.skip !== false;
  const n = byAisle(l.items).filter(it => !(skip && cartGet(l.week).has(it.ing))).length;
  return `<div class="sheet narrow"><div class="sheet-head"><div><h2>Einkaufsliste weitergeben</h2><p class="muted">Woche ${l.week} · ${n} Artikel, sortiert nach Supermarkt-Bereichen</p></div>
      <button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
    <label class="q-opt"><input type="checkbox" data-on="q-skip" ${skip ? 'checked' : ''}> Artikel im Wagen weglassen</label>
    <div class="stack" style="margin-top:12px">
      <button class="btn primary q-big" data-act="q-send" data-mode="lines" ${n ? '' : 'disabled'}>${ic('share')} An Kurzbefehl „Zur Einkaufsliste“</button>
      <p class="muted small">Eine Zeile pro Artikel – für die Einkaufsliste in „Erinnerungen“. Erinnerungen sortiert sie selbst in Bereiche. Einrichtung: siehe Anleitung.</p>
      <button class="btn q-big" data-act="q-send" data-mode="text" ${n ? '' : 'disabled'}>${ic('share')} Als Text teilen (mit Bereichen)</button>
      <p class="muted small">Für Notizen, WhatsApp, Mail oder zum Einfügen in eine andere App.</p>
      <button class="btn q-big" data-act="q-copy" ${n ? '' : 'disabled'}>Kopieren</button>
    </div>
    ${m.showText ? `<label class="f" style="margin-top:12px">Text zum Markieren und Kopieren <textarea rows="8" readonly>${esc(m.showText)}</textarea></label>` : ''}
    <p class="muted small" style="margin-top:14px">YAZIO, kaufDA und die EDEKA-App bieten keine offene Schnittstelle, über die eine andere App Artikel in ihre Listen schreiben darf. Den Text kannst du dort nur von Hand übernehmen.</p></div>`;
}
function bookModal() {
  const m = ui.modal, l = S.shopping[m.week - 1], cart = cartGet(l.week);
  const items = l.items.filter(it => cart.has(it.ing)), est = items.reduce((a, it) => a + it.cost, 0);
  const stores = S.settings.stores.map(s => `<option>${esc(s)}</option>`).join('');
  return `<div class="sheet narrow"><div class="sheet-head"><div><h2>${items.length} Artikel buchen</h2><p class="muted">Kommt in den Vorrat und ins Budget von Woche ${l.week}.</p></div>
      <button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
    <form class="stack" data-form="q-book" data-week="${l.week}">
      <label class="f">Laden <select name="store">${stores}</select></label>
      <label class="f">Bezahlt laut Bon (€) <input type="number" name="paid" min="0" step="0.01" inputmode="decimal" value="${est.toFixed(2)}"></label>
      <p class="muted small">Vorausgefüllt ist der geschätzte Preis. Trägst du den echten Betrag ein, verteilt die App ihn auf die Artikel.</p>
      <div class="sheet-foot"><button type="button" class="btn ghost" data-act="modal-close">Abbrechen</button><button class="btn primary">${ic('check')} Buchen</button></div></form></div>`;
}

// ---------- Abgleich PC <-> Handy ----------
const syncAge = () => S.lastSync ? diffDays(S.lastSync.slice(0, 10), S.today) : null;
function syncCard() {
  const age = syncAge(), other = WEB ? 'PC' : 'Handy';
  const last = S.lastSync ? `${fmtShort(S.lastSync.slice(0, 10))}${age > 0 ? ` (vor ${age} ${age === 1 ? 'Tag' : 'Tagen'})` : ' (heute)'}` : 'noch nie';
  return `<section class="card"><div class="card-head"><h2>Abgleich mit dem ${other}</h2><span class="sub">zuletzt: ${last}</span></div>
    <div class="stack"><p class="muted small">Teile die Sync-Datei und spiel sie auf dem ${other} ein. Die App führt beide Stände zusammen: Neues kommt dazu, bei Änderungen auf beiden Geräten gewinnt die neuere. Danach siehst du, was übernommen wurde.</p>
      <div class="form-row"><button class="btn primary" data-act="sync-out">${ic('share')} ${WEB ? 'Sync-Datei teilen' : 'Sync-Datei speichern'}</button></div>
      <label class="f">Sync-Datei vom ${other} einspielen (zusammenführen) <input type="file" accept=".json,application/json" data-on="sync-in"></label>
      ${WEB ? '' : '<p class="muted small">Am PC geht es noch einfacher: Datei vom Handy einfach ins Fenster ziehen.</p>'}</div></section>`;
}
function showSyncReport(rep, undoTok) {
  ui.modal = { type: 'syncrep', rep, undoTok }; renderModal();
}
function syncRepModal() {
  const m = ui.modal, r = m.rep;
  return `<div class="sheet narrow"><div class="sheet-head"><div><h2>Abgleich fertig</h2><p class="muted">Daten ${esc(r.from)} zusammengeführt.</p></div><button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
    <ul class="syncrep">${r.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
    <p class="muted small">Vorher wurde automatisch eine Sicherung angelegt${WEB ? '' : ' (Ordner „backups“, Datei vor-abgleich-…)'}.</p>
    <div class="sheet-foot">${m.undoTok ? `<button class="btn ghost" data-act="undo" data-tok="${m.undoTok}">Rückgängig</button>` : ''}<button class="btn primary" data-act="modal-close">OK</button></div></div>`;
}
function syncFile(file) {
  file.text().then(txt => {
    let info = '';
    try { const d = JSON.parse(txt); info = d.device && d.device.startsWith('handy') ? ' vom Handy' : d.device && d.device.startsWith('pc') ? ' vom PC' : ''; } catch (e) { return toast('Das ist keine Sync-Datei dieser App.', true); }
    confirmBox('Abgleichen?', `„${file.name}“${info} wird mit deinen Daten zusammengeführt. Vorher wird automatisch eine Sicherung angelegt.`, 'Zusammenführen', () => { ui.day = null; call('/api/sync/merge', txt, true); });
  });
}
if (!WEB) {
  document.addEventListener('dragover', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); document.body.classList.add('dropping'); } });
  document.addEventListener('dragleave', e => { if (!e.relatedTarget) document.body.classList.remove('dropping'); });
  document.addEventListener('drop', e => {
    document.body.classList.remove('dropping');
    const f = e.dataTransfer && e.dataTransfer.files[0];
    if (!f) return;
    e.preventDefault();
    if (!/\.json$/i.test(f.name)) return toast('Bitte die Sync-Datei (.json) hineinziehen.', true);
    syncFile(f);
  });
}

// ---------- Kühlschrank, Schnell-Extras, Protein-Lückenfüller ----------
function fridgeCard() {
  const cooked = S.batches.filter(b => b.cooked && b.left > 0).sort((a, b) => a.expires.localeCompare(b.expires));
  const frozen = S.lots.filter(l => l.frozen);
  if (!cooked.length && !frozen.length && !(S.thaw || []).length) return '';
  const row = b => {
    const left = diffDays(S.today, b.expires), cls = left < 0 ? 'bad' : left <= 1 ? 'warn' : 'ok';
    const next = S.weeks.flatMap(w => w.days).flatMap(d => d.meals).filter(m => m.batch === b.id && m.status === 'offen').map(m => m.date).sort()[0];
    return `<li class="fr ${cls}"><div><b>${esc(b.short)}</b> <span class="muted">×${b.left}</span>
      <div class="sub">${left < 0 ? `seit ${fmtShort(b.expires)} über der Haltbarkeit` : left === 0 ? 'hält bis heute' : `hält bis ${fmtShort(b.expires)}`}${next ? ` · nächste Portion ${next === S.today ? 'heute' : fmtShort(next)}` : ''}${b.keepWarn ? ' · eine Portion einfrieren' : ''}</div></div>
      <span class="pill ${cls}">${left < 0 ? 'abgelaufen' : left === 0 ? 'heute' : left === 1 ? '1 Tag' : left + ' Tage'}</span></li>`;
  };
  return `<section class="card c-5"><div class="card-head"><h2>Kühlschrank</h2><button class="link" data-act="nav" data-view="vorrat">Bearbeiten</button></div>
    ${cooked.length ? `<ul class="fridge">${cooked.map(row).join('')}</ul>` : '<p class="muted small">Gerade keine vorgekochten Portionen.</p>'}
    ${frozen.length ? `<p class="muted small" style="margin-top:10px">${ic('snow')} Im Tiefkühler: ${frozen.map(l => `${esc(l.name)} ${amt(l.ing, l.g)}`).join(', ')}</p>` : ''}</section>`;
}
function quickExtraChips(date) {
  const q = S.quickExtras || [];
  if (!q.length) return '';
  return `<div class="qx-row"><span class="muted small">Schnell eintragen:</span>${q.map((x, i) => `<button class="chip qx" data-act="qx-add" data-i="${i}" data-date="${date}" title="${esc(x.name)}: ${num(x.kcal)} kcal, ${nf1.format(x.protein)} g Protein"><i class="qx-n">+ ${esc(x.name)}</i> <span>${num(x.kcal)} kcal</span></button>`).join('')}</div>`;
}
function fillBox(compact) {
  const f = S.fill;
  if (!f || S.day.date !== S.today) return '';
  const opts = f.options.map((o, i) => `<button class="fill-opt ${o.overKcal ? 'over' : ''}" data-act="fill-add" data-i="${i}">
      <span><b>${esc(o.label)} ${esc(o.name)}</b><em>${num(o.kcal)} kcal · ${nf1.format(o.protein)} g Protein${o.protein < f.gap - 2 ? ` · deckt ${num(o.protein)} von ${num(f.gap)} g` : ''}${o.overKcal ? ' · über dem kcal-Ziel' : ''}</em></span><i>Eintragen</i></button>`).join('');
  return `<div class="pfill ${compact ? 'compact' : ''}"><b>Heute fehlen noch ${num(f.gap)} g Protein</b> <span class="muted small">(noch ${num(Math.max(0, f.kcalRoom))} kcal Luft)</span>
    ${opts ? `<div class="fill-opts">${opts}</div><span class="muted small">Aus deinem Vorrat – „Eintragen“ bucht es als Extra und zieht es vom Vorrat ab.</span>` : '<p class="muted small">Im Vorrat ist gerade kein passender Eiweiß-Snack (z. B. Skyr, Magerquark, Eier).</p>'}</div>`;
}

// ---------- Plan-Generator ----------
async function genCall(path, body) {
  const m = ui.modal;
  m.loading = true; renderModal();
  const r = await call(path, body);
  if (ui.modal !== m) return;
  m.loading = false;
  if (r && r.preview) m.pv = r.preview;
  renderModal();
}
function genModal() {
  const m = ui.modal, pv = m.pv, set = S.settings;
  if (!pv) return `<div class="sheet narrow"><div class="sheet-head"><h2>Nächste Woche planen</h2><button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div><p class="muted">Suche passende Gerichte …</p></div>`;
  const opts = (cur, snack) => `<option value="">${snack ? 'kein Snack' : 'Austauschen …'}</option>` + pv.options.filter(o => o.snack === snack).map(o => `<option value="${esc(o.id)}" ${o.id === cur ? 'selected' : ''}>${esc(o.name)} · ${num(o.kcal)} kcal · ${num(o.protein)} g P${o.cost ? ' · ' + eur(o.cost) : ''}${o.recent && !snack ? ' · zuletzt gegessen' : ''}</option>`).join('');
  const slot = v => `<div class="gslot"><div class="gslot-main"><span class="gwhen">${esc(v.when)} · ×${v.portions}</span>
      <b>${esc(v.name)}</b><span class="muted small">${num(v.kcal)} kcal · ${num(v.protein)} g Protein · ${v.cost ? eur(v.cost) + '/Portion' : 'Preis ?'}${v.stars ? ' · ' + '★'.repeat(v.stars) : ''}</span>
      ${v.why.length ? `<span class="gwhy">${v.why.map(esc).join(' · ')}</span>` : ''}</div>
    <div class="gslot-act"><button class="btn sm" data-act="gen-reroll" data-slot="${v.key}" ${m.loading ? 'disabled' : ''}>${ic('swap')} Neu würfeln</button>
      <select data-on="gen-set" data-slot="${v.key}" aria-label="Gericht für ${esc(v.when)} austauschen">${opts('', false)}</select></div></div>`;
  const snack = v => `<div class="gsnack"><span class="gwhen">${v.when}</span><select data-on="gen-set" data-slot="${v.key}" aria-label="Snack ${v.when}">${opts(v.recipe, true)}</select>
      <button class="icon-btn" data-act="gen-reroll" data-slot="${v.key}" title="Snack neu würfeln" ${m.loading ? 'disabled' : ''}>${ic('swap')}</button></div>`;
  const days = pv.days.map(d => `<tr><td><b>${fmtShort(d.date)}</b><div class="sub">${esc(d.meals.join(' · '))}</div></td>
      <td class="num ${d.kcalOk ? 'okc' : 'warnc'}">${num(d.kcal)}</td><td class="num ${d.protOk ? 'okc' : 'warnc'}">${num(d.protein)} g</td></tr>`).join('');
  const total = pv.spent + pv.shop, over = total > pv.budget;
  return `<div class="sheet wide gen"><div class="sheet-head"><div><span class="eyebrow">Nächste Woche planen</span><h2>Woche ${pv.week} · ${fmtShort(pv.proposal.monday)} – ${fmtShort(addDays(pv.proposal.monday, 4))}</h2>
      <p class="muted">Vorschlag aus allen Rezepten ohne Pilze und Fisch. Erst mit „Woche übernehmen“ wird etwas gespeichert.</p></div>
      <button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
    <div class="gen-grid"><div class="stack">${pv.slots.map(slot).join('')}
      <div class="h3" style="margin-top:6px">Snacks</div><div class="gsnacks">${pv.snacks.map(snack).join('')}</div></div>
    <div class="stack"><div class="budgetbox ${over ? 'bad' : 'ok'}">${ic(over ? 'alert' : 'check')}<div><b>${over ? 'Über' : 'Im'} Budget: ${eur(total)} von ${eur(pv.budget)}</b>
        <span>Einkauf nach Vorrat ca. ${eur(pv.shop)}${pv.spent ? ` · schon ausgegeben ${eur(pv.spent)}` : ''}</span>
        ${pv.noPrice.length ? `<span>Ohne Preis (nicht in der Summe): ${esc(pv.noPrice.join(', '))}</span>` : ''}</div></div>
      <table class="mini"><thead><tr><th>Tag (inkl. Shake)</th><th class="num">kcal</th><th class="num">Protein</th></tr></thead><tbody>${days}</tbody></table>
      <p class="muted small">Ziel: ${num(set.kcalMin)}–${num(set.kcalMax)} kcal und mind. ${num(set.proteinMin)} g Protein pro Tag.</p>
      ${pv.notes.map(n => `<p class="warn-text small">${esc(n)}</p>`).join('')}</div></div>
    <div class="sheet-foot"><button class="btn ghost" data-act="gen-new" ${m.loading ? 'disabled' : ''}>Ganz neu vorschlagen</button><span class="grow"></span>
      <button class="btn ghost" data-act="modal-close">Abbrechen</button><button class="btn primary" data-act="gen-apply" ${m.loading ? 'disabled' : ''}>${ic('check')} Woche übernehmen</button></div></div>`;
}

// ---------- Kochmodus ----------
const reMin = /(\d+)(?:\s*[–-]\s*(\d+))?\s*(?:Min\b|Min\.|Minuten|min\b)/i;
let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
    if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) { /* nicht verfügbar oder abgelehnt */ }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && ui.modal && ui.modal.type === 'cookmode') keepAwake(true); });
function openCook(recipeId, batchId) {
  const r = recipeById(recipeId), b = batchId ? batchById(batchId) : null;
  if (!r) return;
  ui.modal = { type: 'cookmode', id: r.id, batch: b && !b.cooked ? b.id : null, portions: b ? b.portions : r.portions, step: 0 };
  ui.timers = ui.timers || [];
  keepAwake(true);
  renderModal();
}
function cookSteps(r) { return [{ prep: true }, ...r.steps.filter(s => s.trim()).map(t => ({ t }))]; }
function fmtTimer(sec) { const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${String(s).padStart(2, '0')}`; }
function timerLeft(t) { return Math.max(0, Math.round((t.end - Date.now()) / 1000)); }
function cookModal() {
  const m = ui.modal, r = recipeById(m.id);
  if (!r) return '';
  const steps = cookSteps(r), i = Math.min(m.step, steps.length), last = i >= steps.length;
  const timers = (ui.timers || []).map((t, k) => `<button class="ctimer ${timerLeft(t) === 0 ? 'ring' : ''}" data-act="ck-timer-x" data-k="${k}" title="Timer beenden">${ic('clock')}<b>${timerLeft(t) === 0 ? 'Fertig!' : fmtTimer(timerLeft(t))}</b><span>${esc(t.label)}</span></button>`).join('');
  let body;
  if (last) {
    body = `<div class="cstep"><span class="cnum">Fertig</span><p class="ctext">${m.batch ? `Gekocht? Dann zieht die App die Zutaten für ${m.portions} Portionen vom Vorrat ab.` : 'Guten Appetit! Dieses Rezept ist gerade nicht eingeplant – der Vorrat bleibt unverändert.'}</p></div>`;
  } else if (steps[i].prep) {
    const ings = r.ings.map(x => { const ing = ingById(x.ing); return `<li><b>${amt(x.ing, x.g * m.portions, true)}</b> ${esc(ing ? ing.name : x.ing)}</li>`; }).join('');
    body = `<div class="cstep"><span class="cnum">Zutaten für ${m.portions} ${m.portions === 1 ? 'Portion' : 'Portionen'}</span>
      <div class="cport">${m.batch ? '' : `<button class="icon-btn" data-act="ck-port" data-n="-1" title="Weniger Portionen">–</button><button class="icon-btn" data-act="ck-port" data-n="1" title="Mehr Portionen">+</button>`}</div>
      <ul class="cings">${ings}</ul>${r.spices ? `<p class="cspice"><b>Gewürze:</b> ${esc(r.spices)}</p>` : ''}</div>`;
  } else {
    const t = steps[i].t, mm = t.match(reMin);
    body = `<div class="cstep"><span class="cnum">Schritt ${i} von ${steps.length - 1}</span><p class="ctext">${esc(t)}</p>
      ${mm ? `<button class="btn q-big" data-act="ck-timer" data-min="${mm[1]}" data-label="${esc(r.short || r.name)}: Schritt ${i}">${ic('clock')} Timer ${mm[1]} Min. starten</button>` : ''}</div>`;
  }
  return `<div class="sheet cook-sheet"><div class="ctop"><div><span class="eyebrow">Kochmodus${wakeLock ? ' · Bildschirm bleibt an' : ''}</span><h2>${esc(r.short || r.name)} ×${m.portions}</h2></div>
      <button class="icon-btn" data-act="ck-close" title="Kochmodus beenden">${ic('x')}</button></div>
    ${timers ? `<div class="ctimers">${timers}</div>` : ''}
    <div class="cprog"><i style="width:${(i / steps.length * 100).toFixed(0)}%"></i></div>
    ${body}
    <div class="cnav"><button class="btn q-big" data-act="ck-step" data-n="-1" ${i === 0 ? 'disabled' : ''}>${ic('left')} Zurück</button>
      ${last ? (m.batch ? `<button class="btn primary q-big" data-act="ck-done">${ic('check')} Gekocht</button>` : `<button class="btn primary q-big" data-act="ck-close">Schließen</button>`)
        : `<button class="btn primary q-big" data-act="ck-step" data-n="1">Weiter ${ic('right')}</button>`}</div></div>`;
}
let timerTick = 0;
function ensureTimerTick() {
  if (timerTick) return;
  timerTick = setInterval(() => {
    const ts = ui.timers || [];
    ts.forEach(t => { if (!t.rang && timerLeft(t) === 0) { t.rang = true; ring(t.label); } });
    if (!ts.length) { clearInterval(timerTick); timerTick = 0; }
    if (ui.modal && ui.modal.type === 'cookmode') { const box = $('.ctimers'); if (box) renderModal(); }
  }, 1000);
}
function ring(label) {
  toast(`Timer fertig: ${label}`);
  try { navigator.vibrate && navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) { /* egal */ }
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach(off => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ac.destination); g.gain.setValueAtTime(0.25, ac.currentTime + off); o.start(ac.currentTime + off); o.stop(ac.currentTime + off + 0.22); });
  } catch (e) { /* kein Ton */ }
}

// ---------- Wochenrückblick ----------
function reviewCard() {
  const r = S.review;
  if (!r) return '';
  const set = S.settings, n = r.days;
  const pct = r.budget > 0 ? Math.min(100, r.spent / r.budget * 100) : 0;
  const stars = d => `<li><span>${esc(d.name)}</span><span class="rstars">${'★'.repeat(d.stars)}<i>${'★'.repeat(5 - d.stars)}</i></span></li>`;
  return `<section class="card c-12 review"><div class="card-head"><h2>Wochenrückblick</h2><span class="sub">${fmtShort(r.monday)} – ${fmtShort(addDays(r.monday, 6))}</span></div>
    <div class="rv-grid">
      <div class="rv"><b>${r.bothOk}<small> von ${n}</small></b><span>Tage komplett im Ziel</span><em>kcal ${r.kcalOk}× · Protein ${r.protOk}×</em></div>
      <div class="rv"><b>${num(r.avgKcal)}<small> kcal</small></b><span>im Schnitt pro Tag</span><em>Ziel ${num(set.kcalMin)}–${num(set.kcalMax)}</em></div>
      <div class="rv"><b>${num(r.avgProtein)}<small> g</small></b><span>Protein im Schnitt</span><em>Ziel mind. ${num(set.proteinMin)} g</em></div>
      <div class="rv"><b class="${r.spent > r.budget ? 'neg' : ''}">${eur(r.spent)}</b><span>von ${eur(r.budget)} Budget</span><div class="bar"><div class="fill ${r.spent > r.budget ? 'red' : ''}" style="width:${pct}%"></div></div></div>
      <div class="rv"><b>${r.weight ? nf1.format(r.weight) + '<small> kg</small>' : '–'}</b><span>Gewicht</span><em>${r.hasDelta ? `${r.weightDelta > 0 ? '+' : r.weightDelta < 0 ? '−' : '±'}${nf1.format(Math.abs(r.weightDelta))} kg zur Vorwoche` : r.weight ? 'erster Wert' : 'diese Woche nicht gewogen'}</em></div>
    </div>
    ${r.top.length ? `<div class="rv-top"><span class="muted small">Bestbewertet diese Woche</span><ul>${r.top.map(stars).join('')}</ul></div>` : ''}
    ${r.unrated.length ? `<p class="muted small" style="margin-top:8px">Noch ohne Bewertung: ${r.unrated.map(d => `<button class="link" data-act="recipe" data-id="${d.recipe}">${esc(d.name)}</button>`).join(', ')}</p>` : ''}</section>`;
}

// ---------- Preisverlauf ----------
function priceModal() {
  const pi = S.prices[ui.modal.ing], ing = ingById(ui.modal.ing);
  const rows = pi ? [...pi.history].reverse().map(p => `<tr><td>${fmtShort(p.date)}</td><td><b>${esc(p.store)}</b></td><td class="num">${amt(ui.modal.ing, p.g)}</td><td class="num">${eur(p.price)}</td><td class="num">${eur(p.perKg)}/kg</td></tr>`).join('') : '';
  return `<div class="sheet narrow"><div class="sheet-head"><div><h2>Preisverlauf: ${esc(ing ? ing.name : '')}</h2>
      ${pi ? `<p class="muted">Zuletzt am günstigsten bei <b style="color:var(--accent)">${esc(pi.best.store)}</b> (${eur(pi.best.perKg)}/kg, ${fmtShort(pi.best.date)})</p>` : ''}</div>
      <button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
    ${pi ? `<table class="mini"><thead><tr><th>Datum</th><th>Laden</th><th class="num">Menge</th><th class="num">Preis</th><th class="num">pro kg</th></tr></thead><tbody>${rows}</tbody></table>`
      : '<p class="empty">Noch keine gebuchten Einkäufe mit Preis für diesen Artikel.</p>'}</div>`;
}
function pricesCard() {
  const list = Object.values(S.prices || {}).sort((a, b) => a.name.localeCompare(b.name, 'de'));
  if (!list.length) return '';
  const pref = S.settings.stores[0];
  return `<section class="card" style="margin-top:16px"><div class="card-head"><h2>Preise</h2><span class="sub">aus deinen gebuchten Einkäufen</span></div>
    <table><thead><tr><th>Artikel</th><th>Zuletzt</th><th class="num">pro kg</th><th>Am günstigsten</th></tr></thead><tbody>
    ${list.map(p => `<tr><td><button class="link" data-act="price" data-ing="${esc(p.ing)}">${esc(p.name)}</button></td><td>${esc(p.last.store)} · ${fmtShort(p.last.date)}</td><td class="num">${eur(p.last.perKg)}</td>
      <td>${p.best.store === p.last.store ? '<span class="muted">–</span>' : `<b style="color:var(--accent)">${esc(p.best.store)}</b> ${eur(p.best.perKg)}/kg`}${p.best.store !== pref && p.best.perKg < p.last.perKg ? '' : ''}</td></tr>`).join('')}</tbody></table></section>`;
}

// ---------- Barcode ----------
// Eigener EAN-13/EAN-8-Leser für Browser ohne BarcodeDetector (z. B. Safari auf dem iPhone).
const EAN_L = ['3211', '2221', '2122', '1411', '1132', '1231', '1114', '1312', '1213', '3112'];
const EAN_G = EAN_L.map(p => p.split('').reverse().join(''));
const EAN_FIRST = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];
function eanDigit(ws) {
  const sum = ws[0] + ws[1] + ws[2] + ws[3], n = ws.map(w => w * 7 / sum);
  let best = null, bestD = 9;
  const test = (pat, kind, d) => { let e = 0; for (let j = 0; j < 4; j++) e += Math.abs(n[j] - +pat[j]); if (e < bestD) { bestD = e; best = { d, kind }; } };
  for (let d = 0; d < 10; d++) { test(EAN_L[d], 'L', d); test(EAN_G[d], 'G', d); }
  return bestD < 1.6 ? best : null;
}
function eanCheck(code) {
  let s = 0; const n = code.length;
  for (let i = 0; i < n - 1; i++) s += (+code[n - 2 - i]) * (i % 2 === 0 ? 3 : 1);
  return (10 - s % 10) % 10 === +code[n - 1];
}
function decodeRuns(runs) {
  // runs: Breiten abwechselnd, beginnend mit einem Strich
  const guard = (i, k) => { const avg = runs.slice(i, i + k).reduce((a, b) => a + b, 0) / k; for (let j = i; j < i + k; j++) if (runs[j] < avg * 0.4 || runs[j] > avg * 2.2) return false; return true; };
  for (let s = 0; s + 43 <= runs.length; s += 2) {
    for (const [nR, left, right] of [[59, 6, 6], [43, 4, 4]]) {
      if (s + nR > runs.length || !guard(s, 3)) continue;
      const total = runs.slice(s, s + nR).reduce((a, b) => a + b, 0), mod = total / (nR === 59 ? 95 : 67);
      if (runs[s] > mod * 2.2) continue;
      let p = s + 3, code = '', kinds = '';
      let ok = true;
      for (let k = 0; k < left && ok; k++, p += 4) { const r = eanDigit(runs.slice(p, p + 4)); if (!r) ok = false; else { code += r.d; kinds += r.kind; } }
      if (!ok || !guard(p, 5)) continue;
      p += 5;
      for (let k = 0; k < right && ok; k++, p += 4) { const r = eanDigit(runs.slice(p, p + 4)); if (!r || r.kind !== 'L') ok = false; else code += r.d; }
      if (!ok || !guard(p, 3)) continue;
      if (nR === 59) { const f = EAN_FIRST.indexOf(kinds); if (f < 0) continue; code = f + code; }
      else if (kinds !== 'LLLL') continue;
      if (eanCheck(code)) return code;
    }
  }
  return null;
}
function decodeRow(px) {
  // px: Grauwerte einer Zeile
  let lo = 255, hi = 0;
  for (const v of px) { if (v < lo) lo = v; if (v > hi) hi = v; }
  if (hi - lo < 40) return null;
  const thr = (lo + hi) / 2, runs = [];
  let i = 0;
  while (i < px.length && px[i] >= thr) i++; // bis zum ersten Strich
  let cur = true, len = 0;
  for (; i < px.length; i++) {
    const dark = px[i] < thr;
    if (dark === cur) len++; else { runs.push(len); cur = dark; len = 1; }
  }
  runs.push(len);
  return decodeRuns(runs) || decodeRuns(runs.slice().reverse().slice(runs.length % 2 === 0 ? 1 : 0));
}
function decodeCanvas(ctx, w, h) {
  const rows = [0.5, 0.45, 0.55, 0.4, 0.6, 0.35, 0.65, 0.3, 0.7];
  const found = {};
  for (const f of rows) {
    const y = Math.round(h * f), d = ctx.getImageData(0, y, w, 1).data, px = new Array(w);
    for (let x = 0; x < w; x++) px[x] = (d[x * 4] * 0.3 + d[x * 4 + 1] * 0.59 + d[x * 4 + 2] * 0.11);
    const c = decodeRow(px);
    if (c) { found[c] = (found[c] || 0) + 1; if (found[c] >= 2) return c; }
  }
  const keys = Object.keys(found);
  return keys.length === 1 ? keys[0] : null;
}
window.mpDecodeCanvas = decodeCanvas; // für Tests
const camOK = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.isSecureContext;
let scanStream = null, scanTimer = 0, scanLast = { code: '', n: 0 };
function stopScan() { clearInterval(scanTimer); scanTimer = 0; if (scanStream) { scanStream.getTracks().forEach(t => t.stop()); scanStream = null; } }
function openScan(ctx) { ui.modal = { type: 'scan', ctx, phase: camOK() ? 'cam' : 'manual' }; renderModal(); if (ui.modal.phase === 'cam') startCam(); }
async function startCam() {
  try {
    scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } }, audio: false });
  } catch (e) { ui.modal.phase = 'manual'; ui.modal.camErr = 'Die Kamera ist nicht freigegeben. Du kannst die Nummer unter dem Barcode eintippen.'; renderModal(); return; }
  const v = $('#scanVideo');
  if (!v) return stopScan();
  v.srcObject = scanStream; v.setAttribute('playsinline', ''); await v.play().catch(() => {});
  const det = 'BarcodeDetector' in window ? new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a'] }) : null;
  const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
  scanTimer = setInterval(async () => {
    if (!v.videoWidth || !ui.modal || ui.modal.type !== 'scan') return;
    let code = null;
    if (det) { try { const r = await det.detect(v); if (r.length) code = r[0].rawValue; } catch (e) { /* weiter mit eigenem Leser */ } }
    if (!code) {
      const w = 640, h = Math.round(v.videoHeight * 640 / v.videoWidth);
      cv.width = w; cv.height = h; cx.drawImage(v, 0, 0, w, h);
      code = decodeCanvas(cx, w, h);
    }
    if (code) {
      if (scanLast.code === code) scanLast.n++; else scanLast = { code, n: 1 };
      if (scanLast.n >= (det ? 1 : 2)) { try { navigator.vibrate && navigator.vibrate(80); } catch (e) { /* egal */ } stopScan(); lookupCode(code); }
    }
  }, 180);
}
async function lookupCode(code) {
  const m = ui.modal;
  m.phase = 'loading'; m.code = code; renderModal();
  const r = await call('/api/barcode?code=' + encodeURIComponent(code));
  if (ui.modal !== m) return;
  if (!r) { m.phase = 'manual'; renderModal(); return; }
  const res = r.result;
  m.res = res; m.phase = 'result';
  if (m.ctx === 'essen') return foodFromScan(res);
  m.ing = res.known || (res.cands[0] && res.cands[0].ing) || '';
  m.g = res.qtyG || (m.ing && ingById(m.ing) && ingById(m.ing).packs && ingById(m.ing).packs[0] ? ingById(m.ing).packs[0].g : '') || '';
  if (m.ctx === 'einkauf' && res.known) return scanToCart(m);
  renderModal();
}
function scanToCart(m) {
  const l = quickShopWeek(), it = l && l.items.find(x => x.ing === m.ing);
  if (!it) { m.phase = 'result'; m.notOnList = true; renderModal(); return; }
  const c = cartGet(l.week); c.add(it.ing); cartSet(l.week, c);
  ui.modal = null; renderModal(); render();
  toast(`${it.name} liegt im Wagen.`);
}
function scanModal() {
  const m = ui.modal;
  let body = '';
  if (m.phase === 'cam') body = `<div class="scanbox"><video id="scanVideo" muted playsinline></video><div class="scanline"></div></div>
      <p class="muted small">Barcode waagerecht in den Rahmen halten, etwa 15 cm Abstand.${'BarcodeDetector' in window ? '' : ' (Eingebauter EAN-Leser)'}</p>`;
  if (m.phase === 'cam' || m.phase === 'manual') body += `${m.camErr ? `<p class="warn-text small">${esc(m.camErr)}</p>` : ''}
      <form class="form-row" data-form="scan-code"><label class="f grow">Nummer unter dem Barcode <input type="text" name="code" inputmode="numeric" pattern="[0-9]*" maxlength="14" placeholder="z. B. 4006040263012"></label><button class="btn">Suchen</button></form>
      ${camOK() ? '' : '<p class="muted small">Die Kamera ist hier nicht verfügbar. Tippe die Nummer ein.</p>'}`;
  if (m.phase === 'loading') body = `<p class="muted">Suche ${esc(m.code)} …</p>`;
  if (m.phase === 'result') {
    const r = m.res, p = r.product;
    const known = r.known ? ingById(r.known) : null;
    const cands = r.cands.filter(c => ingById(c.ing));
    const opts = `${known ? '' : '<option value="">– Zutat wählen –</option>'}${cands.length ? `<optgroup label="Passt vermutlich">${cands.map(c => `<option value="${c.ing}" ${m.ing === c.ing ? 'selected' : ''}>${esc(ingById(c.ing).name)}</option>`).join('')}</optgroup>` : ''}
      <optgroup label="Alle Zutaten">${S.ingredients.filter(i => !i.untracked).sort((a, b) => a.name.localeCompare(b.name, 'de')).map(i => `<option value="${i.id}" ${m.ing === i.id && !cands.some(c => c.ing === i.id) ? 'selected' : ''}>${esc(i.name)}</option>`).join('')}</optgroup>
      ${p && !known ? `<option value="__new" ${m.ing === '__new' ? 'selected' : ''}>+ Neu anlegen: ${esc(p.name)}</option>` : ''}`;
    body = `<div class="scanres"><b>${known ? esc(known.name) : p ? esc(p.name) : 'Unbekanntes Produkt'}</b>
        <span class="muted small">EAN ${esc(r.code)}${p ? ` · ${esc([p.brand, p.quantity].filter(Boolean).join(' · '))}${p.kcal ? ` · ${num(p.kcal)} kcal / ${nf1.format(p.p)} g Protein pro 100 g` : ''}` : ''}</span>
        ${p ? flagTags(p.flags) : ''}
        ${r.notFound ? '<span class="warn-text small">Nicht in Open Food Facts gefunden – bitte die Zutat selbst wählen.</span>' : ''}
        ${r.offline ? `<span class="warn-text small">${esc(r.note || 'Offline: Produktdaten nicht abrufbar.')} Wähle die Zutat selbst – beim nächsten Scan erkennt die App den Barcode dann auch offline.</span>` : ''}
        ${m.notOnList ? '<span class="warn-text small">Steht nicht auf der Einkaufsliste dieser Woche. Du kannst es direkt in den Vorrat legen.</span>' : ''}</div>
      <form class="stack" data-form="scan-save">
        <label class="f">Zutat <select name="ing" data-on="scan-ing">${opts}</select></label>
        ${m.ctx === 'vorrat' || m.notOnList ? `<div class="form-row nums"><label class="f">Menge (g) <input type="number" name="g" min="1" step="1" value="${m.g || ''}" required></label>
          <label class="f">Haltbar bis <input type="date" name="mhd"></label></div>` : ''}
        <div class="sheet-foot"><button type="button" class="btn ghost" data-act="scan-again">Nochmal scannen</button>
          <button class="btn primary">${m.ctx === 'vorrat' || m.notOnList ? 'In den Vorrat' : 'In den Wagen'}</button></div></form>
      ${p ? '<p class="muted small">Produktdaten: Open Food Facts (Lizenz ODbL).</p>' : ''}`;
  }
  return `<div class="sheet narrow scan-sheet"><div class="sheet-head"><h2>${m.ctx === 'einkauf' ? 'Artikel scannen' : m.ctx === 'essen' ? 'Essen scannen' : 'Barcode scannen'}</h2><button class="icon-btn" data-act="scan-close" title="Schließen">${ic('x')}</button></div>${body}</div>`;
}

// ---------- Modal ----------
function renderModal() {
  const m = $('#modal');
  if (!ui.modal) { m.hidden = true; m.innerHTML = ''; m.dataset.type = ''; return; }
  const prevSheet = m.querySelector('.sheet');
  const keepScroll = prevSheet && m.dataset.type === ui.modal.type ? prevSheet.scrollTop : 0;
  if (MODALS[ui.modal.type]) m.innerHTML = MODALS[ui.modal.type]();
  else if (ui.modal.type === 'editor') m.innerHTML = editorModal();
  else if (ui.modal.type === 'import') m.innerHTML = importModal();
  else if (ui.modal.type === 'planr') m.innerHTML = planModal();
  else if (ui.modal.type === 'suggest') m.innerHTML = suggestModal();
  else if (ui.modal.type === 'qshare') m.innerHTML = shareModal();
  else if (ui.modal.type === 'gen') m.innerHTML = genModal();
  else if (ui.modal.type === 'syncrep') m.innerHTML = syncRepModal();
  else if (ui.modal.type === 'cookmode') m.innerHTML = cookModal();
  else if (ui.modal.type === 'price') m.innerHTML = priceModal();
  else if (ui.modal.type === 'scan') m.innerHTML = scanModal();
  else if (ui.modal.type === 'qbook') m.innerHTML = bookModal();
  else if (ui.modal.type === 'recipe') {
    const r = recipeById(ui.modal.id);
    if (!r) { ui.modal = null; return renderModal(); }
    m.innerHTML = recipeModal(r);
  } else if (ui.modal.type === 'more') {
    m.innerHTML = `<div class="sheet narrow more-sheet"><div class="sheet-head"><h2>Mehr</h2><button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
      <div class="more-list">${NAV.filter(([v]) => !PRIMARY[v]).map(([v, i, t]) => `<button class="more-item ${ui.view === v ? 'on' : ''}" data-act="nav" data-view="${v}">${ic(i)}<span>${t}</span></button>`).join('')}
        ${backupDue() ? `<button class="more-item" data-act="export-web">${ic('share')}<span>Backup teilen</span><i class="count">fällig</i></button>` : ''}
        <button class="more-item" data-act="theme">${ic(S.settings.theme === 'dark' ? 'sun' : 'moon')}<span>${S.settings.theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'}</span></button></div></div>`;
  } else if (ui.modal.type === 'confirm') {
    m.innerHTML = `<div class="sheet narrow"><div class="sheet-head"><h2>${esc(ui.modal.title)}</h2></div><p class="muted">${esc(ui.modal.text)}</p>
      <div class="sheet-foot"><button class="btn ghost" data-act="modal-close">Abbrechen</button><button class="btn ${ui.modal.danger ? 'danger' : 'primary'}" data-act="confirm-ok">${esc(ui.modal.ok)}</button></div></div>`;
  }
  m.dataset.type = ui.modal.type;
  m.hidden = false;
  const sh = m.querySelector('.sheet');
  if (sh && keepScroll) sh.scrollTop = keepScroll;
}
// Bestätigung; "Abbrechen" führt zurück zum vorherigen Dialog (z. B. Editor)
function confirmBox(title, text, ok, fn, danger) {
  ui.modal = { type: 'confirm', title, text, ok, fn, danger, back: ui.modal && ui.modal.type !== 'confirm' ? ui.modal : null };
  renderModal();
}
function closeModal() {
  if (ui.modal && ui.modal.type === 'cookmode') keepAwake(false);
  if (ui.modal && ui.modal.type === 'scan') stopScan();
  ui.modal = ui.modal && ui.modal.back ? ui.modal.back : null;
  if (!ui.modal) ui.ed = null;
  renderModal();
}

// ---------- Aktionen ----------
const ACT = {
  more() { ui.modal = { type: 'more' }; renderModal(); },
  quick(d) { enterQuick(d.q); },
  'batch-left'(d) { call('/api/batch/left', { id: +d.id, left: Math.max(0, +d.n) }); },
  'qx-add'(d) { const x = S.quickExtras[+d.i]; call('/api/extra/add', { date: d.date || S.day.date, name: x.name, kcal: x.kcal, protein: x.protein }); },
  'fill-add'(d) { const o = S.fill.options[+d.i]; call('/api/extra/add', { date: S.today, name: `${o.label} ${o.name}`, kcal: o.kcal, protein: o.protein, ing: o.ing, g: o.g }); },
  undo(d) {
    $('#toast').hidden = true;
    if (ui.modal && ui.modal.type === 'syncrep') { ui.modal = null; renderModal(); }
    const cu = ui.cartUndo; ui.cartUndo = null;
    call('/api/undo', { tok: +d.tok }).then(r => { if (r && cu) { const c = cartGet(cu.week); cu.ids.forEach(i => c.add(i)); cartSet(cu.week, c); render(); } });
  },
  cookmode(d) { openCook(d.id, +d.batch || null); },
  'ck-step'(d) { ui.modal.step = Math.max(0, ui.modal.step + +d.n); renderModal(); const sh = $('.cook-sheet'); if (sh) sh.scrollTop = 0; },
  'ck-port'(d) { ui.modal.portions = Math.max(1, Math.min(12, ui.modal.portions + +d.n)); renderModal(); },
  'ck-timer'(d) { (ui.timers = ui.timers || []).push({ end: Date.now() + +d.min * 60e3, label: d.label }); ensureTimerTick(); renderModal(); toast(`Timer läuft: ${d.min} Min.`); },
  'ck-timer-x'(d) { ui.timers.splice(+d.k, 1); renderModal(); },
  'ck-close'() { ui.modal = null; keepAwake(false); renderModal(); },
  'ck-done'() { const b = ui.modal.batch; ui.modal = null; keepAwake(false); renderModal(); call('/api/batch/cook', { id: b, cooked: true }); },
  price(d) { ui.modal = { type: 'price', ing: d.ing, back: ui.modal || null }; renderModal(); },
  scan(d) { openScan(d.ctx); },
  'scan-again'() { stopScan(); openScan(ui.modal.ctx); },
  'scan-close'() { stopScan(); ui.modal = null; renderModal(); },
  'sync-out'() { if (WEB) exportWeb(); else { const a = document.createElement('a'); a.href = '/api/export?sync=1'; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => call('/api/state'), 800); } },
  gen() { ui.modal = { type: 'gen', seed: Date.now() % 1e9 }; renderModal(); genCall('/api/gen/propose', { seed: ui.modal.seed }); },
  'gen-new'() { const m = ui.modal; m.seed = (m.seed || 1) + 7919; genCall('/api/gen/propose', { seed: m.seed }); },
  'gen-reroll'(d) { genCall('/api/gen/preview', { proposal: ui.modal.pv.proposal, reroll: d.slot }); },
  'gen-apply'() { const p = ui.modal.pv.proposal; ui.modal = null; renderModal(); ui.week = null; call('/api/gen/apply', { proposal: p }).then(r => { if (r) { ui.view = 'plan'; ui.week = S.numWeeks; render(); } }); },
  'q-go'(d) { enterQuick(d.q); },
  'q-exit'() { const k = ui.quick; ui.quick = null; ui.view = k === 'einkauf' ? 'einkauf' : 'dashboard'; render(); },
  'q-hint-x'() { ui.hintClosed = true; render(); },
  'q-week'(d) { ui.qweek = +d.n; render(); },
  'q-cart'(d) {
    const l = quickShopWeek(), c = cartGet(l.week);
    if (c.has(d.ing)) c.delete(d.ing); else c.add(d.ing);
    cartSet(l.week, c); render();
  },
  'q-share'(d) { ui.modal = { type: 'qshare', week: +d.week || quickShopWeek().week, skip: true }; renderModal(); },
  'q-send'(d) { const m = ui.modal, l = S.shopping[m.week - 1]; shareText(shopText(l, d.mode, m.skip !== false), `Einkaufsliste Woche ${l.week}`); },
  'q-copy'() {
    const m = ui.modal, txt = shopText(S.shopping[m.week - 1], 'text', m.skip !== false);
    const show = () => { ui.modal = { ...m, showText: txt }; renderModal(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => toast('Liste kopiert.'), show); else show();
  },
  'q-book'() { const l = quickShopWeek(); ui.modal = { type: 'qbook', week: l.week }; renderModal(); },
  'export-web'() { ui.modal = null; renderModal(); exportWeb(); },
  nav(d) { ui.modal = null; renderModal(); ui.quick = null; ui.view = d.view; ui.swap = null; ui.editLot = null; if (d.view !== 'einkauf') ui.shop = null; render(); },
  theme() { if (ui.modal && ui.modal.type === 'more') { ui.modal = null; renderModal(); } call('/api/settings', { theme: S.settings.theme === 'dark' ? 'light' : 'dark' }); },
  'day-move'(d) { ui.day = addDays(S.day.date, +d.n); if (ui.day === S.today) ui.day = null; ui.extraOpen = false; call('/api/state'); },
  'day-set'(d) { ui.day = d.date && d.date !== S.today ? d.date : null; ui.extraOpen = false; call('/api/state'); },
  shake() { call('/api/shake', { date: S.day.date, done: !S.day.shake }); },
  'meal-eat'(d) { const m = findMeal(+d.id) || S.day.meals.find(x => x.id === +d.id); call('/api/meal/status', { id: +d.id, status: m && m.status === 'gegessen' ? 'offen' : 'gegessen' }); },
  'meal-skip'(d) { const m = findMeal(+d.id) || S.day.meals.find(x => x.id === +d.id); call('/api/meal/status', { id: +d.id, status: m && m.status === 'ausgelassen' ? 'offen' : 'ausgelassen' }); },
  'meal-swap'(d) {
    ui.swap = +d.id;
    const m = findMeal(ui.swap);
    if (m) { const w = S.weeks.find(x => x.days.some(y => y.date === m.date)); if (w) ui.week = w.n; }
    ui.view = 'plan';
    render();
  },
  'swap-to'(d) { const a = ui.swap; ui.swap = null; call('/api/meal/swap', { a, b: +d.id }); },
  'swap-cancel'() { ui.swap = null; render(); },
  cook(d) { call('/api/batch/cook', { id: +d.id, cooked: d.cooked === '1' }); },
  week(d) { ui.week = +d.n; render(); },
  'shop-week'(d) { ui.shop = { week: +d.n, off: {}, price: {} }; render(); },
  recipe(d) { ui.modal = { type: 'recipe', id: d.id }; ui.perPortion = false; renderModal(); },
  'per-portion'() { ui.perPortion = !ui.perPortion; renderModal(); },
  'modal-close'() { closeModal(); },
  rf(d) { ui.rf.f = d.f; if (d.f === 'alle') { ui.rf.tag = ''; ui.rf.q = ''; } render(); },
  rtag(d) { ui.rf.tag = ui.rf.tag === d.tag ? '' : d.tag; render(); },
  'r-new'() { openEditor(emptyDraft(), 'new'); },
  'r-import'() { ui.modal = { type: 'import', tab: S.canFetch ? 'link' : 'text' }; renderModal(); },
  'imp-tab'(d) { ui.modal.tab = d.tab; renderModal(); },
  async 'imp-link'() {
    const m = ui.modal;
    if (!m.url || !/^https?:\/\//i.test(m.url.trim())) return toast('Bitte einen vollständigen Link einfügen, der mit https:// beginnt.', true);
    m.busy = true; renderModal();
    const r = await call('/api/recipe/draft', { mode: 'url', url: m.url.trim() });
    if (ui.modal !== m) return;
    m.busy = false;
    if (r) openEditor(r.draft, 'import'); else renderModal();
  },
  async 'imp-text'() {
    const m = ui.modal;
    m.busy = true; renderModal();
    const r = await call('/api/recipe/draft', { mode: 'text', text: m.text || '' });
    if (ui.modal !== m) return;
    m.busy = false;
    if (r) openEditor(r.draft, 'import'); else renderModal();
  },
  async 'r-edit'(d) { const r = await call('/api/recipe/draft', { mode: 'edit', id: d.id }); if (r) openEditor(r.draft, 'edit'); },
  'r-del'(d) { const r = recipeById(d.id); confirmBox('Rezept löschen?', `„${r.name}“ wird aus deinen Rezepten entfernt. Neu angelegte Zutaten bleiben erhalten.`, 'Löschen', () => { ui.modal = null; call('/api/recipe/delete', { id: d.id }); }, true); },
  'r-fav'(d) { const r = recipeById(d.id); call('/api/favorite', { recipe: d.id, on: !r.fav }); },
  'r-plan'(d) { ui.modal = { type: 'planr', id: d.id, batch: null, pv: null }; renderModal(); },
  async 'planr-pick'(d) {
    const m = ui.modal;
    m.batch = +d.b; m.pv = null; m.loading = true; renderModal();
    const r = await call('/api/plan/preview', { batch: m.batch, recipe: m.id });
    if (ui.modal !== m) return;
    m.loading = false; m.pv = r ? r.preview : null; renderModal();
    if (innerWidth < 900) { const pv = $('.preview'); if (pv) pv.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  },
  async 'planr-ok'() {
    const m = ui.modal;
    const b = S.batches.find(x => x.id === m.batch);
    const r = await call('/api/plan/replace', { batch: m.batch, recipe: m.id });
    if (r) { ui.modal = null; if (b) ui.week = b.week; renderModal(); }
  },
  async 'r-suggest'() {
    const m = { type: 'suggest', list: null };
    ui.modal = m; renderModal();
    const r = await call('/api/recipe/suggest');
    if (ui.modal === m) { m.list = r ? r.suggestions : []; renderModal(); }
  },
  'ed-close'() {
    if (ui.ed && ui.ed.dirty) confirmBox('Änderungen verwerfen?', 'Das Rezept ist noch nicht gespeichert.', 'Verwerfen', () => { ui.ed = null; ui.modal = null; renderModal(); }, true);
    else { ui.ed = null; ui.modal = null; renderModal(); }
  },
  'ed-tag'(d) { const t = ui.ed.d.tags; const i = t.indexOf(d.tag); if (i >= 0) t.splice(i, 1); else t.push(d.tag); ui.ed.dirty = true; renderModal(); },
  'ed-parse'() { edReparse(); },
  'ed-accept'() { ui.ed.d.lines.forEach(l => { if (l.status === 'neu' && ui.ed.d.suggest[l.ing]) acceptNew(l.ing); }); ui.ed.form = null; ui.ed.dirty = true; renderModal(); },
  async 'ed-save'() {
    const e = ui.ed, d = e.d;
    const body = { ...d, portions: +d.portions || 1, minutes: +d.minutes || 0, keep: +d.keep || 3, steps: d.steps.filter(s => s.trim()),
      lines: d.lines.map(({ cand, manual, ...l }) => ({ ...l, g: +l.g || 0 })),
      newIngs: Object.entries(e.newIngs).map(([key, n]) => ({ ...n, key, kcal: +n.kcal || 0, p: +n.p || 0, c: +n.c || 0, f: +n.f || 0, packG: +n.packG || 0, packPrice: +n.packPrice || 0, pieceG: +n.pieceG || 0, shelf: +n.shelf || 0 })) };
    const before = new Set(S.recipes.map(r => r.id));
    const r = await call('/api/recipe/save', body);
    if (!r) return;
    const id = d.id || (S.recipes.find(x => !before.has(x.id)) || {}).id;
    ui.ed = null;
    ui.modal = id ? { type: 'recipe', id } : null;
    ui.perPortion = false;
    renderModal();
  },
  'ni-ok'() {
    const e = ui.ed, f = e.form, n = f.ni;
    n.name = String(n.name || '').trim();
    if (!n.name) return toast('Bitte einen Namen für die Zutat eingeben.', true);
    if (n.kcal === '' || isNaN(+n.kcal) || n.p === '' || isNaN(+n.p)) return toast('Bitte mindestens kcal und Protein pro 100 g eintragen – von der Packung oder aus Open Food Facts.', true);
    if (+n.packPrice > 0 && !(+n.packG > 0)) return toast('Für den Preis fehlt die Packungsgröße (g oder ml) – sonst lassen sich die Kosten pro Portion nicht berechnen.', true);
    e.newIngs[f.key] = { ...n };
    e.d.lines.forEach((l, i) => { if (i === f.i || (l.ing === f.key && l.status === 'neu')) { l.ing = f.key; l.status = 'ok'; l.manual = true; } });
    e.form = null; e.off = null; e.dirty = true;
    renderModal();
  },
  'ni-cancel'() { ui.ed.form = null; ui.ed.off = null; renderModal(); },
  async 'off-search'() {
    const e = ui.ed, inp = $('[data-ni-q]');
    const q = (inp ? inp.value : '').trim();
    if (!q) return;
    e.form.q = q; e.off = { loading: true }; renderModal();
    const r = await call('/api/off/search?q=' + encodeURIComponent(q));
    if (!ui.ed || ui.ed !== e) return;
    e.off = r ? { items: r.products } : { items: [], error: 'Suche nicht möglich – trag die Werte von der Packung ein.' };
    renderModal();
  },
  'off-pick'(d) {
    const p = ui.ed.off.items[+d.k];
    Object.assign(ui.ed.form.ni, { kcal: p.kcal, p: p.p, c: p.c, f: p.f, nutSource: `Open Food Facts: ${p.name}${p.brand ? ' (' + p.brand + ')' : ''}, Lizenz ODbL` });
    renderModal();
  },
  'confirm-ok'() { const fn = ui.modal && ui.modal.fn; ui.modal = null; renderModal(); if (fn) fn(); },
  'extra-toggle'() { ui.extraOpen = !ui.extraOpen; render(); if (ui.extraOpen) { const i = $('[data-form="extra-add"] input'); if (i) i.focus(); } },
  'extra-del'(d) { call('/api/extra/delete', { id: +d.id }); },
  'lot-edit'(d) { ui.editLot = +d.id || null; render(); },
  'lot-del'(d) { const l = S.lots.find(x => x.id === +d.id); confirmBox('Posten entfernen?', `${l ? l.name : 'Dieser Posten'} wird aus dem Vorrat gelöscht.`, 'Entfernen', () => call('/api/lot/delete', { id: +d.id }), true); },
  'purchase-del'(d) { confirmBox('Einkauf löschen?', 'Der Betrag wird aus dem Budget entfernt. Der Vorrat bleibt unverändert.', 'Löschen', () => call('/api/purchase/delete', { id: +d.id }), true); },
  rate(d) { call('/api/rating', { recipe: d.id, stars: S.ratings[d.id] === +d.n ? 0 : +d.n }); },
  'weight-del'(d) { call('/api/weight', { date: d.date, kg: 0 }); },
  backup() { call('/api/backup', {}); },
  'open-folder'() { call('/api/openfolder', {}); },
  quit() {
    confirmBox('App beenden?', 'Alle Daten sind gespeichert. Du kannst die App jederzeit wieder per Doppelklick starten.', 'Beenden', async () => {
      await call('/api/quit', {});
      $('#offline').hidden = false;
      $('#offline h2').textContent = 'App beendet';
      $('#offline p').textContent = 'Du kannst dieses Fenster jetzt schließen.';
      setTimeout(() => window.close(), 400);
    });
  },
};
const fd = f => Object.fromEntries(new FormData(f).entries());
const FORMS = {
  'extra-add'(f) { const v = fd(f); ui.extraOpen = false; call('/api/extra/add', { date: S.day.date, name: v.name, kcal: +v.kcal, protein: +v.protein }); },
  'lot-add'(f) { const v = fd(f); call('/api/lot/add', { ing: v.ing === '__new' ? '' : v.ing, newName: v.newName || '', g: +v.g, mhd: v.mhd || '', frozen: !!v.frozen }); },
  'lot-edit'(f) { const v = fd(f); ui.editLot = null; call('/api/lot/update', { id: +f.dataset.id, g: +v.g, mhd: v.mhd || '', frozen: !!v.frozen }); },
  'purchase-add'(f) { const v = fd(f); call('/api/purchase/add', { date: v.date, store: v.store, amount: +String(v.amount).replace(',', '.'), note: v.note || '', week: v.week || '' }); },
  'shop-book'(f) {
    const v = fd(f), l = S.shopping[+f.dataset.week - 1], st = shopState(l);
    const items = l.items.filter(it => !st.off[it.ing]).map(it => ({ ing: it.ing, g: it.buyG, price: st.price[it.ing] ?? it.cost }));
    if (!items.length) return toast('Bitte mindestens einen Artikel markieren.', true);
    call('/api/shopping/book', { date: v.date, store: v.store, items, week: '' }).then(r => { if (r) { ui.shop = { week: l.week, off: {}, price: {} }; render(); } });
  },
  'scan-code'(f) { const v = fd(f), c = String(v.code || '').replace(/\D/g, ''); if (c.length < 8) return toast('Bitte die 8 oder 13 Ziffern unter dem Barcode eingeben.', true); stopScan(); lookupCode(c); },
  'scan-save'(f) {
    const v = fd(f), m = ui.modal, p = m.res.product;
    if (!v.ing) return toast('Bitte eine Zutat wählen.', true);
    if (m.ctx === 'einkauf' && !m.notOnList) {
      if (v.ing === '__new') return toast('Neue Zutaten bitte über „In den Vorrat“ anlegen.', true);
      m.ing = v.ing;
      call('/api/barcode/assign', { code: m.res.code, ing: v.ing }).then(r => { if (r) scanToCart(m); });
      return;
    }
    const body = { ing: v.ing === '__new' ? '' : v.ing, g: +v.g, mhd: v.mhd || '', barcode: m.res.code };
    if (v.ing === '__new' && p) Object.assign(body, { newName: p.name, newCat: m.res.newCat || '', kcal: p.kcal, p: p.p, c: p.c, f: p.f, packG: m.res.qtyG || 0, source: 'Open Food Facts: ' + p.name + (p.brand ? ' (' + p.brand + ')' : '') + ', Lizenz ODbL' });
    ui.modal = null; renderModal();
    call('/api/lot/add', body);
  },
  'q-book'(f) {
    const v = fd(f), l = S.shopping[+f.dataset.week - 1], cart = cartGet(l.week);
    const items = l.items.filter(it => cart.has(it.ing));
    if (!items.length) return toast('Im Wagen ist nichts.', true);
    const paid = Math.max(0, +String(v.paid || '').replace(',', '.') || 0);
    const est = items.reduce((a, it) => a + it.cost, 0), noP = items.filter(it => !(it.cost > 0));
    let prices = items.map(it => it.cost);
    if (paid > 0) {
      if (!noP.length && est > 0) prices = items.map(it => it.cost * paid / est);
      else if (paid >= est) prices = items.map(it => (it.cost > 0 ? it.cost : (paid - est) / noP.length));
      else prices = items.map(it => (est > 0 ? it.cost * paid / est : paid / items.length));
      prices = prices.map(p => Math.round(p * 100) / 100);
      const diff = Math.round((paid - prices.reduce((a, p) => a + p, 0)) * 100) / 100;
      prices[prices.length - 1] = Math.max(0, Math.round((prices[prices.length - 1] + diff) * 100) / 100);
    }
    const body = { date: S.today, store: v.store, items: items.map((it, i) => ({ ing: it.ing, g: it.buyG, price: prices[i] })), week: '' };
    ui.modal = null; renderModal();
    call('/api/shopping/book', body).then(r => { if (r) { ui.cartUndo = { week: l.week, ids: items.map(it => it.ing) }; items.forEach(it => cart.delete(it.ing)); cartSet(l.week, cart); render(); } });
  },
  'weight-add'(f) { const v = fd(f); call('/api/weight', { date: v.date, kg: +String(v.kg).replace(',', '.') }); },
  settings(f) {
    const v = fd(f);
    call('/api/settings', { kcalMin: +v.kcalMin, kcalMax: +v.kcalMax, proteinMin: +v.proteinMin, budgetWeek: +v.budgetWeek, shakeKcal: +v.shakeKcal, shakeProtein: +v.shakeProtein, stores: v.stores.split(',').map(s => s.trim()).filter(Boolean) });
  },
  'plan-reset'(f) {
    const v = fd(f);
    confirmBox('Plan neu starten?', `Der 4-Wochen-Startplan beginnt dann am ${fmtLong(v.start)}. Ersetzt werden nur offene, noch nicht gekochte Mahlzeiten ab heute – dein Verlauf bleibt.`, 'Neu starten', () => { ui.week = null; ui.day = null; call('/api/plan/reset', { start: v.start }); });
  },
};

document.addEventListener('click', e => {
  if (e.target.id === 'modal') { if (!['editor', 'planr', 'import', 'tday', 'exedit', 'gym', 'food', 'session', 'actedit'].includes(ui.modal && ui.modal.type)) closeModal(); return; }
  const el = e.target.closest('[data-act]');
  if (!el || !S) return;
  const fn = ACT[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset, el); }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]');
  if (!f) return;
  e.preventDefault();
  const fn = FORMS[f.dataset.form];
  if (fn) fn(f);
});
document.addEventListener('change', e => {
  const on = e.target.dataset && e.target.dataset.on;
  if (on && CHANGE[on]) return CHANGE[on](e.target);
  if (on === 'lot-ing') {
    const f = e.target.form, v = e.target.value, i = ingById(v);
    $('#newNameWrap').hidden = v !== '__new';
    f.newName.required = v === '__new';
    const hint = $('#packHint');
    hint.textContent = '';
    if (i) {
      if (i.packs && i.packs.length) { f.g.value = i.packs[0].g; hint.textContent = 'Übliche Packung: ' + i.packs.map(p => `${p.label} = ${num(p.g)} g`).join(' · ') + (i.pieceG ? ` · 1 ${i.pieceName} ≈ ${i.pieceG} g` : ''); }
      f.mhd.value = i.shelf ? addDays(S.today, i.shelf) : '';
      if (i.shelf) hint.textContent += (hint.textContent ? ' · ' : '') + 'Datum ist geschätzt – bitte mit der Packung abgleichen.';
    }
  } else if (on === 'scan-ing') {
    const m = ui.modal, g = $('.scan-sheet [name="g"]'), mhd = $('.scan-sheet [name="mhd"]');
    m.ing = e.target.value; if (g) m.g = g.value; m.mhdVal = mhd ? mhd.value : '';
    const ing = ingById(m.ing);
    if (ing && !m.res.qtyG && ing.packs && ing.packs[0]) m.g = ing.packs[0].g;
    renderModal();
  } else if (on === 'gen-set') {
    if (!e.target.value && !e.target.dataset.slot.startsWith('S')) return;
    genCall('/api/gen/preview', { proposal: ui.modal.pv.proposal, set: e.target.dataset.slot, recipe: e.target.value });
  } else if (on === 'q-skip') {
    ui.modal.skip = e.target.checked; ui.modal.showText = null; renderModal();
  } else if (on === 'start-opt') {
    lsSet('mealprep-start', e.target.value); toast('Gespeichert. Gilt ab dem nächsten Öffnen der App.');
  } else if (on === 'shop-check') {
    const l = S.shopping[ui.shop.week - 1];
    shopState(l).off[e.target.dataset.ing] = !e.target.checked;
    $('#shopSum').textContent = eur(shopSum(l));
  } else if (on === 'ed-map') {
    const e2 = ui.ed, i = +e.target.dataset.i, l = e2.d.lines[i], v = e.target.value;
    e2.dirty = true;
    if (!v) return;
    if (v === '__ignore') { l.status = 'ignoriert'; l.manual = true; e2.form = null; }
    else if (v === '__custom') {
      const nm = (l.name || l.text).replace(/^[\d\s.,/½¼¾-]+/, '').trim();
      e2.form = { i, key: `neu:${nm || 'Zutat'}#${i}`, title: 'Neue Zutat anlegen', ni: { name: nm, cat: 'Trockenware & Konserven', kcal: '', p: '', c: '', f: '', packG: '', packPrice: '', pieceG: '', nutSource: 'eigene Angabe' } };
      e2.off = null;
    } else if (v.startsWith('neu:')) {
      l.ing = v; l.manual = true;
      if (e2.newIngs[v]) { l.status = 'ok'; e2.form = null; }
      else if (e2.d.suggest[v]) { l.status = 'neu'; e2.form = { i, key: v, title: `Neu anlegen: ${e2.d.suggest[v].name}`, ni: { ...e2.d.suggest[v] } }; e2.off = null; }
    } else { l.ing = v; l.status = 'ok'; l.manual = true; e2.form = null; }
    renderModal();
  } else if (on === 'ed-g') {
    const l = ui.ed.d.lines[+e.target.dataset.i];
    l.g = Math.max(0, parseFloat(String(e.target.value).replace(',', '.')) || 0); l.manual = true; ui.ed.dirty = true;
    renderModal();
  } else if (e.target.dataset && e.target.dataset.ed === 'portions') {
    renderModal();
  } else if (on === 'import-recipes') {
    const file = e.target.files[0];
    if (!file) return;
    file.text().then(txt => confirmBox('Rezepte übernehmen?', `Eigene Rezepte aus „${file.name}“ werden ergänzt. Plan, Vorrat, Budget und alles andere bleiben unverändert.`, 'Übernehmen', () => call('/api/import/recipes', txt, true)));
    e.target.value = '';
  } else if (on === 'sync-in') {
    const file = e.target.files[0];
    if (file) syncFile(file);
    e.target.value = '';
  } else if (on === 'import') {
    const file = e.target.files[0];
    if (!file) return;
    file.text().then(txt => confirmBox('Backup einspielen?', `Der aktuelle Stand wird durch „${file.name}“ ersetzt. Vorher wird automatisch eine Sicherung angelegt.`, 'Einspielen', () => { ui.day = null; ui.week = null; call('/api/import', txt, true); }));
    e.target.value = '';
  }
});
document.addEventListener('input', e => {
  const ds = e.target.dataset || {};
  if (ds.in && INPUT[ds.in]) return INPUT[ds.in](e.target);
  if (ds.ed && ui.ed) {
    const d = ui.ed.d, v = e.target.value;
    if (ds.ed === 'steps') d.steps = v.split('\n');
    else if (['portions', 'minutes', 'keep'].includes(ds.ed)) d[ds.ed] = v === '' ? '' : +v;
    else d[ds.ed] = v;
    ui.ed.dirty = true;
    return;
  }
  if (ds.on === 'ed-ingtext' && ui.ed) { ui.ed.ingText = e.target.value; ui.ed.dirty = true; return; }
  if (ds.ni && ui.ed && ui.ed.form) { ui.ed.form.ni[ds.ni] = e.target.value; return; }
  if (ds.imp && ui.modal) { ui.modal[ds.imp] = e.target.value; return; }
  if (ds.on === 'rq') { ui.rf.q = e.target.value; const g = $('#rgrid'); if (g) g.innerHTML = recipeGrid(); return; }
  if (e.target.dataset && e.target.dataset.on === 'shop-price') {
    const l = S.shopping[ui.shop.week - 1];
    const v = parseFloat(String(e.target.value).replace(',', '.'));
    shopState(l).price[e.target.dataset.ing] = isFinite(v) && v >= 0 ? v : 0;
    $('#shopSum').textContent = eur(shopSum(l));
  }
});
document.addEventListener('keydown', e => {
  const ds = e.target.dataset || {};
  if (e.key === 'Enter' && ds.on === 'ed-tag-input') {
    e.preventDefault();
    const t = e.target.value.trim();
    if (t && !ui.ed.d.tags.includes(t)) { ui.ed.d.tags.push(t); ui.ed.dirty = true; }
    renderModal();
    const inp = $('[data-on="ed-tag-input"]'); if (inp) inp.focus();
    return;
  }
  if (e.key === 'Enter' && ds.niQ !== undefined) { e.preventDefault(); ACT['off-search'](); return; }
  if (e.key === 'Enter' && ds.imp === 'url') { e.preventDefault(); ACT['imp-link'](); return; }
  if (e.key !== 'Escape') return;
  if (ui.modal) { if (ui.modal.type === 'editor') ACT['ed-close'](); else if (ui.modal.type === 'cookmode') ACT['ck-close'](); else if (ui.modal.type === 'scan') ACT['scan-close'](); else if (ui.modal.type === 'gym') ACT['g-min'](); else if (ui.modal.type === 'tday') ACT['tday-close'](); else closeModal(); } else if (ui.swap) { ui.swap = null; render(); }
});

// Regelmäßig prüfen: läuft das Programm noch, hat der Tag gewechselt?
function checkDay() { if (S && iso(new Date()) !== S.today && !document.querySelector('input:focus, select:focus')) call('/api/state'); }
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkDay(); });
if (WEB && navigator.storage && navigator.storage.persist) navigator.storage.persist().then(v => { ui.persisted = v; }).catch(() => {});
setInterval(async () => {
  if (WEB) return checkDay();
  if (!S || !$('#offline').hidden) return;
  try {
    const res = await fetch('/api/ping');
    const p = await res.json();
    if (p.app !== 'mealprep') throw new Error();
    const now = iso(new Date());
    if (now !== S.today && !document.querySelector('input:focus, select:focus')) call('/api/state');
  } catch (e) { $('#offline').hidden = false; }
}, 30000);

// Einstieg: Direkt-Link (/heute, /einkaufsliste, ?v=…) oder gewählte Startansicht
ui.quick = routeFromUrl() || startTarget();
window.addEventListener('hashchange', () => { const k = routeFromUrl(); if (k) enterQuick(k); });
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  // Nach längerer Pause wieder mit der gewählten Schnellansicht starten (iOS setzt Web-Apps oft nur fort)
  if (hiddenAt && Date.now() - hiddenAt > 20 * 60e3 && !ui.modal && S) { const k = startTarget(); if (k) enterQuick(k); }
});
call('/api/state');

// ---------- 2.1.1: Wischbare Leisten mit Rand-Verlauf, iOS-Vollbild-Höhe ----------
function markScrollers(root) {
  (root || document).querySelectorAll('.tabs').forEach(t => {
    const upd = () => {
      const more = t.scrollWidth - t.clientWidth > 2;
      t.classList.toggle('fade-r', more && t.scrollLeft + t.clientWidth < t.scrollWidth - 2);
      t.classList.toggle('fade-l', more && t.scrollLeft > 2);
    };
    if (!t.dataset.fade) {
      t.dataset.fade = '1';
      t.addEventListener('scroll', upd, { passive: true });
      const on = t.querySelector('.on'); // aktiven Reiter sichtbar machen
      if (on && t.scrollWidth > t.clientWidth) t.scrollLeft = Math.max(0, on.offsetLeft - t.offsetLeft - 24);
    }
    upd();
  });
}
new MutationObserver(() => markScrollers()).observe(document.body, { childList: true, subtree: true });
addEventListener('resize', () => markScrollers());
// iOS-Web-App: Nach der Tastatur bleibt die Höhe manchmal zu klein (dunkler Streifen unten, Leiste zu hoch).
// Dann die volle Höhe neu messen lassen.
(function healViewport() {
  const standalone = navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  if (!standalone) return;
  let maxH = innerHeight;
  addEventListener('resize', () => { maxH = Math.max(maxH, innerHeight); });
  const heal = () => {
    const ae = document.activeElement;
    if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return; // Tastatur offen
    if (maxH - innerHeight <= 4) return;
    const app = document.getElementById('app'), v = document.getElementById('view'), st = v ? v.scrollTop : 0;
    if (!app || app.hidden) return;
    app.style.display = 'none';
    void app.offsetHeight;
    app.style.display = '';
    if (v) v.scrollTop = st;
  };
  document.addEventListener('focusout', e => { if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) setTimeout(heal, 160); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(heal, 160); });
  addEventListener('pageshow', () => setTimeout(heal, 160));
})();
// MealPrep Tracker 2.0 – Training: Übungsdatenbank, Trainingsplaner, Gym-Modus.
// Baut auf app.js auf (S, ui, call, ACT, FORMS, VIEWS, MODALS, CHANGE, INPUT …).

// ---------- Übungsdatenbank ----------
const GYM = { ex: null, byId: {}, hints: {}, quellen: [], pack: null, urls: {}, loading: false, packLoading: false };
const MUSCLES = ['Brust', 'Rücken', 'Schultern', 'Bizeps', 'Trizeps', 'Unterarme', 'Nacken', 'Bauch', 'Beine', 'Gesäß', 'Waden'];
const EQUIPS = ['Langhantel', 'Kurzhantel', 'Kabel', 'Maschine', 'Körpergewicht', 'Sonstiges'];
const nfk = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });
const kg = w => `${nfk.format(w)} kg`;
const repTxt = it => (it.repMin === it.repMax ? `${it.repMin}` : `${it.repMin}–${it.repMax}`);
ui.gym = { tab: 'plan', lib: { q: '', m: '', e: '', day: '', n: 40 }, prog: { ex: '', data: null } };

async function apiGet(path) {
  if (WEB) { const r = await window.mpCall('GET', path, ''); return JSON.parse(r.body); }
  const r = await fetch(path); return r.json();
}
async function loadEx() {
  if (GYM.ex || GYM.loading) return;
  GYM.loading = true;
  try {
    const d = await apiGet('/api/gym/exercises');
    GYM.ex = d.ex; GYM.hints = d.hints; GYM.quellen = d.quellen;
    d.ex.forEach(e => { GYM.byId[e.id] = e; });
  } catch (e) { /* später erneut */ }
  GYM.loading = false;
  if (S) render();
}
loadEx();
function exGet(id) {
  if (GYM.byId[id]) return GYM.byId[id];
  const c = S && S.gym.custom.find(x => x.id === id);
  if (c) return { id: c.id, n: c.name, en: '', m: c.muscle, e: c.equip, k: c.kind, p: '_', custom: true, note: c.note || '' };
  return { id, n: GYM.ex ? 'Unbekannte Übung' : 'Lade …', en: '', m: '', e: '', k: 'i', p: '_' };
}
const allEx = () => S.gym.custom.map(c => exGet(c.id)).concat(GYM.ex || []);
const restDefault = e => (e.k === 'g' && e.e === 'Langhantel' ? 150 : e.k === 'g' ? 120 : 75);
const planDefault = e => ({ ex: e.id, sets: 3, repMin: e.k === 'g' ? 8 : 10, repMax: e.k === 'g' ? 12 : 15, weight: 0, rest: restDefault(e), note: '' });

async function loadPack() {
  if (GYM.pack || GYM.packLoading) return;
  GYM.packLoading = true;
  try { const r = await fetch('uebungen-bilder.bin'); if (r.ok) GYM.pack = await r.arrayBuffer(); } catch (e) { /* offline vor dem ersten Laden */ }
  GYM.packLoading = false;
  if (GYM.pack) { if (ui.modal) renderModal(); else render(); }
}
function exImg(slot, k) {
  if (!GYM.pack) { loadPack(); return ''; }
  const n = slot * 2 + k;
  if (GYM.urls[n]) return GYM.urls[n];
  const dv = new DataView(GYM.pack);
  if (n >= dv.getUint32(0, true)) return '';
  const off = dv.getUint32(4 + n * 8, true), len = dv.getUint32(8 + n * 8, true);
  return (GYM.urls[n] = URL.createObjectURL(new Blob([GYM.pack.slice(off, off + len)], { type: 'image/webp' })));
}
function exFigure(e, cls = '') {
  if (e.i === undefined) return '';
  const a = exImg(e.i, 0), b = exImg(e.i, 1);
  if (!a) return `<div class="exfig ${cls}"></div>`;
  return `<div class="exfig ${cls}" data-act="ex-anim" title="Antippen: Start und Ende nebeneinander"><img src="${a}" alt="Ausgangsposition"><img src="${b}" alt="Endposition"></div>`;
}
const exHints = e => GYM.hints[e.p] || GYM.hints._ || ['', '', ''];
function alternatives(e, max = 8) {
  return allEx().filter(x => x.id !== e.id && x.m === e.m)
    .map(x => [x, (x.p === e.p && e.p !== '_' ? 4 : 0) + (x.e !== e.e ? 2 : 0) + (x.k === e.k ? 1 : 0) + (x.i !== undefined ? 0.5 : 0)])
    .sort((a, b) => b[1] - a[1] || a[0].n.localeCompare(b[0].n, 'de')).slice(0, max).map(x => x[0]);
}
const exTags = e => `<span class="tag">${esc(e.m || '–')}</span><span class="tag">${esc(e.e || '–')}</span><span class="tag ${e.k === 'g' ? 'blue' : ''}">${e.k === 'g' ? 'Grundübung' : 'Isolation'}</span>${e.custom ? '<span class="tag ok">eigene</span>' : ''}`;
const dayById = id => S.gym.days.find(d => d.id === id);

// ---------- Ansicht „Training“ ----------
function gymHero() {
  const g = S.gym, a = g.active, next = dayById(g.next);
  if (a) {
    const done = a.items.filter(it => it.skipped || it.log.length >= it.sets).length;
    return `<section class="card gym-hero on"><div><span class="eyebrow">Training läuft</span><h2>${esc(a.dayName)}</h2>
      <p class="muted">${done} von ${a.items.length} Übungen erledigt · gestartet ${a.date === S.today ? 'heute' : fmtShort(a.date)}</p></div>
      <button class="btn primary q-big" data-act="gym-open">${ic('play')} Weiter trainieren</button></section>`;
  }
  if (!next) return `<section class="card gym-hero"><div><h2>Noch kein Trainingstag</h2><p class="muted">Leg unten deinen ersten Tag an.</p></div></section>`;
  const pos = g.days.findIndex(d => d.id === next.id) + 1;
  return `<section class="card gym-hero"><div><span class="eyebrow">${g.todayDone ? 'Heute schon trainiert – als Nächstes' : 'Als Nächstes'} · Tag ${pos} von ${g.days.length}</span><h2>${esc(next.name)}</h2>
      <p class="muted">${next.items.length ? `${next.items.length} Übungen · ${next.items.reduce((s, it) => s + it.sets, 0)} Sätze` : 'Noch keine Übungen – stell dir den Tag zusammen.'}${g.lastDate ? ` · letztes Training ${rel(g.lastDate)}` : ''}</p></div>
      ${next.items.length ? `<button class="btn primary q-big" data-act="gym-start" data-day="${next.id}">${ic('play')} Training starten</button>`
        : `<button class="btn primary q-big" data-act="tday-edit" data-id="${next.id}">${ic('edit')} Tag zusammenstellen</button>`}</section>`;
}
function dayCard(d, i) {
  const g = S.gym, isNext = d.id === g.next;
  const rows = d.items.map((it, k) => {
    const e = exGet(it.ex), sg = d.sug[k] || {};
    return `<li><button class="link strong" data-act="ex-info" data-id="${esc(it.ex)}">${esc(e.n)}</button>
      <span class="muted">${it.sets}×${repTxt(it)}${sg.w ? ` · ${kg(sg.w)}` : ''}</span></li>`;
  }).join('');
  return `<section class="card tday ${isNext ? 'next' : ''}"><div class="card-head"><div><span class="eyebrow">Tag ${i + 1}${isNext ? ' · als Nächstes dran' : ''}</span><h2>${esc(d.name)}</h2></div>
      <div class="tday-act"><button class="icon-btn" data-act="split-move" data-id="${d.id}" data-n="-1" title="Im Split nach vorn" ${i === 0 ? 'disabled' : ''}>${ic('left')}</button>
        <button class="icon-btn" data-act="split-move" data-id="${d.id}" data-n="1" title="Im Split nach hinten" ${i === g.days.length - 1 ? 'disabled' : ''}>${ic('right')}</button></div></div>
    <div class="chips" style="margin-bottom:8px">${d.muscles.map(m => `<span class="tag">${esc(m)}</span>`).join('') || '<span class="muted small">keine Muskelgruppen gewählt</span>'}</div>
    ${rows ? `<ul class="tday-list">${rows}</ul>` : '<p class="empty">Noch keine Übungen.</p>'}
    <p class="muted small">${d.lastDone ? `Zuletzt trainiert ${fmtShort(d.lastDone)}` : 'Noch nie trainiert'}</p>
    <div class="form-row" style="margin-top:10px"><button class="btn sm" data-act="tday-edit" data-id="${d.id}">${ic('edit')} Bearbeiten</button>
      ${d.items.length && !g.active ? `<button class="btn sm" data-act="gym-start" data-day="${d.id}">${ic('play')} Starten</button>` : ''}
      ${isNext ? '' : `<button class="btn sm ghost" data-act="split-next" data-id="${d.id}">Als Nächstes</button>`}</div></section>`;
}
function gymPlanTab() {
  return `${gymHero()}<div class="tday-grid">${S.gym.days.map(dayCard).join('')}</div>
    <div class="form-row" style="margin-top:14px"><button class="btn" data-act="tday-new">${ic('plus')} Trainingstag hinzufügen</button></div>
    <p class="muted small" style="margin-top:10px">Die Reihenfolge läuft unabhängig vom Wochentag: Nach jeder abgeschlossenen Einheit ist der nächste Tag dran. Ruhetage verschieben nichts.</p>`;
}
function libFilter(l) {
  const q = l.q.trim().toLowerCase(), day = l.day ? dayById(l.day) : null;
  return allEx().filter(e => (!l.m || e.m === l.m) && (!l.e || e.e === l.e) && (!day || day.muscles.includes(e.m))
    && (!q || e.n.toLowerCase().includes(q) || (e.en || '').toLowerCase().includes(q)));
}
function libRows(l, act) {
  const list = libFilter(l), show = list.slice(0, l.n);
  return `<p class="muted small">${list.length} Übungen${GYM.ex ? '' : ' (lade …)'}</p>
    <div class="exlist">${show.map(e => `<button class="exrow" data-act="${act}" data-id="${esc(e.id)}">
      <span class="exrow-n"><b>${esc(e.n)}</b>${e.en && e.en !== e.n ? `<small>${esc(e.en)}</small>` : ''}</span>
      <span class="exrow-t">${e.i !== undefined ? '<span class="tag ok">Bild</span>' : ''}<span class="tag">${esc(e.m)}</span><span class="tag">${esc(e.e)}</span></span></button>`).join('')}</div>
    ${list.length > show.length ? `<button class="btn" data-act="lib-more" style="margin-top:10px">Mehr anzeigen</button>` : ''}`;
}
function libControls(l) {
  const opt = (v, cur, t) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(t || v)}</option>`;
  return `<div class="form-row lib-ctl"><label class="f grow">Suche <input type="search" data-in="lib-q" value="${esc(l.q)}" placeholder="z. B. Curl, Latzug, bench"></label>
    <label class="f">Muskelgruppe <select data-on="lib-f" data-k="m">${opt('', l.m, 'alle')}${MUSCLES.map(m => opt(m, l.m)).join('')}</select></label>
    <label class="f">Gerät <select data-on="lib-f" data-k="e">${opt('', l.e, 'alle')}${EQUIPS.map(m => opt(m, l.e)).join('')}</select></label>
    <label class="f">Passt zu Trainingstag <select data-on="lib-f" data-k="day">${opt('', l.day, 'egal')}${S.gym.days.map(d => opt(d.id, l.day, d.name)).join('')}</select></label></div>`;
}
function gymLibTab() {
  const l = ui.gym.lib;
  return `<section class="card">${libControls(l)}<div id="exlist" style="margin-top:12px">${libRows(l, 'ex-info')}</div>
    <div class="form-row" style="margin-top:14px"><button class="btn" data-act="ex-new">${ic('plus')} Eigene Übung anlegen</button></div>
    <p class="muted small" style="margin-top:12px">Quellen: ${GYM.quellen.map(q => `${esc(q.name)} – ${esc(q.was)}, Lizenz ${esc(q.lizenz)}`).join(' · ')}. Deutsche Namen und Hinweise: MealPrep Tracker (Hinweise je Bewegungstyp).</p></section>`;
}
function gymHistTab() {
  const h = S.gym.history;
  if (!h.length) return '<section class="card"><p class="empty">Noch kein abgeschlossenes Training.</p></section>';
  return `<section class="card"><table><thead><tr><th>Datum</th><th>Tag</th><th class="num">Dauer</th><th class="num">Sätze</th><th class="num">Volumen</th><th>Bestleistungen</th></tr></thead><tbody>
    ${h.map(w => `<tr><td><button class="link" data-act="gym-sum" data-id="${w.id}">${fmtShort(w.date)}</button></td><td>${esc(w.dayName)}</td><td class="num">${w.minutes} Min.</td><td class="num">${w.sets}</td>
      <td class="num">${num(w.volume)} kg</td><td>${w.prs.length ? `<span class="tag star">${ic('trophy')} ${w.prs.length}</span>` : '<span class="muted">–</span>'}</td></tr>`).join('')}</tbody></table></section>`;
}
VIEWS.training = () => {
  const t = ui.gym.tab, tabs = [['plan', 'Plan'], ['uebungen', 'Übungen'], ['fortschritt', 'Fortschritt'], ['verlauf', 'Verlauf']];
  const body = t === 'uebungen' ? gymLibTab() : t === 'verlauf' ? gymHistTab() : t === 'fortschritt' && typeof gymProgTab === 'function' ? gymProgTab() : gymPlanTab();
  return head('Training', `${S.gym.total} ${S.gym.total === 1 ? 'Einheit' : 'Einheiten'} bisher · ${GYM.ex ? GYM.ex.length + S.gym.custom.length : '…'} Übungen in der Bibliothek`,
    `<div class="tabs">${tabs.map(([k, n]) => `<button class="tab ${t === k ? 'on' : ''}" data-act="gym-tab" data-t="${k}">${n}</button>`).join('')}</div>`) + body;
};

// ---------- Übungs-Details, eigene Übungen ----------
MODALS.exinfo = () => {
  const m = ui.modal, e = exGet(m.id), h = exHints(e), alts = alternatives(e);
  const yt = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${e.n} Ausführung`);
  return `<div class="sheet"><div class="sheet-head"><div><h2>${esc(e.n)}</h2>${e.en && e.en !== e.n ? `<p class="muted">${esc(e.en)}</p>` : ''}<div class="chips" style="margin-top:6px">${exTags(e)}</div></div>
      <button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
    <div class="exinfo-grid">${exFigure(e, 'big')}
      <div class="stack">${e.custom ? (e.note ? `<p>${esc(e.note)}</p>` : '<p class="muted">Eigene Übung ohne Beschreibung.</p>') : `
        <div class="hint"><b>Ausgangsposition</b><p>${esc(h[0])}</p></div><div class="hint"><b>Bewegung</b><p>${esc(h[1])}</p></div><div class="hint bad"><b>Typische Fehler</b><p>${esc(h[2])}</p></div>`}
        ${e.s && e.s.length ? `<p class="muted small">Arbeitet mit: ${esc(e.s.join(', '))}</p>` : ''}
        <div class="form-row"><a class="btn sm" href="${yt}" target="_blank" rel="noopener">${ic('search')} Video suchen</a>
          ${e.custom ? `<button class="btn sm" data-act="ex-new" data-id="${esc(e.id)}">${ic('edit')} Bearbeiten</button><button class="btn sm danger" data-act="ex-del" data-id="${esc(e.id)}">${ic('trash')} Löschen</button>` : ''}</div></div></div>
    ${m.pick ? '' : `<div class="form-row" style="margin-top:14px"><label class="f grow">Zu Trainingstag hinzufügen <select id="exAddDay">${S.gym.days.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select></label>
      <button class="btn primary" data-act="ex-add" data-id="${esc(e.id)}">${ic('plus')} Hinzufügen</button></div>`}
    <h3 class="h3" style="margin-top:18px">Gleichwertige Alternativen</h3>
    <div class="exlist">${alts.map(x => `<button class="exrow" data-act="ex-info" data-id="${esc(x.id)}"><span class="exrow-n"><b>${esc(x.n)}</b></span><span class="exrow-t"><span class="tag">${esc(x.e)}</span></span></button>`).join('') || '<p class="empty">Keine gefunden.</p>'}</div>
    ${e.i !== undefined ? '<p class="muted small" style="margin-top:12px">Zeichnung: Everkinetic (Greg Priday), CC BY-SA 4.0.</p>' : ''}</div>`;
};
MODALS.exedit = () => {
  const c = ui.modal.c, opt = (v, cur) => `<option ${v === cur ? 'selected' : ''}>${v}</option>`;
  return `<div class="sheet narrow"><div class="sheet-head"><h2>${c.id ? 'Übung bearbeiten' : 'Eigene Übung'}</h2><button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
    <form class="stack" data-form="ex-save"><label class="f">Name <input type="text" name="name" value="${esc(c.name)}" required maxlength="80"></label>
      <div class="form-row nums"><label class="f">Muskelgruppe <select name="muscle">${MUSCLES.map(m => opt(m, c.muscle)).join('')}</select></label>
        <label class="f">Gerät <select name="equip">${EQUIPS.map(m => opt(m, c.equip)).join('')}</select></label></div>
      <label class="f">Art <select name="kind"><option value="i" ${c.kind !== 'g' ? 'selected' : ''}>Isolationsübung (ein Gelenk)</option><option value="g" ${c.kind === 'g' ? 'selected' : ''}>Grundübung (mehrere Gelenke)</option></select></label>
      <label class="f">Hinweise (optional) <textarea name="note" rows="3">${esc(c.note || '')}</textarea></label>
      <div class="sheet-foot"><button type="button" class="btn ghost" data-act="modal-close">Abbrechen</button><button class="btn primary">Speichern</button></div></form></div>`;
};

// ---------- Trainingstag bearbeiten ----------
function tdayRows(d) {
  return d.items.map((it, i) => {
    const e = exGet(it.ex), f = (k, v, attr) => `<input type="number" inputmode="decimal" data-in="ti" data-i="${i}" data-k="${k}" value="${v}" ${attr}>`;
    return `<div class="ti" data-i="${i}"><button type="button" class="ti-grip" title="Ziehen zum Sortieren" aria-label="Ziehen zum Sortieren">${ic('grip')}</button>
      <div class="ti-main"><div class="ti-head"><button type="button" class="link strong" data-act="ex-info" data-id="${esc(it.ex)}">${esc(e.n)}</button>
          <button type="button" class="icon-btn" data-act="ti-del" data-i="${i}" title="Entfernen">${ic('trash')}</button></div>
        <div class="ti-fields"><label class="f">Sätze ${f('sets', it.sets, 'min="1" max="12" step="1"')}</label>
          <label class="f">Wdh. von ${f('repMin', it.repMin, 'min="1" max="100" step="1"')}</label><label class="f">bis ${f('repMax', it.repMax, 'min="1" max="100" step="1"')}</label>
          <label class="f">Gewicht (kg) ${f('weight', it.weight || '', 'min="0" step="0.5" placeholder="0"')}</label>
          <label class="f">Pause (s) ${f('rest', it.rest || '', `min="0" step="15" placeholder="${restDefault(e)}"`)}</label>
          <label class="f">Schritt (kg) ${f('step', it.step || '', `min="0" step="0.5" placeholder="${e.e === 'Kurzhantel' ? 2 : 2.5}"`)}</label></div>
        <input type="text" class="ti-note" data-in="ti" data-i="${i}" data-k="note" value="${esc(it.note || '')}" placeholder="Notiz, z. B. Sitz Stufe 4" maxlength="120"></div></div>`;
  }).join('');
}
MODALS.tday = () => {
  const m = ui.modal, d = m.d;
  if (m.pick) {
    const l = m.lib;
    return `<div class="sheet"><div class="sheet-head"><div><h2>Übung hinzufügen</h2><p class="muted">für ${esc(d.name || 'neuen Tag')} – antippen fügt hinzu</p></div>
      <button class="icon-btn" data-act="tday-pick" data-on="0" title="Zurück">${ic('x')}</button></div>
      ${libControls(l)}<div id="exlist" style="margin-top:12px">${libRows(l, 'tday-add')}</div></div>`;
  }
  return `<div class="sheet"><div class="sheet-head"><div><h2>${d.id ? 'Trainingstag bearbeiten' : 'Neuer Trainingstag'}</h2></div><button class="icon-btn" data-act="tday-close" title="Schließen">${ic('x')}</button></div>
    <label class="f">Name <input type="text" data-in="td-name" value="${esc(d.name)}" maxlength="40" placeholder="z. B. Push"></label>
    <div style="margin:12px 0"><span class="muted small">Muskelgruppen (für Vorschläge und Filter)</span><div class="chips" style="margin-top:6px">${MUSCLES.map(x => `<button type="button" class="chip ${d.muscles.includes(x) ? 'on' : ''}" data-act="td-muscle" data-m="${x}">${x}</button>`).join('')}</div></div>
    <div id="tiList" class="ti-list">${tdayRows(d)}</div>
    ${d.items.length ? '' : '<p class="empty">Noch keine Übungen.</p>'}
    <div class="form-row" style="margin-top:12px"><button class="btn" data-act="tday-pick" data-on="1">${ic('plus')} Übung hinzufügen</button>
      ${!d.items.length && d.muscles.length ? `<button class="btn ghost" data-act="tday-starter">${ic('spark')} Startvorschlag einfügen</button>` : ''}</div>
    <div class="sheet-foot">${d.id ? `<button class="btn ghost danger" data-act="tday-del" data-id="${d.id}">Tag löschen</button>` : ''}<span class="grow"></span>
      <button class="btn ghost" data-act="tday-close">Abbrechen</button><button class="btn primary" data-act="tday-save">${ic('check')} Speichern</button></div></div>`;
};
// Ziehen zum Sortieren (Maus und Finger): Zeilen werden direkt im DOM verschoben, beim Loslassen wird die Reihenfolge übernommen.
let tiDrag = null;
document.addEventListener('pointerdown', e => {
  const grip = e.target.closest && e.target.closest('.ti-grip');
  if (!grip || !ui.modal || ui.modal.type !== 'tday') return;
  e.preventDefault();
  tiDrag = { row: grip.closest('.ti'), list: $('#tiList') };
  tiDrag.row.classList.add('dragging');
  try { grip.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
});
function tiPlace() { // Zeile an die Fingerposition setzen, am Rand mitscrollen
  const y = tiDrag.y, sh = tiDrag.list.closest('.sheet'), box = sh.getBoundingClientRect();
  if (y < box.top + 80) sh.scrollTop -= 14; else if (y > box.bottom - 80) sh.scrollTop += 14;
  const rows = [...tiDrag.list.querySelectorAll('.ti')].filter(r => r !== tiDrag.row);
  const before = rows.find(r => { const b = r.getBoundingClientRect(); return y < b.top + b.height / 2; }) || null;
  if (before !== tiDrag.row.nextElementSibling) tiDrag.list.insertBefore(tiDrag.row, before);
}
document.addEventListener('pointermove', e => {
  if (!tiDrag) return;
  e.preventDefault(); tiDrag.y = e.clientY;
  if (!tiDrag.timer) tiDrag.timer = setInterval(tiPlace, 16);
}, { passive: false });
const tiDrop = () => {
  if (!tiDrag) return;
  clearInterval(tiDrag.timer);
  const d = ui.modal.d, order = [...tiDrag.list.querySelectorAll('.ti')].map(r => +r.dataset.i);
  d.items = order.map(i => d.items[i]);
  tiDrag = null; ui.modal.dirty = true; renderModal();
};
document.addEventListener('pointerup', tiDrop);
document.addEventListener('pointercancel', tiDrop);

// ---------- Gym-Modus ----------
function gymCur(a) {
  const open = i => !a.items[i].skipped && a.items[i].log.length < a.items[i].sets;
  if (ui.g.idx != null && ui.g.idx < a.items.length && (ui.g.stay || open(ui.g.idx))) return ui.g.idx;
  const i = a.items.findIndex((_, k) => open(k));
  return i;
}
function gymLoad(a, i) { // Eingabewerte für die aktuelle Übung setzen
  ui.g.idx = i; ui.g.edit = null; ui.g.feel = 0;
  if (i < 0) return;
  const it = a.items[i], last = it.log[it.log.length - 1];
  ui.g.w = last ? last.w : it.w; ui.g.r = last ? last.r : it.repMax;
}
function openGym() {
  const a = S.gym.active;
  if (!a) return;
  ui.g = { idx: null, panel: '', stay: false };
  gymLoad(a, gymCur(a));
  ui.modal = { type: 'gym' };
  const t = $('#toast'); if (t) t.hidden = true;
  keepAwake(true);
  renderModal();
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && ui.modal && ui.modal.type === 'gym') keepAwake(true); });
const gymStep = e => (e.e === 'Kurzhantel' ? 1 : 2.5);
function gymMinutes(a) { const t = Date.parse(a.start); return isNaN(t) ? 0 : Math.max(0, Math.round((Date.now() - t) / 60000)); }
function gymListPanel(a, cur) {
  return `<div class="g-panel"><h3 class="h3">Übersicht</h3><div class="exlist">${a.items.map((it, i) => {
    const e = exGet(it.ex), st = it.skipped ? 'übersprungen' : it.log.length >= it.sets ? 'fertig' : it.log.length ? `${it.log.length} von ${it.sets}` : 'offen';
    return `<button class="exrow ${i === cur ? 'on' : ''}" data-act="g-jump" data-i="${i}"><span class="exrow-n"><b>${esc(e.n)}</b><small>${it.sets}×${repTxt(it)}${it.w ? ` · ${kg(it.w)}` : ''}${it.orig ? ' · getauscht' : ''}</small></span>
      <span class="exrow-t"><span class="tag ${st === 'fertig' ? 'ok' : it.skipped ? 'warn' : ''}">${st}</span></span></button>`;
  }).join('')}</div>
    <p class="muted small">Antippen: Diese Übung jetzt machen (sie rückt in der Reihenfolge nach vorn).</p>
    <div class="g-row2"><button class="btn q-big" data-act="g-panel" data-p="">Zurück</button><button class="btn q-big danger" data-act="g-cancel">Training abbrechen</button></div></div>`;
}
function gymSwapPanel(a, cur) {
  const it = a.items[cur], e = exGet(it.ex), sel = ui.g.swapTo ? exGet(ui.g.swapTo) : null;
  if (sel) return `<div class="g-panel"><h3 class="h3">Tauschen gegen</h3><p class="g-name" style="font-size:22px">${esc(sel.n)}</p><div class="chips">${exTags(sel)}</div>
    <div class="stack" style="margin-top:14px"><button class="btn primary q-big" data-act="g-swap-do" data-perm="0">Nur heute tauschen</button>
      <button class="btn q-big" data-act="g-swap-do" data-perm="1">Dauerhaft in den Plan übernehmen</button><button class="btn ghost q-big" data-act="g-swap-pick" data-id="">Andere wählen</button></div></div>`;
  const q = (ui.g.swapQ || '').trim().toLowerCase();
  const list = q ? allEx().filter(x => x.id !== e.id && (x.n.toLowerCase().includes(q) || (x.en || '').toLowerCase().includes(q))).slice(0, 25) : alternatives(e, 10);
  return `<div class="g-panel"><h3 class="h3">${esc(e.n)} tauschen</h3>
    <label class="f">Suche in allen Übungen <input type="search" data-in="g-swapq" value="${esc(ui.g.swapQ || '')}" placeholder="leer = passende Alternativen"></label>
    <div class="exlist" id="swaplist" style="margin-top:10px">${list.map(x => `<button class="exrow" data-act="g-swap-pick" data-id="${esc(x.id)}"><span class="exrow-n"><b>${esc(x.n)}</b></span><span class="exrow-t"><span class="tag">${esc(x.m)}</span><span class="tag">${esc(x.e)}</span></span></button>`).join('') || '<p class="empty">Nichts gefunden.</p>'}</div>
    <div class="g-row2"><button class="btn q-big" data-act="g-panel" data-p="">Zurück</button></div></div>`;
}
MODALS.gym = () => {
  const a = S.gym.active;
  if (!a) return '<div class="sheet narrow"><p>Kein laufendes Training.</p><div class="sheet-foot"><button class="btn primary" data-act="modal-close">OK</button></div></div>';
  let cur = gymCur(a);
  if (cur !== ui.g.idx) gymLoad(a, cur);
  const doneN = a.items.filter(it => it.skipped || it.log.length >= it.sets).length;
  const top = `<div class="g-top"><div><span class="eyebrow">${esc(a.dayName)} · ${gymMinutes(a)} Min.${wakeLock ? ' · Bildschirm bleibt an' : ''}</span>
      <div class="g-prog"><i style="width:${(doneN / a.items.length * 100).toFixed(0)}%"></i></div><span class="muted small">${doneN} von ${a.items.length} Übungen</span></div>
      <button class="icon-btn g-x" data-act="g-min" title="Verkleinern – das Training läuft weiter">${ic('x')}</button></div>`;
  if (ui.g.panel === 'list') return `<div class="sheet gym-sheet">${top}${gymListPanel(a, cur)}</div>`;
  if (ui.g.panel === 'swap' && cur >= 0) return `<div class="sheet gym-sheet">${top}${gymSwapPanel(a, cur)}</div>`;
  if (cur < 0) {
    const sets = a.items.reduce((s, it) => s + it.log.length, 0);
    return `<div class="sheet gym-sheet">${top}<div class="g-main"><span class="g-set">Geschafft</span><p class="g-name">Alle Übungen sind erledigt.</p><p class="muted">${sets} Sätze eingetragen.</p></div>
      <div class="g-row2"><button class="btn q-big" data-act="g-panel" data-p="list">Übersicht</button><button class="btn primary q-big" data-act="g-finish">${ic('check')} Training beenden</button></div></div>`;
  }
  const it = a.items[cur], e = exGet(it.ex), n = it.log.length, edit = ui.g.edit, extra = n >= it.sets && edit == null;
  const nextI = a.items.findIndex((x, k) => k !== cur && !x.skipped && x.log.length < x.sets && k > cur), nx = nextI >= 0 ? a.items[nextI] : null;
  const step = (f, lbl, val, d) => `<div class="g-step"><span>${lbl}</span><div><button class="g-pm" data-act="g-step" data-f="${f}" data-d="-1" aria-label="${lbl} weniger">−</button>
      <input type="number" inputmode="decimal" data-in="g-val" data-f="${f}" value="${val}" step="${d}" min="0" aria-label="${lbl}">
      <button class="g-pm" data-act="g-step" data-f="${f}" data-d="1" aria-label="${lbl} mehr">+</button></div></div>`;
  return `<div class="sheet gym-sheet">${top}
    <div class="g-main">${exFigure(e, 'gymfig')}
      <span class="g-set">${edit != null ? `Satz ${edit + 1} ändern` : extra ? `Zusatzsatz (${n} von ${it.sets} fertig)` : `Satz ${n + 1} von ${it.sets}`}</span>
      <button class="g-name" data-act="ex-info" data-id="${esc(it.ex)}">${esc(e.n)}</button>
      <p class="g-target">Ziel: <b>${it.w ? kg(it.w) : e.e === 'Körpergewicht' ? 'Körpergewicht' : 'Gewicht wählen'}</b> × <b>${repTxt(it)}</b> Wdh.${it.rest ? ` <span class="muted">· Pause ca. ${it.rest} s</span>` : ''}</p>
      ${it.why ? `<p class="g-why">${esc(it.why)}</p>` : ''}${it.note ? `<p class="g-note">${esc(it.note)}</p>` : ''}${it.orig ? `<p class="muted small">Heute getauscht für: ${esc(exGet(it.orig).n)}</p>` : ''}
      ${n ? `<div class="g-log">${it.log.map((l, k) => `<button class="chip ${edit === k ? 'on' : ''}" data-act="g-edit" data-k="${k}" title="Satz ändern">${k + 1}: ${l.w ? nfk.format(l.w) + '×' : ''}${l.r}${l.feel ? ['', ' · leicht', ' · mittel', ' · schwer'][l.feel] : ''}</button>`).join('')}</div>` : ''}</div>
    <div class="g-inputs">${step('w', 'Gewicht (kg)', ui.g.w, gymStep(e))}${step('r', 'Wiederholungen', ui.g.r, 1)}</div>
    <div class="g-feel"><span class="muted small">Wie schwer?</span>${[[1, 'leicht'], [2, 'mittel'], [3, 'schwer']].map(([v, t]) => `<button class="chip ${ui.g.feel === v ? 'on' : ''}" data-act="g-feel" data-v="${v}">${t}</button>`).join('')}</div>
    <button class="btn primary g-done" data-act="g-set">${ic('check')} ${edit != null ? 'Satz speichern' : 'Satz fertig'}</button>
    ${edit != null ? `<div class="g-row2"><button class="btn q-big" data-act="g-edit" data-k="-1">Abbrechen</button><button class="btn q-big danger" data-act="g-setdel">Satz löschen</button></div>` : `
    <div class="g-row3"><button class="btn" data-act="g-panel" data-p="swap" ${n ? 'disabled' : ''}>${ic('swap')} Tauschen</button>
      <button class="btn" data-act="g-skip">${ic('skip')} Überspringen</button><button class="btn" data-act="g-panel" data-p="list">${ic('menu')} Übersicht</button></div>
    ${nx ? `<button class="g-next" data-act="g-jump" data-i="${nextI}"><span class="muted small">Danach</span><b>${esc(exGet(nx.ex).n)}</b><span class="muted small">${nx.sets}×${repTxt(nx)}${nx.w ? ` · ${kg(nx.w)}` : ''}</span></button>`
      : `<button class="g-next" data-act="g-finish"><span class="muted small">Letzte Übung</span><b>Training beenden</b></button>`}`}</div>`;
};
MODALS.gymsum = () => {
  const w = S.gym.history.find(x => x.id === ui.modal.id);
  if (!w) return '<div class="sheet narrow"><p>Training nicht gefunden.</p></div>';
  const dv = w.prevDate && w.prevVolume ? (w.volume - w.prevVolume) / w.prevVolume * 100 : null;
  return `<div class="sheet"><div class="sheet-head"><div><span class="eyebrow">${ui.modal.fresh ? 'Training geschafft' : 'Training'} · ${fmtLong(w.date)}</span><h2>${esc(w.dayName)}</h2></div>
      <button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
    <div class="rv-grid sum3"><div class="rv"><b>${w.minutes}<small> Min.</small></b><span>Dauer</span>${w.prevDate ? `<em>zuletzt ${w.prevMinutes} Min.</em>` : ''}</div>
      <div class="rv"><b>${num(w.volume)}<small> kg</small></b><span>Volumen (kg × Wdh.)</span>${dv != null ? `<em>${dv >= 0 ? '+' : '−'}${nf1.format(Math.abs(dv))} % zum ${dm(w.prevDate)}</em>` : '<em>erste Einheit dieses Tags</em>'}</div>
      <div class="rv"><b>${w.sets}</b><span>Sätze</span>${w.prevDate ? `<em>zuletzt ${w.prevSets}</em>` : ''}</div></div>
    ${w.prs.length ? `<div class="prbox"><b>${ic('trophy')} Neue Bestleistungen</b><ul>${w.prs.map(p => `<li>${esc(exGet(p.ex).n)}: ${esc(p.text)}</li>`).join('')}</ul></div>` : ''}
    <ul class="sumlist">${w.items.map(it => `<li><div><b>${esc(exGet(it.ex).n)}</b>${it.orig ? ' <span class="tag">getauscht</span>' : ''}<span>${it.skipped && !it.sets ? 'übersprungen' : esc(it.sets || '–')}</span></div><em>${it.volume ? num(it.volume) + ' kg' : ''}</em></li>`).join('')}</ul>
    <div class="sheet-foot"><button class="btn ghost danger" data-act="gym-del" data-id="${w.id}">Training löschen</button><span class="grow"></span><button class="btn primary" data-act="modal-close">OK</button></div></div>`;
};

// ---------- Aktionen ----------
Object.assign(ACT, {
  'gym-tab'(d) { ui.gym.tab = d.t; if (d.t === 'fortschritt' && typeof progLoad === 'function') progLoad(); render(); },
  'lib-more'() { const l = ui.modal && ui.modal.type === 'tday' ? ui.modal.lib : ui.gym.lib; l.n += 60; const b = $('#exlist'); if (b) b.innerHTML = libRows(l, ui.modal && ui.modal.type === 'tday' ? 'tday-add' : 'ex-info'); },
  'ex-info'(d) { ui.modal = { type: 'exinfo', id: d.id, back: ui.modal && ui.modal.type === 'exinfo' ? ui.modal.back : ui.modal, pick: ui.modal && (ui.modal.type === 'gym' || ui.modal.type === 'tday' || ui.modal.pick) }; renderModal(); const s = $('#modal .sheet'); if (s) s.scrollTop = 0; },
  'ex-anim'(d, el) { el.classList.toggle('paused'); },
  'ex-new'(d) { const c = d.id ? S.gym.custom.find(x => x.id === d.id) : null; ui.modal = { type: 'exedit', c: c ? { ...c } : { id: '', name: '', muscle: ui.gym.lib.m || 'Brust', equip: 'Maschine', kind: 'i', note: '' } }; renderModal(); },
  'ex-del'(d) { confirmBox('Übung löschen?', 'Die eigene Übung wird entfernt. Bereits gespeicherte Trainings bleiben erhalten.', 'Löschen', () => { ui.modal = null; call('/api/gym/ex/delete', { id: d.id }); }, true); },
  'ex-add'(d) {
    const day = dayById($('#exAddDay').value), e = exGet(d.id);
    if (!day) return;
    if (day.items.some(it => it.ex === d.id)) return toast(`${e.n} steht schon in „${day.name}“.`, true);
    const body = { id: day.id, name: day.name, muscles: day.muscles, items: day.items.concat([planDefault(e)]) };
    call('/api/gym/day/save', body).then(r => { if (r) toast(`${e.n} zu „${day.name}“ hinzugefügt.`); });
  },
  'tday-new'() { ui.modal = { type: 'tday', d: { id: '', name: '', muscles: [], items: [] }, lib: { q: '', m: '', e: '', day: '', n: 40 } }; renderModal(); },
  'tday-edit'(d) { const x = dayById(d.id); ui.modal = { type: 'tday', d: JSON.parse(JSON.stringify({ id: x.id, name: x.name, muscles: x.muscles, items: x.items })), lib: { q: '', m: '', e: '', day: '', n: 40 } }; renderModal(); },
  'tday-close'() { const m = ui.modal; if (m.dirty) confirmBox('Änderungen verwerfen?', 'Deine Änderungen an diesem Trainingstag gehen verloren.', 'Verwerfen', () => { ui.modal = null; renderModal(); }, true); else { ui.modal = null; renderModal(); } },
  'tday-pick'(d) { ui.modal.pick = d.on === '1'; if (ui.modal.pick) { const l = ui.modal.lib; l.q = ''; l.n = 40; l.m = ''; l.day = ''; l.muscles = ui.modal.d.muscles; } renderModal(); },
  'tday-add'(d) { const m = ui.modal, e = exGet(d.id); if (m.d.items.some(it => it.ex === d.id)) return toast('Diese Übung ist schon im Tag.', true); m.d.items.push(planDefault(e)); m.pick = false; m.dirty = true; renderModal(); },
  'ti-del'(d) { ui.modal.d.items.splice(+d.i, 1); ui.modal.dirty = true; renderModal(); },
  'td-muscle'(d) { const ms = ui.modal.d.muscles, i = ms.indexOf(d.m); if (i >= 0) ms.splice(i, 1); else ms.push(d.m); ui.modal.dirty = true; renderModal(); },
  'tday-save'() {
    const d = ui.modal.d;
    const body = { ...d, items: d.items.map(it => ({ ...it, sets: +it.sets || 0, repMin: +it.repMin || 0, repMax: +it.repMax || 0, weight: +it.weight || 0, rest: +it.rest || 0, step: +it.step || 0 })) };
    call('/api/gym/day/save', body).then(r => { if (r) { ui.modal = null; renderModal(); toast('Trainingstag gespeichert.'); } });
  },
  'tday-starter'() {
    const d = ui.modal.d;
    const go = () => call('/api/gym/day/starter', { id: d.id }).then(r => { if (r) ACT['tday-edit']({ id: d.id }); });
    if (!d.id) return toast('Speichere den Tag zuerst, dann kann ich einen Vorschlag einfügen.', true);
    call('/api/gym/day/save', d).then(r => { if (r) go(); });
  },
  'tday-del'(d) { confirmBox('Trainingstag löschen?', 'Der Tag verschwindet aus dem Split. Gespeicherte Trainings bleiben im Verlauf.', 'Löschen', () => { ui.modal = null; call('/api/gym/day/delete', { id: d.id }); }, true); },
  'split-move'(d) { const o = S.gym.days.map(x => x.id), i = o.indexOf(d.id), j = i + +d.n; if (j < 0 || j >= o.length) return; [o[i], o[j]] = [o[j], o[i]]; call('/api/gym/split', { order: o, next: '' }); },
  'split-next'(d) { call('/api/gym/split', { next: d.id }).then(r => { if (r) toast(`„${dayById(d.id).name}“ ist als Nächstes dran.`); }); },
  'gym-start'(d) { call('/api/gym/start', { day: d.day || '' }).then(r => { if (r && S.gym.active) openGym(); }); },
  'gym-open'() { openGym(); },
  'gym-sum'(d) { ui.modal = { type: 'gymsum', id: +d.id }; renderModal(); },
  'gym-del'(d) { confirmBox('Training löschen?', 'Das Training verschwindet aus Verlauf und Fortschritt.', 'Löschen', () => { ui.modal = null; call('/api/gym/workout/delete', { id: +d.id }); }, true); },
  'g-min'() { ui.modal = null; keepAwake(false); renderModal(); render(); },
  'g-panel'(d) { ui.g.panel = d.p; ui.g.swapTo = ''; ui.g.swapQ = ''; renderModal(); },
  'g-step'(d) {
    const a = S.gym.active, e = exGet(a.items[ui.g.idx].ex), st = d.f === 'w' ? gymStep(e) : 1;
    ui.g[d.f] = Math.max(d.f === 'w' ? 0 : 1, Math.round(((+ui.g[d.f] || 0) + st * +d.d) * 100) / 100);
    const inp = $(`[data-in="g-val"][data-f="${d.f}"]`); if (inp) inp.value = ui.g[d.f];
  },
  'g-feel'(d) { ui.g.feel = ui.g.feel === +d.v ? 0 : +d.v; renderModal(); },
  'g-set'() {
    const a = S.gym.active, i = ui.g.idx, it = a.items[i], edit = ui.g.edit;
    if (!(+ui.g.r >= 1)) return toast('Bitte die Wiederholungen eintragen.', true);
    const body = { wid: a.id, item: i, set: edit != null ? edit : it.log.length, w: +ui.g.w || 0, r: Math.round(+ui.g.r), feel: ui.g.feel || 0 };
    ui.g.stay = edit != null || it.log.length >= it.sets; // beim Ändern und bei Zusatzsätzen auf der Übung bleiben
    call('/api/gym/set', body).then(r => { if (r) { ui.g.edit = null; ui.g.feel = 0; if (!ui.g.stay) ui.g.idx = null; ui.g.stay = false; renderModal(); } });
  },
  'g-edit'(d) {
    const k = +d.k, it = S.gym.active.items[ui.g.idx];
    if (k < 0 || ui.g.edit === k) { ui.g.edit = null; ui.g.stay = false; gymLoad(S.gym.active, ui.g.idx); } else { ui.g.edit = k; ui.g.stay = true; ui.g.w = it.log[k].w; ui.g.r = it.log[k].r; ui.g.feel = it.log[k].feel || 0; }
    renderModal();
  },
  'g-setdel'() { const a = S.gym.active; ui.g.stay = true; call('/api/gym/set', { wid: a.id, item: ui.g.idx, set: ui.g.edit, del: true }).then(() => { ui.g.edit = null; ui.g.stay = false; gymLoad(S.gym.active, ui.g.idx); renderModal(); }); },
  'g-skip'() { const a = S.gym.active; ui.g.stay = false; call('/api/gym/skip', { wid: a.id, item: ui.g.idx, skip: true }).then(() => { ui.g.idx = null; renderModal(); }); },
  'g-jump'(d) {
    const a = S.gym.active, to = +d.i, cur = gymCur(a);
    ui.g.panel = '';
    const it = a.items[to];
    const done = () => { ui.g.stay = true; gymLoad(S.gym.active, ui.g.idx); renderModal(); };
    const unskip = it.skipped ? call('/api/gym/skip', { wid: a.id, item: to, skip: false }) : Promise.resolve(true);
    unskip.then(() => {
      if (cur >= 0 && to > cur && !a.items[cur].log.length) { ui.g.idx = cur; call('/api/gym/move', { wid: a.id, from: to, to: cur }).then(done); } else { ui.g.idx = to; done(); }
    });
  },
  'g-swap-pick'(d) { ui.g.swapTo = d.id; renderModal(); },
  'g-swap-do'(d) { const a = S.gym.active; ui.g.stay = true; call('/api/gym/swap', { wid: a.id, item: ui.g.idx, ex: ui.g.swapTo, permanent: d.perm === '1' }).then(r => { if (r) { ui.g.panel = ''; ui.g.swapTo = ''; gymLoad(S.gym.active, ui.g.idx); renderModal(); } }); },
  'g-finish'() {
    const a = S.gym.active, open = a.items.filter(it => !it.skipped && it.log.length < it.sets).length;
    const go = () => call('/api/gym/finish', { wid: a.id }).then(r => { if (r) { keepAwake(false); ui.modal = { type: 'gymsum', id: a.id, fresh: true }; renderModal(); } });
    if (open) confirmBox('Training beenden?', `${open} ${open === 1 ? 'Übung ist' : 'Übungen sind'} noch nicht fertig. Das Training wird trotzdem gespeichert.`, 'Beenden', go); else go();
  },
  'g-cancel'() { const a = S.gym.active; confirmBox('Training abbrechen?', 'Alle Sätze dieser Einheit werden verworfen. Der Trainingstag bleibt als Nächstes dran.', 'Verwerfen', () => { keepAwake(false); ui.modal = null; call('/api/gym/workout/delete', { id: a.id }); }, true); },
});
FORMS['ex-save'] = f => {
  const v = fd(f), c = ui.modal.c;
  call('/api/gym/ex/save', { id: c.id, name: v.name, muscle: v.muscle, equip: v.equip, kind: v.kind, note: v.note }).then(r => { if (r) { ui.modal = null; renderModal(); } });
};
CHANGE['lib-f'] = el => {
  const inTday = ui.modal && ui.modal.type === 'tday', l = inTday ? ui.modal.lib : ui.gym.lib;
  l[el.dataset.k] = el.value; l.n = 40;
  const b = $('#exlist'); if (b) b.innerHTML = libRows(l, inTday ? 'tday-add' : 'ex-info');
};
INPUT['lib-q'] = el => {
  const inTday = ui.modal && ui.modal.type === 'tday', l = inTday ? ui.modal.lib : ui.gym.lib;
  l.q = el.value; l.n = 40;
  const b = $('#exlist'); if (b) b.innerHTML = libRows(l, inTday ? 'tday-add' : 'ex-info');
};
INPUT['td-name'] = el => { ui.modal.d.name = el.value; ui.modal.dirty = true; };
INPUT.ti = el => { const it = ui.modal.d.items[+el.dataset.i]; it[el.dataset.k] = el.dataset.k === 'note' ? el.value : el.value; ui.modal.dirty = true; };
INPUT['g-val'] = el => { ui.g[el.dataset.f] = el.value === '' ? '' : +el.value.replace(',', '.'); };
INPUT['g-swapq'] = el => {
  ui.g.swapQ = el.value;
  const a = S.gym.active, e = exGet(a.items[ui.g.idx].ex), q = el.value.trim().toLowerCase();
  const list = q ? allEx().filter(x => x.id !== e.id && (x.n.toLowerCase().includes(q) || (x.en || '').toLowerCase().includes(q))).slice(0, 25) : alternatives(e, 10);
  $('#swaplist').innerHTML = list.map(x => `<button class="exrow" data-act="g-swap-pick" data-id="${esc(x.id)}"><span class="exrow-n"><b>${esc(x.n)}</b></span><span class="exrow-t"><span class="tag">${esc(x.m)}</span><span class="tag">${esc(x.e)}</span></span></button>`).join('') || '<p class="empty">Nichts gefunden.</p>';
};

// ---------- Fortschritt ----------
const GCH = {}; // Diagrammdaten für den Tooltip
function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v || 1))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }
function gLine(id, title, pts, unit, zero) { // eine Reihe je Diagramm, Titel nennt sie
  if (!pts.length) return '';
  const W = 520, H = 200, L = 46, R = 16, T = 12, B = 26, vs = pts.map(p => p.v);
  let lo = Math.min(...vs), hi = Math.max(...vs);
  if (zero) lo = 0;
  const span = hi - lo || Math.max(1, hi * 0.1), stp = niceMax(span / 3);
  lo = zero ? 0 : Math.floor((lo - span * 0.1) / stp) * stp; hi = Math.ceil((hi + span * 0.1) / stp) * stp; if (hi === lo) hi = lo + stp;
  const x = i => (pts.length === 1 ? (L + W - R) / 2 : L + i / (pts.length - 1) * (W - L - R)), y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  let grid = '';
  for (let v = lo; v <= hi + 1e-9; v += stp) grid += `<line x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="g"/><text x="${L - 8}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${nfk.format(Math.round(v * 100) / 100)}</text>`;
  const last = pts.length - 1;
  GCH[id] = { pts: pts.map((p, i) => ({ x: x(i), y: y(p.v), t: `${fmtShort(p.d)}: ${nfk.format(Math.round(p.v * 10) / 10)} ${unit}${p.s ? ' · ' + p.s : ''}` })), W, H };
  return `<figure class="gchart" data-ch="${id}"><figcaption><b>${title}</b><span>${nfk.format(Math.round(pts[last].v * 10) / 10)} ${unit}</span></figcaption>
    <svg class="wchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title} im Verlauf">${grid}
      <polyline points="${pts.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')}"/>
      ${pts.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="${pts.length > 24 ? 2.5 : 4}"/>`).join('')}
      <line class="gx" y1="${T}" y2="${H - B}" x1="0" x2="0" visibility="hidden"/>
      <text x="${L}" y="${H - 6}">${dm(pts[0].d)}</text>${last ? `<text x="${W - R}" y="${H - 6}" text-anchor="end">${dm(pts[last].d)}</text>` : ''}</svg><div class="gtip" hidden></div></figure>`;
}
function gBars(id, title, bars, unit) { // Wochenbalken, eine Reihe
  const W = 520, H = 190, L = 46, R = 10, T = 12, B = 40, hi = niceMax(Math.max(1, ...bars.map(b => b.v)) * 1.05), stp = hi / 4;
  const bw = (W - L - R) / bars.length, y = v => T + (hi - v) / hi * (H - T - B);
  let grid = '';
  for (let v = 0; v <= hi + 1e-9; v += stp) grid += `<line x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="g"/><text x="${L - 8}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${num(v)}</text>`;
  GCH[id] = { pts: bars.map((b, i) => ({ x: L + bw * (i + 0.5), y: y(b.v), t: b.t })), W, H, bar: true };
  return `<figure class="gchart" data-ch="${id}"><figcaption><b>${title}</b><span>${unit}</span></figcaption>
    <svg class="wchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">${grid}
      ${bars.map((b, i) => { const h = Math.max(b.v ? 2 : 0, H - B - y(b.v)), w = Math.min(34, bw - 6), bx = L + bw * (i + 0.5) - w / 2;
        return `${b.v ? `<path class="gb ${b.on ? 'on' : ''}" d="M${bx.toFixed(1)},${H - B} v${(-h + Math.min(4, h)).toFixed(1)} q0,${-Math.min(4, h)} ${Math.min(4, h)},${-Math.min(4, h)} h${(w - 2 * Math.min(4, h)).toFixed(1)} q${Math.min(4, h)},0 ${Math.min(4, h)},${Math.min(4, h)} v${(h - Math.min(4, h)).toFixed(1)} z"/>` : ''}
          <text x="${(L + bw * (i + 0.5)).toFixed(1)}" y="${H - B + 15}" text-anchor="middle">${b.l}</text><text x="${(L + bw * (i + 0.5)).toFixed(1)}" y="${H - B + 30}" text-anchor="middle" class="${b.on ? 'strong' : ''}">${b.l2}</text>`; }).join('')}</svg><div class="gtip" hidden></div></figure>`;
}
document.addEventListener('pointermove', e => {
  const f = e.target.closest && e.target.closest('.gchart');
  document.querySelectorAll('.gchart .gtip:not([hidden])').forEach(t => { if (!f || t.parentNode !== f) { t.hidden = true; const l = t.parentNode.querySelector('.gx'); if (l) l.setAttribute('visibility', 'hidden'); } });
  if (!f) return;
  const c = GCH[f.dataset.ch], svg = f.querySelector('svg'), b = svg.getBoundingClientRect(), tip = f.querySelector('.gtip');
  if (!c) return;
  const px = (e.clientX - b.left) / b.width * c.W, p = c.pts.reduce((a, q) => (Math.abs(q.x - px) < Math.abs(a.x - px) ? q : a));
  tip.textContent = p.t; tip.hidden = false;
  const left = p.x / c.W * b.width + (b.left - f.getBoundingClientRect().left);
  tip.style.left = `${Math.min(Math.max(left, 70), f.clientWidth - 70)}px`; tip.style.top = `${Math.max(0, p.y / c.H * b.height + (b.top - f.getBoundingClientRect().top) - 36)}px`;
  const gx = f.querySelector('.gx'); if (gx && !c.bar) { gx.setAttribute('x1', p.x); gx.setAttribute('x2', p.x); gx.setAttribute('visibility', 'visible'); }
});
async function progLoad(ex) {
  const p = ui.gym.prog;
  if (ex !== undefined) p.ex = ex;
  if (!p.ex && S.gym.trained.length) p.ex = S.gym.trained[0].ex;
  if (!p.ex) { p.data = null; return; }
  try { p.data = (await apiGet('/api/gym/progress?ex=' + encodeURIComponent(p.ex))).progress; } catch (e) { p.data = null; }
  if (ui.view === 'training' && ui.gym.tab === 'fortschritt') render();
}
function gymWeekCard() {
  const ws = S.gym.weeks, p = ui.gym.prog, sel = ws.find(w => w.monday === p.week) || ws[ws.length - 1];
  if (!ws.length) return '';
  const bars = ws.map(w => ({ v: w.volume, l: dm(w.monday), l2: `${w.sessions}×`, on: w === sel, t: `Woche ab ${fmtShort(w.monday)}: ${num(w.volume)} kg · ${w.sessions} ${w.sessions === 1 ? 'Einheit' : 'Einheiten'}` }));
  const ms = MUSCLES.map(m => ({ m, sets: sel.sets[m] || 0, vol: sel.muscle[m] || 0 })).filter(x => x.sets).sort((a, b) => b.sets - a.sets), mx = Math.max(1, ...ms.map(x => x.sets));
  const prev = ws[ws.indexOf(sel) - 1];
  return `<section class="card"><div class="card-head"><h2>Wochenübersicht</h2><span class="sub">Zahl unter dem Datum = Einheiten</span></div>
    <div class="prog-grid"><div>${gBars('weeks', 'Volumen je Woche', bars, 'kg × Wdh.')}
      <div class="chips" style="margin-top:8px">${ws.slice(-4).map(w => `<button class="chip ${w === sel ? 'on' : ''}" data-act="prog-week" data-w="${w.monday}">ab ${dm(w.monday)}</button>`).join('')}</div></div>
    <div><p class="h3">Woche ab ${fmtShort(sel.monday)}</p><p class="muted small">${sel.sessions} ${sel.sessions === 1 ? 'Einheit' : 'Einheiten'} · ${num(sel.volume)} kg Volumen${prev && prev.volume ? ` · Vorwoche ${num(prev.volume)} kg` : ''}</p>
      ${ms.length ? `<div class="mbars">${ms.map(x => `<div class="mbar"><span>${x.m}</span><div><i style="width:${(x.sets / mx * 100).toFixed(0)}%"></i></div><b>${x.sets} Sätze</b><em>${num(x.vol)} kg</em></div>`).join('')}</div>
        <p class="muted small" style="margin-top:8px">Sätze zählen für die Hauptmuskelgruppe der Übung. Grober Richtwert für Muskelaufbau: etwa 10 und mehr Sätze je Muskelgruppe und Woche.</p>` : '<p class="empty">In dieser Woche noch kein Training.</p>'}</div></div></section>`;
}
function gymProgTab() {
  const g = S.gym, p = ui.gym.prog;
  if (!g.total) return '<section class="card"><p class="empty">Sobald du dein erstes Training beendet hast, siehst du hier Gewichte, Bestleistungen und die Wochenübersicht.</p></section>';
  if (!p.ex || (!p.data && !p.loading)) { p.loading = true; progLoad().then(() => { p.loading = false; }); }
  const d = p.data && p.data.ex === p.ex ? p.data : null, e = p.ex ? exGet(p.ex) : null;
  let body = '<p class="muted">Lade …</p>';
  if (d) {
    const pts = d.points, bw = !pts.some(x => x.top > 0);
    const pr = (v, at, lbl) => `<div class="rv"><b>${v}</b><span>${lbl}</span><em>${at ? fmtShort(at) : ''}</em></div>`;
    body = `<div class="rv-grid prs">${bw ? '' : pr(kg(d.bestW), d.bestWAt, 'Schwerstes Gewicht')}${bw ? '' : pr(kg(Math.round(d.bestE * 10) / 10), d.bestEAt, 'Geschätztes 1RM')}${pr(d.bestReps, d.bestRAt, 'Meiste Wdh. in einem Satz')}${bw ? '' : pr(num(d.bestVol) + ' kg', d.bestVAt, 'Höchstes Volumen')}</div>
      ${pts.length < 2 ? '<p class="muted small" style="margin-top:10px">Ab der zweiten Einheit mit dieser Übung entsteht eine Linie.</p>' : ''}
      <div class="gch-grid">${bw ? gLine('p-r', 'Beste Wiederholungen', pts.map(x => ({ d: x.date, v: x.reps, s: x.sets })), 'Wdh.') : gLine('p-w', 'Top-Gewicht', pts.map(x => ({ d: x.date, v: x.top, s: `${x.reps} Wdh.` })), 'kg')
        + gLine('p-e', 'Geschätztes 1RM', pts.map(x => ({ d: x.date, v: x.e1rm })), 'kg') + gLine('p-v', 'Volumen je Einheit', pts.map(x => ({ d: x.date, v: x.volume })), 'kg', true)}</div>
      <p class="muted small">Geschätztes 1RM = Gewicht × (1 + Wdh. ÷ 30), Formel nach Epley – ein Rechenwert, kein Test. Volumen = Gewicht × Wiederholungen aller Sätze.</p>
      <details class="restore" style="margin-top:10px"><summary>Alle Einheiten als Tabelle</summary><table class="mini"><thead><tr><th>Datum</th><th>Sätze (kg × Wdh.)</th><th class="num">1RM</th><th class="num">Volumen</th></tr></thead><tbody>
        ${pts.slice().reverse().map(x => `<tr><td>${fmtShort(x.date)}</td><td>${esc(x.sets)}</td><td class="num">${x.e1rm ? nfk.format(Math.round(x.e1rm * 10) / 10) : '–'}</td><td class="num">${num(x.volume)}</td></tr>`).join('')}</tbody></table></details>`;
  }
  return `${gymWeekCard()}<section class="card" style="margin-top:14px"><div class="card-head"><h2>Fortschritt je Übung</h2>${e ? `<button class="link" data-act="ex-info" data-id="${esc(e.id)}">Übung ansehen</button>` : ''}</div>
    <label class="f" style="max-width:460px">Übung <select data-on="prog-ex">${g.trained.map(t => `<option value="${esc(t.ex)}" ${t.ex === p.ex ? 'selected' : ''}>${esc(exGet(t.ex).n)} (${t.count}×)</option>`).join('')}</select></label>
    <div style="margin-top:12px">${body}</div></section>`;
}
ACT['prog-week'] = d => { ui.gym.prog.week = d.w; render(); };
CHANGE['prog-ex'] = el => { ui.gym.prog.data = null; progLoad(el.value); render(); };
// MealPrep Tracker 2.0 – Kalorien-Tracker, Verbrauch aus Apple Health, neuer Überblick.

// ---------- Verbrauch (aktive Kalorien) ----------
// Format aus dem Kurzbefehl: "MPH1;d=2026-11-13;kcal=412" – oder einfach eine Zahl.
function parseBurn(txt) {
  const t = String(txt || '').trim();
  if (!t) return null;
  const m = /MPH1\s*;(.*)/i.exec(t);
  const numOf = s => { const v = parseFloat(String(s).replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return isFinite(v) ? v : null; };
  if (m) {
    const kv = {}; m[1].split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) kv[p.slice(0, i).trim().toLowerCase()] = p.slice(i + 1).trim(); });
    const k = numOf(kv.kcal);
    if (k == null) return null;
    return { date: /^\d{4}-\d{2}-\d{2}$/.test(kv.d || '') ? kv.d : null, kcal: Math.round(k) };
  }
  if (/^[\d.,\s]+(kcal)?$/i.test(t)) { const k = numOf(t); return k == null ? null : { date: null, kcal: Math.round(k) }; }
  return null;
}
function saveBurn(b, viaImport) {
  if (!b || !(b.kcal >= 0) || b.kcal > 10000) { toast('Das sieht nicht nach einem Kalorienwert aus. Erwartet wird z. B. „MPH1;d=2026-11-13;kcal=412“ oder nur eine Zahl.', true); return Promise.resolve(null); }
  const date = b.date || S.day.date;
  if (date > S.today) { toast('Das Datum liegt in der Zukunft – bitte den Kurzbefehl prüfen.', true); return Promise.resolve(null); }
  return call('/api/burn', { date, kcal: b.kcal }).then(r => { if (r && viaImport) toast(`${num(b.kcal)} kcal Verbrauch für ${date === S.today ? 'heute' : fmtShort(date)} übernommen.`); return r; });
}
let pendingBurn = null;
try { const h = new URLSearchParams(location.search).get('h'); if (h) { pendingBurn = parseBurn(h); history.replaceState(null, '', location.pathname); } } catch (e) { /* egal */ }
(function waitState() { if (!pendingBurn) return; if (typeof S === 'undefined' || !S) return setTimeout(waitState, 200); const b = pendingBurn; pendingBurn = null; saveBurn(b, true); })();

function burnCard() {
  const d = S.day, share = S.settings.burnShare || 0;
  return `<section class="card c-5"><div class="card-head"><h2>Verbrannt (aktiv)</h2><button class="link" data-act="burn-help">Kurzbefehl einrichten</button></div>
    <div class="big">${num(d.burned)} <small class="muted">kcal</small></div>
    <p class="muted small">${d.burned ? (share ? `Davon zählen ${share} % = ${num(d.credit)} kcal zusätzlich zu deinem Tagesziel.` : 'Wird nur angezeigt – dein Tagesziel bleibt unverändert.') : 'Noch nichts eingetragen. Aktive Kalorien aus Apple Health per Kurzbefehl übernehmen oder von der Uhr abtippen.'}</p>
    <form class="form-row" data-form="burn-save" style="margin-top:10px"><label class="f grow">Aktive kcal ${d.date === S.today ? 'heute' : 'am ' + dm(d.date)} <input type="number" name="kcal" inputmode="numeric" min="0" max="10000" step="1" value="${d.burned || ''}" placeholder="z. B. 420"></label>
      <button class="btn">Speichern</button><button type="button" class="btn primary" data-act="burn-paste">${ic('flame')} Einfügen</button></form>
    <div style="margin-top:14px"><span class="muted small">Wie viel davon darf ich zusätzlich essen?</span>
      <div class="chips" style="margin-top:6px">${[[0, 'nichts (0 %)'], [50, 'die Hälfte (50 %)'], [100, 'alles (100 %)']].map(([v, t]) => `<button class="chip ${share === v ? 'on' : ''}" data-act="burn-share" data-v="${v}">${t}</button>`).join('')}</div>
      <p class="muted small" style="margin-top:6px">Uhren überschätzen den Verbrauch oft. Zum Abnehmen oder Halten ist 0 % oder 50 % die sichere Wahl.</p></div></section>`;
}
MODALS.burnhelp = () => `<div class="sheet"><div class="sheet-head"><div><h2>Aktive Kalorien aus Apple Health holen</h2><p class="muted">Einmal einrichten, dann zwei Tipps pro Tag.</p></div><button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
  <p>Eine Web-App darf Apple Health nicht selbst lesen. Die Kurzbefehle-App darf es – sie legt die Zahl in die Zwischenablage, und hier tippst du auf „Einfügen“.</p>
  <ol class="steps"><li>Kurzbefehle-App öffnen, oben rechts <b>+</b>.</li>
    <li>Aktion <b>„Health-Messungen suchen“</b> hinzufügen. Typ: <b>Aktive Energie</b>. Filter hinzufügen: <b>Startdatum</b> „ist heute“.</li>
    <li>Aktion <b>„Statistiken berechnen“</b> hinzufügen, Art: <b>Summe</b>.</li>
    <li>Aktion <b>„Zahl runden“</b> hinzufügen (auf Einer).</li>
    <li>Aktion <b>„Text“</b> hinzufügen und genau das eintragen: <code>MPH1;kcal=</code> und direkt dahinter die Variable <b>Gerundete Zahl</b> einsetzen.</li>
    <li>Aktion <b>„In die Zwischenablage kopieren“</b> hinzufügen.</li>
    <li>Kurzbefehl benennen, z. B. „Kalorien an Kraftkost“, und zum Home-Bildschirm hinzufügen. Beim ersten Start den Zugriff auf Health erlauben.</li>
    <li>Täglich: Kurzbefehl antippen, dann Kraftkost öffnen → Essen → <b>Einfügen</b>.</li></ol>
  <p class="muted small">Die ausführliche Anleitung mit allen Bildschirmen liegt als ANLEITUNG-KALORIEN-KURZBEFEHL.txt im Handy-Paket. Ohne Kurzbefehl geht es auch: Zahl aus der Fitness-App ablesen und oben eintippen.</p>
  <div class="sheet-foot"><button class="btn primary" data-act="modal-close">Verstanden</button></div></div>`;

// ---------- Ansicht „Kalorien“ ----------
function kcalBalance(compact) {
  const d = S.day, set = S.settings, lo = d.goalMin, hi = d.goalMax;
  const left = hi - d.eatenKcal, toMin = lo - d.eatenKcal, pLeft = Math.max(0, set.proteinMin - d.eatenProtein);
  const max = Math.max(hi * 1.15, d.eatenKcal, 1), pct = v => Math.min(100, v / max * 100).toFixed(1);
  const openTxt = left < 0 ? `${num(-left)} über dem Ziel` : toMin > 0 ? `${num(toMin)}–${num(left)}` : `bis ${num(left)}`;
  return `<div class="kc3 ${compact ? 'compact' : ''}"><div><b>${num(d.eatenKcal)}</b><span>gegessen</span></div><div><b>${num(d.burned)}</b><span>verbrannt</span></div>
      <div class="${left < 0 ? 'neg' : ''}"><b>${left < 0 ? '+' + num(-left) : num(Math.max(0, left))}</b><span>${left < 0 ? 'zu viel' : 'noch offen'}</span></div></div>
    <div class="kbar" title="Ziel ${num(lo)}–${num(hi)} kcal"><i class="${d.eatenKcal > hi ? 'red' : ''}" style="width:${pct(d.eatenKcal)}%"></i><em style="left:${pct(lo)}%;width:${(pct(hi) - pct(lo)).toFixed(1)}%"></em></div>
    <div class="gauge-foot"><span>Ziel ${num(lo)}–${num(hi)} kcal${d.credit ? ` (inkl. ${num(d.credit)} kcal Bewegung)` : ''}</span><span>${left < 0 ? openTxt : 'offen: ' + openTxt + ' kcal'}</span></div>
    <div class="kprot"><span>Protein</span><div class="bar"><div class="fill" style="width:${Math.min(100, d.eatenProtein / Math.max(1, set.proteinMin) * 100).toFixed(0)}%"></div></div>
      <b>${pLeft > 0 ? `noch ${num(pLeft)} g` : 'Ziel erreicht'}</b><em>${num(d.eatenProtein)} von ${num(set.proteinMin)} g</em></div>`;
}
function kcalEntries() {
  const d = S.day, set = S.settings;
  const rows = [`<div class="row ${d.shake ? 'done' : ''}"><button class="check ${d.shake ? 'on' : ''}" data-act="shake" title="Shake abhaken" aria-label="Shake abhaken">${ic('check')}</button>
      <div class="body"><span class="slot">Frühstück</span><div class="title">Proteinshake</div><div class="meta">${num(set.shakeKcal)} kcal · ${num(set.shakeProtein)} g Protein</div></div></div>`];
  d.meals.forEach(m => rows.push(mealRow(m)));
  d.extras.forEach(e => rows.push(`<div class="row done"><span class="check on" style="cursor:default">${ic('check')}</span>
      <div class="body"><span class="slot">${esc(e.src || 'Extra')}</span><div class="title">${esc(e.name)}</div><div class="meta">${e.g ? num(e.g) + ' g · ' : ''}${num(e.kcal)} kcal · ${nf1.format(e.protein)} g Protein</div></div>
      <button class="icon-btn" data-act="extra-del" data-id="${e.id}" title="Eintrag löschen">${ic('trash')}</button></div>`));
  return rows.join('');
}
VIEWS.kalorien = () => {
  const d = S.day, isToday = d.date === S.today;
  const nav = `<div class="daynav">${isToday ? '' : '<button class="btn sm" data-act="day-set" data-date="">Heute</button>'}
      <button class="icon-btn" data-act="day-move" data-n="-1" title="Vorheriger Tag">${ic('left')}</button><button class="icon-btn" data-act="day-move" data-n="1" title="Nächster Tag" ${isToday ? 'disabled' : ''}>${ic('right')}</button></div>`;
  const recent = (S.recent || []).slice(0, 6);
  return head('Kalorien', `${isToday ? 'Heute' : rel(d.date)}, ${fmtLong(d.date)}`, nav) + `<div class="grid dash">
    <section class="card c-7"><div class="card-head"><h2>Bilanz</h2><span class="sub">inkl. Shake und abgehakter Gerichte</span></div>${kcalBalance()}${fillBox(true)}</section>
    ${burnCard()}
    <section class="card c-12"><div class="card-head"><h2>Gegessen ${isToday ? 'heute' : 'am ' + dm(d.date)}</h2><button class="btn sm" data-act="scan" data-ctx="essen">${ic('scan')} Barcode</button></div>
      <button class="btn primary q-big food-add" data-act="food-open">${ic('plus')} Essen eintragen</button>
      ${recent.length ? `<div class="qx-row" style="margin-top:12px"><span class="muted small">Zuletzt gegessen:</span>${recent.map((x, i) => `<button class="chip qx" data-act="recent-add" data-i="${i}" title="Direkt eintragen"><i class="qx-n">${esc(x.name)}</i><span>${num(x.kcal)} kcal</span></button>`).join('')}</div>` : ''}
      <div class="rows" style="margin-top:12px">${kcalEntries()}</div></section></div>`;
};

// ---------- Essen eintragen ----------
const stockOf = id => S.lots.filter(l => l.ing === id).reduce((s, l) => s + l.g, 0);
function foodMatches(q) {
  const t = q.trim().toLowerCase();
  if (t.length < 2) return [];
  const hit = s => (s || '').toLowerCase().includes(t);
  const ings = S.ingredients.filter(i => hit(i.name) || (i.aliases || []).some(hit)).filter(i => i.kcal > 0)
    .map(i => ({ kind: 'ing', id: i.id, name: i.name, k100: i.kcal, p100: i.p, pieceG: i.pieceG || 0, pieceName: i.pieceName || 'Stück', stock: stockOf(i.id), src: 'Zutat' }));
  const recs = S.recipes.filter(r => hit(r.name) || hit(r.short)).map(r => ({ kind: 'rec', name: r.name, kcal: r.kcal, protein: r.protein, src: 'Rezept' }));
  const rank = x => (x.name.toLowerCase().startsWith(t) ? 0 : 1) + (x.stock ? -0.5 : 0);
  return ings.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'de')).slice(0, 12).concat(recs.slice(0, 8));
}
function foodRow(x, i, list) {
  const meta = x.kind === 'rec' ? `${num(x.kcal)} kcal · ${num(x.protein)} g Protein je Portion` : `${num(x.k100)} kcal · ${nf1.format(x.p100)} g Protein je 100 g${x.stock ? ` · ${num(x.stock)} g im Vorrat` : ''}`;
  return `<button class="exrow" data-act="food-pick" data-l="${list}" data-i="${i}"><span class="exrow-n"><b>${esc(x.name)}</b><small>${meta}</small></span><span class="exrow-t"><span class="tag ${x.kind === 'off' ? 'blue' : x.kind === 'rec' ? 'ok' : ''}">${esc(x.src)}</span></span></button>`;
}
function foodResults(m) {
  m.own = foodMatches(m.q);
  const off = m.off || [];
  const offBtn = m.q.trim().length >= 2 ? `<button class="btn" data-act="food-off" ${m.offBusy ? 'disabled' : ''}>${ic('search')} ${m.offBusy ? 'Suche …' : 'In Open Food Facts suchen (online)'}</button>` : '';
  return `${m.own.length ? `<div class="exlist">${m.own.map((x, i) => foodRow(x, i, 'own')).join('')}</div>` : m.q.trim().length >= 2 ? '<p class="empty">Nichts in deinen Zutaten und Rezepten gefunden.</p>' : ''}
    ${off.length ? `<p class="muted small" style="margin:12px 0 6px">Open Food Facts</p><div class="exlist">${off.map((x, i) => foodRow(x, i, 'off')).join('')}</div>` : ''}
    ${m.offNote ? `<p class="warn-text small" style="margin-top:8px">${esc(m.offNote)}</p>` : ''}
    <div class="form-row" style="margin-top:12px">${offBtn}<button class="btn" data-act="food-free">${ic('edit')} Frei eintragen</button><button class="btn" data-act="scan" data-ctx="essen">${ic('scan')} Barcode</button></div>`;
}
function foodCalc(m) {
  const x = m.item, n = +String(m.amount).replace(',', '.') || 0;
  if (x.kind === 'rec') return { kcal: x.kcal * n, protein: x.protein * n, g: 0 };
  return { kcal: x.k100 * n / 100, protein: x.p100 * n / 100, g: n };
}
MODALS.food = () => {
  const m = ui.modal, d = S.day;
  const headHtml = (t, sub) => `<div class="sheet-head"><div><h2>${t}</h2><p class="muted">${sub}</p></div><button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>`;
  const when = d.date === S.today ? 'für heute' : `für ${fmtShort(d.date)}`;
  if (m.step === 'free') return `<div class="sheet narrow">${headHtml('Frei eintragen', when)}
    <form class="stack" data-form="food-free"><label class="f">Was? <input type="text" name="name" value="${esc(m.q || '')}" placeholder="z. B. Döner, Kuchen bei Oma" required maxlength="80"></label>
      <div class="form-row nums"><label class="f">kcal <input type="number" name="kcal" inputmode="numeric" min="0" max="5000" step="1" required></label>
        <label class="f">Protein (g) <input type="number" name="protein" inputmode="decimal" min="0" max="500" step="0.1" value="0" required></label></div>
      <div class="sheet-foot"><button type="button" class="btn ghost" data-act="food-back">Zurück</button><button class="btn primary">Eintragen</button></div></form></div>`;
  if (m.step === 'amount') {
    const x = m.item, c = foodCalc(m), rec = x.kind === 'rec';
    const quick = rec ? [0.5, 1, 1.5, 2] : [50, 100, 150, 200, 250];
    return `<div class="sheet narrow">${headHtml(esc(x.name), `${esc(x.src)} · ${when}`)}
      <label class="f">${rec ? 'Portionen' : 'Menge in g'} <input type="number" class="food-amt" data-in="food-amt" inputmode="decimal" min="0" step="${rec ? 0.5 : 1}" value="${m.amount}"></label>
      <div class="chips" style="margin-top:8px">${quick.map(v => `<button class="chip ${+m.amount === v ? 'on' : ''}" data-act="food-amt" data-v="${v}">${nfk.format(v)}${rec ? '' : ' g'}</button>`).join('')}
        ${x.pieceG ? `<button class="chip ${+m.amount === x.pieceG ? 'on' : ''}" data-act="food-amt" data-v="${x.pieceG}">1 ${esc(x.pieceName)} (${num(x.pieceG)} g)</button>` : ''}</div>
      <div class="kc3 compact" id="foodCalc" style="margin-top:14px"><div><b>${num(c.kcal)}</b><span>kcal</span></div><div><b>${nf1.format(c.protein)} g</b><span>Protein</span></div></div>
      ${x.kind === 'ing' && x.stock ? `<label class="check-line"><input type="checkbox" data-on="food-deduct" ${m.deduct ? 'checked' : ''}> Aus dem Vorrat abziehen (${num(x.stock)} g vorhanden)</label>` : ''}
      ${x.kind === 'off' ? '<p class="muted small" style="margin-top:8px">Nährwerte: Open Food Facts (Lizenz ODbL). Angaben stammen von Nutzern – bei Zweifeln mit der Packung vergleichen.</p>' : ''}
      <div class="sheet-foot"><button class="btn ghost" data-act="food-back">Zurück</button><button class="btn primary" data-act="food-save">${ic('check')} Eintragen</button></div></div>`;
  }
  const recent = (S.recent || []).slice(0, 8);
  return `<div class="sheet">${headHtml('Essen eintragen', when)}
    <label class="f">Suche in deinen Zutaten und Rezepten <input type="search" id="foodQ" data-in="food-q" value="${esc(m.q)}" placeholder="z. B. Banane, Skyr, Curry" autocomplete="off"></label>
    <div id="foodRes" style="margin-top:12px">${foodResults(m)}</div>
    ${recent.length && m.q.trim().length < 2 ? `<p class="muted small" style="margin:14px 0 6px">Zuletzt gegessen – antippen trägt direkt ein</p><div class="exlist">${recent.map((x, i) => `<button class="exrow" data-act="recent-add" data-i="${i}"><span class="exrow-n"><b>${esc(x.name)}</b><small>${num(x.kcal)} kcal · ${nf1.format(x.protein)} g Protein</small></span><span class="exrow-t"><span class="tag">${x.last === S.today ? 'heute' : dm(x.last)}</span></span></button>`).join('')}</div>` : ''}</div>`;
};
function foodFromScan(res) { // Ergebnis eines Barcode-Scans im Kontext „essen“
  stopScan();
  const known = res.known ? ingById(res.known) : null, p = res.product;
  let item = null;
  if (known && known.kcal > 0) item = { kind: 'ing', id: known.id, name: known.name, k100: known.kcal, p100: known.p, pieceG: known.pieceG || 0, pieceName: known.pieceName || 'Stück', stock: stockOf(known.id), src: 'Zutat' };
  else if (p && p.kcal > 0) item = { kind: 'off', name: [p.name, p.brand].filter(Boolean).join(' – '), k100: p.kcal, p100: p.p, src: 'Open Food Facts' };
  if (!item) { ui.modal = { type: 'food', step: 'free', q: p ? p.name : '' }; renderModal(); toast(res.offline ? 'Offline: Produktdaten nicht abrufbar – bitte frei eintragen.' : 'Zu diesem Barcode gibt es keine Nährwerte – bitte frei eintragen.', true); return; }
  ui.modal = { type: 'food', step: 'amount', q: '', item, amount: res.qtyG && res.qtyG <= 500 ? res.qtyG : 100, deduct: !!item.stock };
  renderModal();
}
function addExtra(body) { return call('/api/extra/add', { date: S.day.date, ...body }); }

Object.assign(ACT, {
  'food-open'() { ui.modal = { type: 'food', step: 'search', q: '', off: [] }; renderModal(); const i = $('#foodQ'); if (i && !matchMedia('(max-width: 680px)').matches) i.focus(); },
  'food-free'() { ui.modal.step = 'free'; renderModal(); },
  'food-back'() { ui.modal.step = 'search'; ui.modal.q = ui.modal.q || ''; ui.modal.off = ui.modal.off || []; renderModal(); },
  'food-pick'(d) { const m = ui.modal, x = (d.l === 'off' ? m.off : m.own)[+d.i]; if (!x) return; m.item = x; m.step = 'amount'; m.amount = x.kind === 'rec' ? 1 : x.pieceG || 100; m.deduct = x.kind === 'ing' && x.stock > 0; renderModal(); },
  'food-amt'(d) { ui.modal.amount = +d.v; renderModal(); },
  'food-save'() {
    const m = ui.modal, x = m.item, c = foodCalc(m);
    if (!(c.kcal > 0) && !(c.protein > 0)) return toast('Bitte eine Menge eintragen.', true);
    const body = { name: x.kind === 'rec' && +m.amount !== 1 ? `${x.name} (${nfk.format(+m.amount)} Port.)` : x.name, kcal: Math.round(c.kcal), protein: Math.round(c.protein * 10) / 10, src: x.src, g: c.g || 0 };
    if (x.kind === 'ing' && m.deduct && c.g > 0) body.ing = x.id;
    addExtra(body).then(r => { if (r) { ui.modal = null; renderModal(); } });
  },
  async 'food-off'() {
    const m = ui.modal; m.offBusy = true; m.offNote = ''; $('#foodRes').innerHTML = foodResults(m);
    const r = await call('/api/off/search?q=' + encodeURIComponent(m.q.trim()));
    if (ui.modal !== m) return;
    m.offBusy = false;
    if (!r) { m.offNote = 'Open Food Facts ist gerade nicht erreichbar (offline?). Du kannst frei eintragen.'; }
    else { m.off = (r.products || []).filter(p => p.kcal > 0).slice(0, 12).map(p => ({ kind: 'off', name: [p.name, p.brand].filter(Boolean).join(' – '), k100: p.kcal, p100: p.p, src: 'Open Food Facts' })); if (!m.off.length) m.offNote = 'Dort wurde nichts Passendes mit Nährwerten gefunden.'; }
    renderModal();
  },
  'recent-add'(d) { const x = (S.recent || [])[+d.i]; if (!x) return; addExtra({ name: x.name, kcal: x.kcal, protein: x.protein }).then(r => { if (r && ui.modal && ui.modal.type === 'food') { ui.modal = null; renderModal(); } }); },
  'burn-help'() { ui.modal = { type: 'burnhelp' }; renderModal(); },
  'burn-share'(d) { call('/api/settings', { burnShare: +d.v }); },
  async 'burn-paste'() {
    let txt = '';
    try { txt = await navigator.clipboard.readText(); } catch (e) { txt = ''; }
    if (!txt) { ui.modal = { type: 'burnpaste' }; renderModal(); return; }
    const b = parseBurn(txt);
    if (!b) { ui.modal = { type: 'burnpaste', bad: true }; renderModal(); return; }
    saveBurn(b, true);
  },
  'rest-day'(d) { lsSet('mealprep-rest', d.on === '1' ? S.today : ''); render(); },
});
MODALS.burnpaste = () => `<div class="sheet narrow"><div class="sheet-head"><h2>Wert einfügen</h2><button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
  <p class="muted">${ui.modal.bad ? 'In der Zwischenablage steht kein Kalorienwert. Starte zuerst den Kurzbefehl – oder füge den Text hier ein.' : 'Die Zwischenablage konnte nicht automatisch gelesen werden. Tippe lange in das Feld und wähle „Einfügen“.'}</p>
  <form class="stack" data-form="burn-text"><label class="f">Text aus dem Kurzbefehl oder Zahl <input type="text" name="t" placeholder="MPH1;kcal=412" autocomplete="off"></label>
    <div class="sheet-foot"><button type="button" class="btn ghost" data-act="modal-close">Abbrechen</button><button class="btn primary">Übernehmen</button></div></form></div>`;
FORMS['burn-save'] = f => { const v = fd(f); saveBurn({ date: S.day.date, kcal: Math.round(+v.kcal || 0) }); };
FORMS['burn-text'] = f => { const b = parseBurn(fd(f).t); if (!b) return toast('Das konnte ich nicht lesen. Erwartet wird z. B. „MPH1;kcal=412“.', true); ui.modal = null; renderModal(); saveBurn(b, true); };
FORMS['food-free'] = f => { const v = fd(f); addExtra({ name: v.name, kcal: +v.kcal, protein: +String(v.protein).replace(',', '.') }).then(r => { if (r) { ui.modal = null; renderModal(); } }); };
INPUT['food-q'] = el => { const m = ui.modal; m.q = el.value; m.off = []; m.offNote = ''; $('#foodRes').innerHTML = foodResults(m); };
INPUT['food-amt'] = el => { const m = ui.modal; m.amount = el.value; const c = foodCalc(m); $('#foodCalc').innerHTML = `<div><b>${num(c.kcal)}</b><span>kcal</span></div><div><b>${nf1.format(c.protein)} g</b><span>Protein</span></div>`; };
CHANGE['food-deduct'] = el => { ui.modal.deduct = el.checked; };

// ---------- Neuer Überblick ----------
function trainCard() {
  const g = S.gym, a = g.active, next = g.days.find(d => d.id === g.next), rest = lsGet('mealprep-rest') === S.today;
  const pos = next ? g.days.findIndex(d => d.id === next.id) + 1 : 0;
  let body;
  if (a) body = `<span class="eyebrow">Training läuft</span><div class="big">${esc(a.dayName)}</div><p class="muted small">${a.items.filter(it => it.skipped || it.log.length >= it.sets).length} von ${a.items.length} Übungen erledigt</p>
      <button class="btn primary q-big" data-act="gym-open">${ic('play')} Weiter trainieren</button>`;
  else if (g.todayDone) { const h = g.history[0]; body = `<span class="eyebrow">Heute trainiert</span><div class="big">${esc(h ? h.dayName : 'Geschafft')}</div>
      <p class="muted small">${h ? `${h.minutes} Min. · ${h.sets} Sätze · ${num(h.volume)} kg Volumen${h.prs.length ? ` · ${h.prs.length} ${h.prs.length === 1 ? 'Bestleistung' : 'Bestleistungen'}` : ''}` : ''}${next ? ` · als Nächstes: ${esc(next.name)}` : ''}</p>
      ${h ? `<button class="btn" data-act="gym-sum" data-id="${h.id}">Zusammenfassung</button>` : ''}`; }
  else if (!next) body = `<div class="big">Kein Trainingsplan</div><button class="btn" data-act="nav" data-view="training">Plan anlegen</button>`;
  else if (rest) body = `<span class="eyebrow">Heute</span><div class="big">Ruhetag</div><p class="muted small">Als Nächstes dran: ${esc(next.name)} (Tag ${pos} von ${g.days.length}). Der Split verschiebt sich nicht.</p>
      <button class="link" data-act="rest-day" data-on="0">Doch trainieren</button>`;
  else body = `<span class="eyebrow">Heute dran · Tag ${pos} von ${g.days.length}</span><div class="big">${esc(next.name)}</div>
      <p class="muted small">${next.items.length ? `${next.items.length} Übungen · ${next.items.reduce((s, it) => s + it.sets, 0)} Sätze` : 'Noch keine Übungen eingetragen'}${g.lastDate ? ` · letztes Training ${rel(g.lastDate)}` : ''}</p>
      ${next.items.length ? `<button class="btn primary q-big" data-act="gym-start" data-day="${next.id}">${ic('play')} Training starten</button>` : `<button class="btn primary q-big" data-act="nav" data-view="training">Tag zusammenstellen</button>`}
      <button class="link" data-act="rest-day" data-on="1" style="margin-top:10px">Heute ist Ruhetag</button>`;
  return `<section class="card c-5 traincard ${a ? 'on' : ''}"><div class="card-head"><h2>Training</h2><button class="link" data-act="nav" data-view="training">Plan</button></div>${body}</section>`;
}
function weightCard() {
  const ws = S.weights || [];
  if (!ws.length) return `<section class="card c-4"><div class="card-head"><h2>Gewicht</h2></div><p class="empty">Noch kein Gewicht eingetragen.</p><button class="link" data-act="nav" data-view="gewicht">Eintragen</button></section>`;
  const last = ws[ws.length - 1], from = addDays(last.date, -28), win = ws.filter(w => w.date >= from), first = win[0], diff = last.kg - first.kg;
  let spark = '';
  if (win.length > 1) {
    const W = 220, H = 44, lo = Math.min(...win.map(w => w.kg)), hi = Math.max(...win.map(w => w.kg)), t0 = D(first.date).getTime(), t1 = D(last.date).getTime();
    const pts = win.map(w => `${(4 + (D(w.date).getTime() - t0) / Math.max(1, t1 - t0) * (W - 8)).toFixed(1)},${(6 + (hi - w.kg) / Math.max(0.1, hi - lo) * (H - 12)).toFixed(1)}`);
    spark = `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gewicht der letzten 4 Wochen"><polyline points="${pts.join(' ')}"/><circle cx="${pts[pts.length - 1].split(',')[0]}" cy="${pts[pts.length - 1].split(',')[1]}" r="3.5"/></svg>`;
  }
  return `<section class="card c-4"><div class="card-head"><h2>Gewicht</h2><span class="sub">${rel(last.date)}</span></div>
    <div class="big">${nf1.format(last.kg)} kg</div><div class="muted small">${win.length > 1 ? `${diff > 0 ? '+' : diff < 0 ? '−' : '±'}${nf1.format(Math.abs(diff))} kg seit ${dm(first.date)}` : 'Für einen Trend fehlt noch ein zweiter Eintrag.'}</div>
    ${spark}<button class="link" data-act="nav" data-view="gewicht">Gewicht eintragen</button></section>`;
}
VIEWS.dashboard = () => {
  const h = new Date().getHours(), hello = h < 11 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend', d = S.day;
  return head(hello, `${fmtLong(S.today)} · ${planStatusText()}`) + `<div class="grid dash">
    ${trainCard()}
    <section class="card c-7"><div class="card-head"><h2>Kalorien ${d.date === S.today ? 'heute' : 'am ' + dm(d.date)}</h2><button class="link" data-act="nav" data-view="kalorien">Essen eintragen</button></div>${kcalBalance(true)}${fillBox(true)}</section>
    ${todayCard()}
    <section class="card c-5 tasks-n"><div class="card-head"><h2>Als Nächstes</h2></div>${tasks()}</section>
    ${reviewCard()}${pantryCard()}${budgetCard()}${shopCard()}
    ${weightCard()}<section class="card c-8"><div class="card-head"><h2>Woche ${curWeek()}</h2><button class="link" data-act="nav" data-view="plan">Wochenplan</button></div>${weekStrip()}</section>
    ${fridgeCard()}
  </div>`;
};

// ---------- Quellen und Lizenzen (Einstellungen) ----------
const einstBase = VIEWS.einstellungen;
VIEWS.einstellungen = () => einstBase() + `<section class="card" style="margin-top:14px"><div class="card-head"><h2>Quellen und Lizenzen</h2></div>
  <ul class="plain-list">${(GYM.quellen || []).map(q => `<li><b>${esc(q.name)}</b> – ${esc(q.was)}. Lizenz: ${esc(q.lizenz)}. <span class="muted">${esc(q.url || '')}</span></li>`).join('')}
    <li><b>Open Food Facts</b> – Produkt- und Nährwertdaten bei Suche und Barcode. Lizenz: Open Database License (ODbL). <span class="muted">openfoodfacts.org</span></li></ul>
  <p class="muted small">Die Übungszeichnungen stammen von Everkinetic und wurden für die App verkleinert; sie stehen unter CC BY-SA 4.0 und dürfen unter derselben Lizenz weitergegeben werden. Deutsche Übungsnamen und Ausführungshinweise wurden für diese App geschrieben.</p></section>`;
// MealPrep Tracker 2.1 – feste Gym-Tage, weitere Trainingsarten (Bouldern …), Training im Wochenplan.

const INTENS = [[1, 'leicht'], [2, 'mittel'], [3, 'hart']];
const WD1 = ['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']; // 1 = Montag
const actById = id => (S.activities || []).find(a => a.id === id);
const trainOf = date => (S.train || []).find(t => t.date === date) || ((S.weeks || []).flatMap(w => w.days).find(d => d.date === date) || {}).train || (S.day.date === date ? S.day.train : null);
const fmtMin = m => (m >= 60 ? `${Math.floor(m / 60)} Std.${m % 60 ? ` ${m % 60} Min.` : ''}` : `${m} Min.`);

ICONS.mountain = '<path d="M3 20 9.5 8l4 7 2.5-4L21 20z"/><path d="m8 11 1.5 1.5L11 11"/>';
ICONS.moon = '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>';

// ---------- Bausteine: Chips für einen Tag ----------
const GYM_ST = { geplant: '', laeuft: 'on', erledigt: 'done', ausgefallen: 'miss' };
const ACT_ST = { geplant: '', erledigt: 'done', ausgelassen: 'miss', offen: 'open' };
function trainChips(d, compact) {
  const t = d.train;
  if (!t) return '';
  const out = [];
  if (t.gym) {
    const g = t.gym, txt = g.status === 'ausgefallen' ? 'Gym ausgefallen' : `Gym · ${esc(g.name)}`;
    const st = g.status === 'erledigt' ? ' ✓' : g.status === 'laeuft' ? ' · läuft' : '';
    out.push(`<button class="tchip gym ${GYM_ST[g.status]}" data-act="tr-gym" data-date="${t.date}" title="${g.status === 'ausgefallen' ? 'Ausgefallen – die Einheit kommt beim nächsten Training' : ''}">${ic('dumbbell')}${txt}${st}</button>`);
  }
  t.acts.forEach(a => {
    const st = a.status === 'erledigt' ? ` ✓${a.minutes && !compact ? ' ' + fmtMin(a.minutes) : ''}` : a.status === 'ausgelassen' ? ' · ausgelassen' : a.status === 'offen' ? ' · eintragen?' : '';
    out.push(`<button class="tchip act ${ACT_ST[a.status]}" data-act="tr-act" data-date="${t.date}" data-type="${esc(a.type)}" ${a.session ? `data-id="${a.session}"` : ''}>${ic('mountain')}${esc(a.name)}${st}</button>`);
  });
  if (!out.length) out.push(`<button class="tchip rest" data-act="tr-rest" data-date="${t.date}" title="${t.date <= S.today ? 'Trotzdem eine Einheit eintragen' : ''}">Ruhetag</button>`);
  return `<div class="tchips">${out.join('')}</div>`;
}
function trainMini(d) { // für die Wochenleiste im Überblick
  const t = d.train;
  if (!t) return '';
  const g = t.gym && t.gym.status !== 'ausgefallen' ? t.gym : null, a = t.acts.filter(x => x.status === 'geplant' || x.status === 'erledigt');
  if (!g && !a.length) return '<div class="tmini rest">Ruhe</div>';
  return `<div class="tmini ${t.done ? 'done' : ''}">${g ? esc(g.name.split('/')[0]) : ''}${g && a.length ? ' + ' : ''}${a.map(x => esc(x.name)).join(' + ')}</div>`;
}
function trainTag(d) { // Kennzeichnung in der Tagesbilanz
  const t = d.train;
  if (!t || t.rest) return '';
  return `<div class="ttag">${ic('dumbbell')}<span>Trainingstag: ${t.labels.map(esc).join(' + ')}${t.done ? ' ✓' : ''}</span></div>`;
}

// ---------- Tippen auf Chips ----------
Object.assign(ACT, {
  'tr-gym'(d) {
    const t = trainOf(d.date), g = t && t.gym;
    if (!g) return;
    if (g.status === 'erledigt') { ui.modal = { type: 'gymsum', id: g.workout }; return renderModal(); }
    if (g.status === 'laeuft') return openGym();
    if (g.status === 'ausgefallen') return toast('Ausgefallen. Der Split rückt nicht weiter – diese Einheit kommt beim nächsten Training.');
    if (S.gym.active) return openGym();
    if (d.date === S.today) return ACT['gym-start']({ day: g.day });
    const next = S.gym.days.find(x => x.id === S.gym.next);
    confirmBox('Heute trainieren?', `${esc(g.name)} ist für ${WDL[D(d.date).getDay()]} geplant. Wenn du heute gehst, ist jetzt ${next ? esc(next.name) : 'die nächste Einheit'} dran, und der Plan rückt danach nach.`, 'Jetzt starten', () => ACT['gym-start']({ day: '' }));
  },
  'tr-act'(d) {
    if (d.id) return openSession({ id: +d.id });
    if (d.date > S.today) return toast(`${esc((actById(d.type) || {}).name || 'Die Einheit')} kannst du am Tag selbst eintragen.`);
    openSession({ type: d.type, date: d.date, planned: true });
  },
  'tr-rest'(d) { if (d.date <= S.today) openSession({ date: d.date }); },
  'ses-new'() { openSession({ date: S.today }); },
  'ses-int'(d) { sesSync(); ui.modal.s.intensity = +d.v; renderModal(); },
  'ses-min'(d) { sesSync(); ui.modal.s.minutes = +d.v; renderModal(); },
  'ses-skip'() { const s = ui.modal.s; call('/api/session/save', { type: s.type, date: s.date, skipped: true }).then(r => { if (r) { ui.modal = null; renderModal(); } }); },
  'ses-del'() { const s = ui.modal.s; confirmBox('Eintrag löschen?', `${esc((actById(s.type) || {}).name || 'Einheit')} am ${fmtShort(s.date)} wird entfernt.`, 'Löschen', () => call('/api/session/delete', { id: s.id }), true); },
  'gymday'(d) { const cur = S.settings.gymDays || [], v = +d.v; call('/api/gymdays', { days: cur.includes(v) ? cur.filter(x => x !== v) : cur.concat([v]) }); },
  'act-edit'(d) { const a = d.id ? actById(d.id) : null; ui.modal = { type: 'actedit', a: a ? JSON.parse(JSON.stringify(a)) : { id: '', name: '', days: [], resLabel: '', off: false } }; renderModal(); },
  'act-day'(d) { const ds = ui.modal.a.days, v = +d.v, i = ds.indexOf(v); if (i >= 0) ds.splice(i, 1); else ds.push(v); syncActForm(); renderModal(); },
  'act-del'(d) { confirmBox('Trainingsart löschen?', 'Das geht nur, solange noch keine Einheit eingetragen ist. Sonst kannst du sie ausblenden.', 'Löschen', () => call('/api/act/delete', { id: d.id }), true); },
});
function sesSync() { // Eingaben vor dem Neuzeichnen übernehmen
  const f = $('[data-form="ses-save"]'); if (!f) return; const v = fd(f);
  Object.assign(ui.modal.s, { type: v.type || ui.modal.s.type, date: v.date || ui.modal.s.date, minutes: +v.minutes || ui.modal.s.minutes, result: v.result || '', note: v.note || '', hr: +v.hr || 0, kcal: +v.kcal || 0 });
}
function syncActForm() { const f = $('[data-form="act-save"]'); if (!f) return; const v = fd(f); Object.assign(ui.modal.a, { name: v.name, resLabel: v.resLabel, off: !!v.off }); }
function openSession(o) {
  let s;
  if (o.id) { const x = (S.sessions || []).find(y => y.id === o.id); if (!x) return toast('Eintrag nicht gefunden.', true); s = { ...x }; }
  else {
    const types = (S.activities || []).filter(a => !a.off);
    s = { id: 0, type: o.type || (types[0] || {}).id || '', date: o.date || S.today, minutes: 90, intensity: 2, result: '', note: '', hr: 0, kcal: 0 };
  }
  ui.modal = { type: 'session', s, planned: !!o.planned };
  renderModal();
}

// ---------- Einheit eintragen ----------
MODALS.session = () => {
  const m = ui.modal, s = m.s, a = actById(s.type) || { name: 'Einheit', resLabel: '' };
  const types = (S.activities || []).filter(x => !x.off || x.id === s.type);
  if (!types.length) return `<div class="sheet narrow"><div class="sheet-head"><h2>Keine Trainingsart</h2><button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div><p>Lege unter Einstellungen → Training eine Trainingsart an, z. B. Bouldern.</p></div>`;
  const burnDay = s.date === S.day.date ? S.day : null;
  return `<div class="sheet narrow"><div class="sheet-head"><div><h2>${s.id ? 'Einheit bearbeiten' : 'Einheit eintragen'}</h2><p class="muted">${esc(a.name)} · ${WDL[D(s.date).getDay()]}, ${fmtShort(s.date)}</p></div><button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
    <form class="stack" data-form="ses-save">
      <div class="form-row nums"><label class="f">Trainingsart <select name="type" data-on="ses-type">${types.map(x => `<option value="${esc(x.id)}" ${x.id === s.type ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
        <label class="f">Datum <input type="date" name="date" value="${s.date}" max="${S.today}" required></label></div>
      <div><span class="muted small">Dauer</span><div class="form-row" style="margin-top:4px"><label class="f" style="width:110px">Minuten <input type="number" name="minutes" inputmode="numeric" min="1" max="600" step="1" value="${s.minutes || ''}" required></label>
        <div class="chips">${[45, 60, 90, 120].map(v => `<button type="button" class="chip ${+s.minutes === v ? 'on' : ''}" data-act="ses-min" data-v="${v}">${fmtMin(v)}</button>`).join('')}</div></div></div>
      <div><span class="muted small">Intensität</span><div class="chips" style="margin-top:4px">${INTENS.map(([v, t]) => `<button type="button" class="chip big ${s.intensity === v ? 'on' : ''}" data-act="ses-int" data-v="${v}">${t}</button>`).join('')}</div></div>
      <label class="f">${esc(a.resLabel || 'Leistung')} <span class="muted">(optional)</span><input type="text" name="result" value="${esc(s.result || '')}" maxlength="120" placeholder="${a.id === 'boulder' ? 'z. B. 8 Routen, bis 6a' : ''}"></label>
      <label class="f">Notiz <span class="muted">(optional)</span><input type="text" name="note" value="${esc(s.note || '')}" maxlength="300"></label>
      <div class="form-row nums"><label class="f">Ø Puls <span class="muted">(optional)</span><input type="number" name="hr" inputmode="numeric" min="0" max="230" value="${s.hr || ''}" placeholder="z. B. 125"></label>
        <label class="f">Aktive kcal <span class="muted">(optional)</span><input type="number" name="kcal" inputmode="numeric" min="0" max="5000" value="${s.kcal || ''}" placeholder="aus der Uhr"></label></div>
      <p class="muted small">${burnDay && burnDay.burnSrc === 'tag' ? `Für diesen Tag sind schon ${num(burnDay.burned)} aktive kcal aus Health eingetragen – darin ist diese Einheit enthalten, die kcal hier zählen dann nicht doppelt.` : 'Holst du abends die aktiven kcal per Kurzbefehl, ist diese Einheit darin schon enthalten. Die kcal hier zählen nur, solange für den Tag kein Health-Wert da ist.'}</p>
      <div class="sheet-foot">${s.id ? '<button type="button" class="btn ghost danger" data-act="ses-del">Löschen</button>' : m.planned ? '<button type="button" class="btn ghost" data-act="ses-skip">War nicht da</button>' : ''}<span class="grow"></span>
        <button type="button" class="btn ghost" data-act="modal-close">Abbrechen</button><button class="btn primary">${ic('check')} Speichern</button></div></form></div>`;
};
FORMS['ses-save'] = f => {
  const v = fd(f), s = ui.modal.s;
  if (v.date > S.today) return toast('Das Datum liegt in der Zukunft.', true);
  call('/api/session/save', { id: s.id || 0, type: v.type, date: v.date, minutes: Math.round(+v.minutes || 0), intensity: s.intensity || 2, result: v.result || '', note: v.note || '', hr: Math.round(+v.hr || 0), kcal: Math.round(+v.kcal || 0) })
    .then(r => { if (r) { ui.modal = null; renderModal(); } });
};
CHANGE['ses-type'] = el => { sesSync(); ui.modal.s.type = el.value; renderModal(); };

// ---------- Trainingsart bearbeiten (Einstellungen) ----------
MODALS.actedit = () => {
  const a = ui.modal.a;
  return `<div class="sheet narrow"><div class="sheet-head"><h2>${a.id ? 'Trainingsart bearbeiten' : 'Neue Trainingsart'}</h2><button class="icon-btn" data-act="modal-close" title="Schließen">${ic('x')}</button></div>
    <form class="stack" data-form="act-save"><label class="f">Name <input type="text" name="name" value="${esc(a.name)}" maxlength="40" required placeholder="z. B. Laufen"></label>
      <div><span class="muted small">Normalerweise an diesen Tagen (optional)</span><div class="chips" style="margin-top:6px">${[1, 2, 3, 4, 5, 6, 7].map(v => `<button type="button" class="chip ${a.days.includes(v) ? 'on' : ''}" data-act="act-day" data-v="${v}">${WD1[v]}</button>`).join('')}</div></div>
      <label class="f">Bezeichnung für die Leistung <input type="text" name="resLabel" value="${esc(a.resLabel || '')}" maxlength="30" placeholder="z. B. Strecke (km), Routen/Grade"></label>
      ${a.id ? `<label class="check-line"><input type="checkbox" name="off" ${a.off ? 'checked' : ''}> Ausblenden (nicht mehr planen, Einträge bleiben)</label>` : ''}
      <div class="sheet-foot">${a.id && a.id !== 'boulder' ? `<button type="button" class="btn ghost danger" data-act="act-del" data-id="${esc(a.id)}">Löschen</button>` : ''}<span class="grow"></span>
        <button type="button" class="btn ghost" data-act="modal-close">Abbrechen</button><button class="btn primary">Speichern</button></div></form></div>`;
};
FORMS['act-save'] = f => { syncActForm(); const a = ui.modal.a; call('/api/act/save', { id: a.id, name: a.name, days: a.days, resLabel: a.resLabel, off: a.off }).then(r => { if (r) { ui.modal = null; renderModal(); } }); };

function trainSettingsCard() {
  const gd = S.settings.gymDays || [];
  return `<section class="card"><div class="card-head"><h2>Training</h2></div>
    <p class="muted small">Gym-Tage: An diesen Wochentagen plant die App den nächsten Split-Tag ein. Fällt ein Tag aus, rückt der Split nicht weiter.</p>
    <div class="chips" style="margin:8px 0 14px">${[1, 2, 3, 4, 5, 6, 7].map(v => `<button class="chip big ${gd.includes(v) ? 'on' : ''}" data-act="gymday" data-v="${v}">${WD1[v]}</button>`).join('')}</div>
    <p class="muted small">Weitere Trainingsarten</p>
    <div class="exlist" style="margin-top:6px">${(S.activities || []).map(a => `<button class="exrow" data-act="act-edit" data-id="${esc(a.id)}"><span class="exrow-n"><b>${esc(a.name)}</b><small>${a.days.length ? 'geplant ' + a.days.map(v => WD1[v]).join(', ') : 'nicht fest geplant'}${a.off ? ' · ausgeblendet' : ''}</small></span><span class="exrow-t">${ic('edit')}</span></button>`).join('')}</div>
    <button class="btn" data-act="act-edit" style="margin-top:10px">${ic('plus')} Trainingsart hinzufügen</button></section>`;
}
{
  const einstPrev = VIEWS.einstellungen;
  VIEWS.einstellungen = () => {
    const html = einstPrev(), i = html.indexOf('<section class="card">', html.indexOf('<div class="grid settings">'));
    const at = html.indexOf('</section>', i) + '</section>'.length;
    return i > 0 ? html.slice(0, at) + trainSettingsCard() + html.slice(at) : html + trainSettingsCard();
  };
}

// ---------- Überblick: heute und morgen ----------
function dayTrainBlock(t, label) {
  if (!t) return '';
  const isToday = t.date === S.today, rows = [];
  if (t.gym && t.gym.status !== 'ausgefallen') {
    const g = t.gym, a = S.gym.active;
    let btn = '';
    if (isToday && g.status === 'geplant' && !a) btn = `<button class="btn primary q-big" data-act="gym-start" data-day="${g.day}">${ic('play')} Training starten</button>`;
    if (isToday && (g.status === 'laeuft' || a)) btn = `<button class="btn primary q-big" data-act="gym-open">${ic('play')} Weiter trainieren</button>`;
    if (g.status === 'erledigt') btn = `<button class="btn sm" data-act="gym-sum" data-id="${g.workout}">Zusammenfassung</button>`;
    const day = S.gym.days.find(x => x.id === g.day), info = day && g.status === 'geplant' ? `${day.items.length} Übungen · ${day.items.reduce((s2, it) => s2 + it.sets, 0)} Sätze` : g.status === 'erledigt' ? 'erledigt' : g.status === 'laeuft' ? 'läuft' : '';
    rows.push(`<div class="trow"><div class="trow-h">${ic('dumbbell')}<div><b>Gym · ${esc(g.name)}</b><span class="muted small">${info}</span></div></div>${btn}</div>`);
  }
  t.acts.filter(x => x.status !== 'offen').forEach(x => {
    let btn = '';
    if (isToday && x.status === 'geplant') btn = `<div class="form-row"><button class="btn sm primary" data-act="tr-act" data-date="${t.date}" data-type="${esc(x.type)}">War da – eintragen</button><button class="btn sm ghost" data-act="ses-skip-q" data-date="${t.date}" data-type="${esc(x.type)}">Heute nicht</button></div>`;
    if (x.status === 'erledigt' || x.status === 'ausgelassen') btn = `<button class="btn sm" data-act="tr-act" data-date="${t.date}" data-type="${esc(x.type)}" data-id="${x.session}">${x.status === 'erledigt' ? 'Bearbeiten' : 'Doch eintragen'}</button>`;
    rows.push(`<div class="trow"><div class="trow-h">${ic('mountain')}<div><b>${esc(x.name)}</b><span class="muted small">${x.status === 'erledigt' ? 'erledigt' + (x.minutes ? ' · ' + fmtMin(x.minutes) : '') : x.status === 'ausgelassen' ? 'ausgelassen' : 'geplant, optional'}</span></div></div>${btn}</div>`);
  });
  if (!rows.length) rows.push(`<div class="trow"><div class="trow-h">${ic('moon')}<div><b>Ruhetag</b>${isToday && t.gym && t.gym.status === 'ausgefallen' ? '<span class="muted small">Gym ausgefallen – die Einheit kommt beim nächsten Training.</span>' : ''}</div></div></div>`);
  return `<div class="tday-block"><span class="eyebrow">${label}</span>${rows.join('')}</div>`;
}
ACT['ses-skip-q'] = d => call('/api/session/save', { type: d.type, date: d.date, skipped: true });
function trainCard() {
  const tt = trainOf(S.today), tm = trainOf(addDays(S.today, 1)), g = S.gym;
  const next = g.days.find(d => d.id === g.next);
  const upcoming = (S.train || []).find(t => t.date > S.today && t.gym && t.gym.status === 'geplant');
  return `<section class="card c-5 traincard ${g.active ? 'on' : ''}"><div class="card-head"><h2>Training</h2><button class="link" data-act="nav" data-view="training">Plan</button></div>
    ${dayTrainBlock(tt, 'Heute')}${dayTrainBlock(tm, 'Morgen')}
    <div class="form-row" style="margin-top:10px;width:100%">${!(tt && tt.gym && tt.gym.status !== 'ausgefallen') && !g.active && next && next.items.length ? `<button class="btn sm" data-act="gym-start" data-day="">${ic('play')} Trotzdem Gym (${esc(next.name)})</button>` : ''}
      <button class="btn sm ghost" data-act="ses-new">${ic('plus')} Einheit eintragen</button></div>
    ${upcoming && !(tm && tm.gym && tm.gym.status === 'geplant') ? `<p class="muted small" style="margin-top:6px">Nächstes Gym: ${WDL[D(upcoming.date).getDay()]}, ${dm(upcoming.date)} · ${esc(upcoming.gym.name)}</p>` : ''}</section>`;
}

// ---------- Training-Ansicht: Woche, Verlauf, Wochenzahlen ----------
function trainWeekCard() {
  const days = (S.train || []).slice(0, 7);
  if (!days.length) return '';
  return `<section class="card tweek"><div class="card-head"><h2>Diese Woche</h2><button class="btn sm" data-act="ses-new">${ic('plus')} Einheit eintragen</button></div>
    <div class="tweek-grid">${days.map(t => `<div class="tw ${t.date === S.today ? 'today' : ''} ${t.date < S.today ? 'past' : ''}"><div class="tw-d"><b>${WD1[(D(t.date).getDay() + 6) % 7 + 1]}</b><span>${dm(t.date)}</span></div>${trainChips({ train: t }, true)}</div>`).join('')}</div></section>`;
}
{
  const prevHero = gymHero;
  gymHero = () => {
    let h = prevHero();
    const g = S.gym, up = (S.train || []).find(t => t.date >= S.today && t.gym && t.gym.status === 'geplant');
    if (!g.active && up) h = h.replace('</p></div>', ` · geplant ${up.date === S.today ? 'heute' : up.date === addDays(S.today, 1) ? 'morgen' : 'am ' + WDL[D(up.date).getDay()]}</p></div>`);
    return h;
  };
  const prevPlan = gymPlanTab;
  gymPlanTab = () => { const h = prevPlan(), i = h.indexOf('<div class="tday-grid">'); return h.slice(0, i) + trainWeekCard() + h.slice(i); };
  const prevHist = gymHistTab;
  gymHistTab = () => {
    const ss = S.sessions || [];
    const sesCard = ss.length ? `<section class="card" style="margin-top:14px"><div class="card-head"><h2>Weitere Einheiten</h2><button class="btn sm" data-act="ses-new">${ic('plus')} Eintragen</button></div><table><thead><tr><th>Datum</th><th>Art</th><th class="num">Dauer</th><th>Intensität</th><th>Leistung / Notiz</th><th class="num">Puls</th><th class="num">kcal</th></tr></thead><tbody>
      ${ss.map(x => `<tr><td><button class="link" data-act="tr-act" data-id="${x.id}" data-date="${x.date}" data-type="${esc(x.type)}">${fmtShort(x.date)}</button></td><td>${esc(x.name)}</td><td class="num">${fmtMin(x.minutes)}</td><td>${(INTENS.find(i => i[0] === x.intensity) || [0, '–'])[1]}</td><td>${esc([x.result, x.note].filter(Boolean).join(' · ') || '–')}</td><td class="num">${x.hr || '–'}</td><td class="num">${x.kcal ? num(x.kcal) : '–'}</td></tr>`).join('')}</tbody></table></section>` : '';
    return actWeeksCard() + `<div style="margin-top:14px">${prevHist()}</div>` + sesCard;
  };
}
function actWeeksCard() {
  const ws = (S.actWeeks || []).slice(-6).reverse(), acts = (S.activities || []).filter(a => !a.off || ws.some(w => w.acts[a.id]));
  const part = (n, min, name) => `<span class="aw-p ${n ? '' : 'zero'}"><b>${n}</b> ${esc(name)}${min ? ` <em>${fmtMin(min)}</em>` : ''}</span>`;
  return `<section class="card"><div class="card-head"><h2>Einheiten pro Woche</h2><span class="sub">Gym, weitere Trainingsarten und gesamt</span></div>
    <div class="aw-list">${ws.map(w => `<div class="aw ${w.monday === mondayOf(S.today) ? 'cur' : ''}"><span class="aw-w">${w.monday === mondayOf(S.today) ? 'Diese Woche' : 'ab ' + dm(w.monday)}</span>
      <div class="aw-parts">${part(w.gymN, w.gymMin, 'Gym')}${acts.map(a => part(w.acts[a.id] || 0, w.actMin[a.id] || 0, a.name)).join('')}</div>
      <span class="aw-t"><b>${w.totalN}</b> gesamt${w.totalMin ? ` · ${fmtMin(w.totalMin)}` : ''}</span></div>`).join('')}</div></section>`;
}
{
  const prevWeek = gymWeekCard;
  gymWeekCard = () => actWeeksCard() + `<div style="margin-top:14px">${prevWeek()}</div>`;
}

// ---------- Tagesbilanz: Trainingstag kennzeichnen ----------
{
  const prevBal = kcalBalance;
  kcalBalance = compact => trainTag(S.day) + prevBal(compact);
  const prevBurn = burnCard;
  burnCard = () => {
    let h = prevBurn();
    if (S.day.burnSrc === 'einheiten') h = h.replace('<p class="muted small">', '<p class="muted small">Aus deinen eingetragenen Einheiten (kein Health-Wert für den Tag). ');
    return h;
  };
}
