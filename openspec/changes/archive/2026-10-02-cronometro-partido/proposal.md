## Why

Hoy no hay noción de tiempo de juego: los goles llevan minuto manual u opcional, y si se refresca la página en cancha se pierde toda referencia del minuto actual. Un cronómetro anclado en el servidor (con pausa) permite mostrar el tiempo en vivo, sobrevivir refreshes y registrar el minuto de cada gol automáticamente.

## What Changes

- `football-api`: `Partido` suma `inicioEn`, `pausaDesde`, `pausaAcumSeg`, `finEn` (todos null/0 al crear); `cambiarEstado` a `en_juego` setea `inicioEn` (solo si es null) y a `finalizado` setea `finEn`; nuevo `POST /partidos/:id/pausa {pausada}` (solo en `en_juego`); el detalle expone los 4 campos.
- "Poner en juego" solo posterior a fecha+hora del partido: botón deshabilitado con aviso "Disponible desde ..." en web **y** rechazo 400 en API si se intenta antes.
- `acsed-web`: hook `useCronometro` (minuto derivado de campos del servidor, tick local 1s, re-ancla con polling); Card "Cronómetro" sobre la tarjeta unificada, visible solo en `en_juego` (corriendo: tiempo + badge pulsante + Pausar; pausado: tiempo congelado + Reanudar; en `finalizado` se oculta).
- Minuto automático: con cronómetro corriendo el sheet muestra "Minuto: N' (auto)" y lo envía sin campo de texto; en pausa o `finalizado` se mantiene el campo "Minuto (opcional)" actual.
- "Fecha de juego" sin segundos (`02/10/2026 16:05`) en `PartidoPage` y `PartidoManagePage` vía helper `formatoFechaCorta` compartido.
- Inicio y fin en **ambas** cronologías (pública y gestión): primer ítem "Inicio HH:MM", último "Fin HH:MM · N'" (minuto de juego derivado en frontend, sin costo extra); si `finEn` es null (partidos viejos) se muestra "Fin" sin hora.
- Tests API (transiciones, pausa, gating por fecha) y web (hook, card, auto/manual, cronología).

## Capabilities

### New Capabilities

- `cronometro`: cronómetro de partido anclado en servidor con pausa, minuto automático en goles e hitos inicio/fin en cronología.

### Modified Capabilities

- `gestion-partido`: transiciones registran `inicioEn`/`finEn`; iniciar exige fecha+hora pasada (botón deshabilitado + 400 en API).
- `carga-en-vivo`: minuto automático cuando el cronómetro corre, manual en pausa/corrección.

## Impact

- `football-api`: modelo `Partido`, servicio/rutas de partidos y pausa, specs del dominio partidos.
- `acsed-web`: `PartidoManagePage.tsx`, `CargaVivo.tsx`, `PartidoPage.tsx`, nuevo hook `useCronometro` (+ servicio `partidos.pausa` y helper de fecha), tests.
- Se apoya sobre el layout del change `convocatoria-unificada` (implementar ese primero).
