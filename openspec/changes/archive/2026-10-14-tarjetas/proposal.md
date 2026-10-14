## Why

Match officials need to record yellow and red cards, but today `TipoEvento` only supports goals (`gol`|`autogol`|`penal`). Cards must live in the same sheet and cronología as goals, never touch the score, and appear in player stats.

## What Changes

- New event types `amarilla` and `roja`, registered from the same player sheet as goals (same validation: convocado-presente, `en_juego`/`finalizado`, admin; no accumulation logic — two yellows are just two events).
- Sheet layout: row 1 `GOL | AUTOGOL | PENAL` (equal width), row 2 `T. AMARILLA | T. ROJA` with color chip. Toast text adapts (`Tarjeta registrada`).
- Cards NEVER affect marcador, GF/GC, goleadores or autogoles (backend branches made explicit; the two `else`-as-autogol traps in `marcador.ts`/`jugadores.ts` fixed).
- Cronología (workspace + public): gol/penal/autogol show an adjustable-size `SoccerBall` instead of the Badge; cards show new yellow/red card icons with accessible labels. Quitar sheet stays text-only.
- Player stats (API + both player tables): new `amarillas`/`rojas` counters per jugador, displayed as columns.

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `eventos`: new `amarilla`/`roja` event types with card semantics (no score impact, same validation as goals).
- `carga-en-vivo`: sheet two-row button layout, card icons in workspace cronología, card counters in row totals, text-only quitar list.
- `publico-partidos`: public cronología shows ball icon for goals and card icons for cards.
- `publico-estadisticas`: player tables show amarillas/rojas columns.

## Impact

- API: `domain/types.ts`, `http/schemas.ts`, `models/evento.model.ts` enum, `domain/marcador.ts` (explicit card branches), `domain/jugadores.ts` (+ counters), stats endpoints shape (+2 fields), domain + http tests.
- Web: `CargaVivo.tsx` (sheet layout, cronología, row totals, toast), `PartidoPage.tsx` (cronología), new `TarjetaAmarillaIcon`/`TarjetaRojaIcon`, `SoccerBall` size fix (missing-space `className` bug, same as `WhatsappIcon` had), `JugadoresTab` + `EstadisticasPage` players columns, `compartir.ts` unaffected (already filters goal types).
- No accumulation (double-yellow) logic; no card stats beyond per-player counts.
