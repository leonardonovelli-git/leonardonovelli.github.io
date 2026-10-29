/* Inspect Lab — coach. Generato da inspect-lab/_src/build.mjs: non modificare coach/coach.js a mano.
   Vive in uno Shadow DOM e non crea variabili globali, per non "sporcare" la pagina che stai ispezionando. */
(() => {
  'use strict';
  if (document.getElementById('inspect-lab-coach')) return;

  /*__NORM__*/

  const UNITS = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob('__DATA__'), (c) => c.charCodeAt(0))));
  const STORE = '__inspectlab_v1';
  const PAGES = {
    home: { path: '/inspect-lab/', name: 'Home del Lab' },
    plp: { path: '/inspect-lab/shop/donna/calzature/', name: 'PLP · Calzature Donna' },
    'pdp:VL2041': { path: '/inspect-lab/shop/p/decollete-aurora-vl2041/', name: 'PDP · Décolleté Aurora' },
    'pdp:VL2210': { path: '/inspect-lab/shop/p/stivaletto-navigli-vl2210/', name: 'PDP · Stivaletto Navigli' },
  };
  const KEYS = {
    mac: { devtools: '⌘ ⌥ I', inspect: '⌘ ⇧ C', source: '⌘ ⌥ U', find: '⌘ F', gsearch: '⌘ ⌥ F', cmd: '⌘ ⇧ P', device: '⌘ ⇧ M', reload: '⌘ R', hardreload: '⌘ ⇧ R', console: '⌘ ⌥ J' },
    win: { devtools: 'F12', inspect: 'Ctrl Shift C', source: 'Ctrl U', find: 'Ctrl F', gsearch: 'Ctrl Shift F', cmd: 'Ctrl Shift P', device: 'Ctrl Shift M', reload: 'F5', hardreload: 'Ctrl Shift R', console: 'Ctrl Shift J' },
  };
  const TYPE_LABEL = { intro: 'Concetto', mcq: 'Quiz', find: 'Trova', do: 'Fai' };
  const XP = { mcq: 5, find: 10, do: 10 };

  // ------------------------------------------------------------------ stato
  const LESSONS = [];
  UNITS.forEach((u) => u.lessons.forEach((l) => { l.unit = u; LESSONS.push(l); }));
  const byId = (id) => LESSONS.find((l) => l.id === id);

  const defaults = { xp: 0, done: {}, run: null, open: true, side: 'left', plat: null, streak: { n: 0, last: null } };
  let S;
  try { S = Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORE)) || {}); } catch (e) { S = Object.assign({}, defaults); }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* storage pieno o bloccato */ } };
  const plat = () => S.plat || (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? 'mac' : 'win');

  let view = S.run && byId(S.run.lid) ? 'lesson' : 'map';
  let feedback = null;   // { kind: 'ok'|'bad'|'info', title, body, actions: [[label, act, primary]] }
  let draft = '';
  let picked = null;
  let lastDone = null;
  let checking = false;
  // Sulla home la pagina spiega già tutto: parto ridotto, a meno che non ci sia una lezione in corso
  let homeCollapsed = location.pathname.replace(/index\.html$/, '') === PAGES.home.path && !S.run;

  const currentPage = () => {
    const p = location.pathname.replace(/index\.html$/, '');
    return Object.keys(PAGES).find((k) => PAGES[k].path === p) || null;
  };
  const lessonOf = () => S.run && byId(S.run.lid);
  const stepOf = () => { const l = lessonOf(); return l && l.steps[S.run.i]; };
  const pageOf = (step, lesson) => step.page || lesson.page || 'any';
  const nextLesson = () => LESSONS.find((l) => !S.done[l.id]) || null;

  function bumpStreak() {
    const d = new Date();
    const today = d.toISOString().slice(0, 10);
    if (S.streak.last === today) return;
    const y = new Date(d.getTime() - 864e5).toISOString().slice(0, 10);
    S.streak = { n: S.streak.last === y ? S.streak.n + 1 : 1, last: today };
  }

  // ------------------------------------------------------------------ testo
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const kbd = (name) => {
    const k = KEYS[plat()][name];
    return k ? '<span class="keys">' + k.split(' ').map((x) => '<kbd>' + esc(x) + '</kbd>').join('') + '</span>' : esc(name);
  };
  function inline(s) {
    return s.split('`').map((part, i) => {
      if (i % 2) return '<code>' + esc(part) + '</code>';
      return esc(part)
        .replace(/\[\[(\w+)\]\]/g, (m, k) => kbd(k))
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.+?)\*/g, '<i>$1</i>');
    }).join('');
  }
  const fmt = (s) => String(s).split(/\n\n+/).map((p) => '<p>' + p.split('\n').map(inline).join('<br>') + '</p>').join('');

  // ------------------------------------------------------------------ verifica
  async function hash(id, value) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ilab|' + id + '|' + value));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
  }
  const compiled = {};
  function runCheck(step) {
    try {
      compiled[step.id] = compiled[step.id] || new Function('return (' + step.check + ')')();
      return Promise.resolve(compiled[step.id]()).then(Boolean).catch(() => false);
    } catch (e) { return Promise.resolve(false); }
  }
  function seeded(arr, seed) {
    let h = 0;
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const out = arr.map((x, i) => [x, i]);
    for (let i = out.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }

  // ------------------------------------------------------------------ flusso lezione
  function startLesson(id) {
    S.run = { lid: id, i: 0, att: 0, hints: 0, xp: 0, right: 0, scored: 0 };
    view = 'lesson'; feedback = null; draft = ''; picked = null;
    S.open = true; homeCollapsed = false;
    save(); render();
  }
  function award(step, ok) {
    const r = S.run;
    if (step.type === 'intro') return 0;
    r.scored++;
    if (!ok) return 0;
    r.right++;
    const base = XP[step.type] || 0;
    const xp = step.type === 'mcq' ? base : Math.max(4, base - r.hints * 3);
    r.xp += xp; S.xp += xp;
    bumpStreak();
    return xp;
  }
  function advance() {
    const l = lessonOf();
    S.run.i++; S.run.att = 0; S.run.hints = 0;
    draft = ''; picked = null; feedback = null;
    if (S.run.i >= l.steps.length) {
      const acc = S.run.scored ? Math.round((S.run.right / S.run.scored) * 100) : 100;
      const prev = S.done[l.id];
      S.done[l.id] = { xp: Math.max(S.run.xp, prev ? prev.xp : 0), acc: Math.max(acc, prev ? prev.acc : 0) };
      lastDone = { lesson: l, xp: S.run.xp, acc };
      S.run = null;
      view = 'done';
    }
    save(); render();
    if (view === 'done') confetti();
  }

  async function verify() {
    const step = stepOf();
    if (!step || checking) return;
    const r = S.run;
    if (step.type === 'intro') return advance();

    if (step.type === 'mcq') {
      if (picked == null) return;
      const ok = !!step.options[picked].ok;
      const xp = award(step, ok);
      const right = step.options.find((o) => o.ok);
      feedback = ok
        ? { kind: 'ok', title: pick(['Esatto!', 'Perfetto!', 'Giusto!']) + ' +' + xp + ' XP', body: step.explain, actions: [['Continua', 'next', 1]] }
        : { kind: 'bad', title: 'Non proprio', body: '**Risposta giusta:** ' + right.t + (step.explain ? '\n\n' + step.explain : ''), actions: [['Continua', 'next', 1]] };
      save(); return render();
    }

    if (step.type === 'find') {
      if (!draft.trim()) return;
      checking = true;
      const h = await hash(step.id, norm(draft, step.mode));
      checking = false;
      if (step.h.includes(h)) {
        const xp = award(step, true);
        feedback = { kind: 'ok', title: pick(['Trovato!', 'Bingo!', 'Occhio di falco!']) + ' +' + xp + ' XP', body: step.explain, actions: [['Continua', 'next', 1]] };
      } else {
        r.att++;
        const more = step.hints && r.hints < step.hints.length;
        feedback = {
          kind: 'bad',
          title: r.att >= 3 ? 'Ancora no…' : 'Non è questo, riprova',
          body: r.att >= 3 ? 'Vuoi vedere la soluzione? Non prendi XP per questo step, ma impari lo stesso.' : (more ? 'Se sei bloccato, prendi un indizio 💡' : 'Controlla di aver copiato il valore esatto.'),
          actions: [['Riprova', 'retry', 1]].concat(more ? [['Indizio', 'hint']] : []).concat(r.att >= 3 ? [['Mostra soluzione', 'reveal']] : []),
        };
      }
      save(); return render();
    }

    if (step.type === 'do') {
      checking = true; render();
      const ok = await runCheck(step);
      checking = false;
      if (ok) {
        const xp = award(step, true);
        feedback = { kind: 'ok', title: 'Fatto! +' + xp + ' XP', body: step.explain, actions: [['Continua', 'next', 1]] };
      } else {
        r.att++;
        const here = pageOf(step, lessonOf()) === 'any' || pageOf(step, lessonOf()) === currentPage();
        feedback = {
          kind: 'bad',
          title: 'Non lo vedo ancora',
          body: !here ? 'Sei sulla pagina sbagliata: usa il link 📍 qui sopra.' : 'Controllo la pagina in tempo reale: se il passaggio richiede di ricaricare, ricarica e torno a guardare io.',
          actions: [['Ok', 'retry', 1]].concat(step.hints && r.hints < step.hints.length ? [['Indizio', 'hint']] : []).concat(r.att >= 2 ? [['L\'ho fatto, vai avanti', 'skip']] : []),
        };
      }
      save(); return render();
    }
  }
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // Controllo automatico degli step "fai": se l'azione è già avvenuta (anche dopo un reload) lo rilevo da solo.
  setInterval(async () => {
    const step = stepOf();
    if (view !== 'lesson' || !step || step.type !== 'do' || feedback || checking) return;
    if (await runCheck(step)) {
      if (stepOf() !== step || feedback) return;
      const xp = award(step, true);
      feedback = { kind: 'ok', title: 'Rilevato! +' + xp + ' XP', body: step.explain, actions: [['Continua', 'next', 1]] };
      S.open = true;
      save(); render();
    }
  }, 1200);

  // ------------------------------------------------------------------ viste
  function vMap() {
    const total = LESSONS.length;
    const done = LESSONS.filter((l) => S.done[l.id]).length;
    const next = nextLesson();
    const run = lessonOf();
    let html = `
      <header class="top">
        <div class="brand"><span class="logo">Inspect <em>Lab</em></span></div>
        <div class="stats">
          <span class="chip" title="Punti esperienza">⚡ ${S.xp}</span>
          <span class="chip ${S.streak.n ? 'fire' : ''}" title="Giorni di fila">🔥 ${S.streak.n}</span>
          <button class="icon" data-act="tips" title="Prontuario dei trucchi">📒</button>
          <button class="icon" data-act="settings" title="Impostazioni">⚙</button>
          <button class="icon" data-act="min" title="Riduci">—</button>
        </div>
      </header>
      <div class="body">
        <div class="progress-line"><div style="width:${(done / total) * 100}%"></div></div>
        <p class="muted small">${done}/${total} lezioni completate</p>`;
    if (run) {
      html += `<button class="resume" data-act="resume">
        <span class="resume-k">Continua</span><b>${esc(run.title)}</b><span class="muted small">step ${S.run.i + 1} di ${run.steps.length}</span></button>`;
    }
    UNITS.forEach((u) => {
      const ud = u.lessons.filter((l) => S.done[l.id]).length;
      html += `<section class="unit"><h3><span>${u.icon}</span>${esc(u.title)}<small>${ud}/${u.lessons.length}</small></h3><ol class="path">`;
      u.lessons.forEach((l, i) => {
        const st = S.done[l.id] ? 'done' : (next && next.id === l.id ? 'next' : 'todo');
        const stars = S.done[l.id] ? (S.done[l.id].acc >= 90 ? 3 : S.done[l.id].acc >= 60 ? 2 : 1) : 0;
        html += `<li class="node-row off${i % 4}">
          <button class="node ${st}" data-act="start" data-id="${l.id}" aria-label="${esc(l.title)}">${st === 'done' ? '✓' : st === 'next' ? '★' : LESSONS.indexOf(l) + 1}</button>
          <div class="node-label">${st === 'next' ? '<span class="bubble">Inizia</span>' : ''}<b>${esc(l.title)}</b>
            <span class="muted small">${l.steps.length} step · ${esc(PAGES[l.page].name.split(' · ')[0])}${stars ? ' · ' + '★'.repeat(stars) + '☆'.repeat(3 - stars) : ''}</span></div>
        </li>`;
      });
      html += '</ol></section>';
    });
    html += '</div>';
    return html;
  }

  function vLesson() {
    const l = lessonOf();
    const step = stepOf();
    const r = S.run;
    const page = pageOf(step, l);
    const here = page === 'any' || page === currentPage();
    let html = `
      <header class="top lesson-top">
        <button class="icon" data-act="exit" title="Esci (il progresso resta salvato)">✕</button>
        <div class="bar"><div style="width:${(r.i / l.steps.length) * 100}%"></div></div>
        <span class="chip">⚡ ${r.xp}</span>
        <button class="icon" data-act="min" title="Riduci">—</button>
      </header>
      <div class="body">
        <p class="eyebrow">${l.unit.icon} ${esc(l.title)} · ${r.i + 1}/${l.steps.length}</p>`;
    if (page !== 'any') {
      html += here
        ? `<p class="where ok">📍 ${esc(PAGES[page].name)}</p>`
        : `<a class="where go" href="${PAGES[page].path}">📍 Questo step si fa su <b>${esc(PAGES[page].name)}</b><span>Vai alla pagina →</span></a>`;
    }
    html += `<span class="type t-${step.type}">${TYPE_LABEL[step.type]}</span><div class="text">${fmt(step.text)}</div>`;

    if (step.type === 'mcq') {
      html += '<div class="options">' + seeded(step.options, step.id).map(([o, i], n) =>
        `<button class="opt ${picked === i ? 'picked' : ''} ${feedback && o.ok ? 'right' : ''} ${feedback && picked === i && !o.ok ? 'wrong' : ''}" data-act="pick" data-i="${i}" ${feedback ? 'disabled' : ''}><span class="letter">${'ABCD'[n]}</span><span>${inline(o.t)}</span></button>`).join('') + '</div>';
    }
    if (step.type === 'find') {
      html += `<input class="answer ${feedback && feedback.kind === 'bad' ? 'shake' : ''}" data-input placeholder="${esc(step.placeholder || 'La tua risposta')}" value="${esc(draft)}" autocomplete="off" spellcheck="false" ${feedback && feedback.kind === 'ok' ? 'disabled' : ''}>`;
    }
    if (step.type === 'do') {
      html += `<div class="watch ${checking ? 'busy' : ''}"><span class="pulse"></span>Sto osservando la pagina: quando fai l'azione me ne accorgo da solo. Oppure premi Verifica.</div>`;
    }
    if (step.hints && r.hints) {
      html += '<ul class="hints">' + step.hints.slice(0, r.hints).map((h, i) => `<li><span>💡 ${i + 1}</span>${inline(h)}</li>`).join('') + '</ul>';
    }
    html += '</div>';

    if (feedback) {
      html += `<div class="sheet ${feedback.kind}"><p class="sheet-title">${esc(feedback.title)}</p>${feedback.body ? '<div class="sheet-body">' + fmt(feedback.body) + '</div>' : ''}
        <div class="sheet-actions">${feedback.actions.map(([t, a, p]) => `<button class="${p ? 'btn primary' : 'btn ghost'}" data-act="${a}">${esc(t)}</button>`).join('')}</div></div>`;
    } else {
      const hintsLeft = step.hints ? step.hints.length - r.hints : 0;
      const label = step.type === 'intro' ? 'Ho capito' : 'Verifica';
      const disabled = (step.type === 'mcq' && picked == null) || (step.type === 'find' && !draft.trim()) || checking;
      html += `<footer class="foot">
        ${hintsLeft > 0 ? `<button class="btn ghost" data-act="hint">💡 Indizio <small>${r.hints + 1}/${step.hints.length}</small></button>` : '<span></span>'}
        <button class="btn primary" data-act="verify" ${disabled ? 'disabled' : ''}>${checking ? 'Controllo…' : label}</button>
      </footer>`;
    }
    return html;
  }

  function vDone() {
    const d = lastDone;
    const next = nextLesson();
    const stars = d.acc >= 90 ? 3 : d.acc >= 60 ? 2 : 1;
    return `
      <header class="top"><span class="logo">Inspect <em>Lab</em></span><button class="icon" data-act="map" title="Mappa">✕</button></header>
      <div class="body done">
        <div class="trophy">🏆</div>
        <h2>Lezione completata!</h2>
        <p class="muted">${esc(d.lesson.title)}</p>
        <div class="stars">${'★'.repeat(stars)}<span>${'★'.repeat(3 - stars)}</span></div>
        <div class="kpis"><div><b>+${d.xp}</b><span>XP</span></div><div><b>${d.acc}%</b><span>precisione</span></div><div><b>🔥 ${S.streak.n}</b><span>streak</span></div></div>
        <div class="tip"><p class="tip-k">Trucco sbloccato · nel prontuario 📒</p><b>${esc(d.lesson.tip.title)}</b>${fmt(d.lesson.tip.body)}</div>
      </div>
      <footer class="foot">
        <button class="btn ghost" data-act="map">Mappa</button>
        ${next ? `<button class="btn primary" data-act="start" data-id="${next.id}">Prossima →</button>` : '<button class="btn primary" data-act="map">Hai finito tutto! 🎉</button>'}
      </footer>`;
  }

  function vTips() {
    let html = `<header class="top"><button class="icon" data-act="map" title="Indietro">←</button><span class="logo">Prontuario</span><span></span></header><div class="body">
      <p class="muted small">Un trucco per ogni lezione completata. Tienilo aperto quando lavori sui siti veri.</p>`;
    UNITS.forEach((u) => {
      html += `<h3 class="tips-unit">${u.icon} ${esc(u.title)}</h3>`;
      u.lessons.forEach((l) => {
        html += S.done[l.id]
          ? `<div class="tip"><b>${esc(l.tip.title)}</b>${fmt(l.tip.body)}</div>`
          : `<div class="tip locked"><b>🔒 ${esc(l.tip.title)}</b><p>Completa "${esc(l.title)}" per sbloccarlo.</p></div>`;
      });
    });
    return html + '</div>';
  }

  function vSettings() {
    return `<header class="top"><button class="icon" data-act="map" title="Indietro">←</button><span class="logo">Impostazioni</span><span></span></header><div class="body settings">
      <div class="row"><span>Posizione del pannello</span><div class="seg"><button data-act="side" data-v="left" class="${S.side === 'left' ? 'on' : ''}">Sinistra</button><button data-act="side" data-v="right" class="${S.side === 'right' ? 'on' : ''}">Destra</button></div></div>
      <div class="row"><span>Scorciatoie da tastiera</span><div class="seg"><button data-act="plat" data-v="mac" class="${plat() === 'mac' ? 'on' : ''}">Mac</button><button data-act="plat" data-v="win" class="${plat() === 'win' ? 'on' : ''}">Windows</button></div></div>
      <div class="row col"><span>Negozio "rotto"? Cancella cookie e storage di Maison Velluto (non i tuoi progressi).</span><button class="btn ghost" data-act="reset-shop">Ripristina il negozio</button></div>
      <div class="row col"><span>Ricomincia da zero: cancella XP, streak e lezioni completate.</span><button class="btn ghost danger" data-act="reset-all">Azzera i progressi</button></div>
      <p class="muted small">Il coach vive nell'elemento <code>#inspect-lab-coach</code> (Shadow DOM) e salva i progressi nel Local Storage alla chiave <code>${STORE}</code>: ignorali quando ispezioni il negozio.</p>
    </div>`;
  }

  // ------------------------------------------------------------------ DOM
  const host = document.createElement('div');
  host.id = 'inspect-lab-coach';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${CSS()}</style><div class="wrap"><button class="fab" data-act="open"></button><section class="panel" role="dialog" aria-label="Inspect Lab"></section><div class="fx"></div></div>`;
  const wrap = root.querySelector('.wrap');
  const panel = root.querySelector('.panel');
  const fab = root.querySelector('.fab');

  function render() {
    wrap.dataset.side = S.side;
    const open = S.open && !homeCollapsed;
    wrap.classList.toggle('closed', !open);
    const run = lessonOf();
    fab.innerHTML = `<span class="fab-logo">IL</span><span>${run ? 'Step ' + (S.run.i + 1) + '/' + run.steps.length : 'Inspect Lab'}</span><span class="chip">⚡ ${S.xp}</span>`;
    if (!open) return;
    const scroll = panel.querySelector('.body') ? panel.querySelector('.body').scrollTop : 0;
    panel.innerHTML = view === 'lesson' && run ? vLesson() : view === 'done' && lastDone ? vDone() : view === 'tips' ? vTips() : view === 'settings' ? vSettings() : vMap();
    const body = panel.querySelector('.body');
    if (body && view !== 'lesson') body.scrollTop = scroll;
    const input = panel.querySelector('[data-input]');
    if (input && !input.disabled && document.activeElement === host) input.focus();
  }

  root.addEventListener('input', (e) => {
    if (!e.target.matches('[data-input]')) return;
    draft = e.target.value;
    const btn = panel.querySelector('[data-act="verify"]');
    if (btn) btn.disabled = !draft.trim();
    if (feedback && feedback.kind === 'bad') { feedback = null; render(); panel.querySelector('[data-input]').focus(); }
  });
  root.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key !== 'Enter') return;
    if (feedback) { const p = panel.querySelector('.sheet .primary'); if (p) { e.preventDefault(); p.click(); } return; }
    if (e.target.matches('[data-input]')) { e.preventDefault(); verify(); }
  });
  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    const step = stepOf();
    switch (act) {
      case 'open': S.open = true; homeCollapsed = false; break;
      case 'min': S.open = false; break;
      case 'map': view = 'map'; feedback = null; break;
      case 'tips': view = 'tips'; break;
      case 'settings': view = 'settings'; break;
      case 'resume': view = 'lesson'; break;
      case 'start': return startLesson(el.dataset.id);
      case 'exit': view = 'map'; feedback = null; break;
      case 'pick': picked = Number(el.dataset.i); break;
      case 'verify': return verify();
      case 'next': return advance();
      case 'retry': feedback = null; render(); { const i = panel.querySelector('[data-input]'); if (i) i.select(); } return;
      case 'hint': if (step && step.hints && S.run.hints < step.hints.length) S.run.hints++; feedback = null; break;
      case 'reveal':
        S.run.scored++;
        feedback = { kind: 'info', title: 'Soluzione', body: step.solution + (step.explain ? '\n\n' + step.explain : ''), actions: [['Continua', 'next', 1]] };
        break;
      case 'skip':
        S.run.scored++;
        feedback = { kind: 'info', title: 'Ok, ti credo 😉', body: step.explain || 'Andiamo avanti.', actions: [['Continua', 'next', 1]] };
        break;
      case 'side': S.side = el.dataset.v; break;
      case 'plat': S.plat = el.dataset.v; break;
      case 'reset-shop':
        document.cookie.split('; ').forEach((c) => {
          const n = c.split('=')[0];
          if (n.startsWith('vl_')) ['/inspect-lab/', '/'].forEach((p) => { document.cookie = n + '=; path=' + p + '; max-age=0'; });
        });
        Object.keys(localStorage).filter((k) => k.startsWith('vl_')).forEach((k) => localStorage.removeItem(k));
        sessionStorage.clear();
        location.reload();
        return;
      case 'reset-all':
        if (!confirm('Azzerare XP, streak e lezioni completate?')) return;
        S = Object.assign({}, defaults, { side: S.side, plat: S.plat });
        view = 'map';
        break;
      default: return;
    }
    save(); render();
  });

  function confetti() {
    const fx = root.querySelector('.fx');
    const colors = ['#f0c210', '#8fa89e', '#f5f0eb', '#e2836b', '#9db8ff'];
    for (let i = 0; i < 46; i++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%';
      s.style.background = colors[i % colors.length];
      s.style.animationDelay = Math.random() * 0.4 + 's';
      s.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      s.style.setProperty('--r', Math.random() * 720 + 'deg');
      fx.appendChild(s);
      setTimeout(() => s.remove(), 2600);
    }
  }

  function CSS() {
    return `
:host { all: initial; }
* { box-sizing: border-box; }
.wrap { --bg:#1a1816; --card:#24211e; --card2:#2d2925; --line:rgba(245,240,235,.11); --text:#f5f0eb; --text2:rgba(245,240,235,.62); --text3:rgba(245,240,235,.4);
  --sage:#8fa89e; --yellow:#f0c210; --ok:#9fd38f; --okbg:#1f2a1d; --bad:#ff9b85; --badbg:#2e1d19;
  position: fixed; bottom: 16px; left: 16px; z-index: 2147483000; font: 400 14px/1.5 'DM Sans', system-ui, -apple-system, sans-serif; color: var(--text); -webkit-font-smoothing: antialiased; }
.wrap[data-side="right"] { left: auto; right: 16px; }
.panel { width: 384px; max-height: min(680px, calc(100vh - 32px)); display: flex; flex-direction: column; background: var(--bg); border: 1px solid var(--line); border-radius: 18px; box-shadow: 0 24px 60px -12px rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.2); overflow: hidden; position: relative; animation: pop .28s cubic-bezier(.2,.9,.3,1.2); }
.wrap.closed .panel { display: none; }
.fab { display: none; align-items: center; gap: 10px; padding: 8px 10px 8px 8px; border-radius: 99px; border: 1px solid var(--line); background: var(--bg); color: var(--text); font: 500 13px/1 'DM Sans', system-ui, sans-serif; cursor: pointer; box-shadow: 0 10px 30px -8px rgba(0,0,0,.5); }
.wrap.closed .fab { display: inline-flex; animation: pop .25s ease-out; }
.fab-logo { width: 28px; height: 28px; border-radius: 50%; background: var(--yellow); color: #1a1816; display: grid; place-items: center; font: 600 12px/1 'DM Mono', monospace; }
@keyframes pop { from { transform: translateY(10px) scale(.97); opacity: 0; } }
button { font: inherit; color: inherit; }
code { font: 500 12.5px/1.3 'DM Mono', ui-monospace, monospace; background: rgba(240,194,16,.1); color: #f6d55c; padding: 1px 5px; border-radius: 4px; word-break: break-word; }
kbd { display: inline-block; min-width: 20px; padding: 2px 6px; margin: 0 1px; border-radius: 5px; background: var(--card2); border: 1px solid var(--line); border-bottom-width: 2px; font: 500 12px/1.2 'DM Mono', monospace; text-align: center; color: var(--text); }
.keys { white-space: nowrap; }
.muted { color: var(--text2); } .small { font-size: 12px; }
p { margin: 0 0 8px; } p:last-child { margin-bottom: 0; }

.top { display: flex; align-items: center; gap: 8px; padding: 12px 12px 12px 16px; border-bottom: 1px solid var(--line); flex-shrink: 0; justify-content: space-between; }
.logo { font: 500 21px/1 'Cormorant Garamond', Georgia, serif; letter-spacing: .01em; }
.logo em { color: var(--yellow); }
.stats { display: flex; align-items: center; gap: 4px; }
.chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 99px; background: var(--card); font: 500 12px/1 'DM Mono', monospace; white-space: nowrap; }
.chip.fire { background: rgba(240,140,60,.16); }
.icon { width: 30px; height: 30px; border-radius: 8px; border: 0; background: transparent; cursor: pointer; color: var(--text2); font-size: 14px; display: grid; place-items: center; flex-shrink: 0; }
.icon:hover { background: var(--card); color: var(--text); }
.body { padding: 16px; overflow-y: auto; overscroll-behavior: contain; flex: 1; }
.body::-webkit-scrollbar { width: 8px; } .body::-webkit-scrollbar-thumb { background: var(--card2); border-radius: 8px; }

.progress-line, .bar { height: 8px; border-radius: 99px; background: var(--card2); overflow: hidden; }
.progress-line { margin-bottom: 6px; }
.progress-line div, .bar div { height: 100%; background: linear-gradient(90deg, var(--sage), var(--yellow)); border-radius: 99px; transition: width .5s cubic-bezier(.2,.8,.2,1); }
.bar { flex: 1; }
.resume { width: 100%; text-align: left; margin: 14px 0 4px; padding: 12px 14px; border-radius: 14px; border: 1px solid rgba(240,194,16,.35); background: rgba(240,194,16,.08); cursor: pointer; display: grid; gap: 2px; }
.resume:hover { background: rgba(240,194,16,.14); }
.resume-k { font: 500 11px/1 'DM Mono', monospace; text-transform: uppercase; letter-spacing: .1em; color: var(--yellow); }

.unit { margin-top: 20px; }
.unit h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; font: 600 12px/1 'DM Sans', sans-serif; letter-spacing: .1em; text-transform: uppercase; color: var(--text2); }
.unit h3 small { margin-left: auto; font: 500 11px 'DM Mono', monospace; letter-spacing: 0; }
.path { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.node-row { display: flex; align-items: center; gap: 12px; }
.node-row.off1 { padding-left: 28px; } .node-row.off2 { padding-left: 52px; } .node-row.off3 { padding-left: 28px; }
.node { width: 50px; height: 50px; flex-shrink: 0; border-radius: 50%; border: 0; cursor: pointer; font: 600 16px/1 'DM Mono', monospace; transition: transform .15s; }
.node:hover { transform: translateY(-2px); }
.node:active { transform: translateY(2px); }
.node.todo { background: var(--card2); color: var(--text2); box-shadow: 0 4px 0 #151311; }
.node.done { background: var(--sage); color: #12201b; box-shadow: 0 4px 0 #5f776d; }
.node.next { background: var(--yellow); color: #1a1816; box-shadow: 0 4px 0 #a88700, 0 0 0 6px rgba(240,194,16,.15); animation: glow 2s ease-in-out infinite; }
@keyframes glow { 50% { box-shadow: 0 4px 0 #a88700, 0 0 0 11px rgba(240,194,16,.05); } }
.node-label { display: grid; gap: 1px; line-height: 1.3; min-width: 0; }
.node-label b { font-weight: 500; }
.bubble { justify-self: start; font: 600 10px/1 'DM Mono', monospace; text-transform: uppercase; letter-spacing: .1em; background: var(--yellow); color: #1a1816; padding: 3px 6px; border-radius: 5px; margin-bottom: 3px; }

.lesson-top { gap: 10px; }
.eyebrow { font: 500 11px/1.3 'DM Mono', monospace; color: var(--text3); letter-spacing: .04em; margin-bottom: 10px; }
.where { display: block; font-size: 12px; padding: 7px 10px; border-radius: 10px; margin: 0 0 12px; }
.where.ok { background: rgba(143,168,158,.12); color: var(--sage); }
.where.go { background: rgba(240,194,16,.1); color: var(--text); text-decoration: none; border: 1px dashed rgba(240,194,16,.5); }
.where.go span { display: block; color: var(--yellow); font-weight: 600; margin-top: 2px; }
.type { display: inline-block; font: 600 10px/1 'DM Mono', monospace; text-transform: uppercase; letter-spacing: .12em; padding: 5px 7px; border-radius: 5px; margin-bottom: 10px; }
.t-intro { background: rgba(157,184,255,.14); color: #b9cbff; } .t-mcq { background: rgba(143,168,158,.16); color: var(--sage); }
.t-find { background: rgba(240,194,16,.14); color: var(--yellow); } .t-do { background: rgba(226,131,107,.16); color: #f0a48f; }
.text { font-size: 15px; line-height: 1.55; }
.text b { color: #fff; font-weight: 600; }
.options { display: grid; gap: 8px; margin-top: 14px; }
.opt { display: flex; gap: 10px; align-items: flex-start; text-align: left; padding: 11px 12px; border-radius: 12px; border: 1.5px solid var(--line); border-bottom-width: 3px; background: var(--card); cursor: pointer; line-height: 1.4; }
.opt:hover:not(:disabled) { border-color: rgba(245,240,235,.28); }
.opt.picked { border-color: var(--yellow); background: rgba(240,194,16,.08); }
.opt.right { border-color: var(--ok); background: var(--okbg); }
.opt.wrong { border-color: var(--bad); background: var(--badbg); }
.opt:disabled { cursor: default; }
.letter { flex-shrink: 0; width: 22px; height: 22px; border-radius: 6px; border: 1px solid var(--line); display: grid; place-items: center; font: 500 11px/1 'DM Mono', monospace; color: var(--text2); }
.answer { width: 100%; margin-top: 14px; padding: 13px 14px; border-radius: 12px; border: 1.5px solid var(--line); background: var(--card); color: var(--text); font: 500 15px/1.2 'DM Mono', monospace; outline: none; }
.answer:focus { border-color: var(--yellow); }
.answer.shake { border-color: var(--bad); animation: shake .35s; }
@keyframes shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
.watch { display: flex; gap: 10px; align-items: center; margin-top: 14px; padding: 11px 12px; border-radius: 12px; background: var(--card); color: var(--text2); font-size: 13px; line-height: 1.4; }
.pulse { width: 10px; height: 10px; flex-shrink: 0; border-radius: 50%; background: #f0a48f; animation: ping 1.3s infinite; }
@keyframes ping { 0% { box-shadow: 0 0 0 0 rgba(240,164,143,.6); } 100% { box-shadow: 0 0 0 10px rgba(240,164,143,0); } }
.hints { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 6px; }
.hints li { padding: 9px 11px; border-radius: 10px; background: rgba(240,194,16,.06); border: 1px solid rgba(240,194,16,.18); font-size: 13px; line-height: 1.45; animation: pop .25s; }
.hints li span { display: block; font: 600 10px/1 'DM Mono', monospace; color: var(--yellow); margin-bottom: 4px; letter-spacing: .08em; }

.foot { display: flex; justify-content: space-between; gap: 10px; padding: 12px 16px 16px; border-top: 1px solid var(--line); flex-shrink: 0; }
.btn { border: 0; border-radius: 12px; padding: 11px 18px; font: 600 14px/1 'DM Sans', sans-serif; cursor: pointer; transition: transform .1s, filter .15s; }
.btn:active:not(:disabled) { transform: translateY(2px); }
.btn.primary { background: var(--yellow); color: #1a1816; box-shadow: 0 4px 0 #a88700; min-width: 128px; text-transform: uppercase; letter-spacing: .06em; font-size: 13px; }
.btn.primary:hover:not(:disabled) { filter: brightness(1.06); }
.btn.primary:disabled { background: var(--card2); color: var(--text3); box-shadow: 0 4px 0 #151311; cursor: not-allowed; }
.btn.ghost { background: transparent; border: 1.5px solid var(--line); color: var(--text); }
.btn.ghost:hover { background: var(--card); }
.btn.ghost small { color: var(--text3); font: 500 11px 'DM Mono', monospace; margin-left: 4px; }
.btn.danger { color: var(--bad); }

.sheet { padding: 14px 16px 16px; border-top: 1px solid var(--line); animation: up .25s cubic-bezier(.2,.9,.3,1.1); flex-shrink: 0; max-height: 46%; overflow-y: auto; }
@keyframes up { from { transform: translateY(20px); opacity: 0; } }
.sheet.ok { background: var(--okbg); } .sheet.bad { background: var(--badbg); } .sheet.info { background: #1d2230; }
.sheet-title { font: 700 17px/1.2 'DM Sans', sans-serif; margin-bottom: 6px; }
.sheet.ok .sheet-title { color: var(--ok); } .sheet.bad .sheet-title { color: var(--bad); } .sheet.info .sheet-title { color: #b9cbff; }
.sheet-body { font-size: 13.5px; color: var(--text); opacity: .9; margin-bottom: 12px; }
.sheet-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.sheet .btn.primary { flex: 1; }
.sheet.bad .btn.primary { background: var(--bad); box-shadow: 0 4px 0 #b55e4c; }
.sheet.ok .btn.primary { background: var(--ok); box-shadow: 0 4px 0 #5f8f52; }

.done { text-align: center; }
.trophy { font-size: 54px; line-height: 1; margin: 6px 0 10px; animation: bounce .8s cubic-bezier(.3,1.6,.5,1); }
@keyframes bounce { from { transform: scale(.3) rotate(-20deg); } }
.done h2 { margin: 0 0 4px; font: 500 30px/1.1 'Cormorant Garamond', Georgia, serif; }
.stars { font-size: 26px; color: var(--yellow); letter-spacing: 4px; margin: 10px 0; } .stars span { color: var(--card2); }
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 14px 0; }
.kpis div { background: var(--card); border-radius: 12px; padding: 10px 6px; display: grid; gap: 2px; }
.kpis b { font: 600 18px/1.1 'DM Mono', monospace; } .kpis span { font-size: 11px; color: var(--text2); }
.tip { text-align: left; background: var(--card); border-radius: 14px; padding: 13px 14px; margin-bottom: 8px; font-size: 13.5px; border-left: 3px solid var(--sage); }
.tip > b { display: block; margin-bottom: 4px; }
.tip.locked { opacity: .45; border-left-color: var(--card2); }
.tip-k { font: 500 10px/1 'DM Mono', monospace; text-transform: uppercase; letter-spacing: .1em; color: var(--sage); margin-bottom: 8px !important; }
.tips-unit { font: 600 12px/1 'DM Sans', sans-serif; letter-spacing: .1em; text-transform: uppercase; color: var(--text2); margin: 18px 0 8px; }
.settings .row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); font-size: 13.5px; }
.settings .row.col { flex-direction: column; align-items: stretch; }
.settings .row:last-of-type { margin-bottom: 14px; }
.seg { display: inline-flex; background: var(--card); border-radius: 10px; padding: 3px; }
.seg button { border: 0; background: transparent; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 12.5px; color: var(--text2); }
.seg button.on { background: var(--card2); color: var(--text); }

.fx { position: absolute; left: 0; right: 0; top: 0; height: 0; pointer-events: none; z-index: 2; }
.fx i { position: absolute; top: 40px; width: 8px; height: 12px; border-radius: 2px; opacity: 0; animation: confetti 2.2s cubic-bezier(.2,.7,.4,1) forwards; }
@keyframes confetti { 0% { opacity: 1; transform: translate(0,-30px) rotate(0); } 100% { opacity: 0; transform: translate(var(--dx), 380px) rotate(var(--r)); } }
@media (max-width: 520px) {
  .wrap, .wrap[data-side="right"] { left: 8px; right: 8px; bottom: 8px; }
  .panel { width: auto; max-height: 62vh; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
`;
  }

  // ------------------------------------------------------------------ avvio
  function mount() {
    document.body.appendChild(host);
    if (location.hash === '#lab-start') {
      history.replaceState(null, '', location.pathname + location.search);
      const n = S.run ? lessonOf() : nextLesson();
      if (n && !S.run) return startLesson(n.id);
      S.open = true; view = S.run ? 'lesson' : 'map';
    }
    render();
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
