## 1. Base

- [x] 1.1 Scaffold Vite React+TS+Tailwind+router en `acsed-web/` y verificar `tsc --noEmit`, lint y dev arrancan
- [x] 1.2 Implementar cliente API tipado (ligas, partidos, eventos, stats, errores 401/403/409/422) + `usePolling` con pausa oculta y verificar contra API con seed
- [x] 1.3 Implementar auth (login, sesión, guardas, logout, 401→login) y verificar flujo con usuarios seed

## 2. Público (ola 1)

- [x] 2.1 Implementar `/ligas` y `/ligas/:id` (tabs Partidos/Tabla|Llaves/Jugadores según formato) y verificar con seed
- [x] 2.2 Implementar `/partidos/:id` pública con marcador + polling 10–15s y verificar que un gol aparece sin recargar
- [x] 2.3 Implementar estadísticas (tabla, goleadores/autogoles, historial) con filtros año/liga/equipo y verificar orden y rango >1a muestra error

## 3. Carga en vivo (ola 2)

- [x] 3.1 Implementar crear partido + convocatorias/ausentes + estados y verificar flujo programado→en_juego→finalizado
- [x] 3.2 Implementar goles en 2 taps (bottom-sheet, minuto opcional) + deshacer + estados envío/error con reintento manual y verificar en 360px + tests del flujo crítico
- [x] 3.3 Implementar penales mínimo + corrección en finalizado y verificar que la tanda no altera goleadores

## 4. Gestión y auditoría (ola 3)

- [x] 4.1 Implementar CRUD ligas/equipos/jugadores + bulk con errores inline + gestión usuarios/asignaciones (solo admin_usuarios) y verificar 409/403 visibles
- [x] 4.2 Implementar home mis ligas (empty state con 0) + auditoría visible (quién creó/cargó qué, "sin registro" en legacy) y verificar en ficha y gestión
- [x] 4.3 Verificar gates (`tsc`, lint, tests), matriz de roles E2E y documentar en `acsed-web/README.md` (rutas, polling, variables de entorno del API)
