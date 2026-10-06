## Context

Ver `proposal.md` (Why). Estado actual: `CargaVivo.tsx` abre la sheet `agregar-jugador` por equipo; cada toque llama `services.convocatorias.agregar(partidoId, { jugadorId, equipoId })` → `POST /partidos/:partidoId/convocatorias` (schema `convocatoriaSchema = { jugadorId, equipoId }`) → `convocar()` valida existencia, equipo local/visita y duplicado (índice único `(partidoId, jugadorId)`, 422). Los jugadores no tienen equipo fijo, así que no hay validación de pertenencia posible ni deseable.

## Goals / Non-Goals

- Goals: un solo request por tanda; tolerancia a duplicados por carrera; filtro por nombre; conteo vivo; cerrar + toast + un refetch.
- Non-Goals: deshacer bulk; paginación del catálogo; validación de pertenencia jugador-equipo; cambios en eventos/cronómetro/estados.

## Decisions

- **Bulk como `{ equipoId, jugadorIds[] }` en el POST existente** (no endpoint nuevo ni payload polimórfico): la sheet ya es por equipo, repetir `equipoId` por item es ruido; el endpoint simple `{ jugadorId, equipoId }` se mantiene para compatibilidad (lote de 1 = caso general). Alternativa descartada: `POST .../convocatorias:lote` — ruta nueva sin beneficio.
- **Duplicados internos y de carrera se saltan, no fallan el lote**: respuesta `201 { creados: Convocatoria[], omitidos: string[] }`. Falla con 422 solo por errores reales (equipo no local/visita, jugador inexistente). Tope 30 ids por request.
- **Estado de selección en la sheet (web), no en el servidor**: `Set<string>` local + input de filtro; el botón muestra `Agregar (N)`. Selección con `aria-pressed` + check visible (no solo color).
- **Cerrar la sheet tras confirmar** (decisión de producto): una interacción por tanda; el toast confirma.

## Risks

- Lote grande + red mala: un solo POST igual puede fallar; el error se muestra inline y la selección se preserva para reintentar (patrón `ux-movil` existente).
- Dos operadores agregando al mismo jugador: cubierto por skip + `omitidos`.

## Migration

Sin migración: endpoint viejo sigue aceptando objeto simple; la web nueva siempre manda lote.
