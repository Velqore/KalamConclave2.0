import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { ensureSupabase } from '../../lib/supabaseClient'
import { SUB_EVENTS } from '../../config/subEvents'

const SUB_EVENT_OPTIONS = ['All', ...SUB_EVENTS.map((e) => e.name)]

function SubEventRegistrationsTab() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEvent, setFilterEvent] = useState('All')
  const [filterUniversity, setFilterUniversity] = useState('All')

  useEffect(() => {
    const fetch = async () => {
      try {
        const supabase = ensureSupabase()
        const { data, error } = await supabase
          .from('sub_event_registrations')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        setRegistrations(data ?? [])
      } catch (err) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const universities = useMemo(() => {
    const set = new Set(registrations.map((r) => r.participant_university).filter(Boolean))
    return ['All', ...set]
  }, [registrations])

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return registrations.filter((r) => {
      const eventMatch = filterEvent === 'All' || r.sub_event_name?.includes(filterEvent) || SUB_EVENTS.find((e) => e.name === filterEvent)?.id === r.sub_event_id
      const uniMatch = filterUniversity === 'All' || r.participant_university === filterUniversity
      const textMatch =
        !term ||
        r.participant_name?.toLowerCase().includes(term) ||
        r.participant_roll?.toLowerCase().includes(term) ||
        r.participant_email?.toLowerCase().includes(term) ||
        r.pass_id?.toLowerCase().includes(term)
      return eventMatch && uniMatch && textMatch
    })
  }, [registrations, search, filterEvent, filterUniversity])

  const statsByEvent = useMemo(() => {
    return SUB_EVENTS.map((ev) => ({
      name: ev.name,
      icon: ev.icon,
      color: ev.color,
      count: registrations.filter((r) => r.sub_event_id === ev.id).length,
    }))
  }, [registrations])

  const exportCSV = () => {
    if (!filtered.length) { toast.error('No data to export'); return }
    const rows = filtered.map((r) => ({
      pass_id: r.pass_id,
      sub_event: r.sub_event_name,
      name: r.participant_name,
      roll: r.participant_roll ?? '',
      email: r.participant_email ?? '',
      phone: r.participant_phone ?? '',
      course: r.participant_course ?? '',
      year: r.participant_year ?? '',
      university: r.participant_university ?? '',
      team_name: r.team_name ?? '',
      created_at: r.created_at,
    }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sub-event-registrations-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Per-sub-event stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statsByEvent.map((ev) => (
          <div
            key={ev.name}
            className="rounded-xl border p-4"
            style={{ borderColor: `${ev.color}44`, background: `${ev.color}0d` }}
          >
            <span className="text-2xl">{ev.icon}</span>
            <p className="mt-2 font-display text-3xl leading-none" style={{ color: ev.color }}>
              {ev.count}
            </p>
            <p className="mt-1 text-xs text-sand/70">{ev.name}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, roll, email, pass ID"
          value={search}
        />
        <select className="input max-w-[180px]" onChange={(e) => setFilterEvent(e.target.value)} value={filterEvent}>
          {SUB_EVENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select className="input max-w-[220px]" onChange={(e) => setFilterUniversity(e.target.value)} value={filterUniversity}>
          {universities.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <button
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-bg"
          onClick={exportCSV}
          type="button"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sand/60">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sand/60">No registrations found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-sand/10">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-sand/10 bg-surface/60 text-left text-xs font-semibold uppercase tracking-wide text-sand/55">
                <th className="px-3 py-3">Pass ID</th>
                <th className="px-3 py-3">Sub-Event</th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Roll</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">University</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const ev = SUB_EVENTS.find((e) => e.id === r.sub_event_id)
                return (
                  <tr key={r.id} className="border-b border-sand/5 hover:bg-surface/30">
                    <td className="px-3 py-2 font-mono text-xs text-accent">{r.pass_id}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: ev?.color ?? '#ccc' }}>
                        {ev?.icon} {r.sub_event_name}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium text-sand">{r.participant_name}</td>
                    <td className="px-3 py-2 font-mono text-xs text-sand/70">{r.participant_roll ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-sand/70">{r.participant_email ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-sand/70">{r.participant_phone ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-sand/70">{r.participant_university ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-sand/70">{r.team_name ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-sand/50">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SubEventRegistrationsTab
