## MODIFIED Requirements

### Requirement: Public read and admin write
`GET /partidos` (filterable by `liga_id`) and `GET /partidos/{id}` SHALL be public; every partido returned by `GET /partidos` SHALL include its calculated `marcador` (`local` and `visita` as non-negative integers derived from `gol`, `autogol` and in-match `penal` eventos; shootout `penales_*` SHALL NOT affect it); all writes SHALL require admin role (scoped by assignment for `admin_partidos`, see asignaciones).

#### Scenario: Public partido detail
- **WHEN** an anonymous client calls `GET /partidos/{id}`
- **THEN** the system returns the partido with equipos, estado, marcador calculado and eventos.

#### Scenario: Public partido list includes marcador
- **WHEN** an anonymous client calls `GET /partidos?ligaId={id}` for a liga containing a partido with goal eventos
- **THEN** every returned partido includes `marcador.local` and `marcador.visita` matching the same calculation used by partido detail.

#### Scenario: Partido without eventos is scoreless
- **WHEN** an anonymous client calls `GET /partidos?ligaId={id}` for a partido without goal eventos
- **THEN** that partido is returned with `marcador.local` equal to `0` and `marcador.visita` equal to `0`.
