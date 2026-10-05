## Context

La máquina de estados (`football-api/src/domain/estado.ts`) es lineal: `programado → en_juego → finalizado`. Ver proposal.md (Why). Estadísticas ya filtran solo `finalizado`, por lo que `suspendido` queda excluido sin cambios.

## Goals / Non-Goals

- Goals: estado terminal visible y atenuado; suspender solo desde `programado` con confirmación; workspace sin acciones en `suspendido`; gol en `suspendido` → 422.
- Non-Goals: reversión/reprogramación (terminal por decisión); suspender desde `en_juego` (congelaría eventos a medio jugar); migración de datos (ningún partido existente usa el estado).

## Decisions

- **Nuevo estado en la máquina, no flag booleano.** `ESTADOS += "suspendido"`, `programado → [en_juego, suspendido]`, `suspendido → []`. Reutiliza validación, schemas, enum de `?estado=` e índice existente sin bifurcar lógica.
- **Guardia de eventos por exclusión.** `eventos.service` hoy rechaza `programado`; pasa a rechazar todo lo que no sea `en_juego`/`finalizado` (cubre `suspendido` y futuros estados). `cambiarEstado`/`pausa` ya exigen sus estados y no cambian.
- **Web: `suspendido` como variante Neutra.** `tonoPorEstado` suma tono neutro; `EstadoBotones` muestra "Suspender" (confirmación inline, mismo patrón que Quitar) solo en `programado` y nada en `suspendido`; `CargaVivo` recibe `estadoPartido` y desactiva filas/agregar/goles cuando es `suspendido` (ofreceGoles ya es falso por construcción; falta bloquear tap y "+ Agregar"); listados atenúan la fila (`opacity-60`).
- **Sin tocar cronómetro ni estadísticas.** El reloj solo vive en `en_juego`; stats filtra `finalizado`. Verificado, no hay ramas que alcancen `suspendido`.

## Risks

- `renderUni` y uniones literales de `EstadoPartido` en tests web deben sumar `"suspendido"`.
- `?estado=` con valor viejo en algún cliente filtraría suspendidos fuera; revisarlo al implementar listados (detalle menor).
