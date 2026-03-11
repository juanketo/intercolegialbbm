// juez.js — Pantallas del flujo del juez
const Juez = (() => {

  let _datos = null;

  async function getDatos() {
    if (!_datos) _datos = await Api.datos();
    return _datos;
  }

  // ── Pantalla 1: Bloques ──────────────────────────────────────
  async function verBloques() {
    UI.hideSidebar();
    UI.loading('main');
    const main = document.getElementById('main');
    try {
      const bloques = await Api.bloques();
      main.innerHTML = '';
      const sec = document.createElement('div');
      sec.className = 'sec';
      sec.appendChild(UI.h2('Selecciona un Bloque'));

      if (bloques.length === 0) {
        sec.innerHTML += `<div class="empty-state"><div class="ei"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><p>No hay bloques disponibles aún.</p></div>`;
        main.appendChild(sec); return;
      }

      const grid = document.createElement('div');
      grid.className = 'grid-bloques';
      for (const b of bloques) {
        const grupos = await Api.grupos(b);
        const card = document.createElement('div');
        card.className = 'tarjeta-bloque';
        card.innerHTML = `
          <div class="bloque-num">${b}</div>
          <h3>Bloque ${b}</h3>
          <p>${grupos.length} grupo${grupos.length !== 1 ? 's' : ''}</p>
        `;
        card.addEventListener('click', () => verGrupos(b));
        grid.appendChild(card);
      }
      sec.appendChild(grid);
      main.appendChild(sec);
    } catch (e) { UI.msg(e.message, 'error'); }
  }

  // ── Pantalla 2: Grupos del bloque ────────────────────────────
  async function verGrupos(bloque) {
    UI.hideSidebar();
    UI.loading('main');
    const main = document.getElementById('main');
    try {
      const grupos = await Api.grupos(bloque);
      main.innerHTML = '';

      const sec = document.createElement('div');
      sec.className = 'sec';
      sec.appendChild(UI.h2(`Bloque ${bloque} — Grupos`));
      const acc = document.createElement('div');
      acc.className = 'acc';
      acc.appendChild(UI.btn(
        `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Bloques`,
        'btn-sec', verBloques));
      sec.appendChild(acc);
      main.appendChild(sec);

      if (grupos.length === 0) {
        const s2 = document.createElement('div'); s2.className = 'sec';
        s2.innerHTML = `<div class="empty-state"><div class="ei"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg></div><p>No hay grupos en este bloque.</p></div>`;
        main.appendChild(s2); return;
      }

      const sec2 = document.createElement('div');
      sec2.className = 'sec';
      const scroll = document.createElement('div');
      scroll.className = 'tabla-scroll';
      const tabla = document.createElement('table');
      tabla.innerHTML = `<thead><tr><th>#</th><th>Unidad</th><th>Nivel</th><th>Disciplina</th><th>Part.</th><th>Jueces</th><th>Acciones</th></tr></thead>`;
      const tbody = document.createElement('tbody');
      const evals = await Promise.all(grupos.map(g => Api.evaluaciones(g.id)));

      grupos.forEach((g, i) => {
        const evs = evals[i];
        const mia = evs.find(e => e.juez === App.usuario.username);
        const jueces = ['juez1','juez2','juez3'];
        const badges = jueces.map(j => {
          const ev = evs.find(e => e.juez === j);
          const esMio = j === App.usuario.username;
          return `<span class="badge${ev ? (esMio ? ' mine' : ' done') : ''}" title="${j}">${j.replace('juez','J')}</span>`;
        }).join('');

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${i + 1}</td>
          <td><strong>${g.unidad}</strong></td>
          <td>${g.nivel}</td>
          <td>${g.disciplina}</td>
          <td>${g.participantes}</td>
          <td>${badges} <span style="font-size:11px;color:var(--text-soft)">(${evs.length}/3)</span></td>
          <td class="td-acc"></td>
        `;
        const tdAcc = tr.querySelector('.td-acc');
        // Solo botón Evaluar/Editar — sin botón Detalle
        const svgEval = mia
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editar`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Evaluar`;
        tdAcc.appendChild(UI.btn(svgEval, mia ? 'btn-sec btn-sm' : 'btn-app btn-sm', () => verRubrica(g.id)));
        tbody.appendChild(tr);
      });

      tabla.appendChild(tbody);
      scroll.appendChild(tabla);
      sec2.appendChild(scroll);
      main.appendChild(sec2);
    } catch (e) { UI.msg(e.message, 'error'); }
  }

  // ── Pantalla 3: Rúbrica ──────────────────────────────────────
  async function verRubrica(grupoId) {
    UI.hideSidebar();
    UI.loading('main');
    const main = document.getElementById('main');
    try {
      const [grupo, datos, evs] = await Promise.all([
        Api.grupo(grupoId), getDatos(), Api.evaluaciones(grupoId)
      ]);
      const mia = evs.find(e => e.juez === App.usuario.username);
      main.innerHTML = '';

      const secInfo = document.createElement('div');
      secInfo.className = 'sec';
      secInfo.appendChild(UI.h2(`Evaluando — ${App.usuario.username}`));
      secInfo.innerHTML += `
        <div class="tabla-scroll">
          <table class="tabla-info">
            <tr><th>Unidad</th><td>${grupo.unidad}</td><th>Nivel</th><td>${grupo.nivel}</td></tr>
            <tr><th>Disciplina</th><td>${grupo.disciplina}</td><th>Bloque</th><td>${grupo.bloque}</td></tr>
          </table>
        </div>`;
      if (mia) {
        const av = document.createElement('div');
        av.style.cssText = 'margin-top:14px;padding:12px 16px;border-radius:12px;background:rgba(245,166,35,.1);border-left:3px solid var(--accent);font-size:13px;color:var(--text-soft)';
        av.innerHTML = `Ya tienes evaluación guardada. Promedio: <strong style="color:var(--accent)">${mia.promedio.toFixed(2)}</strong>. Puedes modificarla.`;
        secInfo.appendChild(av);
      }
      main.appendChild(secInfo);

      const secLive = document.createElement('div');
      secLive.className = 'sec';
      secLive.innerHTML = `
        <div class="live-card">
          <div class="live-card-left">
            <div class="live-label">Tu promedio actual</div>
            <div class="live-num" id="live-num">—</div>
            <div class="live-sub" id="live-sub">Ingresa los criterios para calcular</div>
          </div>
          <div class="live-card-right">
            <div class="live-prog-label" id="live-prog-label">0 / 10 criterios</div>
            <div class="live-prog-bar">
              <div class="live-prog-fill" id="live-fill" style="width:0%"></div>
            </div>
          </div>
        </div>
      `;
      main.appendChild(secLive);

      const secRubrica = document.createElement('div');
      secRubrica.className = 'sec';
      secRubrica.appendChild(UI.h2('Rúbrica de Evaluación'));
      const scroll = document.createElement('div');
      scroll.className = 'tabla-scroll';
      const tabla = document.createElement('table');
      tabla.className = 'rubrica-tabla';
      tabla.innerHTML = `<thead><tr><th>#</th><th>Criterio</th><th>Calificación (8.00 – 10.00)</th></tr></thead>`;
      const tbody = document.createElement('tbody');

      datos.criterios.forEach((c, i) => {
        const prevVal = mia ? mia[c.id] : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:700;color:var(--lila)">${i + 1}</td>
          <td>${c.nombre}</td>
          <td><input type="number" id="inp-${c.id}" min="8" max="10" step="0.01"
            placeholder="8.00" inputmode="decimal"
            value="${prevVal !== '' ? Number(prevVal).toFixed(2) : ''}" /></td>
        `;
        tbody.appendChild(tr);
      });
      tabla.appendChild(tbody);
      scroll.appendChild(tabla);
      secRubrica.appendChild(scroll);

      const acc = document.createElement('div');
      acc.className = 'acc';
      acc.style.marginTop = '20px';
      acc.appendChild(UI.btn(
        `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Volver`,
        'btn-sec', () => verGrupos(grupo.bloque)));
      acc.appendChild(UI.btn(
        `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:5px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Guardar Evaluación`,
        '', () => guardar(grupo.id, grupo.bloque, datos.criterios)));
      secRubrica.appendChild(acc);
      main.appendChild(secRubrica);

      function calcLive() {
        const vals = datos.criterios.map(c => {
          const inp = document.getElementById(`inp-${c.id}`);
          if (!inp || inp.value === '') return NaN;
          const n = parseFloat(inp.value);
          return (!isNaN(n) && n >= 8 && n <= 10) ? n : NaN;
        });
        const validos = vals.filter(v => !isNaN(v));
        const numEl  = document.getElementById('live-num');
        const subEl  = document.getElementById('live-sub');
        const fillEl = document.getElementById('live-fill');
        const progEl = document.getElementById('live-prog-label');
        if (!numEl) return;

        progEl.textContent = `${validos.length} / 10 criterios`;
        fillEl.style.width = `${(validos.length / 10) * 100}%`;

        if (validos.length === 0) {
          numEl.textContent = '—';
          subEl.textContent = 'Ingresa los criterios para calcular';
        } else {
          const prom = validos.reduce((a,b) => a+b, 0) / validos.length;
          numEl.textContent = prom.toFixed(2);
          subEl.textContent = validos.length < 10
            ? `(${10 - validos.length} criterio${10-validos.length!==1?'s':''} pendiente${10-validos.length!==1?'s':''})`
            : 'Todos los criterios completos';
        }
      }

      datos.criterios.forEach(c => {
        const inp = document.getElementById(`inp-${c.id}`);
        if (inp) inp.addEventListener('input', calcLive);
      });
      calcLive();

    } catch (e) { UI.msg(e.message, 'error'); }
  }

  // ── Guardar evaluación ───────────────────────────────────────
  async function guardar(grupoId, bloque, criteriosDef) {
    const criterios = {};
    const errores = [];
    criteriosDef.forEach(c => {
      const inp = document.getElementById(`inp-${c.id}`);
      const val = inp ? inp.value.trim() : '';
      const n = parseFloat(val);
      const ok = val !== '' && !isNaN(n) && n >= 8.00 && n <= 10.00 && /^\d+(\.\d{1,2})?$/.test(val);
      if (!ok) {
        errores.push(c.nombre);
        if (inp) inp.style.boxShadow = 'inset 3px 3px 8px #e57373,inset -3px -3px 8px #ffcdd2,0 0 0 2px #c0392b';
      } else {
        if (inp) inp.style.boxShadow = '';
        criterios[c.id] = parseFloat(n.toFixed(2));
      }
    });
    if (errores.length > 0) {
      UI.msg('Valor inválido en: ' + errores.slice(0,3).join(', ') + (errores.length > 3 ? '...' : ''), 'error');
      return;
    }
    try {
      const res = await Api.guardarEval({ grupo_id: grupoId, criterios });
      UI.msg(`Guardado. Tu promedio: ${res.promedio.toFixed(2)}`);
      verGrupos(bloque);
    } catch (e) { UI.msg(e.message, 'error'); }
  }

  return { verBloques, verGrupos, verRubrica };
})();
