// admin.js — Pantallas del administrador
const Admin = (() => {

  let _datos = null;

  async function getDatos() {
    if (!_datos) _datos = await Api.datos();
    return _datos;
  }

  // ── Panel principal: lista de grupos ────────────────────────
  async function verPanel() {
    if (window._supervisarIntervalo) { clearInterval(window._supervisarIntervalo); window._supervisarIntervalo = null; }
    UI.sidebar('grupos');
    UI.loading('main');
    const main = document.getElementById('main');
    try {
      const bloques = await Api.bloques();
      main.innerHTML = '';

      if (bloques.length === 0) {
        const sec = document.createElement('div');
        sec.className = 'sec';
        sec.appendChild(UI.h2('Grupos Registrados'));
        sec.innerHTML += `<div class="empty-state"><div class="ei"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><p>No hay grupos registrados.<br>Usa <strong>Registrar Grupo</strong> en el menú lateral.</p></div>`;
        main.appendChild(sec); return;
      }

      for (const b of bloques) {
        const grupos = await Api.grupos(b);
        const evals = await Promise.all(grupos.map(g => Api.evaluaciones(g.id)));

        const sec = document.createElement('div');
        sec.className = 'sec';

        const hdr = document.createElement('div');
        hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:14px;border-bottom:2px solid;border-image:linear-gradient(90deg,var(--accent),var(--lila)) 1';
        hdr.innerHTML = `<h2 style="border:none;margin:0;padding:0">Bloque ${b}</h2>`;
        const btnHdr = document.createElement('div');
        btnHdr.style.cssText = 'display:flex;gap:8px';
        btnHdr.appendChild(UI.btn(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Ranking Bloque ${b}`, 'btn-sec btn-sm', () => verRanking(b)));
        btnHdr.appendChild(UI.btn(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg> Tabla General Bloque ${b}`, 'btn-obs btn-sm', () => window.open(`/tabla-general?bloque=${b}`, '_blank')));
        hdr.appendChild(btnHdr);
        sec.appendChild(hdr);

        const scroll = document.createElement('div');
        scroll.className = 'tabla-scroll';
        const tabla = document.createElement('table');
        tabla.innerHTML = `<thead><tr><th>#</th><th>Unidad</th><th>Nivel</th><th>Disciplina</th><th>Part.</th><th>Evaluaciones</th><th>Acciones</th></tr></thead>`;
        const tbody = document.createElement('tbody');

        grupos.forEach((g, i) => {
          const evs = evals[i];
          const jueces = ['juez1','juez2','juez3'];
          const badges = jueces.map(j => {
            const ev = evs.find(e => e.juez === j);
            return `<span class="badge${ev ? ' done' : ''}" title="${j}">${j.replace('juez','J')}</span>`;
          }).join('');
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${i + 1}</td>
            <td><strong>${g.unidad}</strong></td>
            <td>${g.nivel}</td>
            <td>${g.disciplina}</td>
            <td>${g.participantes}</td>
            <td>${badges} <span style="font-size:11px;color:var(--text-soft)">${evs.length}/3</span></td>
            <td class="td-acc"></td>
          `;
          const tdAcc = tr.querySelector('.td-acc');
          tdAcc.appendChild(UI.btn(`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Supervisar`, 'btn-sec btn-sm', () => supervisarGrupo(g.id)));
          tdAcc.appendChild(UI.btn(`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> Pantalla resultados`, 'btn-obs btn-sm', () => {
            window.open(`/obs?grupo_id=${g.id}`, '_blank');
          }));
          tdAcc.appendChild(UI.btn(`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg> Eliminar`, 'btn-del btn-sm', async () => {
            if (!confirm(`¿Eliminar grupo "${g.unidad}"? Se perderán sus evaluaciones.`)) return;
            try { await Api.eliminarGrupo(g.id); UI.msg('Grupo eliminado.'); verPanel(); }
            catch (e) { UI.msg(e.message, 'error'); }
          }));
          tbody.appendChild(tr);
        });

        tabla.appendChild(tbody);
        scroll.appendChild(tabla);
        sec.appendChild(scroll);
        main.appendChild(sec);
      }
    } catch (e) { UI.msg(e.message, 'error'); }
  }

  // ── Registrar grupo ─────────────────────────────────────────
  async function registrarGrupo() {
    if (window._supervisarIntervalo) { clearInterval(window._supervisarIntervalo); window._supervisarIntervalo = null; }
    UI.sidebar('registro');
    const datos = await getDatos();
    const main = document.getElementById('main');
    main.innerHTML = '';

    const sec = document.createElement('div');
    sec.className = 'sec';
    sec.appendChild(UI.h2('Registrar Nuevo Grupo'));
    main.appendChild(sec);

    const form = document.createElement('div');
    form.className = 'sec form-grupo';

    const campoBloq = document.createElement('div');
    campoBloq.className = 'campo';
    campoBloq.innerHTML = '<label for="inp-bloque">Número de Bloque</label>';
    const inpBloq = document.createElement('input');
    inpBloq.type = 'number'; inpBloq.id = 'inp-bloque'; inpBloq.min = '1'; inpBloq.placeholder = 'Ej: 1';
    campoBloq.appendChild(inpBloq);
    form.appendChild(campoBloq);
    form.appendChild(UI.sel('sel-unidad',     'Unidad',       datos.unidades));
    form.appendChild(UI.sel('sel-nivel',      'Nivel',        datos.niveles));
    form.appendChild(UI.sel('sel-disciplina', 'Disciplina',   datos.disciplinas));

    const campoPart = document.createElement('div');
    campoPart.className = 'campo';
    campoPart.innerHTML = '<label for="inp-part">Cantidad de participantes</label>';
    const inpPart = document.createElement('input');
    inpPart.type = 'number'; inpPart.id = 'inp-part'; inpPart.min = '1'; inpPart.placeholder = 'Ej: 8';
    campoPart.appendChild(inpPart);
    form.appendChild(campoPart);

    const campoNombre = document.createElement('div');
    campoNombre.className = 'campo';
    campoNombre.innerHTML = '<label for="inp-nombre-grupo">Nombre del Grupo</label>';
    const inpNombreGrupo = document.createElement('input');
    inpNombreGrupo.type = 'text'; inpNombreGrupo.id = 'inp-nombre-grupo'; inpNombreGrupo.placeholder = 'Ej: Las Estrellas';
    campoNombre.appendChild(inpNombreGrupo);
    form.appendChild(campoNombre);

    const acc = document.createElement('div');
    acc.className = 'acc';
    acc.style.marginTop = '8px';
    acc.appendChild(UI.btn(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:5px"><polyline points="20 6 9 17 4 12"/></svg> Registrar Grupo`, '', async () => {
      const bloque      = parseInt(document.getElementById('inp-bloque').value);
      const unidad      = document.getElementById('sel-unidad').value;
      const nivel       = document.getElementById('sel-nivel').value;
      const disciplina  = document.getElementById('sel-disciplina').value;
      const participantes = parseInt(document.getElementById('inp-part').value);
      const nombre_grupo  = document.getElementById('inp-nombre-grupo').value.trim();
      if (!bloque || bloque < 1 || !unidad || !nivel || !disciplina || !participantes || participantes < 1) {
        UI.msg('Completa todos los campos correctamente.', 'error'); return;
      }
      try {
        await Api.crearGrupo({ bloque, unidad, nivel, disciplina, participantes, nombre_grupo });
        UI.msg('Grupo registrado correctamente.');
        verPanel();
      } catch (e) { UI.msg(e.message, 'error'); }
    }));
    form.appendChild(acc);
    main.appendChild(form);
  }

  // ── Ranking con calificaciones ───────────────────────────────
  async function verRanking(bloque) {
    if (window._supervisarIntervalo) { clearInterval(window._supervisarIntervalo); window._supervisarIntervalo = null; }
    UI.sidebar('ranking');
    UI.loading('main');
    const main = document.getElementById('main');
    try {
      const grupos = await Api.ranking(bloque);
      main.innerHTML = '';

      const sec = document.createElement('div');
      sec.className = 'sec';
      sec.appendChild(UI.h2(bloque ? ` Ranking — Bloque ${bloque}` : ' Ranking General'));
      const acc = document.createElement('div');
      acc.className = 'acc';
      if (bloque) acc.appendChild(UI.btn(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Todos los bloques`, 'btn-sec', () => verRanking(null)));
      sec.appendChild(acc);
      main.appendChild(sec);

      if (grupos.length === 0) {
        const s = document.createElement('div'); s.className = 'sec';
        s.innerHTML = `<div class="empty-state"><div class="ei"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div><p>No hay grupos con evaluaciones completas aún.</p></div>`;
        main.appendChild(s); return;
      }

      const sec2 = document.createElement('div');
      sec2.className = 'sec';
      const scroll = document.createElement('div');
      scroll.className = 'tabla-scroll';
      const tabla = document.createElement('table');
      tabla.className = 'tabla-ranking';
      tabla.innerHTML = `
        <thead>
          <tr>
            <th>Pos.</th>
            <th>Unidad</th>
            <th>Nivel</th>
            <th>Disciplina</th>
            <th>Bloque</th>
            <th>J1</th>
            <th>J2</th>
            <th>J3</th>
            <th>Calificación Final</th>
          </tr>
        </thead>
      `;
      const tbody = document.createElement('tbody');

      grupos.forEach((g, i) => {
        const pos = i + 1;
        const medallaHtml = pos === 1 ? `<span class="medalla m1">1°</span>`
          : pos === 2 ? `<span class="medalla m2">2°</span>`
          : pos === 3 ? `<span class="medalla m3">3°</span>`
          : `<span class="medalla mn">${pos}</span>`;

        const jueces = ['juez1','juez2','juez3'];
        const jChips = jueces.map(j => {
          const val = g.jueces && g.jueces[j];
          return `<td>${val != null ? `<span class="chip-j">${Number(val).toFixed(2)}</span>` : '<span class="chip-j pend">—</span>'}</td>`;
        }).join('');

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${medallaHtml}</td>
          <td><strong>${g.unidad}</strong></td>
          <td>${g.nivel}</td>
          <td>${g.disciplina}</td>
          <td>Bloque ${g.bloque}</td>
          ${jChips}
          <td><span class="chip-final">${Number(g.calificacion_final).toFixed(2)}</span></td>
        `;
        tbody.appendChild(tr);
      });

      tabla.appendChild(tbody);
      scroll.appendChild(tabla);
      sec2.appendChild(scroll);
      main.appendChild(sec2);
    } catch (e) { UI.msg(e.message, 'error'); }
  }

  // ── Supervisar un grupo específico en tiempo real ─────────────
  async function supervisarGrupo(grupoId) {
    if (window._supervisarIntervalo) { clearInterval(window._supervisarIntervalo); window._supervisarIntervalo = null; }
    UI.sidebar('grupos');
    UI.loading('main');
    const main = document.getElementById('main');
    const datos = await getDatos();
    const grupo = await Api.grupo(grupoId);
    const jueces = ['juez1','juez2','juez3'];

    main.innerHTML = '';

    const secHdr = document.createElement('div');
    secHdr.className = 'sec';
    const hdrRow = document.createElement('div');
    hdrRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px';
    const hdrLeft = document.createElement('div');
    hdrLeft.innerHTML = `<h2 style="margin:0">Supervisando — ${grupo.unidad}</h2>
      <p style="font-size:12px;color:var(--text-soft);margin-top:4px">${grupo.disciplina} · Bloque ${grupo.bloque}${grupo.nombre_grupo ? ' · ' + grupo.nombre_grupo : ''}</p>`;
    const hdrRight = document.createElement('div');
    hdrRight.style.cssText = 'display:flex;align-items:center;gap:12px';
    const liveBadge = document.createElement('span');
    liveBadge.style.cssText = 'font-size:11px;color:var(--text-soft);background:rgba(46,204,113,.12);padding:4px 12px;border-radius:50px';
    liveBadge.innerHTML = `<span style="display:inline-block;width:7px;height:7px;background:#2ecc71;border-radius:50%;margin-right:5px;vertical-align:middle"></span>En vivo`;
    hdrRight.appendChild(liveBadge);
    hdrRight.appendChild(UI.btn(
      `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Volver`,
      'btn-sec btn-sm', () => {
        if (window._supervisarIntervalo) { clearInterval(window._supervisarIntervalo); window._supervisarIntervalo = null; }
        verPanel();
      }
    ));
    hdrRow.appendChild(hdrLeft);
    hdrRow.appendChild(hdrRight);
    secHdr.appendChild(hdrRow);
    main.appendChild(secHdr);

    // Cards de estado por juez + card final
    const secCards = document.createElement('div');
    secCards.className = 'sec';
    const cardsRow = document.createElement('div');
    cardsRow.className = 'eval-grid';

    jueces.forEach(j => {
      const card = document.createElement('div');
      card.className = 'eval-juez-card pend';
      card.dataset.cardJuez = `${grupoId}-${j}`;
      card.innerHTML = `
        <div class="ej-name">${j.replace('juez','Juez ')}</div>
        <div class="ej-score pend sv-card-score" data-grupo="${grupoId}" data-juez="${j}">Pendiente</div>
      `;
      cardsRow.appendChild(card);
    });

    // ── CARD PROMEDIO FINAL (nueva) ──
    const cardFinal = document.createElement('div');
    cardFinal.className = 'eval-juez-card pend';
    cardFinal.dataset.cardJuez = `${grupoId}-final`;
    cardFinal.innerHTML = `
      <div class="ej-name" style="color:var(--lila);font-weight:800">FINAL</div>
      <div class="ej-score pend sv-card-final" data-grupo="${grupoId}">—</div>
    `;
    cardsRow.appendChild(cardFinal);

    secCards.appendChild(cardsRow);
    main.appendChild(secCards);

    // Tabla de criterios
    const secTabla = document.createElement('div');
    secTabla.className = 'sec';
    secTabla.appendChild(UI.h2('Calificaciones por Criterio'));
    const scroll = document.createElement('div');
    scroll.className = 'tabla-scroll';
    const tabla = document.createElement('table');
    tabla.style.fontSize = '13px';

    let ths = `<th style="width:32px">#</th><th>Criterio</th>`;
    jueces.forEach(j => {
      ths += `<th><span class="sv-dot" data-grupo="${grupoId}" data-juez="${j}" style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;vertical-align:middle;background:#e74c3c;transition:background .3s"></span>${j.replace('juez','Juez ')}</th>`;
    });
    tabla.innerHTML = `<thead><tr>${ths}</tr></thead>`;

    const tbody = document.createElement('tbody');
    datos.criterios.forEach((c, ci) => {
      const tr = document.createElement('tr');
      let tds = `<td style="font-weight:700;color:var(--lila)">${ci+1}</td><td>${c.nombre}</td>`;
      jueces.forEach(j => {
        tds += `<td style="text-align:center"><span class="sv-val" data-grupo="${grupoId}" data-juez="${j}" data-criterio="${c.id}" style="transition:all .2s">—</span></td>`;
      });
      tr.innerHTML = tds;
      tbody.appendChild(tr);
    });

    // Fila de promedios
    const trProm = document.createElement('tr');
    trProm.style.cssText = 'background:rgba(156,127,192,.08)!important';
    let tdsProm = `<td colspan="2" style="text-align:right;font-weight:700;color:var(--lila);font-size:11px;text-transform:uppercase;letter-spacing:.5px">Promedio</td>`;
    jueces.forEach(j => {
      tdsProm += `<td style="text-align:center"><span class="sv-prom chip-j pend" data-grupo="${grupoId}" data-juez="${j}">—</span></td>`;
    });
    trProm.innerHTML = tdsProm;
    tbody.appendChild(trProm);

    tabla.appendChild(tbody);
    scroll.appendChild(tabla);
    secTabla.appendChild(scroll);
    main.appendChild(secTabla);

    // ── Función tick: actualiza DOM en vivo ──
    async function tick() {
      try {
        const evs = await Api.evaluaciones(grupoId);
        jueces.forEach(j => {
          const ev = evs.find(e => e.juez === j);

          const dot = document.querySelector(`.sv-dot[data-grupo="${grupoId}"][data-juez="${j}"]`);
          if (dot) dot.style.background = ev ? '#2ecc71' : '#e74c3c';

          const cardScore = document.querySelector(`.sv-card-score[data-grupo="${grupoId}"][data-juez="${j}"]`);
          const card = document.querySelector(`[data-card-juez="${grupoId}-${j}"]`);
          if (cardScore && card) {
            if (ev) {
              cardScore.textContent = ev.promedio.toFixed(2);
              cardScore.classList.remove('pend');
              card.classList.remove('pend');
            } else {
              cardScore.textContent = 'Pendiente';
              cardScore.classList.add('pend');
              card.classList.add('pend');
            }
          }

          datos.criterios.forEach(c => {
            const el = document.querySelector(`.sv-val[data-grupo="${grupoId}"][data-juez="${j}"][data-criterio="${c.id}"]`);
            if (!el) return;
            if (ev && ev[c.id] != null) {
              el.textContent = Number(ev[c.id]).toFixed(2);
              el.style.fontWeight = '700';
              el.style.color = 'var(--text)';
            } else {
              el.textContent = '—';
              el.style.fontWeight = '';
              el.style.color = 'var(--text-xs)';
            }
          });

          const promEl = document.querySelector(`.sv-prom[data-grupo="${grupoId}"][data-juez="${j}"]`);
          if (promEl) {
            if (ev) { promEl.textContent = ev.promedio.toFixed(2); promEl.classList.remove('pend'); }
            else { promEl.textContent = '—'; promEl.classList.add('pend'); }
          }
        });

        // ── PROMEDIO FINAL (nuevo) ──
        const evsValidos = evs.filter(e => jueces.includes(e.juez));
        const cardFinalEl = document.querySelector(`.sv-card-final[data-grupo="${grupoId}"]`);
        const cardFinalCard = document.querySelector(`[data-card-juez="${grupoId}-final"]`);
        if (cardFinalEl && cardFinalCard) {
          if (evsValidos.length > 0) {
            const pf = +(evsValidos.reduce((a, e) => a + e.promedio, 0) / evsValidos.length).toFixed(2);
            cardFinalEl.textContent = pf.toFixed(2);
            cardFinalEl.classList.remove('pend');
            cardFinalCard.classList.remove('pend');
          } else {
            cardFinalEl.textContent = '—';
            cardFinalEl.classList.add('pend');
            cardFinalCard.classList.add('pend');
          }
        }

      } catch(e) { /* silencioso */ }
    }

    await tick();
    window._supervisarIntervalo = setInterval(tick, 2000);
  }

  return { verPanel, registrarGrupo, verRanking, supervisarGrupo };
})();