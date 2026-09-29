## Context

football-api (Express) sin CORS; la web corre en otro origen. Ver proposal.md.

## Goals / Non-Goals

**Goals:** Habilitar la web con orígenes explícitos por env.
**Non-Goals:** Sin credenciales/cookies (auth por header), sin wildcard en producción.

## Decisions

- **Paquete `cors` con `origin: config.corsOrigins`.** Rationale: estándar, maneja preflight solo; alternativa (headers manuales) reinventa validación.
- **Sin `credentials`.** El JWT viaja en `Authorization`, no hace falta.

## Risks / Trade-offs

- [Risk] Olvidar `CORS_ORIGIN` en prod → Mitigation: documentado en README; default solo sirve para dev local.
