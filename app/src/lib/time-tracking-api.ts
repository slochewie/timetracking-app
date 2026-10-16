import { authBaseURL } from "./auth-client";

export type TimeEntry = {
  id: string;
  organizationId: string;
  userId: string;
  workDate: string;
  startTime: string;
  endTime: string;
  endsNextDay: boolean;
  durationMinutes: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TimeEntryInput = {
  organizationId: string;
  workDate: string;
  startTime: string;
  endTime: string;
  endsNextDay: boolean;
  notes: string | null;
};

function authEndpoint(path: string) {
  return `${authBaseURL.replace(/\/$/, "")}${path}`;
}

async function readResponse<T>(response: Response, fallbackError: string) {
  const result = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(typeof result.error === "string" ? result.error : fallbackError);
  }
  return result;
}

export async function listTimeEntries(organizationId: string, signal?: AbortSignal) {
  const url = new URL(authEndpoint("/api/auth/time-tracking/entries"));
  url.searchParams.set("organizationId", organizationId);
  const response = await fetch(url, { credentials: "include", signal });
  const result = await readResponse<{ entries?: TimeEntry[] }>(response, "Unable to load time entries.");
  return Array.isArray(result.entries) ? result.entries : [];
}

export async function createTimeEntry(input: TimeEntryInput) {
  const response = await fetch(authEndpoint("/api/auth/time-tracking/entries/create"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const result = await readResponse<{ entry?: TimeEntry }>(response, "Unable to create the time entry.");
  if (!result.entry) throw new Error("Time entry creation completed without an entry.");
  return result.entry;
}

export async function updateTimeEntry(entryId: string, input: TimeEntryInput) {
  const response = await fetch(authEndpoint("/api/auth/time-tracking/entries/update"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...input, entryId }),
  });
  const result = await readResponse<{ entry?: TimeEntry }>(response, "Unable to update the time entry.");
  if (!result.entry) throw new Error("Time entry update completed without an entry.");
  return result.entry;
}

export async function deleteTimeEntry(organizationId: string, entryId: string) {
  const response = await fetch(authEndpoint("/api/auth/time-tracking/entries/delete"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ organizationId, entryId }),
  });
  const result = await readResponse<{ deleted?: boolean }>(response, "Unable to delete the time entry.");
  if (result.deleted !== true) throw new Error("Time entry deletion did not complete.");
}
