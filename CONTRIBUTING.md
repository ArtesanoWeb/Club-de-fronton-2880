# Flujo de trabajo (Git)

Monorepo con `frontend/` y `backend/`. Dos agentes trabajando en paralelo (uno por área) más el rol de mantenimiento/deploy.

## Ramas

- **`main`** — rama oficial/producción. Protegida: nadie commitea directo, solo entra por PR. Siempre debe quedar en estado deployable.
- **`develop`** — rama de integración. Aquí se juntan los cambios de frontend y backend antes de pasar a `main`.
- **Ramas de trabajo (cortas, por tarea)** — se crean desde `develop`, viven días no semanas:
  - `feat/frontend-<algo>` — ej. `feat/frontend-players-crud`
  - `feat/backend-<algo>` — ej. `feat/backend-rankings`
  - `fix/<algo>` — bugfixes
  - `chore/<algo>` — infra, config, docs

No mantener una rama "frontend" y otra "backend" viviendo en paralelo por mucho tiempo: ambas tocan archivos compartidos (`docker-compose.yml`, `README.md`, tipos compartidos) y generan merges dolorosos. Rama corta → PR → merge → borrar.

## Flujo típico por tarea

1. `git checkout develop && git pull`
2. `git checkout -b feat/backend-rankings`
3. Trabajar, commitear en chico
4. Push + PR contra `develop`
5. Review (o autoreview si trabajas solo) + merge
6. Cuando `develop` esté estable, PR de `develop` → `main` (esto dispara el deploy)

## Deploy

No usar una rama `deploy` editada a mano. El deploy debe ser resultado automático de:
- un merge a `main`, o
- un tag `vX.Y.Z` sobre `main`,

disparado por CI/CD. Si el pipeline exige sí o sí una rama `deploy`, que sea un espejo automático de `main` (nunca destino de commits manuales).

## Commits

Mensajes imperativos y descriptivos (`Add match registration with ELO ranking automation`), como ya se viene haciendo en el historial.
