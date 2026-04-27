import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { ensureSupabase } from '../../lib/supabaseClient'
import { SUB_EVENTS } from '../../config/subEvents'
import AdminSubEventRules from './AdminSubEventRules'

const EVENT_TABS = [{ id: 'all', name: 'All Events', icon: '📋', color: '#64748b' }, ...SUB_EVENTS.map((e) => ({ id: e.id, name: e.name, icon: e.icon, color: e.color }))]
const yearOptions = ['1st', '2nd', '3rd', '4th', '5th', 'Working Professional', 'Other']
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const createFormTemplate = () => ({
  pass_id: '',
  sub_event_id: SUB_EVENTS[0]?.id ?? '',
  participant_name: '',
  participant_roll: '',
  participant_email: '',
  participant_phone: '',
  participant_course: '',
  participant_year: '1st',
  participant_university: 'KR Mangalam University',
  pass_type: 'Participant',
})

const generatePassId = (subEventId) => {
  const prefixMap = {
    war_room_debate: 'WRD',
    science_slam: 'SS',
    wartech_quiz: 'WQ',
    poster: 'PM',
  }
  const prefix = prefixMap[subEventId] ?? 'EV'
  const buf = new Uint32Array(5)
  crypto.getRandomValues(buf)
  const suffix = Array.from(buf, (value) => chars[value % chars.length]).join('')
  return `KCC2-${prefix}-${suffix}`
}

