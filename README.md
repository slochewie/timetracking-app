# Time Tracking App

NiteOwl's planned organization-aware app for recording work performed **outside scheduled hours**. The workflow is intentionally independent of 7shifts: entries are recorded directly rather than imported from or reconciled against a schedule.

## Project status

**Scaffold stage.** The repository currently contains a minimal TanStack Start application with a single starter page. Organization selection, time-entry forms, authentication, persistence, and reporting are not implemented in the inspected scaffold.

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

## Planned work

- Organization-aware time entry and organization-scoped access.
- Date picker defaulting to the current date, with support for historical entry.
- Start/end time selection and validation, including a clear policy for overnight work.
- Persistent records, entry review, and editing.
- Authentication and authorization appropriate to the existing NiteOwl organization model.

Implementation details for data storage, reporting, deployment, and approval workflows remain to be decided. No schedule import or 7shifts integration is planned.

