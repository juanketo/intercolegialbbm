// db/init.js — Base de datos usando lowdb (JSON file, puro JavaScript)
const low  = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const DB_PATH = path.join(__dirname, 'concurso.json');
const adapter = new FileSync(DB_PATH);
const db = low(adapter);

// Estructura inicial
db.defaults({
  usuarios: [
    { id: 1, username: 'juez1', password: 'juez1', rol: 'juez' },
    { id: 2, username: 'juez2', password: 'juez2', rol: 'juez' },
    { id: 3, username: 'juez3', password: 'juez3', rol: 'juez' },
    { id: 4, username: 'admin', password: 'admin', rol: 'admin' }
  ],
  grupos: [],
  evaluaciones: [],
  _nextGrupoId: 1,
  _nextEvalId: 1
}).write();

console.log('Base de datos inicializada:', DB_PATH);

module.exports = db;
