## 1. API bulk

- [x] 1.1 Extender `convocatoriaSchema` para aceptar lote `{ equipoId, jugadorIds[] }` (máx. 30) además del objeto simple
- [x] 1.2 Agregar `convocarLote()` al servicio: valida equipo local/visita, salta duplicados, devuelve `{ creados, omitidos }`
- [x] 1.3 Tests API: lote ok, duplicado interno salteado, duplicado por carrera salteado, equipo inválido 422, tope de tamaño

## 2. Web multi-select

- [x] 2.1 Sheet con selección múltiple (toggle + `aria-pressed` + check), input de filtro por nombre, lista con scroll y botón "Agregar (N)"
- [x] 2.2 Servicio `convocatorias.agregar` manda el lote; toast de confirmación, cerrar sheet y un solo `onCambio()`
- [x] 2.3 Tests web: dos selecciones generan un solo POST con la lista, el filtro reduce opciones, el botón muestra el conteo y se deshabilita en 0

## 3. Gates

- [ ] 3.1 `tsc`, `lint`, tests API + web, `build` en verde
