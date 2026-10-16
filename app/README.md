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

## Outstanding integration

The auth service does not yet provide a time-entry plugin. Saving remains disabled and history does not display fabricated data. Implement the dedicated plugin and server-side authorization before enabling save/history. Every persisted record must belong to a verified authenticated user and organization; derive the user from the session and verify organization membership server-side.

The LAN preview does not currently verify the central NiteOwl session. Validate authentication on the configured domain and its trusted-origin/cookie setup before claiming login and organization selection work end-to-end.

## Development

From the repository root:

    docker compose exec timetracking-app npm run dev -- --host 0.0.0.0
    docker compose exec timetracking-app npx tsc --noEmit
    docker compose exec timetracking-app npm run build

Host port: 3460. The Compose service still uses the existing sleep-infinity development pattern; start the development server again after a container restart.
