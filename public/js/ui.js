// ui.js — Helpers de interfaz compartidos
const UI = (() => {

  function limpiar(id) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
    return el;
  }

  function msg(texto, tipo) {
    const el = document.getElementById('msg');
    if (!el) return;
    el.textContent = texto;
    el.className = tipo === 'error' ? 'error' : '';
    el.style.display = 'block';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.display = 'none'; }, 3500);
  }

  // Nav: solo muestra el nombre (sin rol entre paréntesis)
  function nav(user) {
    const navEl = document.getElementById('nav');
    if (!navEl) return;
    navEl.style.display = 'flex';
    navEl.innerHTML = `
      <div class="nav-logo-wrap">
        <img src="/img/logo.png" alt="Intercolegial 2026" class="nav-logo-img"
          onerror="this.style.display='none'" />
        <div class="nav-titulo">
          Intercolegial
          <span>Baby Ballet 2026</span>
        </div>
      </div>
      <div class="nav-info">
        <div class="nav-user-badge ${user.rol === 'admin' ? 'admin' : ''}">
          <span class="rol-dot"></span>
          ${user.username}
        </div>
        <button class="btn-nav-salir" onclick="App.logout()">Salir</button>
      </div>
    `;
  }

  // Sidebar solo para admin
  function sidebar(activo) {
    const sb = document.getElementById('sidebar');
    if (!sb) return;
    sb.style.display = 'flex';
    sb.innerHTML = `
      <div class="sb-label">Panel Admin</div>
      <button class="sb-btn ${activo === 'grupos' ? 'on-acc' : ''}" onclick="Admin.verPanel()">
        <span class="sb-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></span> Grupos
      </button>
      <button class="sb-btn ${activo === 'registro' ? 'on-acc' : ''}" onclick="Admin.registrarGrupo()">
        <span class="sb-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></span> Registrar Grupo
      </button>
      <div class="sb-label">Resultados</div>
      <button class="sb-btn ${activo === 'ranking' ? 'on-lila' : ''}" onclick="Admin.verRanking(null)">
        <span class="sb-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></span> Ranking General
      </button>
    `;
  }

  function hideSidebar() {
    const sb = document.getElementById('sidebar');
    if (sb) sb.style.display = 'none';
  }

  function loading(contenedor) {
    const el = document.getElementById(contenedor) || document.getElementById('main');
    if (el) el.innerHTML = `
      <div class="loading-wrap">
        <div class="spinner"></div>
        <p style="color:var(--text-soft);font-size:13px">Cargando...</p>
      </div>
    `;
  }

  function sel(id, etiqueta, opciones) {
    const wrap = document.createElement('div');
    wrap.className = 'campo';
    wrap.innerHTML = `<label for="${id}">${etiqueta}</label>`;
    const s = document.createElement('select');
    s.id = id;
    s.innerHTML = `<option value="">— ${etiqueta} —</option>`;
    opciones.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o; opt.textContent = o;
      s.appendChild(opt);
    });
    wrap.appendChild(s);
    return wrap;
  }

  function btn(texto, cls, onclick) {
    const b = document.createElement('button');
    b.innerHTML = texto;
    if (!cls || cls === '') b.className = 'btn-app';
    else if (cls === 'btn-sec') b.className = 'btn-sec';
    else b.className = cls;
    if (onclick) b.addEventListener('click', onclick);
    return b;
  }

  function h2(texto) {
    const h = document.createElement('h2');
    h.textContent = texto;
    return h;
  }

  return { limpiar, msg, nav, sidebar, hideSidebar, loading, sel, btn, h2 };
})();
