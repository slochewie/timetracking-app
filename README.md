# Time Tracking App

NiteOwl's planned organization-aware app for recording work performed **outside scheduled hours**. The workflow is intentionally independent of 7shifts: entries are recorded directly rather than imported from or reconciled against a schedule.

## Project status

The application now uses the central NiteOwl Better Auth session and organization
context and supports persistent self-managed time entries through the dedicated
Time Tracking auth plugin.

## Intended workflow

1. Select the organization for which the work was performed.
2. Choose the work date; default to the current date, with a calendar control for entering work from a previous day.
3. Enter the start and end times.
4. Save the record against the selected organization.

The goal is straightforward entry of hours worked outside the regular schedule. This is **not** a clock-in/clock-out replacement or a 7shifts integration.

## Repository layout

- `app/` — TanStack Start application, TypeScript/React source, npm dependencies, and build configuration.
- `app/src/routes/` — file-based routes; currently only the root route and starter home route.
- `app/src/styles.css` — starter CSS.
- `app/README.md` — app-level setup and development notes.

## Development

From the repository root:

```bash
cd app
npm ci
npm run dev
```

The Vite development server is configured for port **3000**.

To build:

```bash
cd app
npm run build
```

Additional scripts: `npm run generate-routes` generates TanStack Router route types, and `npm run preview` previews a production build.

## Technology

The current scaffold uses TanStack Start, TanStack Router, React 19, TypeScript, Vite, and npm. It uses basic CSS; Tailwind CSS and shadcn/ui are not present in the inspected scaffold.

## Implemented workflow

- Organization-aware time entry and organization-scoped access.
- Date, start/end time, overnight, and notes entry.
- Persistent create, history, edit, and delete operations.
- Central Better Auth authentication and organization selection.
- Server-side duration calculation, membership validation, isolation, and ownership.

No schedule import or 7shifts integration is planned.

