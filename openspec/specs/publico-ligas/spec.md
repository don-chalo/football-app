# publico-ligas Specification

## Purpose

Consulta publica de ligas y copas barriales, separadas por formato, como puerta de entrada del sitio.

## Requirements

### Requirement: Lista de ligas
The system SHALL show a public list of ligas with nombre and formato, linking to each detail. Above the list it SHALL show "En juego ahora" (partidos `en_juego` across ligas, linking to each match) and "Próximos" (next `programado` partidos ordered by fecha); both sections SHALL be omitted when empty.

#### Scenario: Visitor opens home
- **WHEN** an anonymous visitor opens `/ligas`
- **THEN** they see all ligas with their formato badge (liga|copa).

#### Scenario: Live matches surface first
- **WHEN** a visitor opens `/ligas` while two partidos are `en_juego`
- **THEN** an "En juego ahora" section lists both above "Próximos" and the liga list.

### Requirement: Detalle por formato
Liga detail SHALL show tabs Partidos, Tabla (formato liga) or Llaves (formato copa with fases + clasificados), and Jugadores. The Tabla tab SHALL include a sortable `%` (rendimiento) column left of Pts, showing `(3·PG+PE)/(3·PJ)·100` with one decimal ("–" when PJ is 0); the header SHALL carry an info icon with tooltip and accessible label "% de rendimiento". Sorting by `%` SHALL be available without changing the default order. The Jugadores tab SHALL include the same sortable `%` column right of PP with the same format and header treatment. Below `sm` the Jugadores table SHALL show Jugador/PJ/PG/PE/PP/Goles (% added from `sm`), hiding Autogoles/TA/TR/Convocado/Ausencias below `md`, with a tappable row expansion revealing the hidden columns.

#### Scenario: Copa shows bracket
- **WHEN** a visitor opens a copa liga
- **THEN** they see ties grouped by fase with clasificados instead of a points table.

#### Scenario: Tabla shows rendimiento
- **WHEN** a visitor opens the Tabla tab of a liga
- **THEN** each equipo row shows % left of Pts, and tapping the % header sorts by rendimiento.

#### Scenario: Liga players show rendimiento
- **WHEN** a visitor opens the Jugadores tab of a liga
- **THEN** each row shows % right of PP, and tapping the % header sorts by rendimiento.

#### Scenario: Liga players expand on phone
- **WHEN** a visitor opens the Jugadores tab on a 360px phone
- **THEN** hidden columns are revealed by tapping the player row.
