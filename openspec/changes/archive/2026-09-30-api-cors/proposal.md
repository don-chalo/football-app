## Why

La web acsed-web correrá en un servidor distinto al API (Vite dev en `localhost:5173`, producción en otro origen). Sin CORS los navegadores bloquean todas las llamadas. Se registra el contrato cross-origin ya implementado.

## What Changes

- Middleware `cors` con orígenes configurables vía env `CORS_ORIGIN` (coma-separados; default `http://localhost:5173`).
- Preflight OPTIONS habilitado con métodos y `Authorization`.
- Orígenes no listados no reciben `Access-Control-Allow-Origin`.

## Capabilities

### New Capabilities
- `cors`: orígenes permitidos, preflight, bloqueo de no listados.

### Modified Capabilities
- Ninguna.

## Impact

- Solo `football-api/` (middleware + config + docs). Sin cambios de endpoints ni modelos.
