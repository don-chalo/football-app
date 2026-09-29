## Purpose

Calculated-only statistics for teams and players plus head-to-head history, always derived from finalizados partidos with year-bounded filters.

## ADDED Requirements

### Requirement: Calculated-only stats on finalizados
All statistics SHALL be calculated on read (never stored) and SHALL consider only partidos with estado `finalizado`.

#### Scenario: En_juego excluded
- **WHEN** stats are requested while a partido is still `en_juego`
- **THEN** its goles are excluded from all aggregates.

### Requirement: Resultado and puntos rules
Marcador SHALL be the sum of eventos (`gol` + `penal` + rival `autogol`); shootout scores SHALL be excluded; victoria=3 Pts, empate=1, derrota=0; Pts SHALL be shown even for copa/informal with no champion.

#### Scenario: Puntos in copa
- **WHEN** team stats for a copa liga are requested
- **THEN** the system still returns Pts alongside PJ/PG/PE/PP/GF/GC/Dif.

### Requirement: Team stats with filters
`GET /estadisticas/equipos` SHALL return per-equipo PJ, PG, PE, PP, GF, GC, Dif, Pts with filters `liga_ids` (one or many, liga or copa) and `desde/hasta` (max range 1 year, default current year); default sorting SHALL be Pts desc, Dif desc, GF desc or be documented explicitly.

#### Scenario: Yearly accumulated table
- **WHEN** a client requests team stats without dates
- **THEN** the system applies the current-year range by default.

#### Scenario: Range over one year rejected
- **WHEN** a client requests a range longer than 1 year
- **THEN** the system returns 422.

### Requirement: Player stats with filters
`GET /estadisticas/jugadores` SHALL return per-jugador PJ, PG, PE, PP (team result in matches where the jugador was present, counting whichever equipo he played for), goles (gol+penal), autogoles, convocados, ausentes, % inasistencia (ausentes/convocados), jugados; filters SHALL be `liga_ids`, `desde/hasta` (same year rules), optional `equipo_id`, optional `partido_id`; all endpoints SHALL be public.

#### Scenario: Player across two winning teams
- **WHEN** a jugador played (present) in 2 partidos for 2 different winning equipos and equipo filter is blank
- **THEN** the system returns PJ=2 PG=2 PE=0 PP=0.

#### Scenario: Inasistencia percentage
- **WHEN** a jugador was convocado 10 times with 2 ausentes
- **THEN** the system returns convocados=10 ausentes=2 %inasistencia=20.

### Requirement: Head-to-head history
`GET /estadisticas/enfrentamientos?equipo_a=X&equipo_b=Y&...` SHALL return PJ, wins A, draws, wins B, GF each, plus the partido list, honoring the same date/liga filters.

#### Scenario: Head-to-head
- **WHEN** a client requests history between two equipos
- **THEN** the system returns aggregates plus the underlying finalizados partidos.
