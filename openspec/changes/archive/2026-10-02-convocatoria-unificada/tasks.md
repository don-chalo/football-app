## 1. Lista unificada

- [x] 1.1 Extender `CargaVivo` para listar todos los convocados (incluidos ausentes atenuados), con secciones por equipo, botón "+ Agregar jugador" por equipo y prop `estadoPartido`; mudar el fetch del catálogo de jugadores con polling 60s.
- [x] 1.2 Extender el sheet: modo "agregar" con fila horizontal Ausente/Quitar (Quitar con confirmación en 2 taps + guardia de eventos, sin validación extra para ausente con goles), tipos de gol solo en `en_juego`/`finalizado`; nuevo modo "agregar-jugador" con disponibles que agrega en silencio y cierra.

## 2. Página y verificación

- [x] 2.1 Eliminar la tarjeta "Convocados" y el componente `Convocatorias` de `PartidoManagePage.tsx`; renderizar la tarjeta unificada ("Convocatoria y goles") siempre visible en todos los estados.
- [x] 2.2 Reescribir los tests afectados (`PartidoManagePage.test.tsx`, casos nuevos en `CargaVivo.test.tsx`: ausente/quitar en sheet, agregar por equipo, sin goles en `programado`) y ejecutar `npm run typecheck`, `npm run lint`, `npm test -- --run` y `npm run build` en `acsed-web`.
