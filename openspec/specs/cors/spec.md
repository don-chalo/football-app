# cors Specification

## Purpose

Cross-origin access from the web frontend running on different servers, with explicitly configured allowed origins.

## Requirements

### Requirement: Configured allowed origins
The system SHALL answer cross-origin requests only for origins listed in `CORS_ORIGIN` (comma-separated env; default `http://localhost:5173`); the response SHALL echo the requesting origin in `Access-Control-Allow-Origin`.

#### Scenario: Allowed origin
- **WHEN** a browser calls `GET /health` with `Origin: http://localhost:5173`
- **THEN** the response includes that origin in `Access-Control-Allow-Origin`.

#### Scenario: Unlisted origin blocked
- **WHEN** a browser calls with an unlisted origin
- **THEN** no `Access-Control-Allow-Origin` header is returned.

### Requirement: Preflight support
OPTIONS preflight SHALL allow the API methods and the `Authorization`/`Content-Type` headers.

#### Scenario: Preflight for POST with auth
- **WHEN** a browser preflights `POST /ligas` with `Authorization`
- **THEN** it receives 204 with POST in allowed methods.
