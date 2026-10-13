## Context

Ver `proposal.md` (Why). Tablas actuales: `TablaEquipos.tsx` (posiciones, responsive con expansión móvil) reutilizada en `LigaDetailPage` y `EstadisticasPage.TablaGlobal`; `TablaJugadores` local en `EstadisticasPage` (9 columnas, scroll horizontal en móvil). Orden via `useOrden(filas, valor)` + `SortTH` (label string, botón con `aria-sort`).

## Goals / Non-Goals

- Goals: columna % derivada solo-frontend, ordenable, tooltip accesible, visible en móvil en equipos.
- Non-Goals: cambios en API; cambio del orden por defecto; tooltip táctil (enfoque A).

## Decisions

- **Una sola función `rendimiento(pg, pe, pj): string`** en `acsed-web/src/utils/rendimiento.ts`: `(3*pg+pe)/(3*pj)*100`, un decimal vía `toFixed(1)`; `pj <= 0` → `"–"`. Devuelve string ya formateado (sin `%`; el header lo indica). Alternativa descartada: número + formateo en cada tabla (duplica el caso PJ=0).
- **Ordenamiento por valor numérico, no por string**: `useOrden` recibe `valor(f,k)`; para `col="rend"` devolver el número (o `-1` si PJ=0 para que vayan al fondo en desc). Se agrega función `rendimientoValor` en el mismo util para no parsear el string.
- **`SortTH` suma prop opcional `hint?: string`**: button recibe `title={hint}` (tooltip nativo desktop) + icono ⓘ `InfoCircledIcon` (aria-hidden) + `<span className="sr-only">{hint}</span>` (lector de pantalla lee "%, % de rendimiento" más la marca ▲▼ como texto). Sin `hint`, render idéntico al actual.
- **Posición**: equipos `%` entre DIF y Pts en desktop... no — a la izquierda de Pts significa: desktop orden actual PG PE PP GF GC Pts → insertar `%` justo antes de Pts. Móvil: Equipo/PJ/DIF/%/Pts + expansión suma `· % x`. Jugadores: `%` justo después de PP.
- **Celda**: `tabular-nums` para alinear decimales (ya se usa en PartidoCard).

## Risks

- 5 columnas en 360px (equipos): % es angosta (~44px con tabular-nums); verificar sin scroll horizontal en prueba manual.
- `toFixed(1)` redondea (66.65→66.7… en realidad 66.666→"66.7"): aceptado, es display.

## Migration

Sin migración: columna puramente aditiva.
