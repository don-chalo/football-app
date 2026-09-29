## Why

El API (football-api + liga-admins-audit) ya existe pero no hay forma usable de ver ligas ni de cargar goles al borde de la cancha desde un celular. Se necesita una SPA responsive mobile-first: público que consulta y planillero que carga goles en 2 taps.

## What Changes

- SPA nueva `acsed-web`: React + Vite + TypeScript + Tailwind + react-router-dom + Radix a demanda. Mobile-first (360px primero), responsive.
- Zona pública sin login: ligas (lista/detalle por formato), partidos (lista/ficha con marcador calculado), tabla por equipo, stats por jugador (goleadores, autogoles, inasistencia), historial A vs B. Filtros liga/copa + fechas (default año en curso, máx 1 año).
- Auto-refresco por polling fijo: ~5s en carga, ~10–15s en vistas públicas; pausa con tab oculta; refresco inmediato tras mutación propia.
- Zona admin con login JWT: home con mis ligas (`misLigas`), gestión de ligas/equipos/jugadores (bulk incluido), creación de partidos, convocatorias (convocado/ausente), carga de goles en 2 taps (jugador → tipo) sin confirmación, minuto opcional, deshacer (toast + lista con `x`), transición de estados, penales mínimo y corrección en finalizado.
- Auditoría Nivel 2 visible: quién creó liga/partido y quién cargó cada gol (datos de `createdBy`).
- Manejo de errores visible por rol y caso (401 login, 403 sin scope, 409 duplicado, 422 validación, error de red con reintento manual — sin reintentos automáticos).

## Capabilities

### New Capabilities
- `publico-ligas`: lista y detalle de ligas/copas por formato.
- `publico-partidos`: lista y ficha de partido con marcador, auto-refresco.
- `publico-estadisticas`: tabla, jugador/goleadores/autogoles, historial + filtros.
- `auth-admin`: login, sesión, home mis ligas, guardas por rol.
- `gestion-catalogos`: CRUD ligas/equipos/jugadores + bulk.
- `gestion-partido`: crear partido, estados, penales, llave, corrección.
- `carga-en-vivo`: convocatorias/ausentes + goles en 2 taps + deshacer + polling 5s.
- `auditoria-visible`: createdBy en ficha y listados de gestión.
- `ux-movil`: mobile-first 360px, targets táctiles, bottom-sheet, estados de envío/error.

### Modified Capabilities
- Ninguna (no hay specs principales; `openspec/specs/` está vacío).

## Impact

- Proyecto nuevo en `acsed-web/` (aún no existe el directorio); no toca `football-api/`.
- **Prerequisito:** change `liga-admins-audit` implementado (scoping, `misLigas`, `createdBy`); sin él, home por admin y auditoría no tienen fuente.
- Sin backend propio: todo dato viene del API; sin websockets (polling).
