# Repository Guidelines

## Project Structure & Modules
- Next.js 16 (App Router) with TypeScript.
- FSD-style layers under the project root:
  - `app/` Next pages, API routes (`app/api/**`), providers and global styles.
  - `features/` UI + hooks per feature (e.g., `sheet-table`, `theme-toggle`).
  - `entities/` domain models, atoms, API clients (e.g., `keyword`, `sheet`, `theme`).
  - `shared/` cross-cutting libs (`shared/api`, `shared/db`) and utilities.
  - `lib/` Google Sheets integration (`lib/google-sheets.ts`).
- Absolute imports via `@/*` (see `tsconfig.json`). Example: `import { api } from '@/shared';`.

## Build, Dev, and Lint
- Install: `pnpm i` (pnpm is recommended; `pnpm-lock.yaml` present).
- Dev server: `pnpm dev` (runs Next locally).
- Build: `pnpm build` (production build).
- Start: `pnpm start` (serve production build).
- Lint: `pnpm lint` (Next + ESLint config).

## Coding Style & Conventions
- Language: TypeScript, strict mode on.
- Imports: prefer absolute `@/` paths; group by layers (shared → entities → features → app).
- Components: function components, colocate feature UI under `features/<name>/ui`.
- Naming: PascalCase for components/types, camelCase for variables/functions, kebab-case for folders.
- Styling: Tailwind CSS v4 via PostCSS (`app/globals.css`). Avoid inline styles.
- State: TanStack Query (set in `app/providers.tsx`) and Jotai for local/global atoms.

## Testing
- No test framework configured yet. Recommended: Vitest + React Testing Library.
- Place tests under `tests/` or alongside files as `*.test.ts(x)`.
- Aim for meaningful unit tests on hooks and API utilities.

## Commit & PR Guidelines
- Use Conventional Commits (observed):
  - Examples: `feat(api): add keywords CRUD`, `refactor(architecture): layer exports`, `chore(deps): add mongoose`.
- PRs should include:
  - Clear description, linked issues, screenshots (UI), and test steps.
  - Scope limited to a single feature/fix; pass `pnpm lint` and build locally.

## Security & Config
- Configure `.env.local` (never commit):
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (escape newlines as `\n`).
  - `MONGODB_URI` for Mongoose (`shared/db/connection.ts`).
- API keys are server-only; do not expose via `NEXT_PUBLIC_*` unless intentional.

