# Time Tracking App

NiteOwl time-entry application built on the existing TanStack Start scaffold.

## Product requirements

Follow the Design Time Tracking App brief: authenticated user and organization context, manual work date and start/end times, calculated duration, organization-specific entry history, and persistence through a dedicated Better Auth plugin. No stopwatch, 7shifts integration, schedule comparisons, or payroll calculations.

## Implemented foundation

- Existing NiteOwl Better Auth client with organization support.
- Shared NiteOwl sidebar identity, deployment branding, and organization selector.
- Manual date/start/end entry with notes and overnight validation.
- Entry-history view ready for the organization-scoped data layer.
- Correct application metadata.

## Auth integration

The app lists, creates, updates, and deletes the current user's entries through the dedicated Time Tracking plugin. The Auth service derives the user from the session and enforces active organization membership, organization isolation, and entry ownership server-side.

`timetracking.niteowl.dev` and `timetracking.mccarthysirishpub.com` must remain in the Auth service's `BETTER_AUTH_TRUSTED_ORIGINS` value for cross-origin session requests.

## Development

From the repository root:

    docker compose exec timetracking-app npm run dev -- --host 0.0.0.0
    docker compose exec timetracking-app npx tsc --noEmit
    docker compose exec timetracking-app npm run build

Host port: 3460. The Compose service starts the Vite development server on container startup.
