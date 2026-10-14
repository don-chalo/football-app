## Why

The unified players table has 12 columns and overflows on small phones. The teams table already solved this with a responsive pattern (core columns + tap-to-expand); players should behave the same.

## What Changes

- `TablaJugadores` becomes responsive following the `TablaEquipos` pattern: on screens below `sm`, only Jugador/PJ/PG/PE/PP/%/Goles are visible; Autogoles/TA/TR/Convocado/Ausencias hide and appear in a per-row expansion line (`AG {x} · TA {x} · TR {x} · Conv {x} · Aus {x}`) toggled by tapping the player name (`+/-` indicator, `aria-expanded`, desktop unaffected showing all 12 columns).
- Hidden `SortTH`s remain sortable on desktop, as in the teams table.
- If 7 visible columns prove too tight at 360px, fallback is `text-xs` on mobile only.

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `ux-movil`: player tables SHALL follow the same responsive rule as points tables (core columns + expandable detail).
- `publico-estadisticas`: players table gains the mobile expansion behavior.
- `publico-ligas`: liga players tab gains the mobile expansion behavior.

## Impact

- Only `acsed-web/src/components/TablaJugadores.tsx` (+ new test mirroring `TablaEquipos.test.tsx`). Pages untouched. No API changes.
