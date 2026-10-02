## 1. Backend (`football-api`)

- [x] 1.1 Agregar `inicioEn`, `pausaDesde`, `pausaAcumSeg`, `finEn` al modelo `Partido`; exponerlos en el detalle.
- [x] 1.2 `cambiarEstado`: a `en_juego` setear `inicioEn` si es null y rechazar 400 si `now < fecha`; a `finalizado` setear `finEn`; nuevo `POST /partidos/:id/pausa {pausada}` solo en `en_juego`; tests (transiciones, pausa/reanudar, gating por fecha, doble inicio) y gates del API.

## 2. Frontend (`acsed-web`)

- [x] 2.1 Hook `useCronometro` + servicio `partidos.pausa` + Card "Cronómetro" (solo `en_juego`, corriendo/pausado) sobre la lista unificada; minuto automático en el sheet cuando corre, manual en pausa/`finalizado`.
- [x] 2.2 "Poner en juego" deshabilitado con aviso hasta fecha+hora; helper `formatoFechaCorta` aplicado en `PartidoPage` y `PartidoManagePage`; hitos Inicio/Fin en ambas cronologías (fin con reloj + minuto derivado, defensivo sin `finEn`).
- [x] 2.3 Tests web (hook, card, auto/manual, cronología, gating) y gates `npm run typecheck`, `npm run lint`, `npm test -- --run`, `npm run build` en `acsed-web` (+ gates del API).
