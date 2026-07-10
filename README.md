# Club de Frontón 2880 — Plataforma Digital

Plataforma web fullstack para la gestión competitiva y social del Club de Frontón 2880 (Bolivia), modalidad dobles (2 vs 2).

Spec completa del producto: `Reporte Proyecto Club Fronton Bolivia.pdf`. Guía para desarrollo frontend (API, estado actual, orden de trabajo): [`FRONTEND_BRIEF.md`](./FRONTEND_BRIEF.md).

## Identidad de marca

<img src="./frontend/public/brand/logo.png" alt="Logo Club de Frontón 2880" width="160" />

*(colocar el archivo del logo en `frontend/public/brand/logo.png` — ver [`frontend/public/brand/BRAND.md`](./frontend/public/brand/BRAND.md) para la descripción completa)*

| Verde Bosque | Crema Cálido | Dorado | Burdeos |
|---|---|---|---|
| `#0F3D2E` | `#F3EDE2` | `#C8A15A` | `#7A1F2B` |

Paleta sobria y atemporal: tradición del frontón, elegancia clásica de club social, pasión por el juego. **No** es un tema oscuro de esports — corrige la descripción genérica del PDF original. Detalle completo en [`frontend/public/brand/BRAND.md`](./frontend/public/brand/BRAND.md).

## Stack

- **Backend:** NestJS + TypeScript, Prisma ORM, PostgreSQL, JWT + refresh tokens.
- **Frontend:** Next.js + TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, Framer Motion, Chart.js/Recharts.
- **Infra:** Docker (Postgres).

## Quick start

```bash
# Postgres
docker compose up -d postgres

# Backend
cd backend && npm install && npx prisma migrate dev && npm run start:dev   # http://localhost:3000

# Frontend (puerto 3001: el backend tiene CORS configurado para ese origen)
cd frontend && npm install && npm run dev -- -p 3001                       # http://localhost:3001
```

## Estado del proyecto

Backend: Auth (JWT+refresh), CRUD de Players/Seasons, y Registro de Partidos con ranking ELO automático — funcionales y probados. Frontend: scaffold inicial, sin pantallas propias todavía. Detalle completo del avance y próximos pasos en [`FRONTEND_BRIEF.md`](./FRONTEND_BRIEF.md).
