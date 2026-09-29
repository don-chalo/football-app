## Context

SPA nueva que consume football-api (+ liga-admins-audit como prerequisito: scoping, `misLigas`, `createdBy`). Sin backend propio, sin websockets. Principios fijados: mobile-first 360px, polling fijo, 2 taps por gol sin confirmación, errores visibles con reintento manual. Ver proposal.md.

## Goals / Non-Goals

**Goals:**
- Público consultable y carga rápida en celular; gestión completa alineada al orden del API.
- Cliente API tipado que refleja contrato (filtros, errores 401/403/409/422) y reglas (scope por liga).

**Non-Goals:**
- Sin SSR/SEO avanzado (SPA; si el tráfico lo pide, se evalúa prerender después); sin offline-first ni reintentos automáticos; sin nuevos componentes Radix globales más allá de los necesarios (selector, avatar, tooltip a demanda).

## Decisions

- **Vite + React + TS strict + Tailwind + react-router-dom.** Rationale: lo pedido; build rápido, tipado punta a punta con el contrato. Alternativa (Next/SSR) rechazada — el contenido es dinámico por liga y el SEO no es prioridad hoy.
- **Capas: `pages/` → `components/` → `hooks/` → `api/` (cliente tipado + auth).** Estado de servidor con fetching explícito + polling (sin librería de cache al inicio; si el polling se enreda, evaluar TanStack Query). Rationale: MVP simple, pocas pantallas; alternativa (Redux/Zustand global) sobra — el estado vive en el API.
- **Auth: JWT en memoria + persistencia local, contexto `Session` con user/role/misLigas, guardas por ruta.** 401 → logout a login; 403 → mensaje de scope. Rationale: simple y suficiente; alternativa (httpOnly cookies) exigiría cambio del API.
- **Polling dedicado `usePolling(fn, ms, {activo})`:** 5s carga, 10–15s público, pausa con `document.hidden`, refresh inmediato tras mutación propia. Rationale: sin websockets en el API.
- **Carga en 2 taps:** lista agrupada por equipo → bottom-sheet (Radix Dialog) con 3 botones ≥56px → POST inmediato; minuto opcional colapsado; toast Deshacer + lista reciente con `x`. Rationale: velocidad al borde de la cancha; corrección vía DELETE existente.
- **Rutas:** `/ligas`, `/ligas/:id` (tabs Partidos/Tabla|Llaves/Jugadores), `/partidos/:id`, `/estadisticas/*`, `/login`, `/admin` (mis ligas), `/admin/...` gestión. Admin con 0 ligas → empty state.
- **Tests front:** Testing Library para flujos críticos (2 taps registra, undo borra, 403 muestra mensaje, tabla ordena); resto con verificación manual contra seed. Gate: `tsc --noEmit` + lint + tests en verde.

## Risks / Trade-offs

- [Risk] Polling y batería/datos en celular → Mitigation: intervalos fijos moderados + pausa oculta; sin acortar sin medir.
- [Risk] Doble tap accidental registra gol fantasma → Mitigation: undo inmediato + borrado en lista; no se agrega confirmación (decisión explícita).
- [Risk] Prerequisito API no implementado (misLigas/createdBy/scope) → Mitigation: desarrollar contra mocks del contrato hasta que liga-admins-audit esté aplicado; tasks marcan el orden.
- [Risk] Radix a demanda diverge en estilos → Mitigation: wrapper propio mínimo (Button/Sheet/Select) sobre Radix + Tailwind desde el inicio.

## Migration Plan

Proyecto nuevo en `acsed-web/`: scaffold → cliente API + auth → público → carga → gestión → auditoría visible. Sin migración ni rollback de datos.