function SubEventRegistrationsTab() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeEventTab, setActiveEventTab] = useState('all')
  const [filterUniversity, setFilterUniversity] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(createFormTemplate)

  const fetchRegistrations = async () => {
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

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const selectedSubEvent = useMemo(
    () => SUB_EVENTS.find((event) => event.id === formData.sub_event_id) ?? null,
    [formData.sub_event_id],
  )

  const universities = useMemo(() => {
    const set = new Set(registrations.map((r) => r.participant_university).filter(Boolean))
    return ['All', ...set]
  }, [registrations])

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return registrations.filter((r) => {
      const eventMatch = activeEventTab === 'all' || r.sub_event_id === activeEventTab
      const uniMatch = filterUniversity === 'All' || r.participant_university === filterUniversity
      const textMatch =
        !term ||
        r.participant_name?.toLowerCase().includes(term) ||
        r.participant_roll?.toLowerCase().includes(term) ||
        r.participant_email?.toLowerCase().includes(term) ||
        r.pass_id?.toLowerCase().includes(term)
      return eventMatch && uniMatch && textMatch
    })
  }, [registrations, search, activeEventTab, filterUniversity])

  const statsByEvent = useMemo(
    () =>
      SUB_EVENTS.map((ev) => ({
        name: ev.name,
        icon: ev.icon,
        color: ev.color,
        count: registrations.filter((r) => r.sub_event_id === ev.id).length,
      })),
    [registrations],
  )

  const activeEventMeta = useMemo(
    () => (activeEventTab !== 'all' ? SUB_EVENTS.find((e) => e.id === activeEventTab) ?? null : null),
    [activeEventTab],
  )

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData(createFormTemplate())
    setEditingId(null)
    setFormOpen(false)
  }

  const handleCreateNew = () => {
    const template = createFormTemplate()
    template.pass_id = generatePassId(template.sub_event_id)
    setFormData(template)
    setEditingId(null)
    setFormOpen(true)
  }

  const handleEdit = (registration) => {
    setFormData({
      pass_id: registration.pass_id ?? '',
      sub_event_id: registration.sub_event_id ?? SUB_EVENTS[0]?.id ?? '',
      participant_name: registration.participant_name ?? '',
      participant_roll: registration.participant_roll ?? '',
      participant_email: registration.participant_email ?? '',
      participant_phone: registration.participant_phone ?? '',
      participant_course: registration.participant_course ?? '',
      participant_year: registration.participant_year ?? '1st',
      participant_university: registration.participant_university ?? 'KR Mangalam University',
      pass_type: registration.pass_type ?? 'Participant',
    })
    setEditingId(registration.id)
    setFormOpen(true)
  }

  const handleDelete = async (registration) => {
    const confirmed = window.confirm(`Delete event registration for ${registration.participant_name}?`)
    if (!confirmed) return

    try {
      const supabase = ensureSupabase()
      const { error } = await supabase.from('sub_event_registrations').delete().eq('id', registration.id)
      if (error) throw error
      setRegistrations((prev) => prev.filter((entry) => entry.id !== registration.id))
      toast.success('Event registration deleted')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const supabase = ensureSupabase()
      const eventMeta = SUB_EVENTS.find((item) => item.id === formData.sub_event_id)
      const payload = {
        pass_id: formData.pass_id,
        sub_event_id: formData.sub_event_id,
        sub_event_name: eventMeta?.fullName ?? eventMeta?.name ?? formData.sub_event_id,
        participant_name: formData.participant_name,
        participant_roll: formData.participant_roll,
        participant_email: formData.participant_email,
        participant_phone: formData.participant_phone,
        participant_course: formData.participant_course,
        participant_year: formData.participant_year,
        participant_university: formData.participant_university,
        pass_type: formData.pass_type,
      }

      if (editingId) {
        const { error } = await supabase
          .from('sub_event_registrations')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
        setRegistrations((prev) => prev.map((entry) => (entry.id === editingId ? { ...entry, ...payload } : entry)))
        toast.success('Event registration updated')
      } else {
        const { data, error } = await supabase.from('sub_event_registrations').insert(payload).select().single()
        if (error) throw error
        setRegistrations((prev) => [data, ...prev])
        toast.success('Event registration added')
      }
      resetForm()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const exportCSV = () => {
    if (!filtered.length) {
      toast.error('No data to export')
      return
    }
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
      {/* Event-wise tab navigation */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-blue-900 pb-3">
        {EVENT_TABS.map((tab) => {
          const active = activeEventTab === tab.id
          const count = tab.id === 'all' ? registrations.length : registrations.filter((r) => r.sub_event_id === tab.id).length
          return (
            <button
              key={tab.id}
              className="rounded-t px-4 py-2 text-sm font-semibold transition"
              onClick={() => setActiveEventTab(tab.id)}
              style={{
                background: active ? tab.color : 'rgba(30,41,59,0.6)',
                color: active ? '#fff' : '#94a3b8',
                borderBottom: active ? `2px solid ${tab.color}` : '2px solid transparent',
              }}
              type="button"
            >
              {tab.icon} {tab.name}{' '}
              <span
                className="ml-1 rounded-full px-2 py-0.5 text-xs"
                style={{ background: active ? 'rgba(255,255,255,0.25)' : 'rgba(100,116,139,0.3)', color: active ? '#fff' : '#64748b' }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button className="rounded bg-gold px-4 py-2 text-sm font-semibold text-navy" onClick={handleCreateNew} type="button">
          Add Event Registration
        </button>
      </div>

      {formOpen && (
        <form className="mb-6 grid gap-3 rounded-xl border border-blue-900 bg-navyLight/70 p-4 sm:grid-cols-2" onSubmit={handleSave}>
          <h2 className="col-span-full text-xl font-semibold text-gold">
            {editingId ? 'Edit Event Registration' : 'Add Event Registration'}
          </h2>

          <label className="text-sm">
            Pass ID
            <input className="input" name="pass_id" onChange={handleFormChange} readOnly required value={formData.pass_id} />
          </label>
          <label className="text-sm">
            Event
            <select className="input" name="sub_event_id" onChange={handleFormChange} required value={formData.sub_event_id}>
              {SUB_EVENTS.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Participant Name
            <input className="input" name="participant_name" onChange={handleFormChange} required value={formData.participant_name} />
          </label>
          <label className="text-sm">
            Roll Number
            <input className="input" name="participant_roll" onChange={handleFormChange} value={formData.participant_roll} />
          </label>
          <label className="text-sm">
            Email
            <input className="input" name="participant_email" onChange={handleFormChange} type="email" value={formData.participant_email} />
          </label>
          <label className="text-sm">
            Phone
            <input className="input" name="participant_phone" onChange={handleFormChange} value={formData.participant_phone} />
          </label>
          <label className="text-sm">
            Course
            <input className="input" name="participant_course" onChange={handleFormChange} value={formData.participant_course} />
          </label>
          <label className="text-sm">
            Year
            <select className="input" name="participant_year" onChange={handleFormChange} value={formData.participant_year}>
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            University
            <input className="input" name="participant_university" onChange={handleFormChange} value={formData.participant_university} />
          </label>
          <label className="text-sm">
            Pass Type
            <input className="input" name="pass_type" onChange={handleFormChange} value={formData.pass_type} />
          </label>

          {selectedSubEvent && (
            <p className="col-span-full text-xs text-sand/60">
              Selected event name will be saved as: <span className="text-accent">{selectedSubEvent.fullName}</span>
            </p>
          )}

          <div className="col-span-full flex gap-3">
            <button className="rounded bg-electricBlue px-4 py-2 text-sm font-semibold disabled:opacity-60" disabled={saving} type="submit">
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create'}
            </button>
            <button className="rounded border border-blue-700 px-4 py-2 text-sm" onClick={resetForm} type="button">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Per-event stats (shown only on All Events tab) */}
      {activeEventTab === 'all' && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statsByEvent.map((ev) => (
            <button
              key={ev.name}
              className="rounded-xl border p-4 text-left transition hover:opacity-80"
              onClick={() => {
                const match = SUB_EVENTS.find((e) => e.name === ev.name)
                if (match) setActiveEventTab(match.id)
              }}
              style={{ borderColor: `${ev.color}44`, background: `${ev.color}0d` }}
              type="button"
            >
              <span className="text-2xl">{ev.icon}</span>
              <p className="mt-2 font-display text-3xl leading-none" style={{ color: ev.color }}>
                {ev.count}
              </p>
              <p className="mt-1 text-xs text-sand/70">{ev.name}</p>
            </button>
          ))}
        </div>
      )}

      {/* Active event header (shown when a specific event is selected) */}
      {activeEventMeta && (
        <div
          className="mb-6 rounded-xl border p-4"
          style={{ borderColor: `${activeEventMeta.color}44`, background: `${activeEventMeta.color}0d` }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeEventMeta.icon}</span>
            <div>
              <h3 className="font-semibold" style={{ color: activeEventMeta.color }}>{activeEventMeta.name}</h3>
              <p className="text-xs text-sand/60">{activeEventMeta.tagline}</p>
            </div>
            <span
              className="ml-auto rounded-full px-3 py-1 text-sm font-bold"
              style={{ background: `${activeEventMeta.color}22`, color: activeEventMeta.color }}
            >
              {filtered.length} registered
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, roll, email, pass ID"
          value={search}
        />
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
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-sand/10 bg-surface/60 text-left text-xs font-semibold uppercase tracking-wide text-sand/55">
                <th className="px-3 py-3">Pass ID</th>
                <th className="px-3 py-3">Event</th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Roll</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">University</th>
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
                    <td className="px-3 py-2 text-xs text-sand/50">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded bg-electricBlue/20 px-3 py-1 text-xs font-semibold text-electricBlue"
                          onClick={() => handleEdit(r)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded bg-rose-600/20 px-3 py-1 text-xs font-semibold text-rose-300"
                          onClick={() => handleDelete(r)}
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

      <div className="mt-8 border-t border-sand/10 pt-8">
        <AdminSubEventRules />
      </div>
    </div>
  )
}

export default SubEventRegistrationsTab
