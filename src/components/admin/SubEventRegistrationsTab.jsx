import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { ensureSupabase } from '../../lib/supabaseClient'
import { SUB_EVENTS } from '../../config/subEvents'

const SUB_EVENT_OPTIONS = ['All Events', ...SUB_EVENTS.map((e) => e.name)]

function ConfirmDeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-red-500/40 bg-surface p-6 shadow-xl">
        <h3 className="text-lg font-bold text-red-400">Delete Registration?</h3>
        <p className="mt-2 text-sm text-sand/70">
          This action cannot be undone. The registration record will be permanently removed.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            className="rounded border border-sand/30 px-4 py-2 text-sm text-sand/70 hover:border-sand/60"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500"
            onClick={onConfirm}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function EditModal({ reg, onClose, onSaved }) {
  const [fields, setFields] = useState({
    participant_name: reg.participant_name ?? '',
    participant_roll: reg.participant_roll ?? '',
    participant_email: reg.participant_email ?? '',
    participant_phone: reg.participant_phone ?? '',
    participant_course: reg.participant_course ?? '',
    participant_year: reg.participant_year ?? '',
    participant_university: reg.participant_university ?? '',
    team_name: reg.team_name ?? '',
    pass_type: reg.pass_type ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = ensureSupabase()
      const { error } = await supabase
        .from('sub_event_registrations')
        .update(fields)
        .eq('id', reg.id)
      if (error) throw error
      toast.success('Registration updated.')
      onSaved({ ...reg, ...fields })
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-sand/20 bg-surface p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-accent">Edit Registration — {reg.pass_id}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { name: 'participant_name', label: 'Name' },
            { name: 'participant_roll', label: 'Roll No.' },
            { name: 'participant_email', label: 'Email' },
            { name: 'participant_phone', label: 'Phone' },
            { name: 'participant_course', label: 'Course' },
            { name: 'participant_year', label: 'Year' },
            { name: 'participant_university', label: 'University' },
            { name: 'team_name', label: 'Team Name' },
            { name: 'pass_type', label: 'Pass Type' },
          ].map(({ name, label }) => (
            <label key={name} className="text-xs text-sand/70">
              {label}
              <input
                className="input mt-1"
                name={name}
                onChange={handleChange}
                value={fields[name]}
              />
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            className="rounded border border-sand/30 px-4 py-2 text-sm text-sand/70 hover:border-sand/60"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded bg-accent px-5 py-2 text-sm font-semibold text-bg disabled:opacity-50"
            disabled={saving}
            onClick={handleSave}
            type="button"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SubEventRegistrationsTab() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEvent, setFilterEvent] = useState('All Events')
  const [filterUniversity, setFilterUniversity] = useState('All')
  const [editReg, setEditReg] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

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

  const handleSaved = (updated) => {
    setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
  }

  const handleDelete = async (id) => {
    try {
      const supabase = ensureSupabase()
      const { error } = await supabase.from('sub_event_registrations').delete().eq('id', id)
      if (error) throw error
      setRegistrations((prev) => prev.filter((r) => r.id !== id))
      toast.success('Registration deleted.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleteTarget(null)
    }
  }

  const universities = useMemo(() => {
    const set = new Set(registrations.map((r) => r.participant_university).filter(Boolean))
    return ['All', ...set]
  }, [registrations])

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return registrations.filter((r) => {
      const eventMatch = filterEvent === 'All Events' || r.sub_event_name?.includes(filterEvent) || SUB_EVENTS.find((e) => e.name === filterEvent)?.id === r.sub_event_id
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
    a.download = `event-registrations-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {editReg && (
        <EditModal
          onClose={() => setEditReg(null)}
          onSaved={handleSaved}
          reg={editReg}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}

      {/* Per-event stats */}
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
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-sand/10 bg-surface/60 text-left text-xs font-semibold uppercase tracking-wide text-sand/55">
                <th className="px-3 py-3">Pass ID</th>
                <th className="px-3 py-3">Event</th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Roll</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">University</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3">Registered</th>
                <th className="px-3 py-3">Actions</th>
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
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          className="rounded border border-accent/50 px-2 py-1 text-xs text-accent hover:bg-accent/10"
                          onClick={() => setEditReg(r)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded border border-red-500/50 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                          onClick={() => setDeleteTarget(r.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
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
