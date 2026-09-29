## Why

El API actual tiene admins globales (un admin_partidos escribe en todas las ligas) y no guarda quién hizo qué. La web acsed-web necesita admins por liga/copa y auditoría visible de quién creó ligas/partidos y cargó goles. Este change es prerequisito de acsed-web.

## What Changes

- Nueva entidad `Asignacion` N:M entre `admin_partidos` (0..N ligas) y ligas (1..N admins).
- Scoping de escritura: `admin_partidos` solo escribe (ligas, partidos, equipos? no — ver abajo, convocatorias, eventos) dentro de SUS ligas; `admin_usuarios` (sistema) sigue global.
- `POST /auth/login` devuelve `misLigas` (ids de ligas asignadas; todas para admin_usuarios).
- CRUD de asignaciones solo para `admin_usuarios` (`POST/DELETE /ligas/:id/admins`).
- Backfill: los `admin_partidos` existentes quedan asignados a todas las ligas existentes.
- Regla 1..N: **422** al quitar el último admin de una liga; al crear una liga el creador queda auto-asignado.
- Auditoría Nivel 2: `createdBy {userId, username}` (snapshot) en liga, partido, convocatoria y evento; expuesto en lectura (detalle/ficha). Timestamps ya existen.
- **BREAKING**: `admin_partidos` con 0 ligas no puede escribir (antes podía todo); respuestas de login y detalle incluyen campos nuevos (`misLigas`, `createdBy`).

## Capabilities

### New Capabilities
- `asignaciones`: N:M admin↔liga, CRUD asignaciones, scoping de writes, login con misLigas, backfill, auto-asignación al crear liga, mínimo 1 admin.
- `auditoria`: createdBy snapshot en liga/partido/convocatoria/evento y exposición en lectura.

### Modified Capabilities
- Ninguna (no hay specs principales; `openspec/specs/` está vacío).

## Impact

- Código: `football-api/src` (auth middleware + `requireLigaAccess`, login, rutas de asignaciones, `createdBy` en modelos/servicios/lecturas, migración backfill). Tests y matriz de permisos se extienden.
- Los equipos/jugadores son globales (no pertenecen a liga): su CRUD sigue global para ambos roles; el scoping aplica a ligas, partidos, convocatorias y eventos.
- La web acsed-web consume `misLigas` (home del admin) y `createdBy` (ficha con "quién cargó qué").
