# Historias de usuario

Índice de historias de usuario del proyecto, agrupado por funcionalidad.

## Nomenclatura de archivos

```
YYYYMMDD-HU-<ID>-<correlativo>.md
```

| Parte | Descripción |
|---|---|
| `YYYYMMDD` | Fecha de **creación** de la historia. No cambia aunque la historia se modifique o cambie de estado. |
| `HU` | Prefijo fijo de historia de usuario. |
| `<ID>` | Identificador de la funcionalidad, en mayúsculas (por ejemplo `MVP`, `CONV`). |
| `<correlativo>` | Número de la historia dentro de su funcionalidad, con dos dígitos (`01`, `02`, ...). |

Ejemplo: `20261121-HU-MVP-01.md` corresponde a la historia `HU-MVP-01`, de la funcionalidad MVP, creada el 21/11/2026.

Reglas:
- El correlativo es por funcionalidad, no global.
- Una historia que cambia de funcionalidad conserva su nombre de archivo; solo se actualiza el índice.
- Dentro de cada grupo, las historias se ordenan por fecha de creación.

## Estados de una historia

El estado se registra únicamente en la tabla de este índice.

| Estado | Significado |
|---|---|
| **Propuesta** | Historia redactada, aún no aprobada. Puede seguir cambiando. |
| **Aprobada** | Definición cerrada y aceptada. Es la base para el desarrollo. |
| **En desarrollo** | Implementación en curso. |
| **Terminada** | Implementada y verificada según sus criterios de aceptación. |
| **Descartada** | Ya no se implementará. Se conserva el archivo para trazabilidad. |

Flujo habitual: `Propuesta` → `Aprobada` → `En desarrollo` → `Terminada`. Desde cualquier estado puede pasar a `Descartada`.

## Índice

### MVP

| ID | Historia | Estado | Archivo |
|---|---|---|---|
| HU-MVP-01 | Registrar el MVP del partido finalizado | En desarrollo | [20261121-HU-MVP-01.md](20261121-HU-MVP-01.md) |
