# acsed-web

SPA para ligas barriales (consume `football-api`). React + Vite + TypeScript + Tailwind + react-router-dom + Radix (Dialog). Mobile-first (360px).

## Requisitos

Node 20+. API corriendo (`VITE_API_URL`) con seed (`super/super123`, `plan/plan1234`).

## Puesta en marcha

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm install
npm run typecheck
npm run lint
npm run test
npm run dev            # http://localhost:5173
npm run build          # dist/ para el servidor web
```

## Variables de entorno

| Variable | Default | Uso |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | base del API |

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/`, `/ligas`, `/ligas/:id` | público | ligas, tabs Partidos/Tabla\|Llaves/Jugadores |
| `/partidos/:id` | público | ficha + marcador, polling 12s |
| `/estadisticas` | público | tabla, goleadores, duelo; filtros año/liga |
| `/login` | público | JWT → `/admin` |
| `/admin` | admin | mis ligas (`misLigas`; vacío si 0), accesos |
| `/admin/gestion` | admin | CRUD ligas/equipos/jugadores + bulk + usuarios/asignaciones (sistema) |
| `/admin/ligas/:id` | admin | partidos de la liga |
| `/admin/partidos/nuevo` | admin | alta (liga de mis ligas, local≠visita) |
| `/admin/partidos/:id` | admin | convocados/ausentes, goles 2 taps, estados, penales |

## Polling

Carga 5s, público 10–15s, pausa con tab oculta, refresh inmediato tras mutación propia. Sin websockets ni reintentos automáticos: los errores muestran mensaje + reintento manual.

## Roles (reflejo del API)

Anónimo ve todo lo público. `admin_partidos` opera solo sus ligas (403 si no). `admin_usuarios` gestiona usuarios y asignaciones. Auditoría `createdBy` visible en fichas ("sin registro" en legacy).

## Estructura

`pages/` (rutas) → `components/` (UI + `CargaVivo`) → `hooks/` (`usePolling`, `useNombres`) → `api/` (cliente tipado + `ApiError`) + `auth/` (sesión, guardas). Tests: polling, cliente, sesión, guardas, flujo 2 taps (`CargaVivo.test.tsx`).
