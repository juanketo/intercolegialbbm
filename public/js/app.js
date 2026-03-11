// app.js — Controlador principal, login, routing
const App = (() => {

  let usuario = null;

  async function init() {
    try {
      const me = await Api.me();
      if (me.autenticado) {
        usuario = { username: me.username, rol: me.rol };
        postLogin();
      } else {
        renderLogin();
      }
    } catch (e) {
      renderLogin();
    }
  }

  function renderLogin() {
    document.getElementById('nav').style.display = 'none';
    document.body.className = 'login-page';
    const main = document.getElementById('main');
    main.className = 'login-main';
    main.innerHTML = `
      <div class="login-card">

        <!-- Panel izquierdo: logo grande -->
        <div class="login-left">
          <img src="/img/logo.png" alt="Intercolegial 2026" class="login-logo" />
          <p class="login-tagline">Sistema de Evaluación Oficial</p>
        </div>

        <!-- Panel derecho: formulario neumórfico -->
        <div class="login-right">
          <h1 class="login-title">Ingresar</h1>
          <p class="login-sub">Bienvenido al sistema de evaluación</p>

          <div class="login-campo">
            <label for="username">Usuario</label>
            <input type="text" id="username" placeholder="Ingresa tu usuario"
              autocomplete="username" class="login-input" />
          </div>

          <div class="login-campo">
            <label for="password">Contraseña</label>
            <div class="login-pass-wrap">
              <input type="password" id="password" placeholder="Ingresa tu contraseña"
                autocomplete="current-password" class="login-input" />
              <button type="button" class="login-eye" id="btn-eye" tabindex="-1" aria-label="Mostrar contraseña">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <p id="login-error" class="login-error"></p>
          <button id="btn-login" class="login-btn-primary">Sign In</button>
        </div>

      </div>
    `;

    // Toggle mostrar/ocultar contraseña
    document.getElementById('btn-eye').addEventListener('click', () => {
      const inp = document.getElementById('password');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });

    const btnLogin = document.getElementById('btn-login');
    const doLogin = async () => {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const errEl = document.getElementById('login-error');
      errEl.textContent = '';
      try {
        const res = await Api.login(username, password);
        usuario = { username: res.username, rol: res.rol };
        postLogin();
      } catch (e) {
        errEl.textContent = e.message;
      }
    };
    btnLogin.addEventListener('click', doLogin);
    document.getElementById('password').addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });
  }

  function postLogin() {
    document.body.className = '';
    const main = document.getElementById('main');
    main.className = '';
    // Asegurar que el sidebar esté oculto para jueces
    UI.hideSidebar();
    UI.nav(usuario);
    if (usuario.rol === 'admin') {
      Admin.verPanel();
    } else {
      Juez.verBloques();
    }
  }

  async function logout() {
    if (window._supervisarIntervalo) { clearInterval(window._supervisarIntervalo); window._supervisarIntervalo = null; }
    try { await Api.logout(); } catch (e) {}
    usuario = null;
    UI.hideSidebar();
    renderLogin();
  }

  return {
    init,
    logout,
    get usuario() { return usuario; }
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
