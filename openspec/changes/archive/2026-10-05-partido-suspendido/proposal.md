## Why

Un partido `programado` que no se va a jugar (lluvia, cancha no disponible) hoy solo puede eliminarse o quedar eternamente pendiente en el fixture. Suspenderlo lo marca como terminal y visible, sin contaminar estadísticas ni permitir iniciarlo por error.

## What Changes

- Nuevo estado terminal `suspendido`: solo desde `programado` (`programado → suspendido`, sin salida); `suspendido` no admite ninguna transición.
- API: `ESTADOS` + máquina (`estado.ts`), `estadoSchema` y enum de `?estado=`, enum del modelo; gol en `suspendido` → 422 (espejo de `programado`); iniciar/pausar ya exigen `en_juego`, sin cambios; estadísticas sin cambios (ya filtran solo `finalizado`, lo que excluye suspendidos de equipos y jugadores).
- Web: `EstadoPartido` + botón "Suspender" (con confirmación inline, junto a "Poner en juego") solo en `programado`; badge con tono neutro; fixture y listados muestran suspendidos atenuados; tarjeta unificada visible pero sin acciones (filas no abren sheet, sin "+ Agregar", sin goles); cronología colapsada; "Poner en juego" no existe en `suspendido`.
- Tests API (transición, terminal, gol 422) y web (suspender con confirmación, badge, lista atenuada, sin acciones, exclusión de goles).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `partidos`: el modelo admite estado `suspendido`; transiciones `programado → en_juego | suspendido`, `suspendido` terminal.
- `gestion-partido`: suspender desde `programado` con confirmación; workspace en `suspendido` sin acciones.
- `eventos`: gol en `suspendido` → 422.

## Impact

- `football-api`: `domain/types`, `domain/estado`, schemas, modelo, `eventos.service` (guardia), tests.
- `acsed-web`: tipos, `EstadoBotones`, `tonoPorEstado`, listados/badge atenuado, `CargaVivo` (sin acciones en `suspendido`), tests.
- Sin migración de datos (ningún partido existente usa el nuevo estado).
