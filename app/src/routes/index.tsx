import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { OrganizationSelector } from '@niteowl/ui/organization'
import { AppSidebarIdentity, useCurrentHostname } from '@niteowl/ui/shell'
import { getDeploymentBrand } from '@niteowl/app-config'
import { authBaseURL, authClient } from '../lib/auth-client'
export const Route = createFileRoute('/')({ component: TimeTracking })
function localDate() { const d = new Date(); return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-') }
function minutes(time: string) { const [h,m] = time.split(':').map(Number); return h*60+m }
function TimeTracking() {
 const hostname = useCurrentHostname()
 const brand = getDeploymentBrand(hostname ?? "")
 const { data: session, isPending: sessionPending, error: sessionError } = authClient.useSession()
 const { data: organizations, isPending: organizationsPending } = authClient.useListOrganizations()
 const { data: organization } = authClient.useActiveOrganization()
 const [date,setDate] = useState('')
 const [start,setStart] = useState('')
 const [end,setEnd] = useState('')
 const [overnight,setOvernight] = useState(false)
 const [notes,setNotes] = useState('')
 const [error,setError] = useState('')
 const [tab,setTab] = useState<'entry'|'history'>('entry')
 const [switching,setSwitching] = useState(false)
 useEffect(() => { setDate(localDate()) }, [])
 const duration = start && end ? minutes(end)-minutes(start)+(overnight ? 1440 : 0) : 0
 const validDuration = duration > 0 && duration <= 1440
 const durationLabel = validDuration ? Math.floor(duration/60)+'h '+String(duration%60).padStart(2,'0')+'m' : '—'
 async function changeOrganization(organizationId: string) {
  setSwitching(true); setError('')
  try { const result = await authClient.organization.setActive({ organizationId }); if (result.error) setError(result.error.message || 'Unable to change organization.') }
  catch { setError('Unable to change organization. Try again.') } finally { setSwitching(false) }
 }
 function signIn() { const url = new URL('/auth/sign-in', authBaseURL); url.searchParams.set('callbackURL', window.location.href); window.location.assign(url.toString()) }
 return <div className="app-shell">
  <aside className="sidebar"><AppSidebarIdentity brand={brand} appName="Time Tracking" href="/"/><p className="nav-label">WORKSPACE</p><button className={tab==='entry'?'nav-item selected':'nav-item'} onClick={() => setTab('entry')}>Time entry</button><button className={tab==='history'?'nav-item selected':'nav-item'} onClick={() => setTab('history')}>Entry history</button><div className="sidebar-bottom">Time Tracking<span>Organization workspace</span></div></aside>
  <div className="workspace"><header><span>Time Tracking</span><div className="account">{session?.user ? <span>{session.user.name}</span> : <button className="secondary" onClick={signIn} disabled={sessionPending}>{sessionPending?'Checking session…':'Sign in'}</button>}</div></header>
  <main><div className="page-heading"><p className="eyebrow">TIME TRACKING</p><h1>{tab==='entry'?'Record your time':'Entry history'}</h1><p>{tab==='entry'?'Enter the date and hours you worked.':'View time recorded for your active organization.'}</p></div>
   <section className="organization-card"><OrganizationSelector organizations={organizations || []} value={organization?.id} onValueChange={id => void changeOrganization(id)} title="Organization" placeholder={session?.user?'Select an organization':'Sign in to choose an organization'} loading={!!session?.user && organizationsPending} disabled={!session?.user || switching} variant="compact" className="organization-control" selectClassName="organization-select"/>{sessionError ? <p className="notice">Unable to verify your NiteOwl session on this address. Sign in through your configured NiteOwl host.</p> : !sessionPending && !session?.user ? <p className="notice">Sign in with your NiteOwl account to record time for your organization.</p> : null}</section>
   {error ? <p className="error" role="alert">{error}</p> : null}
   {tab==='entry' ? <section className="entry-card"><div className="card-heading"><h2>New time entry</h2><p>Record a completed period of work.</p></div><form onSubmit={e => e.preventDefault()}><label>Work date<input required type="date" value={date} onInput={e => setDate(e.currentTarget.value)}/></label><div className="time-fields"><label>Start time<input required type="time" value={start} onInput={e => setStart(e.currentTarget.value)}/></label><label>End time<input required type="time" value={end} onInput={e => setEnd(e.currentTarget.value)}/></label></div><label className="checkbox"><input type="checkbox" checked={overnight} onChange={e => setOvernight(e.target.checked)}/>End time is on the following day</label><div className="duration"><span>Calculated duration</span><output aria-live="polite">{durationLabel}</output></div>{start && end && !validDuration ? <p className="error" role="alert">End time must follow start time, with a duration of no more than 24 hours. Select following day for overnight work.</p> : null}<label>Notes <span className="optional">(optional)</span><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add details about this time entry" maxLength={2000}/></label><div className="form-footer"><p>Server storage is not connected yet.</p><button className="primary" type="submit" disabled>Save time entry</button></div></form></section> : <section className="entry-card history"><h2>Organization time entries</h2><p className="notice">{!session?.user?'Sign in and select an organization to view its entries.':'Time-entry server storage is not connected yet. History will load here when the dedicated auth plugin is available.'}</p><div className="table-wrap"><table><thead><tr><th>Date</th><th>Start</th><th>End</th><th>Duration</th><th>Notes</th></tr></thead><tbody><tr><td colSpan={5}>Entry history is not available yet.</td></tr></tbody></table></div></section>}
  </main></div></div>
}
