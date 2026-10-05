## Why

El operador trabaja apurado y con sol: "Finalizar partido" es irreversible y hoy es 1 tap sin red; la página de gestión re-renderiza cada segundo por el tick del reloj; y navegar con teclado no muestra foco. Tres fricciones chicas con costo bajo y riesgo operativo (un roce termina un partido) o de accesibilidad.

## What Changes

- "Finalizar partido" con confirmación inline (mismo patrón Confirmar/No que Quitar/Suspender), solo en `en_juego`.
- Tick del reloj aislado: `useCronometro` vive solo en la Card que muestra el tiempo; `CargaVivo` memoizado o sin suscripción al tick (recibe `minutoAuto` ya calculado).
- `:focus-visible` con anillo verde en interactivos (botones, links, tabs, filas).
- Skeletons con la forma de la lista en vez de "Cargando..." en vistas principales (ligas, fixture, workspace).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `gestion-partido`: finalizar exige confirmación inline.
- `ux-movil`: foco visible por teclado; skeletons de carga en vistas principales.

## Impact

- Solo `acsed-web`: `EstadoBotones`, `Cronometro`/`CargaVivo`, estilos globales, `Loading` o skeletons por vista, tests.
- Sin cambios de API ni de comportamiento funcional (mismos endpoints y estados).
