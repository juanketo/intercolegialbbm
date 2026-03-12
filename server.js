// server.js — Backend Node.js + Express + lowdb
const express = require('express');
const session = require('express-session');
const path    = require('path');
const db      = require('./db/init');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'intercolegial-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

// ── Auth guards ───────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'No autenticado' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.rol !== 'admin')
    return res.status(403).json({ error: 'Solo el administrador puede hacer esto' });
  next();
}
function requireJuez(req, res, next) {
  if (!req.session.user || req.session.user.rol !== 'juez')
    return res.status(403).json({ error: 'Solo los jueces pueden evaluar' });
  next();
}

// ── AUTH ──────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.get('usuarios').find({ username, password }).value();
  if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  req.session.user = { id: user.id, username: user.username, rol: user.rol };
  res.json({ ok: true, rol: user.rol, username: user.username });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.json({ autenticado: false });
  res.json({ autenticado: true, ...req.session.user });
});

// ── GRUPOS ────────────────────────────────────────────────────
app.get('/api/bloques', requireAuth, (req, res) => {
  const grupos = db.get('grupos').value();
  const bloques = [...new Set(grupos.map(g => g.bloque))].sort((a, b) => a - b);
  res.json(bloques);
});

app.get('/api/grupos', requireAuth, (req, res) => {
  const { bloque } = req.query;
  let grupos = db.get('grupos').value();
  if (bloque) grupos = grupos.filter(g => String(g.bloque) === String(bloque));
  res.json(grupos);
});

app.get('/api/grupos/:id', requireAuth, (req, res) => {
  const grupo = db.get('grupos').find({ id: parseInt(req.params.id) }).value();
  if (!grupo) return res.status(404).json({ error: 'Grupo no encontrado' });
  res.json(grupo);
});

app.post('/api/grupos', requireAdmin, (req, res) => {
  const { bloque, unidad, nivel, disciplina, participantes, nombre_grupo } = req.body;
  if (!bloque || !unidad || !nivel || !disciplina || !participantes)
    return res.status(400).json({ error: 'Faltan campos obligatorios' });

  const id = db.get('_nextGrupoId').value();
  db.set('_nextGrupoId', id + 1).write();

  const grupo = { id, bloque: parseInt(bloque), unidad, nivel, disciplina, participantes: parseInt(participantes), nombre_grupo: nombre_grupo || '' };
  db.get('grupos').push(grupo).write();
  res.json({ ok: true, id });
});

app.delete('/api/grupos/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  db.get('grupos').remove({ id }).write();
  db.get('evaluaciones').remove({ grupo_id: id }).write();
  res.json({ ok: true });
});

// ── EVALUACIONES ──────────────────────────────────────────────
app.get('/api/evaluaciones/:grupoId', requireAuth, (req, res) => {
  const grupo_id = parseInt(req.params.grupoId);
  const evals = db.get('evaluaciones').filter({ grupo_id }).value();
  res.json(evals);
});

app.post('/api/evaluaciones', requireJuez, (req, res) => {
  const { grupo_id, criterios } = req.body;
  const juez = req.session.user.username;

  const campos = ['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10'];
  for (const c of campos) {
    const val = parseFloat(criterios[c]);
    if (isNaN(val) || val < 8.00 || val > 10.00)
      return res.status(400).json({ error: `Valor inválido en ${c}: debe estar entre 8.00 y 10.00` });
  }

  const vals = {};
  campos.forEach(c => { vals[c] = parseFloat(parseFloat(criterios[c]).toFixed(2)); });
  const promedio = +(Object.values(vals).reduce((a, b) => a + b, 0) / campos.length).toFixed(2);

  // Upsert
  const existing = db.get('evaluaciones').find({ grupo_id: parseInt(grupo_id), juez }).value();
  if (existing) {
    db.get('evaluaciones')
      .find({ grupo_id: parseInt(grupo_id), juez })
      .assign({ ...vals, promedio, fecha: new Date().toISOString() })
      .write();
  } else {
    const id = db.get('_nextEvalId').value();
    db.set('_nextEvalId', id + 1).write();
    db.get('evaluaciones').push({
      id, grupo_id: parseInt(grupo_id), juez, ...vals, promedio,
      fecha: new Date().toISOString()
    }).write();
  }

  res.json({ ok: true, promedio });
});

