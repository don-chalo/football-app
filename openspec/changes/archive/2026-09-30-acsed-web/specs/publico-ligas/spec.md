## Purpose

Consulta publica de ligas y copas barriales, separadas por formato, como puerta de entrada del sitio.

## ADDED Requirements

### Requirement: Lista de ligas
The system SHALL show a public list of ligas with nombre and formato, linking to each detail.

#### Scenario: Visitor opens home
- **WHEN** an anonymous visitor opens `/ligas`
- **THEN** they see all ligas with their formato badge (liga|copa).

### Requirement: Detalle por formato
Liga detail SHALL show tabs Partidos, Tabla (formato liga) or Llaves (formato copa with fases + clasificados), and Jugadores.

#### Scenario: Copa shows bracket
- **WHEN** a visitor opens a copa liga
- **THEN** they see ties grouped by fase with clasificados instead of a points table.
