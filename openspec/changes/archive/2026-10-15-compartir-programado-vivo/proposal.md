## Why

Compartir por WhatsApp solo existe para partidos finalizados. Un programado (invitación: "se juega el sábado") y un en juego (gancho: "seguilo en vivo") son los momentos donde compartir tiene más valor, y hoy el botón ni siquiera aparece.

## What Changes

- El botón Compartir aparece en `/partidos/:id` y en gestión para `programado`, `en_juego` y `finalizado`; sigue ausente en `suspendido`.
- Mensaje `programado`: `LOCAL vs VISITA` (nunca `0 - 0`), `liga · fecha`, back-link. Sin bloque de goles.
- Mensaje `en_juego`: primera línea `EN VIVO {minuto}' — LOCAL x - y VISITA` (minuto = foto al renderizar); desde la línea 3, mismas lógicas que finalizado (bloque goles/conteo, penales, back-link).
- Mensaje `finalizado`: sin cambios.
- Sin convocatoria en ningún mensaje.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `publico-partidos`: compartir disponible por estado con mensaje acorde en la página pública.
- `gestion-partido`: mismo botón y mensajes en la página de gestión.

## Impact

- `acsed-web/src/utils/compartir.ts` (nueva `textoCompartir` con despacho por estado), `acsed-web/src/components/BotonCompartir.tsx` (guard + minuto actual).
- Tests: `compartir.test.ts`, `PartidoPage.test.tsx`, `PartidoManagePage.test.tsx`.
