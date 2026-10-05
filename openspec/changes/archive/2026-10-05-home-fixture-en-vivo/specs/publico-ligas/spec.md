## MODIFIED Requirements

### Requirement: Lista de ligas
The system SHALL show a public list of ligas with nombre and formato, linking to each detail. Above the list it SHALL show "En juego ahora" (partidos `en_juego` across ligas, linking to each match) and "Próximos" (next `programado` partidos ordered by fecha); both sections SHALL be omitted when empty.

#### Scenario: Visitor opens home
- **WHEN** an anonymous visitor opens `/ligas`
- **THEN** they see all ligas with their formato badge (liga|copa).

#### Scenario: Live matches surface first
- **WHEN** a visitor opens `/ligas` while two partidos are `en_juego`
- **THEN** an "En juego ahora" section lists both above "Próximos" and the liga list.
