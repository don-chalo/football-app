## MODIFIED Requirements

### Requirement: Lista y ficha de partido
The system SHALL list partidos (filterable by liga and estado) and show a public match view with equipos, fecha, fase, estado, calculated marcador, convocatoria por equipo, shootout if present, and goal list. Each row in the public partido list SHALL display the calculated local and visiting goal totals alongside the equipos, stacked (equipos one per line, large marcador at right, fase/fecha/badge on a second line). The liga fixture SHALL offer estado filter chips (Todos | En juego | Programados | Finalizados | Suspendidos) keeping date order. The public partido detail SHALL display a `Convocatoria` section above `Goleadores`, with local and visiting equipos in two columns; ausente players SHALL remain visible, subdued and marked as ausente.

#### Scenario: Visitor opens match
- **WHEN** a visitor opens `/partidos/:id`
- **THEN** they see marcador, scorer list with minute when present, and penales score without attributing them to players.

#### Scenario: Visitor sees scores in liga list
- **WHEN** a visitor opens a liga's Partidos list containing a completed scoring match
- **THEN** that match row displays its calculated local and visiting goal totals without requiring the visitor to open the match detail.

#### Scenario: Visitor sees convocatoria by equipo
- **WHEN** a visitor opens `/partidos/:id` for a partido with convocatorias for both equipos
- **THEN** they see local and visiting columns above `Goleadores`, each showing its equipo name and convocados.

#### Scenario: Ausente players remain marked
- **WHEN** a visitor opens `/partidos/:id` for a partido with an ausente convocado
- **THEN** that player remains visible, subdued and marked as ausente.

#### Scenario: Empty convocatoria states
- **WHEN** a visitor opens `/partidos/:id` without convocatorias, or with one equipo lacking convocatorias
- **THEN** the empty card or equipo column indicates that no convocatoria or players are available, as applicable.

#### Scenario: Filter fixture by estado
- **WHEN** a visitor selects "En juego" in the fixture filter
- **THEN** only `en_juego` partidos are listed, still ordered by fecha.
