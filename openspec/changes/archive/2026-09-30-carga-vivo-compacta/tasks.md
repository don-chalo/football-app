## 1. Conteos compactos por jugador

- [x] 1.1 Derivar y mostrar los conteos nonzero de `G`, `AG` y `P` con el formato `G 2`, y verificar con pruebas de componentes para `AG 1` y combinaciones como `G 2 · P 1`.
- [x] 1.2 Conservar el flujo existente de jugador seguido por tipo, sin confirmación previa, y verificar que la prueba actual de dos toques sigue pasando.

## 2. Corrección por jugador

- [x] 2.1 Agregar un control separado de quitar con botones hermanos, disponible solo cuando el jugador tenga eventos, y verificar con pruebas que abre únicamente los eventos de ese jugador.
- [x] 2.2 Eliminar eventos individuales desde la corrección por jugador, actualizar conteos y marcador mediante refresco, y verificar con pruebas que no se borran eventos de otros jugadores.
- [x] 2.3 Colapsar la cronología global por defecto manteniéndola expandible, y verificar con una prueba que sigue accesible con borrado por evento.

## 3. Verificación móvil e integral

- [x] 3.1 Verificar objetivos táctiles de al menos 44px, ausencia de botones anidados y ausencia de desplazamiento horizontal en 360px mediante pruebas y revisión manual.
- [x] 3.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test -- --run` y `npm run build` en `acsed-web`, y verificar que todos pasan.
