# Transfer Efecty v2

Reescritura de la plataforma (`../www/`, PHP + MySQL) en **Next.js 16 +
TypeScript + Postgres**, pensada para desplegarse en Vercel con CI/CD desde
GitHub.

Antes de tocar código, leer:

- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) — stack, decisiones y por qué.
- [`docs/PARIDAD.md`](docs/PARIDAD.md) — checklist de qué está portado y qué falta.
- [`docs/MIGRACION-DATOS.md`](docs/MIGRACION-DATOS.md) — plan para el día del corte a producción.

## Arranque en local

Requisitos: Node.js 20+, una base Postgres (local con Docker, o gratis en
[Neon](https://neon.tech)).

```bash
cd v2
npm install
cp .env.example .env.local
# Editar .env.local:
#   DATABASE_URL / DIRECT_URL  → tu Postgres
#   SESSION_SECRET             → openssl rand -base64 32
#   APP_ENCRYPTION_KEY         → openssl rand -base64 32

npm run db:push    # crea las tablas desde prisma/schema.prisma
npm run db:seed    # usuarios y datos de prueba

npm run dev
```

Abrir:
- http://localhost:3000
- http://localhost:3000/app/login
- http://localhost:3000/admin/dashboard

Credenciales tras el seed (contraseña `Demo1234` para las tres):
- `admin@transferefecty.com` — SuperAdmin
- `superworker@transferefecty.com` — SuperWorker
- `demo@transferefecty.com` — Cliente (código de oficina para registrar otro cliente de prueba: `CEN000`, válido el mismo día que corriste el seed)

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run db:push` | Sincroniza `prisma/schema.prisma` → Postgres (desarrollo) |
| `npm run db:migrate` | Migraciones versionadas de Prisma (usar en vez de `db:push` cuando el schema esté más estable) |
| `npm run db:seed` | Datos de prueba |
| `npm run db:studio` | UI de Prisma para inspeccionar la base |

## Despliegue (cuando esté listo)

1. Subir este repo a GitHub (puede ser el mismo repo del proyecto o uno
   nuevo sólo para `v2/` — pendiente de decidir con el cliente).
2. Importar el repo en Vercel.
3. Cargar las variables de `.env.example` en Vercel → Project Settings →
   Environment Variables (nunca committear `.env.local`).
4. Cada push a una rama abre un preview deploy; `main` despliega a producción.

## Nota sobre Next.js 16

Este proyecto usa Next.js 16, que cambió algunas convenciones de versiones
anteriores (por ejemplo `middleware.ts` → `src/proxy.ts`). Antes de escribir
código nuevo contra el App Router, conviene revisar
`node_modules/next/dist/docs/01-app/` — Next.js empaqueta su documentación
versionada ahí mismo, y es más confiable que dar por hecho patrones de
versiones anteriores.
