## Why

Las tablas de posiciones y jugadores muestran puntos y resultados pero no una medida comparable de eficiencia. Una columna de rendimiento (%) permite comparar equipos y jugadores de un vistazo, en móvil y escritorio.

## What Changes

- Nueva columna `%` en la tabla de equipos, a la izquierda de `Pts`, visible también en móvil (Equipo/PJ/DIF/%/Pts); la fila expandida móvil suma el valor.
- Nueva columna `%` en la tabla de jugadores, a la derecha de `PP`.
- Fórmula única `rendimiento = (3·PG + PE) / (3·PJ) · 100` con un decimal (equivale a `Pts/(3·PJ)·100` en equipos); con `PJ = 0` muestra "–".
- Cálculo 100% frontend en `utils`, sin cambios en la API.
- La columna es ordenable (`SortTH col="rend"`) pero no cambia el orden por defecto.
- Header `%` con icono ⓘ (`InfoCircledIcon`), `title` y `aria-label` "% de rendimiento" (enfoque desktop + lector de pantalla; en táctil el valor se interpreta por contexto).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `publico-ligas`: la pestaña Tabla suma la columna % ordenable con tooltip.
- `publico-estadisticas`: la tabla de jugadores suma la columna % ordenable con tooltip.
- `ux-movil`: las columnas visibles en móvil pasan a Equipo/PJ/DIF/%/Pts.

## Impact

- `acsed-web/src/components/TablaEquipos.tsx`, `acsed-web/src/pages/EstadisticasPage.tsx`, nuevo util en `acsed-web/src/utils/` (+ tests).
- Sin cambios en `football-api` ni en el orden por defecto de las tablas.
