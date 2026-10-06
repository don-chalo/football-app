## Why

Agregar jugadores a la convocatoria se hace de a uno: cada jugador cuesta abrir la sheet, buscar, tocar y esperar un POST + refetch. Armar una convocatoria típica (10+ jugadores) son 10+ interacciones, doloroso en cancha con red inestable. Este cambio lo reduce a una sola interacción por equipo.

## What Changes

- La sheet "+ Agregar jugador" permite selección múltiple con toggle visual (color + check + `aria-pressed`) en vez de agregar al primer toque.
- La sheet suma un input que filtra los jugadores por nombre; la lista scrollea (`max-h` + overflow) con el botón siempre visible.
- El botón "Agregar (N)" muestra el conteo de seleccionados, deshabilitado con 0; hace un único request bulk, muestra toast de confirmación, cierra la sheet y refresca una sola vez.
- El endpoint de convocatoria acepta un lote `{ equipoId, jugadorIds[] }` (tope por request, ej. 30); los duplicados por carrera se saltan y la respuesta devuelve `{ creados, omitidos }`.
- Sin validación de pertenencia jugador-equipo: los jugadores no tienen equipo fijo (pueden jugar para un equipo un partido y para el rival el siguiente); la única invariante es un jugador, un equipo por partido (ya existe: índice único + 422).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `carga-en-vivo`: la sheet de agregar jugador pasa de agregado inmediato por toque a selección múltiple con filtro y confirmación bulk.
- `gestion-partido`: el cluster de convocatoria suma alta múltiple en un solo request con conteo, toast y cierre de sheet.

## Impact

- `acsed-web/src/components/CargaVivo.tsx` (sheet agregar-jugador + servicio `convocatorias.agregar` en `src/servicios/`).
- `football-api`: `POST /partidos/:partidoId/convocatorias` (schema + servicio `convocar` + tests) para aceptar lote.
- Sin cambios en eventos, cronómetro, estados ni specs de suspendido.
