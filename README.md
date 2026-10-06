# Craneta

Craneta is a private, portable profile for the context you want AI tools to know. The frontend, API routes, authentication, and Prisma database access live together in one Next.js app. Supabase hosts the PostgreSQL database.

## Local setup

Requirements: Node.js 20 or later and npm.

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env` and `.env.local`. Keep the private connection values synchronized in both files: Prisma CLI reads `.env`, while Next.js uses `.env.local`.
3. In Supabase, open **Connect → ORM → Prisma** and copy the Session pooler URI (port 5432) into both `DATABASE_URL` and `DIRECT_URL`. Use the exact URI Supabase provides. URL-encode reserved characters in the database password.
4. Set a unique `NEXTAUTH_SECRET`. Generate one with:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
   ```

5. Generate Prisma Client and apply the committed migrations:

   ```sh
   npx prisma generate
   npm run db:migrate
   ```

6. Start the app with `npm run dev` and open <http://localhost:3000>.

Never commit `.env`, `.env.local`, or a connection string. Keep database credentials server-side; do not add them to browser code or `NEXT_PUBLIC_*` variables.

## Portfolio deployment

Deploy this single Next.js project to a host that supports Next.js, such as Vercel. Configure `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` as private server environment variables. Set `NEXTAUTH_URL` to the deployed HTTPS origin. Apply committed database migrations with `npm run db:migrate` before the first deployment that uses a new database.

The existing local SQLite database at `prisma/dev.db` is preserved locally and is not automatically copied to Supabase. The Supabase database contains the schema created by the migration; local SQLite records are separate.

Login and signup throttles currently live in process memory. This is best-effort protection for the portfolio demo: counters reset when a process restarts and are not shared across instances. Add a shared rate-limit store before scaling to multiple server instances.

## Database commands

- `npm run db:migrate:dev`: create and apply a development migration.
- `npm run db:migrate`: apply committed migrations.
- `npm run db:studio`: open Prisma Studio for the configured database.

Do not use `prisma db push` against a production database. Keep migration files in version control so schema changes are repeatable.

## Useful commands

- `npm run dev`: local development server
- `npm run lint`: ESLint
- `npm run build`: production build
