# MomCitas — Sistema de Citas Médicas

App personal para gestionar citas médicas de mamá. Antes corría con
Supabase; ahora es 100% local con Docker + Postgres para deployar en el
homelab.

## Stack

- **Frontend + Backend**: Next.js 16 (App Router, server components,
  route handlers).
- **Base de datos**: PostgreSQL 16 (corriendo en Docker).
- **Cliente DB server-side**: `pg` con `Pool`.
- **Cliente DB client-side**: `fetch` contra `/api/db` (el `pg` no
  puede correr en el browser).
- **Auth**: usuario único hardcodeado. No hay Supabase Auth, no hay
  login real, no hay JWT. Para uso personal.
- **Estilos**: Tailwind CSS + shadcn/ui.
- **Despliegue**: Docker Compose en el homelab.

## Requisitos

- Docker 24+ y Docker Compose v2.
- Node 22+ y npm (solo si vas a desarrollar sin Docker o a editar
  código).

No necesitás cuenta de Supabase, ni Vercel, ni nada externo.

## Setup local con Docker (recomendado)

```bash
# 1. Crear el archivo de variables (editá los valores si querés)
cp .env.example .env

# 2. Levantar el stack (Postgres + app)
docker compose up -d --build

# 3. Esperar a que el healthcheck de Postgres pase y la app arranque
docker compose logs -f app
```

La app queda en `http://localhost:${APP_PORT:-3000}`.

El primer arranque ejecuta `db/init.sql` automáticamente (crea el
schema, los roles, el usuario por defecto y el seed de especialidades
y ubicaciones).

### Comandos útiles

```bash
docker compose ps          # ver estado de los servicios
docker compose logs -f db  # ver logs de Postgres
docker compose logs -f app # ver logs de la app
docker compose down        # parar todo (conservando datos)
docker compose down -v     # parar todo y BORRAR el volumen de Postgres
```

### Backups

El volumen `db-data` persiste aunque bajes el stack. Para hacer
backup:

```bash
# Backup
docker compose exec -T db pg_dump -U postgres momcitas > backup-$(date +%F).sql

# Restore
cat backup-2026-07-25.sql | docker compose exec -T db psql -U postgres -d momcitas
```

Recomendación: automatizar con un cron diario en el host del homelab.

## Setup local sin Docker (modo dev)

Si querés iterar más rápido sin levantar el stack:

```bash
# 1. Levantar solo Postgres (cualquier Postgres 16 sirve)
#    Opción A: docker compose up -d db
#    Opción B: tu Postgres local

# 2. Crear la DB y correr el schema
createdb momcitas
psql -d momcitas -f db/init.sql

# 3. Configurar DATABASE_URL
export DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/momcitas"

# 4. Instalar deps y correr dev
npm install
npm run dev
```

La app queda en `http://localhost:3000`.

## Variables de entorno

Definidas en `.env.example`. Las lee `docker-compose.yml` y la app
(server-side) lee `DATABASE_URL`.

| Variable | Default | Descripción |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | `momcitas` | Password del usuario `postgres` de Postgres. |
| `POSTGRES_DB` | `momcitas` | Nombre de la base de datos. |
| `APP_PORT` | `3000` | Puerto del host mapeado al contenedor de la app. |
| `DATABASE_URL` | (compuesta en compose) | Connection string que usa `pg` en el server. |

> **Importante**: `.env` está en `.gitignore`. Commiteá cambios a
> `.env.example` y nunca pongas secretos reales en commits.

## Estructura del proyecto

```
mom-citas/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/login/         # Redirige al dashboard
│   │   ├── api/db/               # Endpoint POST que arma SQL (usado por el cliente)
│   │   └── dashboard/            # Páginas del dashboard
│   ├── components/                # Componentes React (forms, tables, lists)
│   ├── lib/
│   │   ├── db.ts                 # Pool pg + QueryBuilder (server-side)
│   │   ├── db-server.ts          # createClient() para server components
│   │   ├── db-client.ts          # createClient() para client components (fetch)
│   │   ├── auth.ts               # getUser() hardcodeado (un solo user)
│   │   └── dashboard-metrics.ts  # Cálculo de métricas
│   └── types/
│       └── database.ts           # Tipos TypeScript del schema
├── db/
│   └── init.sql                  # Schema + seed (corre en el primer boot de Postgres)
├── middleware.ts                 # Pass-through (no hay auth real)
├── next.config.ts                # output: "standalone" para el build Docker
├── Dockerfile                    # Multi-stage: deps → build → runner
├── docker-compose.yml            # db (Postgres 16) + app
├── .env.example                  # Plantilla de variables de entorno
└── package.json
```

## Deploy al homelab

El flujo es `git pull` + `docker compose up -d --build` en el server.

```bash
# En el server del homelab
cd /ruta/al/proyecto
git pull
cp .env.example .env   # la primera vez; después editá a mano
nano .env              # ajustar POSTGRES_PASSWORD, APP_PORT, etc.
docker compose up -d --build
```

### Recomendaciones para el homelab

- **Red interna**: si tenés otros servicios, sumá este stack a una red
  de Docker compartida (`networks:` ya tiene `app-net` para db ↔ app).
- **Reverse proxy**: si querés HTTPS, exponé la app con Caddy, Traefik
  o Nginx delante. La app ya escucha en `0.0.0.0:3000`.
- **Backups**: ver la sección de backups más arriba. Cron diario con
  `pg_dump` es lo mínimo.
- **Watchtower / auto-updates**: opcional. Para uso personal, los
  updates manuales con `git pull && docker compose up -d --build` son
  suficientes.
- **Acceso externo**: si querés acceder desde fuera del homelab, poné
  un VPN (Tailscale, WireGuard) en vez de exponer el puerto a
  internet. La app **no** tiene auth real.

## Migraciones de schema

Hoy hay un único archivo `db/init.sql` que corre en el primer boot.
Si más adelante necesitás cambiar el schema:

1. Editá `db/init.sql` (o creá un nuevo archivo `db/migrations/NNN_*.sql`
   si querés historial versionado).
2. Para que Postgres lo corra en containers existentes, montá los
   archivos nuevos en `/docker-entrypoint-initdb.d/` (solo corren en
   el primer boot; para containers ya inicializados, hay que correr
   `psql` a mano).
3. Rebuild: `docker compose up -d --build db`.

## Troubleshooting

- **La app arranca pero no conecta a Postgres**: revisá
  `docker compose logs app` y verificá que `DATABASE_URL` apunta a
  `db:5432` (no `localhost`) dentro de la red de Docker.
- **Cambios de schema no se aplican**: recordá que `db/init.sql` solo
  corre en el primer boot. Si ya tenés un volumen con datos, tenés
  que correr la migración a mano o destruir el volumen
  (`docker compose down -v`).
- **El login me pide credenciales que no tengo**: no hay login. La
  página `/login` redirige a `/dashboard` automáticamente. Es un
  local-only single-user.

## Próximos pasos sugeridos

- [ ] Reemplazar las variables `supabase` que quedaron en el código
      por nombres más claros (`db`, `client`).
- [ ] Endurecer RLS: hoy las policies son permisivas (`USING (true)`)
      porque hay un solo usuario. Si en el futuro se agrega auth real,
      revisar las policies de `db/init.sql`.
- [ ] Agregar tests (no hay todavía).
- [ ] HTTPS + reverse proxy en el homelab.

## Licencia

MIT (uso personal).
