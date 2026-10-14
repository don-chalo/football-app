## 1. Helper + formato

- [x] 1.1 `utils/compartir.ts`: `textoResultado(detalle, nombres, origin)` (líneas marcador/liga-goles-penales/link, reglas minuto/conteo/sufijos)
- [x] 1.2 Test unitario: 5 casos (con minutos, autogol, sin minutos, penales, 0-0) + minuto mixto

## 2. Botones

- [x] 2.1 `PartidoPage`: botón Compartir bajo el header solo en finalizado (nombre de liga vía servicio)
- [x] 2.2 `PartidoManagePage`: botón junto a estado solo en finalizado
- [x] 2.3 Tests: botón presente con href `wa.me` en finalizado, ausente en otros estados (ambas páginas)

## 3. Gates

- [x] 3.1 `npx tsc --noEmit` + `npm run lint` + `npx vitest run` + `npm run build` en `acsed-web`
