## Why

El detalle público del partido muestra marcador, goleadores y cronología, pero no la convocatoria. Los visitantes no pueden ver qué jugadores fueron citados por cada equipo sin entrar al flujo administrativo.

## What Changes

- El detalle público del partido incluirá una Card `Convocatoria` ubicada sobre la Card `Goleadores`.
- La convocatoria mostrará dos columnas: equipo local y equipo visitante.
- Cada columna mostrará el nombre del equipo y sus jugadores convocados.
- Los jugadores ausentes seguirán visibles, atenuados y marcados como ausentes.
- Si un equipo no tiene convocados, su columna indicará que no hay jugadores.
- Si el partido no tiene convocatoria, la Card indicará que no hay convocatoria cargada.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `publico-partidos`: la ficha pública del partido ahora incluye la convocatoria por equipo.

## Impact

- Frontend: cambios concentrados en `PartidoPage` y sus pruebas.
- API y backend: sin cambios previstos; el detalle ya incluye convocatorias.
- Accesibilidad móvil: las columnas deberán permitir el ajuste de nombres sin desplazamiento horizontal.
