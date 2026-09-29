## Context

football-api (TypeScript + Express + Mongoose, en `football-api/src`) hoy tiene roles globales (`requireRole` implica auth; ver `src/http/middleware/auth.ts`) y modelos sin actor (ver `src/models/*.ts`; timestamps sí existen). Este change agrega scoping por liga + actor. Ver proposal.md para motivación.

## Goals / Non-Goals

**Goals:**
- N:M admin_partidos↔liga con CRUD restringido, scoping de writes, login con misLigas.
- Actor `createdBy` en writes y visible en lecturas de detalle.
- Backfill de asignaciones (admins existentes → todas las ligas).

**Non-Goals:**
- Sin cambios en reglas de negocio existentes (marcador, stats, estados); sin UI (eso es acsed-web); equipos/jugadores siguen globales.

## Decisions

- **Colección `Asignacion` `{userId, ligaId}` con índice único compuesto.** Rationale: N:M explícita, barata de consultar; alternativa (array `adminIds` en Liga) complica conteo de ligas por admin para `misLigas` y elmina atomicidad del mínimo-1. Rechazada.
- **Middleware `requireLigaAccess` tras `requireAdmin`.** Resuelve `ligaId` según ruta: body en `POST /partidos`, `POST /ligas/:id/admins`; entidad (`partido.ligaId`) en rutas anidadas y `PATCH/DELETE`; la propia liga en `/ligas/:id`. `admin_usuarios` pasa siempre. Rationale: un solo punto de scope; alternativa (chequeo en cada servicio) dispersa la regla — se combina: middleware resuelve ligaId, servicio valida pertenencia vía repo (testeable con fakes).
- **`createdBy` como snapshot `{userId, username}`, no referencia poblada.** Rationale: Nivel 2 muestra "quién" aunque el username cambie después; alternativa (populate) muestra el nombre actual pero pierde historia. Legacy → `null`.
- **Mínimo-1 y auto-asignación en servicio de asignaciones/ligas** (contar antes de borrar; crear asignación tras crear liga si el creador es admin_partidos). Backfill como script de migración idempotente (`asignar todos los admin_partidos a todas las ligas`, skip si ya existe) + seed actualizado.
- **Respuesta login extendida (additiva):** `{token, user, misLigas}`. No rompe clientes que ignoren el campo nuevo.

## Risks / Trade-offs

- [Risk] Olvidar scoping en una ruta nueva → Mitigation: test de matriz 403 por liga (asignado vs no asignado) + checklist en tasks.
- [Risk] JWT emitido antes del cambio no trae nada nuevo (el scope se consulta en vivo, no va en el token) → Mitigation: no se invalida nada; el token solo lleva sub/role como hoy.
- [Risk] Borrar liga deja asignaciones huérfanas → Mitigation: cascade delete de asignaciones al borrar liga.

## Migration Plan

Deploy: esquemas (Asignacion + createdBy nullable) → backfill idempotente → código con scope → seed con asignaciones. Rollback: revert de código; datos nuevos (createdBy/asignaciones) se ignoran sin romper lectura legacy.
