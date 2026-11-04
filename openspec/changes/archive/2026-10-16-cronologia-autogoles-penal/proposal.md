## Why

En la cronología de un partido no hay forma visual de distinguir un autogol o un penal de un gol común: todos comparten el mismo ícono de pelota. Además, en la sección Goleadores de la vista pública no se listan los autogoles, aunque son eventos registrados y relevantes para el seguimiento del partido.

## What Changes

- Nuevo ícono `AutogolIcon` para eventos de tipo `autogol` (balón con X cruzada).
- Penal sigue usando el ícono de pelota `SoccerBall` (no se crea ícono propio).
- En la fila de cada evento de la cronología, se agrega un badge `AG` (autogol) o `P` (penal) inmediatamente después del ícono y antes del minuto, con color diferenciado.
- En la sección Goleadores de `PartidoPage`, se agrega un sub-listado de Autogoles dentro de la misma card, ordenado por conteo descendente, con encabezado "Autogoles".

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `publico-partidos`: cronología con distintivo visual para autogol/penal; sección de goleadores incluye autogoles en un sub-listado separado.
- `eventos`: los tipos de evento `autogol` y `penal` tienen tratamiento visual distintivo en la cronología.

## Impact

- `acsed-web/src/components/icons/AutogolIcon.tsx` (nuevo)
- `acsed-web/src/components/icons/PenalIcon.tsx` (eliminado, sin uso)
- `acsed-web/src/components/EventoIcono.tsx` (mapeo de tipos a íconos)
- `acsed-web/src/components/Cronologia.tsx` (badges AG/P en fila de evento)
- `acsed-web/src/pages/PartidoPage.tsx` (sub-listado de autogoles en card Goleadores)
- `openspec/specs/publico-partidos/spec.md` (delta)
- `openspec/specs/eventos/spec.md` (delta)
