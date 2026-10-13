## 1. Util + SortTH

- [x] 1.1 Crear `acsed-web/src/utils/rendimiento.ts` (`rendimiento()` formateado + `rendimientoValor()` numérico) con tests (1 decimal, PJ=0 → "–"/fondo)
- [x] 1.2 Extender `SortTH` con prop opcional `hint` (title + icono ⓘ + sr-only), sin cambios cuando no se usa

## 2. Tablas

- [x] 2.1 `TablaEquipos`: columna `%` antes de Pts (visible en móvil) + valor en fila expandida + `col="rend"` en ambos `useOrden` que la usan
- [x] 2.2 `EstadisticasPage.TablaJugadores`: columna `%` después de PP + `col="rend"`
- [x] 2.3 Tests web: % calculado, orden por % sin cambiar default, tooltip/hint presente, % visible en móvil
- [x] 2.4 `LigaDetailPage.JugadoresTab`: columna `%` después de PP + `col="rend"` + test

## 3. Gates

- [x] 3.1 `tsc`, `lint`, tests web, `build` en verde