// ── RANKING ───────────────────────────────────────────────────
app.get('/api/ranking', requireAuth, (req, res) => {
  const { bloque } = req.query;
  let grupos = db.get('grupos').value();
  if (bloque) grupos = grupos.filter(g => String(g.bloque) === String(bloque));

  const evals = db.get('evaluaciones').value();

  const resultado = grupos
    .map(g => {
      const gEvals = evals.filter(e => e.grupo_id === g.id);
      if (gEvals.length === 0) return null;
      const cf = +(gEvals.reduce((a, e) => a + e.promedio, 0) / gEvals.length).toFixed(2);
      // Incluir detalle de cada juez
      const jueces = {};
      gEvals.forEach(e => { jueces[e.juez] = +e.promedio.toFixed(2); });
      return { ...g, num_evaluaciones: gEvals.length, calificacion_final: cf, jueces };
    })
    .filter(Boolean)
    .sort((a, b) => b.calificacion_final - a.calificacion_final);

  res.json(resultado);
});

// Endpoint público para la pantalla OBS (sin auth requerida)
app.get('/api/ranking-obs', (req, res) => {
  const { bloque } = req.query;
  let grupos = db.get('grupos').value();
  if (bloque) grupos = grupos.filter(g => String(g.bloque) === String(bloque));

  const evals = db.get('evaluaciones').value();

  const resultado = grupos
    .map(g => {
      const gEvals = evals.filter(e => e.grupo_id === g.id);
      if (gEvals.length === 0) return null;
      const cf = +(gEvals.reduce((a, e) => a + e.promedio, 0) / gEvals.length).toFixed(2);
      const jueces = {};
      gEvals.forEach(e => { jueces[e.juez] = +e.promedio.toFixed(2); });
      return { ...g, num_evaluaciones: gEvals.length, calificacion_final: cf, jueces };
    })
    .filter(Boolean)
    .sort((a, b) => b.calificacion_final - a.calificacion_final);

  res.json(resultado);
});

// ── DATOS ESTÁTICOS ───────────────────────────────────────────
const DATOS = {
  unidades: [
    "Aragón","Balbuena","Camarones","Centro Sur","Chile Ñuñoa","Coapa",
    "Coyoacán MAQ","Cuernavaca","Cumbres Mty","Del Valle Norte","Del Valle Sur",
    "División del Norte","El Refugio","Esmeralda","Hueso","Izcalli","Iztapalapa",
    "Lerma","Lindavista","Lomas Estrella","Lomas Verdes","Metepec","Mundo E",
    "Neza Golondrinas","Ojo de Agua","Pasaje Ferrería","Playa del Carmen",
    "Plaza Cascada","Plaza Q Hgo","Plaza Santín","Real de Minas Hgo","San Bernabé",
    "San Pedro de los Pinos","Satélite","Tepepan","Tepeyac","Texcoco","Xochimilco",
    "Zacatecas","Zapopan Jardín Real","Zapopan Solares","Zinacantepec"
  ],
  niveles: ["Mini","Baby","Kids","Primary 1","Primary 2"],
  disciplinas: [
    "Ballet","Hip Hop","Danzas Polinesias","Jazz","Danza Árabe","Ritmos Latinos",
    "Flamenco","Mexidanza","Cheer Poms","Gimnasia Rítmica","Tae Kwon Do",
    "Danza Aérea","Capoeira","Yoga Hip-Hop Funk","Break Dance","Electronic Dance",
    "Danza Clásica","Shark Kids Dancer"
  ],
  criterios: [
    { id:"c1",  nombre:"Técnica Corporal" },
    { id:"c2",  nombre:"Precisión Rítmica" },
    { id:"c3",  nombre:"Expresión Facial y Conexión" },
    { id:"c4",  nombre:"Uso del Espacio" },
    { id:"c5",  nombre:"Fluidez y Control" },
    { id:"c6",  nombre:"Proyección Escénica" },
    { id:"c7",  nombre:"Interpretación Artística" },
    { id:"c8",  nombre:"Dificultad de la Coreografía" },
    { id:"c9",  nombre:"Limpieza de Ejecución" },
    { id:"c10", nombre:"Imagen y Estética" }
  ]
};

app.get('/api/datos', requireAuth, (req, res) => res.json(DATOS));

// Endpoint público para OBS — obtener datos básicos de un grupo sin auth
app.get('/api/grupos-obs/:id', (req, res) => {
  const grupo = db.get('grupos').find({ id: parseInt(req.params.id) }).value();
  if (!grupo) return res.status(404).json({ error: 'Grupo no encontrado' });
  res.json(grupo);
});

// ── OBS RESULTS PAGE ─────────────────────────────────────────
app.get('/obs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'obs.html'));
});

app.get('/tabla-general', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tabla-general.html'));
});

// ── SPA fallback ──────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✓ Servidor corriendo en http://localhost:${PORT}`);
  console.log('  Usuarios: juez1/juez1  juez2/juez2  juez3/juez3  admin/admin\n');
});
