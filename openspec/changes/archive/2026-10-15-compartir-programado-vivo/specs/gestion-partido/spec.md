## MODIFIED Requirements

### Requirement: Compartir por estado en workspace

A programado, en_juego or finalizado workspace SHALL offer the same WhatsApp share icon-link as the public match view (same per-estado message) at the right end of the match-date row; it SHALL NOT appear in suspendido workspaces.

#### Scenario: Share programmed match from workspace (ADDED)
- **WHEN** an admin opens a programado partido workspace and activates Compartir
- **THEN** `wa.me` opens with the programado message (`LOCAL vs VISITA`, liga/fecha, back-link).

#### Scenario: Share live match from workspace (ADDED)
- **WHEN** an admin opens an en_juego partido workspace and activates Compartir
- **THEN** `wa.me` opens with the en_juego message (`EN VIVO {minuto}'` header plus finalizado-style goals body).
