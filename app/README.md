# Time Tracking App — Application

This directory contains the **TanStack Start scaffold** for NiteOwl's organization-aware time tracking application. Its planned purpose is recording hours worked outside scheduled hours, independently of 7shifts.

## Current implementation

The source currently exposes a starter page at `/` with the heading “Welcome to TanStack Start.” It does not yet implement organization selection, time entry, storage, sign-in, or reports. This distinction is intentional: the sections below describe both how to run the scaffold and what is planned.

## Requirements

- Node.js compatible with the installed Vite 8 toolchain (Node.js 20.19+ or 22.12+ recommended)
- npm

## Run locally

From this `app/` directory:

```bash
npm ci
npm run dev
```

The `dev` script runs `vite dev --port 3000`. Open `http://localhost:3000`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development server on port 3000 |
| `npm run generate-routes` | Generate file-based route metadata with TanStack Router CLI |
| `npm run build` | Build the production application |
| `npm run preview` | Preview the production build locally |

## Source layout

| Path | Purpose |
| --- | --- |
| `src/router.tsx` | Create/configure TanStack Router |
| `src/routes/__root.tsx` | Root document, metadata and stylesheet link |
| `src/routes/index.tsx` | Current starter home page (`/`) |
| `src/styles.css` | Basic global styles |
| `vite.config.ts` | Vite with TanStack Start and React plugins |
| `tsconfig.json` | TypeScript compiler settings and aliases |

TanStack Router generates `src/routeTree.gen.ts` from file-based routes.

## Intended product behavior

The future entry form should let the user select an organization, select the work date (defaulting to today with calendar access for earlier days), enter start and end times, and save an organization-scoped work-hours record. It should remain separate from 7shifts and should not require a scheduled shift to exist.

The organization model, authorization enforcement, storage schema, form validation, and reporting are future implementation work, not current scaffold capabilities.

## Scaffold naming note

The current `package.json`, `package-lock.json`, and `.cta.json` were generated with the name `inventory-app`. That is scaffold residue, **not** an indication that this repository is the Inventory App. These files should be renamed consistently in a separate code/configuration change to avoid unnecessary lockfile churn during documentation-only updates.
