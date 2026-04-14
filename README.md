# MomCitas - Sistema de Citas Médicas

Sistema de gestión de citas médicas para uso personal compartido.

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase (Postgres + Auth)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel (compatible)

## Requisitos

- Node.js 18+
- Cuenta de Supabase (tier gratuito)

## Setup Local

### 1. Clonar el proyecto

```bash
cd mom-citas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Copiar las credenciales del proyecto:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Crear archivo `.env.local` en la raíz:

```bash
cp .env.example .env.local
# Editar .env.local con las credenciales
```

### 4. Ejecutar migraciones

1. Ir al dashboard de Supabase → SQL Editor
2. Copiar el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ejecutar el SQL

### 5. Ejecutar seed (opcional)

1. En SQL Editor de Supabase
2. Copiar el contenido de `supabase/seed.sql`
3. Ejecutar (remover `auth.uid()` y usar valores hardcodeados o crear función)

### 6. Levantar servidor local

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
mom-citas/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Rutas de autenticación
│   │   ├── (dashboard)/     # Rutas protegidas
│   │   └── ...
│   ├── components/           # Componentes React
│   │   ├── ui/             # shadcn/ui components
│   │   └── sidebar.tsx     # Navegación
│   ├── lib/
│   │   ├── supabase/       # Clientes Supabase
│   │   └── utils.ts        # Utilidades
│   └── types/
│       └── database.ts     # Tipos de BD
├── supabase/
│   ├── migrations/         # Schema SQL
│   └── seed.sql           # Datos iniciales
└── middleware.ts          # Auth middleware
```

## Despliegue en Vercel

1. Hacer push a GitHub
2. Conectar repo en [vercel.com](https://vercel.com)
3. Agregar variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Próximos Pasos

- [ ] CRUD de Pacientes
- [ ] CRUD de Citas
- [ ] Dashboard con gráficos
- [ ] Exportar/Importar desde Excel

## Licencia

MIT
