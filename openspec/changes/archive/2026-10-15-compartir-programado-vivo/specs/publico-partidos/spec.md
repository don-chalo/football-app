## MODIFIED Requirements

### Requirement: Compartir por estado

A `programado`, `en_juego` or `finalizado` partido SHALL show a WhatsApp share icon-link at the right end of the match-date row, opening `https://wa.me/?text=<encoded>` with a message matching the estado; the button SHALL NOT appear on `suspendido` partidos. The `programado` message SHALL be `LOCAL vs VISITA` line (never `0 - 0`), `{Liga/Copa} · {fecha}` line, and a back-link to the partido, with no goals section. The `en_juego` message SHALL start with `EN VIVO {minuto}' — LOCAL {l} - {v} VISITA` (minute snapshot at render time), followed by `{Liga/Copa} · {fecha}` and then the same body as a finalizado message (goals with grouped minutes and `(p)`/`(ag)` suffixes, or `Goleadores:` counts ordered descending when no event has a minute, `Penales:` when shootout exists, `Sin goles.` when scoreless) plus back-link. The `finalizado` message is unchanged. No message SHALL include the convocatoria.

#### Scenario: Share programmed match on WhatsApp (ADDED)
- **WHEN** a visitor opens a programado `/partidos/:id` and activates Compartir
- **THEN** `wa.me` opens with `LOCAL vs VISITA`, liga/fecha and back-link, with no score and no goals section; the button is absent on suspendido partidos.

#### Scenario: Share live match on WhatsApp (ADDED)
- **WHEN** a visitor opens an en_juego `/partidos/:id` and activates Compartir
- **THEN** `wa.me` opens with an `EN VIVO {minuto}'` header line plus the same goals body as a finalizado message.
