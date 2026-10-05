## Context

`EstadoBotones` confirma Suspender pero no Finalizar (irreversible); `useCronometro` vive en `PartidoManagePage` y su tick re-renderiza toda la página cada segundo; no hay estilos `:focus-visible`; `Loading` es texto plano. Ver proposal.md (Why). Solo `acsed-web`.

## Goals / Non-Goals

- Goals: finalizar con red, tick aislado, foco visible, skeletons.
- Non-Goals: offline, modo oscuro, cambios de API.

## Decisions

- **Confirmar Finalizar con el patrón existente.** Mismo inline Confirmar/No de Suspender/Quitar en `EstadoBotones`; sin Sheet ni modal nuevo.
- **Tick abajo, datos arriba.** `useCronometro` se mueve dentro de `Cronometro` (la única que muestra MM:SS); la página calcula `minutoAuto`/`minutoFin` sin suscribirse al tick: `minutoDePartido(p, Date.now())` se evalúa en cada render por poll/mutación (suficiente: el minuto solo se lee al abrir el sheet o pintar hitos). Alternativa (context del reloj) descartada: más piezas para el mismo ahorro.
- **Focus ring global.** Una regla `:focus-visible` en `styles.css` con anillo `cancha-600`; sin tocar componentes.
- **Skeleton mínimo.** Componente `SkeletonFilas(n)` en `ui.tsx` usado en LigasPage, fixture y workspace en lugar de `<Loading />` cuando no hay datos; `Loading` queda para casos menores.

## Risks

- Mover el hook cambia qué re-renderiza cada segundo: verificar con tests que `CargaVivo` no parpadea (test de no-regression: contar renders o snapshot de DOM estable).
- El delta `ux-movil` pisa el mismo requisito que `home-fixture-en-vivo`: archivar home-fixture primero; este bloque ya incluye sus escenarios.
