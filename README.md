# FikirCreative Prospector

Internal lead prospecting tool built with Next.js 14, TypeScript, Prisma, Tailwind CSS, and NextAuth v5.

## Tech Stack
- Next.js 14 (App Router)
- React 18
- NextAuth v5 (Google OAuth with allowlist)
- Prisma 6 with SQLite
- Tailwind CSS 3
- Zod for runtime validation

## Prerequisites
- Node.js 20+
- pnpm (recommended)

## Environment Variables
Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:
- `NODE_ENV`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `DATABASE_URL` (defaults to `file:./prisma/dev.db`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ALLOWED_EMAILS` (comma-separated list)
- `GOOGLE_MAPS_API_KEY`

## Setup
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Apply the initial database migration:
   ```bash
   pnpm prisma:migrate
   ```
3. Generate the Prisma client (also run automatically by `postinstall` if configured):
   ```bash
   pnpm prisma:generate
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) and sign in with an allowlisted Google account.

## Scripts
- `pnpm dev` - Start Next.js development server.
- `pnpm build` - Create production build.
- `pnpm start` - Start production server (after build).
- `pnpm prisma:generate` - Generate Prisma client.
- `pnpm prisma:migrate` - Apply pending migrations.

## Database
SQLite database is stored at `prisma/dev.db`. Adjust `DATABASE_URL` if you wish to use another database.

## Project Structure
- `src/app` - App Router routes and pages.
- `src/auth.ts` - NextAuth configuration and exports.
- `src/lib` - Environment parsing, config, and Prisma client.
- `src/app/api` - API routes for Google Places search and lead persistence.

## Google APIs
This project uses the Google Places Text Search and Place Details APIs. Ensure the provided API key has access to the Places API and that billing is enabled.

## Styling
Tailwind CSS with custom brand tokens (black/white/red) and utility classes defined in `globals.css`.

## Deployment
Before deploying, ensure all environment variables are set in your hosting environment. Run `pnpm build` followed by `pnpm start`.
