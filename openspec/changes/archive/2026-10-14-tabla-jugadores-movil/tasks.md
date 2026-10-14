## 1. Tabla responsive

- [x] 1.1 `TablaJugadores.tsx`: columnas Autogoles/TA/TR/Convocado/Ausencias con `hidden sm:table-cell`, fila de expansión `sm:hidden` con `colSpan={7}`, botón Detalle en nombre (`+/-`, `aria-expanded`)
- [x] 1.2 Test `TablaJugadores.test.tsx`: TA oculta en móvil, tap expande línea `AG/TA/TR/Conv/Aus`, desktop intacto
- [x] 1.3 Verificar a 360px: 6 numéricas (~48px c/u) + nombre ≈ 350px < 360px con `text-sm`; no hizo falta `text-xs`
- [x] 1.4 Ajuste: columna `%` también a la expansión (`colSpan={6}`, visibles Jugador/PJ/PG/PE/PP/Goles) + deltas actualizados

## 2. Gates

- [x] 2.1 `npx tsc --noEmit` + `npm run lint` + `npx vitest run` + `npm run build` en `acsed-web`
