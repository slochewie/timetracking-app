import { getDeploymentBrand } from "@niteowl/app-config";
import { OrganizationSelector } from "@niteowl/ui/organization";
import { AppSidebarIdentity, useCurrentHostname } from "@niteowl/ui/shell";
import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";

import { authBaseURL, authClient } from "../lib/auth-client";
import {
  createTimeEntry,
  deleteTimeEntry,
  listTimeEntries,
  type TimeEntry,
  updateTimeEntry,
} from "../lib/time-tracking-api";

export const Route = createFileRoute("/")({ component: TimeTracking });

function localDate() {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function minutes(time: string) {
  const [hours = 0, minutesValue = 0] = time.split(":").map(Number);
  return hours * 60 + minutesValue;
}

function formatDuration(durationMinutes: number) {
  return `${Math.floor(durationMinutes / 60)}h ${String(durationMinutes % 60).padStart(2, "0")}m`;
}

type WorkPeriod = { id: string; start: string; end: string; overnight: boolean };

function emptyPeriod(): WorkPeriod {
  return { id: crypto.randomUUID(), start: "", end: "", overnight: false };
}

function periodDuration(period: WorkPeriod) {
  if (!period.start || !period.end) return 0;
  return minutes(period.end) - minutes(period.start) + (period.overnight ? 1440 : 0);
}

function TimeTracking() {
  const hostname = useCurrentHostname();
  const brand = getDeploymentBrand(hostname ?? "");
  const { data: session, isPending: sessionPending, error: sessionError } = authClient.useSession();
  const { data: organizations, isPending: organizationsPending } = authClient.useListOrganizations();
  const { data: organization } = authClient.useActiveOrganization();
  const [date, setDate] = useState(localDate);
  const [periods, setPeriods] = useState<WorkPeriod[]>(() => [emptyPeriod()]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"entry" | "history">("entry");
  const [switching, setSwitching] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const durations = periods.map(periodDuration);
  const validPeriods = periods.every((period, index) => Boolean(period.start && period.end) && durations[index] > 0 && durations[index] <= 1440);
  const totalDuration = durations.reduce((total, value) => total + value, 0);

  useEffect(() => {
    if (!session?.user || !organization?.id) {
      setEntries([]);
      return;
    }

    const controller = new AbortController();
    setLoadingEntries(true);
    setError("");
    void listTimeEntries(organization.id, controller.signal)
      .then(setEntries)
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : "Unable to load time entries.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingEntries(false);
      });
    return () => controller.abort();
  }, [organization?.id, session?.user.id]);

  function resetForm() {
    setDate(localDate());
    setPeriods([emptyPeriod()]);
    setNotes("");
    setEditingId(null);
  }

  function updatePeriod(id: string, changes: Partial<Omit<WorkPeriod, "id">>) {
    setPeriods((current) => current.map((period) => period.id === id ? { ...period, ...changes } : period));
  }

  function addPeriod() {
    setPeriods((current) => [...current, emptyPeriod()]);
  }

  function removePeriod(id: string) {
    setPeriods((current) => current.filter((period) => period.id !== id));
  }

  async function changeOrganization(organizationId: string) {
    setSwitching(true);
    setError("");
    resetForm();
    try {
      const result = await authClient.organization.setActive({ organizationId });
      if (result.error) setError(result.error.message || "Unable to change organization.");
    } catch {
      setError("Unable to change organization. Try again.");
    } finally {
      setSwitching(false);
    }
  }

  function signIn() {
    const url = new URL("/auth/sign-in", authBaseURL);
    url.searchParams.set("callbackURL", window.location.href);
    window.location.assign(url.toString());
  }

  async function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization?.id || !validPeriods) return;
    setSaving(true);
    setError("");
    try {
      const inputs = periods.map((period) => ({ organizationId: organization.id, workDate: date, startTime: period.start, endTime: period.end, endsNextDay: period.overnight, notes: notes.trim() || null }));
      const savedEntries = editingId ? [await updateTimeEntry(editingId, inputs[0])] : await Promise.all(inputs.map(createTimeEntry));
      setEntries((current) => [...savedEntries, ...current.filter((item) => !savedEntries.some((saved) => saved.id === item.id))].sort((left, right) => `${right.workDate} ${right.startTime}`.localeCompare(`${left.workDate} ${left.startTime}`)));
      resetForm();
      setTab("history");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the time entry.");
    } finally {
      setSaving(false);
    }
  }

  function editEntry(entry: TimeEntry) {
    setDate(entry.workDate);
    setPeriods([{ id: crypto.randomUUID(), start: entry.startTime, end: entry.endTime, overnight: entry.endsNextDay }]);
    setNotes(entry.notes ?? "");
    setEditingId(entry.id);
    setError("");
    setTab("entry");
  }

  async function removeEntry(entryId: string) {
    if (!organization?.id) return;
    if (!window.confirm("Delete this time entry? This cannot be undone.")) return;
    setDeletingId(entryId);
    setError("");
    try {
      await deleteTimeEntry(organization.id, entryId);
      setEntries((current) => current.filter((entry) => entry.id !== entryId));
      if (editingId === entryId) resetForm();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete the time entry.");
    } finally {
      setDeletingId(null);
    }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <AppSidebarIdentity brand={brand} appName="Time Tracking" href="/" />
      <p className="nav-label">WORKSPACE</p>
      <button className={tab === "entry" ? "nav-item selected" : "nav-item"} onClick={() => setTab("entry")}>Time entry</button>
      <button className={tab === "history" ? "nav-item selected" : "nav-item"} onClick={() => setTab("history")}>Entry history</button>
      <div className="sidebar-bottom">Time Tracking<span>Organization workspace</span></div>
    </aside>
    <div className="workspace">
      <header><span>Time Tracking</span><div className="account">{session?.user ? <span>{session.user.name}</span> : <button className="secondary" onClick={signIn} disabled={sessionPending}>{sessionPending ? "Checking session…" : "Sign in"}</button>}</div></header>
      <main>
        <div className="page-heading"><p className="eyebrow">TIME TRACKING</p><h1>{tab === "entry" ? "Record your time" : "Entry history"}</h1><p>{tab === "entry" ? "Enter the date and hours you worked." : "View time recorded for your active organization."}</p></div>
        <section className="organization-card">
          <OrganizationSelector organizations={organizations || []} value={organization?.id} onValueChange={(id) => void changeOrganization(id)} title="Organization" placeholder={session?.user ? "Select an organization" : "Sign in to choose an organization"} loading={Boolean(session?.user) && organizationsPending} disabled={!session?.user || switching} variant="compact" className="organization-control" selectClassName="organization-select" />
          {sessionError ? <p className="notice">Unable to verify your NiteOwl session on this address. Sign in through your configured NiteOwl host.</p> : !sessionPending && !session?.user ? <p className="notice">Sign in with your NiteOwl account to record time for your organization.</p> : null}
        </section>
        {error ? <p className="error" role="alert">{error}</p> : null}
        {tab === "entry" ? <section className="entry-card">
          <div className="card-heading"><h2>{editingId ? "Edit time entry" : "New time entry"}</h2><p>Record one or more completed periods of work.</p></div>
          <form onSubmit={submitEntry}>
            <label>Work date<input required type="date" value={date} onInput={(event) => setDate(event.currentTarget.value)} /></label>
            <div className="period-list">{periods.map((period, index) => {
              const periodIsValid = durations[index] > 0 && durations[index] <= 1440;
              return <fieldset className="period" key={period.id}><legend>Work period {index + 1}</legend><div className="period-heading"><span>{period.start && period.end && periodIsValid ? formatDuration(durations[index]) : "Enter start and end times"}</span>{periods.length > 1 && !editingId ? <button className="remove-period" type="button" onClick={() => removePeriod(period.id)} aria-label={`Remove work period ${index + 1}`}>Remove</button> : null}</div><div className="time-fields"><label>Start time<input required type="time" value={period.start} onInput={(event) => updatePeriod(period.id, { start: event.currentTarget.value })} /></label><label>End time<input required type="time" value={period.end} onInput={(event) => updatePeriod(period.id, { end: event.currentTarget.value })} /></label></div><label className="checkbox"><input type="checkbox" checked={period.overnight} onChange={(event) => updatePeriod(period.id, { overnight: event.target.checked })} />End time is on the following day</label>{period.start && period.end && !periodIsValid ? <p className="error" role="alert">End time must follow start time, with a duration of no more than 24 hours. Select following day for overnight work.</p> : null}</fieldset>;
            })}</div>
            {!editingId ? <button className="add-period secondary" type="button" onClick={addPeriod}>+ Add another start/stop time</button> : null}
            <div className="duration"><span>Total calculated duration</span><output aria-live="polite">{validPeriods ? formatDuration(totalDuration) : "—"}</output></div>
            <label>Notes <span className="optional">(optional)</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add details about this time entry" maxLength={2000} /></label>
            <div className="form-footer"><p>Each work period is saved separately and validated by the server.</p><div className="form-actions">{editingId ? <button className="secondary" type="button" onClick={resetForm}>Cancel</button> : null}<button className="primary" type="submit" disabled={!session?.user || !organization?.id || !date || !validPeriods || saving}>{saving ? "Saving…" : editingId ? "Update time entry" : periods.length > 1 ? `Save ${periods.length} time entries` : "Save time entry"}</button></div></div>
          </form>
        </section> : <section className="entry-card history">
          <h2>Organization time entries</h2>
          {!session?.user ? <p className="notice">Sign in and select an organization to view your entries.</p> : !organization?.id ? <p className="notice">Select an organization to view entries.</p> : loadingEntries ? <p className="notice">Loading time entries…</p> : entries.length === 0 ? <p className="notice">You have not recorded time for this organization yet.</p> : <div className="table-wrap"><table><thead><tr><th>Date</th><th>Start</th><th>End</th><th>Duration</th><th>Notes</th><th>Actions</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}><td>{entry.workDate}</td><td>{entry.startTime}</td><td>{entry.endTime}{entry.endsNextDay ? " +1 day" : ""}</td><td>{formatDuration(entry.durationMinutes)}</td><td>{entry.notes || "—"}</td><td><div className="row-actions"><button className="secondary" type="button" onClick={() => editEntry(entry)}>Edit</button><button className="secondary danger" type="button" disabled={deletingId === entry.id} onClick={() => void removeEntry(entry.id)}>{deletingId === entry.id ? "Deleting…" : "Delete"}</button></div></td></tr>)}</tbody></table></div>}
        </section>}
      </main>
    </div>
  </div>;
}
