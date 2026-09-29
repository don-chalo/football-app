# football-api

API REST para ligas barriales de futbol. TypeScript + Express + Mongoose (MongoDB) + JWT. Desarrollado con Opencode y Openspec. Lectura pública, escritura solo administradores. Ver `../openspec/specs/` (contrato vigente).

## Requisitos

Node 20+, MongoDB en `MONGODB_URI`.

## Puesta en marcha

```bash
cp .env.example .env   # ver Variables de entorno
npm install
npm run typecheck
npm run lint
npm run test:unit
npm run seed           # datos barriales minimos (ver salida: liga + partido)
npm run dev            # o npm run build && npm start
```

## Variables de entorno

| Variable | Default | Uso |
|---|---|---|
| `PORT` | `3000` | puerto del servidor |
| `MONGODB_URI` | `mongodb://localhost:27017/football-api` | conexión MongoDB |
| `JWT_SECRET` | (secret de dev) | firma de tokens; **cambiar en producción** |
| `JWT_EXPIRES_IN` | `12h` | duración del token |
| `CORS_ORIGIN` | `http://localhost:5173` | orígenes web permitidos, separados por coma |


## Roles

| Rol | Puede |
|---|---|
| anonimo | todos los `GET` |
| `admin_partidos` | `POST/PUT/PATCH/DELETE` en **sus ligas asignadas** (ligas, partidos, convocatorias, eventos) + equipos/jugadores globales |
| `admin_usuarios` | todo lo anterior en **todas** las ligas + CRUD `/usuarios` + asignaciones |

## Endpoints

| Metodo | Ruta | Acceso | Descripcion |
|---|---|---|---|
| GET | `/health` | público | healthcheck |
| POST | `/auth/login` | público | login JWT |
| GET/POST | `/usuarios` | admin de usuarios | CRUD usuarios (sin `passwordHash` en respuestas) |
| GET/PUT/PATCH/DELETE | `/usuarios/:id` | admin de usuarios | |
| GET/POST | `/ligas` | GET público / POST admin de partidos | `{nombre, formato: liga\|copa, idaVuelta?}` (idaVuelta solo copa) |
| GET/PUT/PATCH/DELETE | `/ligas/:id` | GET público / escritura admin de partidos (solo sus ligas) | |
| GET/POST | `/equipos` | GET público / escritura admin de partidos | `{nombre}` único insensible a mayúsculas |
| GET/PUT/PATCH/DELETE | `/equipos/:id` | GET público / escritura admin de partidos | |
| GET/POST | `/jugadores` | GET público / escritura admin de partidos | `{nombre}` único insensible a mayúsculas |
| POST | `/jugadores/bulk` | admin de partidos | `{nombres: [...]}` -> `{creados, errores}` parcial |
| GET/PUT/PATCH/DELETE | `/jugadores/:id` | GET público / escritura admin de partidos | |
| GET/POST | `/partidos[?ligaId=&estado=]` | GET público / POST admin de partidos (solo sus ligas) | `{ligaId, localId, visitaId, fecha, fase?, idaDe?}`; `estado` default `programado` |
| GET | `/partidos/:id` | público | detalle + `marcador` calculado + convocatorias + eventos (con `createdBy`) |
| GET | `/ligas/:id/admins` | admin de usuarios | asignaciones de la liga |
| POST | `/ligas/:id/admins` | admin de usuarios | `{userId}` → 201 |
| DELETE | `/ligas/:id/admins/:userId` | admin de usuarios | 204 (422 si es el último) |
| PUT/PATCH | `/partidos/:id` | admin de partidos (solo sus ligas) | `fecha, fase, idaDe, penalesLocal, penalesVisita, clasificadoId` |
| PATCH | `/partidos/:id/estado` | admin de partidos (solo sus ligas) | `{estado}`: `programado->en_juego->finalizado`, nunca a `programado` |
| DELETE | `/partidos/:id` | admin de partidos (solo sus ligas) | |
| GET/POST | `/partidos/:id/convocatorias` | GET público / POST admin de partidos (solo sus ligas) | `{jugadorId, equipoId}` default `convocado`; un jugador, un equipo |
| PATCH/DELETE | `/convocatorias/:id` | admin de partidos (solo sus ligas) | `{estado: convocado\|ausente}` |
| GET/POST | `/partidos/:id/eventos` | GET público / POST admin de partidos (solo sus ligas) | `{jugadorId, equipoId, tipo: gol\|autogol\|penal, minuto?, metadata?}`; solo en `en_juego` (correccion en `finalizado`), solo convocados presentes |
| PATCH/DELETE | `/eventos/:id` | admin de partidos (solo sus ligas) | correccion |
| GET | `/estadisticas/equipos?liga_ids=&desde=&hasta=` | público | PJ/PG/PE/PP/GF/GC/Dif/Pts (3/1/0), orden Pts/Dif/GF |
| GET | `/estadisticas/jugadores?...&equipo_id=&partido_id=` | público | PJ/PG/PE/PP, goles, autogoles, convocados, ausentes, %inasistencia, jugados |
| GET | `/estadisticas/enfrentamientos?equipo_a=&equipo_b=&...` | público | PJ, ganA, emp, ganB, GF, lista partidos |

## Ejemplos (contra seed)

```bash
TOKEN=$(curl -s -X POST localhost:3000/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"super","password":"super123"}' | node -e "console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).token)")
curl localhost:3000/ligas
curl -X POST localhost:3000/ligas -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"nombre":"Copa Verano","formato":"copa","idaVuelta":true}'
curl 'localhost:3000/estadisticas/equipos'
curl 'localhost:3000/estadisticas/jugadores'
```

> Nota: con `jq` el token se extrae así: `TOKEN=$(curl -s -X POST ... | jq -r .token)`. El login devuelve además `misLigas` (ligas asignadas al admin) y el detalle de partido incluye `createdBy {userId, username}` en liga, convocatorias y eventos.

## Estructura (capas)

`src/http` (routes/controllers, schemas zod, middleware) -> `src/services` (casos de uso, lanzan `HttpError`) ->
`src/repositories` (interfaces + Mongoose) + `src/models` (schemas) · `src/domain` (funciones puras: marcador/strategy por tipo,
maquina de estados, tabla, jugadores, historial, rangos) con gate de cobertura 80% (`npm run test:unit`).
