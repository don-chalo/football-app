## Context

Greenfield REST API (see proposal.md Why). No existing code or specs. Must serve a future website, so the HTTP contract is the product. Key constraints from exploration: fixture 100% manual (copa brackets not power of 2, phases free-form), stats calculated-only on `finalizado`, jugador/equipo global minimal with fluid per-match affiliation, eventos extensible without migrations.

## Goals / Non-Goals

**Goals:**
- Decoupled REST contract with public GET and role-gated writes.
- Data model that supports liga/copa/informal via filters, linked ida/vuelta ties, live goal entry, and correction in finalizado.
- Stats engine with deterministic rules (autogol/penal/shootout) and year-bounded filters.
- Maintainable, testable codebase: domain rules isolated as pure functions with unit tests, thin I/O layers.

**Non-Goals:**
- No fixture generator, no auth beyond JWT roles, no pagos/sanciones/inscripciones, no per-kick shootout detail, no frontend.

## Decisions

- **Resource modeling: `llave` as attributes on partido, not separate table.** `partido` holds nullable `llave_id` (or ida/vuelta link) + `fase` free text. Rationale: manual copa with uneven entry needs flexibility; a rigid bracket table would force power-of-2 logic. Alternative (bracket/nodes table) rejected for MVP complexity.
- **Single `convocatorias` + single `eventos_partido` tables.** Convocatoria = (partido, jugador, equipo, convocado|ausente). Evento = (partido, jugador, equipo, tipo, minuto nullable, metadata JSON). Rationale: one presence flag derives ausentes/%inasistencia; one event table accepts future types additively. Alternative (separate goles/asistencias/tarjetas tables) rejected — would require migrations per new type.
- **Stats computed in query layer, never persisted.** Marcador and aggregates derived from eventos + convocatorias filtered by finalizado + date/liga scope. Rationale: matches "stats se calculan" requirement and avoids inconsistency. Alternative (materialized stats) rejected — premature optimization; add caching later if needed.
- **Pts always shown (3/1/0), shootout excluded from aggregates.** Keeps one code path for liga/copa/informal. Alternative (different columns per formato) rejected — duplicates logic.
- **UNIQUE nombre case-insensitive para equipos/jugadores (indice unico Mongoose con collation `strength: 2`).** Per explicit user decision; homonyms must use distinguishing alias. Documented friction, accepted.
- **Stack fijado: TypeScript strict (Node) + Express + Mongoose (MongoDB) + JWT.** Rationale: restriccion explicita del usuario; Express para el contrato REST, Mongoose para modelado documental (eventos con `metadata` como subdocumento mixto, validaciones en schema). Tipado estricto + DTOs con validacion en el borde; interfaces de repositorio permiten fakes en tests. Runner de tests TS (vitest/jest a elegir en implementacion). Alternativa relacional descartada por decision explicita (Mongoose/MongoDB).
- **State machine enforced in API layer:** programado->en_juego->finalizado, reject any ->programado; edits in finalizado only touch child eventos/convocatorias, never estado. Alternative (reopen to en_juego for corrections) deferred — current rule is simpler and satisfies "se puede corregir estando finalizado".
- **Layered architecture (routes -> controllers -> services/use-cases -> repositories).** Rationale: HTTP, domain rules and persistence evolve independently; services hold use-case orchestration, repositories isolate DB access behind interfaces (dependency inversion) so stats/auth logic is testable without a database. Alternative (logic in controllers) rejected — untestable and duplicates rules.
- **Patterns (minimal set): Repository** for persistence boundaries; **Service/Use-case** per capability (ligas, partidos, eventos, estadisticas); **Strategy** for event-type accounting (`gol` | `autogol` | `penal`, future types plug in additively) and for stats aggregations; **Middleware** for JWT auth + role checks; **DTO + validation** at the boundary (422 on invalid input). No extra patterns (no EventBus, CQRS, DDD aggregates) for MVP.
- **Unit-test strategy on pure domain functions.** Test without DB/HTTP: marcador from eventos, tabla (Pts/Dif/GF ordering), goleadores vs autogoles split, penal-en-juego vs shootout exclusion, %inasistencia, state-machine transitions, convocatoria validations (local!=visita, no double-team, gol only from presente). HTTP/DB covered by a thin integration pass; coverage gate enforced on domain modules.

## Risks / Trade-offs

- [Risk] UNIQUE jugador nombre blocks real homonyms → Mitigation: document alias convention ("Juan Perez (La 14)"); future `alias/documento` field possible without breaking ids.
- [Risk] Manual fixture allows orphan/dangling llaves (vuelta without ida) → Mitigation: validate llave references exist + same liga; allow incomplete ties by design.
- [Risk] Stats over a full year could be heavy → Mitigation: indexes on (partido.estado, fecha, liga_id), (eventos.partido_id), (convocatorias.partido_id); paginate lists; cache later.
- [Risk] Live goals during en_juego polled by website → Mitigation: stats exclude en_juego so live writes never corrupt tables; website refreshes detail endpoint.
- [Risk] Modelado documental (Mongoose/MongoDB) vs joins relacionales → Mitigation: referencias por ObjectId entre ligas/partidos/convocatorias/eventos + agregaciones para stats; metadata de eventos como subdocumento; indices en (estado, fecha, liga).
- [Risk] Over-engineering with patterns → Mitigation: fixed minimal set above; any new pattern needs a decision entry justifying it.
- [Risk] Untested domain rules drift (autogol/penal/shootout/stats) → Mitigation: pure functions + unit tests with coverage gate on domain modules; integration tests only for wiring.

## Migration Plan

Greenfield: no migration. Deploy order: schema -> auth -> catalogs -> ligas/partidos -> eventos -> stats (read-only). Rollback = new deployment only; no data migration needed.
