## 1. Backend (`football-api`)

- [x] 1.1 Agregar `"suspendido"` a `ESTADOS`/`EstadoPartido`, máquina (`programado → en_juego | suspendido`, `suspendido → []`), `estadoSchema` + enum de `?estado=`, enum del modelo; guardia de eventos por exclusión (solo `en_juego`/`finalizado`); tests (transición, terminal, gol 422) y gates del API.
- [x] 1.2 Verificar que estadísticas, pausa y cronómetro no alcanzan `suspendido` (sin cambios esperados) con los tests existentes en verde.

## 2. Frontend (`acsed-web`)

- [x] 2.1 `EstadoPartido` + tono neutro en `tonoPorEstado`; botón "Suspender" con confirmación inline solo en `programado`; `CargaVivo` sin acciones en `suspendido` (filas no abren sheet, sin "+ Agregar"); listados con fila atenuada y badge.
- [x] 2.2 Tests web (suspender con confirmación, badge neutro, lista atenuada, sin acciones en `suspendido`, union `"suspendido"` en helpers) y gates `npm run typecheck`, `npm run lint`, `npm test -- --run`, `npm run build` en `acsed-web`.
