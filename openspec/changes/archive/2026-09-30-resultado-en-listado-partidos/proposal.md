## Why

Las listas de partidos muestran equipos, fecha y estado, pero no el resultado. Consultar el detalle de cada partido sería un patrón N+1 costoso con polling frecuente, mientras que guardar el marcador en el partido introduciría una fuente duplicada y posible inconsistencia.

## What Changes

- `GET /partidos`, con o sin filtros, incluirá un marcador calculado por partido.
- El marcador seguirá derivándose exclusivamente de los eventos registrados.
- Las listas públicas de la liga mostrarán el resultado junto a cada partido.
- La lista administrativa de partidos de una liga mostrará el mismo resultado.
- No se agregarán llamadas al detalle por cada partido en las vistas de lista.
- No se almacenará un marcador editable o independiente en la colección de partidos.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `partidos`: el listado de partidos ahora expone el marcador calculado para cada partido.
- `publico-partidos`: la lista pública de partidos muestra el resultado calculado.
- `gestion-partido`: la lista administrativa de partidos muestra el resultado calculado.

## Impact

- API: cambia la forma de `GET /partidos`; el detalle existente no cambia su contrato.
- Backend: el servicio de listado necesitará eventos agrupados por partido y reutilizar el cálculo actual del marcador.
- Frontend: `LigaDetailPage`, `LlavesTab` si corresponde, y `LigaManagePage` consumirán el nuevo campo.
- Pruebas: se necesitarán pruebas para listas con goles, autogoles, penales, partidos sin eventos y eventos actualizados o eliminados.
