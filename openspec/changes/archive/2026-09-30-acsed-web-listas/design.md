## Context

Refinamientos UI puros en `acsed-web/src` (ver proposal.md). Sin cambios de API.

## Goals / Non-Goals

**Goals:** Desc por fecha, columnas ordenables, liga preseleccionada bloqueada, quitar convocado con guardia.
**Non-Goals:** Sin cambios de endpoints, contrato ni specs principales.

## Decisions

- **Orden en cliente, no en API.** Rationale: listas por liga chicas; evita cambio de contrato.
- **Hook `useOrden` + `SortTH` compartidos.** Rationale: 4 tablas con el mismo ciclo; alternativa (lógica por tabla) duplica.
- **Query param `?ligaId=` + `disabled`.** Rationale: una sola ruta de formulario; alternativa (ruta anidada) duplica el form.
- **Guardia en cliente (eventos del detalle ya cargado).** Rationale: sin llamada extra; el borrado usa `DELETE` existente.

## Risks / Trade-offs

- [Risk] `fecha` iguales desempatan por orden de llegada → Mitigation: aceptado (decisión M1: solo fecha).
