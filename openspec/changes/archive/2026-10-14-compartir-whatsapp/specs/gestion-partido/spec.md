## MODIFIED Requirements

### Requirement: State transitions and shootout
The system SHALL advance estado programado→en_juego→finalizado (never back), record `inicioEn` on start (only if null) and `finEn` on finish, record minimal shootout + clasificado, and allow event correction in finalizado. Starting SHALL require `now >= fecha` (API rejects earlier starts with 400; web disables the button with an availability notice). Finishing from the workspace SHALL require inline confirm (Finalizar → Confirmar/No); suspending SHALL keep its existing inline confirm. A finalizado workspace SHALL offer the same WhatsApp share icon-link as the public match view (same formatted resultado) at the right end of the match-date row; it SHALL NOT appear in other estados.

#### Scenario: Start and finish
- **WHEN** an admin starts a programmed match past its scheduled datetime
- **THEN** the live-load view becomes available with a running server-anchored clock; finishing locks new goals except corrections and freezes the clock.

#### Scenario: Finish requires confirm
- **WHEN** an admin taps Finalizar on an `en_juego` partido
- **THEN** the UI asks Confirmar/No first and only confirms on Confirmar.

#### Scenario: Share finished match from workspace
- **WHEN** an admin opens a finalizado partido workspace and activates Compartir
- **THEN** `wa.me` opens with the same formatted resultado as the public view.
