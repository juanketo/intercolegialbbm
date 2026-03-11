# Concurso de Danza — Sistema de Evaluación con Backend

Sistema web para evaluar grupos de danza. 3 jueces califican simultáneamente desde sus teléfonos.

## Requisitos

- Node.js 16 o superior

## Instalación y ejecución

```bash
npm install
npm start
```

Accede en: **http://localhost:3000**

## Usuarios predefinidos

| Usuario | Contraseña | Rol   |
|---------|-----------|-------|
| juez1   | juez1     | Juez  |
| juez2   | juez2     | Juez  |
| juez3   | juez3     | Juez  |
| admin   | admin     | Admin |

## Estructura del proyecto

```
concurso-evaluacion/
├── server.js              ← Backend Express (API REST)
├── package.json
├── db/
│   ├── init.js            ← Inicialización de base de datos (lowdb)
│   └── concurso.json      ← Base de datos JSON (se crea al iniciar)
└── public/
    ├── index.html
    ├── css/styles.css
    └── js/
        ├── api.js         ← Llamadas al backend
        ├── ui.js          ← Helpers de interfaz
        ├── juez.js        ← Flujo del juez
        ├── admin.js       ← Panel administrador
        └── app.js         ← Login y controlador principal
```

## Flujo del Juez

1. Login → Ver bloques → Seleccionar bloque
2. Ver lista de grupos con estado de evaluaciones (J1 J2 J3)
3. Evaluar: 10 criterios entre 8.00 y 10.00
4. Guardar → regresa a la lista del bloque

## Flujo del Administrador

1. Login con `admin`
2. Registrar grupos (bloque, unidad, nivel, disciplina, participantes)
3. Ver ranking: solo muestra **posición** y **unidad** (sin calificaciones)

## Cálculo

- Promedio del juez = suma de 10 criterios ÷ 10
- Calificación final = promedio de los promedios de los 3 jueces
- Todo redondeado a 2 decimales

## Uso en red local (concurso real)

1. Conecta la computadora a la red WiFi del lugar
2. Obtén la IP local:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` o `ip addr`
3. Los jueces acceden desde sus teléfonos: `http://192.168.x.x:3000`

## Borrar todos los datos

Elimina el archivo `db/concurso.json` y reinicia el servidor.
Los usuarios se recrean automáticamente.
