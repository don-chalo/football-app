## Why

En `PartidoManagePage` el listado de jugadores aparece dos veces — una en "Convocados" y otra en "Cargar goles" — con formatos y acciones distintas, lo cual es redundante y confunde al operador en cancha. Unificar en una sola lista reduce la página a un único modelo mental: cada fila de jugador es el punto de entrada a todas sus acciones.

## What Changes

- La tarjeta "Convocados" y el componente `Convocatorias` se eliminan; la tarjeta de carga (renombrada "Convocatoria y goles") pasa a ser la única lista y vive visible en todos los estados (`programado`, `en_juego`, `finalizado`).
- La lista muestra **todos** los convocados (no solo presentes); los ausentes se ven atenuados con "(ausente)" y siguen accesibles para volver a "Presente".
- El tap en un jugador abre el sheet ampliado: botones GOL/AUTOGOL/PENAL (solo en `en_juego`/`finalizado`; en `programado` el sheet no ofrece goles), campo minuto como hoy, más fila horizontal **[Ausente|Quitar]**.
- "Quitar" conserva la confirmación en 2 taps (Quitar → Confirmar/No) y la guardia "tiene goles, bórralos primero", ahora dentro del sheet.
- Cada equipo tiene su botón **"+ Agregar jugador"** al final de su sección; abre un sheet con los jugadores disponibles (no convocados); el tap agrega directo y cierra, en silencio. Se elimina el select de equipo.
- Un ausente **puede** tener goles (se permite corregir a mano); agregar es silencioso (sin toast).
- Se actualizan los tests afectados (`PartidoManagePage.test.tsx`, nuevos casos en `CargaVivo.test.tsx`).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `carga-en-vivo`: el sheet por jugador suma Ausente/Quitar y agregar por equipo; la lista incluye ausentes; sin goles en `programado`.
- `gestion-partido`: la convocatoria se gestiona desde la lista unificada (se elimina la tarjeta "Convocados" separada).
- `quitar-convocado`: el flujo Quitar con confirmación y guardia vive dentro del sheet del jugador.

## Impact

- Solo `acsed-web`: `PartidoManagePage.tsx` (se elimina `Convocatorias`), `CargaVivo.tsx` (sheet ampliado, fetch de catálogo de jugadores, secciones por equipo con botón agregar), tests.
- Sin cambios en `football-api`; mismos endpoints (`convocatorias.agregar/marcar/quitar`, `eventos.registrar/eliminar`).
- Base para el change `cronometro-partido`, que se apoya sobre este layout.
