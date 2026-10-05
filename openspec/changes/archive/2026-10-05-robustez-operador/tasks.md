## 1. Red de seguridad y rendimiento

- [x] 1.1 Confirmación inline en "Finalizar" (`EstadoBotones`) + test.
- [x] 1.2 Aislar el tick: `useCronometro` dentro de `Cronometro`; página calcula minutos sin tick; test de no-regression de renders.

## 2. Accesibilidad y carga

- [x] 2.1 Regla `:focus-visible` global + verificación por teclado en vistas principales.
- [x] 2.2 `SkeletonFilas` en `ui.tsx` aplicado a ligas, fixture y workspace + tests.
- [x] 2.3 Gates `npm run typecheck`, `npm run lint`, `npm test -- --run`, `npm run build` en `acsed-web`.
