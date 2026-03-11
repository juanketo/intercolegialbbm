// api.js — Todas las llamadas al backend
const Api = (() => {

  async function req(method, url, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error del servidor');
    return data;
  }

  return {
    login:       (username, password) => req('POST', '/api/login', { username, password }),
    logout:      ()                   => req('POST', '/api/logout'),
    me:          ()                   => req('GET',  '/api/me'),
    datos:       ()                   => req('GET',  '/api/datos'),
    bloques:     ()                   => req('GET',  '/api/bloques'),
    grupos:      (bloque)             => req('GET',  `/api/grupos${bloque ? '?bloque='+bloque : ''}`),
    grupo:       (id)                 => req('GET',  `/api/grupos/${id}`),
    crearGrupo:  (data)               => req('POST', '/api/grupos', data),
    eliminarGrupo:(id)                => req('DELETE',`/api/grupos/${id}`),
    evaluaciones:(grupoId)            => req('GET',  `/api/evaluaciones/${grupoId}`),
    guardarEval: (data)               => req('POST', '/api/evaluaciones', data),
    ranking:     (bloque)             => req('GET',  `/api/ranking${bloque ? '?bloque='+bloque : ''}`)
  };
})();
