## Context

`GET /partidos` currently returns one lightweight partido object per match, while `GET /partidos/{id}` separately calculates `marcador` from goal eventos. The list views poll repeatedly, so adding one detail request per partido would create N+1 traffic. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**

- Return the same event-derived marcador in both list and detail responses.
- Keep list responses compact enough for 5–15 second polling.
- Make create, update and delete of eventos automatically reflected in subsequent list responses.
- Show the score in public and administrative liga lists without extra detail requests.

**Non-Goals:**

- No editable or stored marcador field on partidos.
- No change to shootout semantics: `penales_*` remain separate from marcador.
- No pagination, caching layer, or real-time push mechanism.
- No change to existing estado transitions or evento validation.

## Decisions

### Batch event retrieval for list responses

The list operation will retrieve the filtered partidos first, then retrieve eventos for exactly those partido IDs in one batched query. It will group eventos by partido and reuse the existing marcador calculation.

Alternative considered: query `GET /partidos/{id}` once per row from the frontend. Rejected because it multiplies polling traffic, returns convocatorias and full eventos unnecessarily, and complicates partial failure handling.

Alternative considered: persist `golesLocal` and `golesVisita` on partido documents. Rejected because every evento mutation would need a compensating update, historical data would require a backfill, and failures could leave a stored score inconsistent with eventos.

### Preserve detail behavior as the reference implementation

The list calculation will use the same domain-level marcador logic as partido detail. Detail remains the behavioral reference; the list is a projection of the same result.

Alternative considered: duplicate a simpler goal-counting rule for lists. Rejected because autogol and in-match penal semantics could diverge over time.

### Additive list response

Each partido in `GET /partidos` will gain a `marcador` object with non-negative integer `local` and `visita` values. Existing partido fields, filters and ordering behavior remain unchanged.

Alternative considered: a separate `/partidos/marcadores` endpoint. Rejected because it would reintroduce an extra request for every list render and complicate polling synchronization.

### Frontend consumes the list field directly

Public and administrative list rows will render `marcador.local` and `marcador.visita` from the list response. List views will not call partido detail for scores.

Alternative considered: client-side aggregation from an event feed. Rejected because it would move domain logic to the client and increase payload and complexity.

## Risks / Trade-offs

- [Risk] A large liga list increases the batched evento payload → Mitigation: retain indexed `partidoId` lookup, return only fields needed for marcador calculation, and revisit pagination if measured latency regresses.
- [Risk] Event updates or deletes could expose stale scores if a client caches list responses → Mitigation: do not introduce a new cache; existing polling will fetch the recalculated list.
- [Risk] Frontend and API score shapes could diverge → Mitigation: use one shared marcador shape for list, detail and tests.
- [Risk] Callers may depend on the previous exact list shape → Mitigation: make the change additive; no existing fields are removed or renamed.

## Migration Plan

1. Deploy the backend list enhancement first; it is backward compatible for readers that ignore the new field.
2. Deploy the frontend list rendering change.
3. Roll back by reverting the frontend display change first if needed; the backend field can remain because it does not alter existing fields.
4. No database migration or backfill is required because scores remain derived from existing eventos.
