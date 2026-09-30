## MODIFIED Requirements

### Requirement: Lista y ficha de partido
The system SHALL list partidos (filterable by liga and estado) and show a public match view with equipos, fecha, fase, estado, calculated marcador, shootout if present, and goal list. Each row in the public partido list SHALL display the calculated local and visiting goal totals alongside the equipos.

#### Scenario: Visitor opens match
- **WHEN** a visitor opens `/partidos/:id`
- **THEN** they see marcador, scorer list with minute when present, and penales score without attributing them to players.

#### Scenario: Visitor sees scores in liga list
- **WHEN** a visitor opens a liga's Partidos list containing a completed scoring match
- **THEN** that match row displays its calculated local and visiting goal totals without requiring the visitor to open the match detail.
