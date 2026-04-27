import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'
import { SUB_EVENTS } from '../../config/subEvents'

const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const yearOptions = ['1st', '2nd', '3rd', '4th', '5th', 'Working Professional', 'Other']

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

const EVENT_TABS = [
  { id: 'all', name: 'All', icon: '📋', color: '#64748b' },
  ...SUB_EVENTS.map((e) => ({ id: e.id, name: e.name, icon: e.icon, color: e.color })),
]

const inputStyle = (readOnly = false) => ({
  width: '100%',
  padding: '11px 12px',
  borderRadius: '10px',
  border: `1px solid ${readOnly ? '#475569' : '#334155'}`,
  background: '#0f172a',
  color: '#f1f5f9',
  fontSize: '14px',
  boxSizing: 'border-box',
})

const actionBtn = (bg, color) => ({
  flex: 1,
  minHeight: '44px',
  border: 'none',
  borderRadius: '10px',
  background: bg,
  color,
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '14px',
})

function DetailModal({ record, onClose, onDelete }) {
  if (!record) return null
  const ev = SUB_EVENTS.find((e) => e.id === record.sub_event_id)
  return (
    <Motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end' }}
    >
      <Motion.div
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        initial={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', background: '#1e293b', borderRadius: '20px 20px 0 0', padding: '24px 20px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {ev && (
          <div
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, color: '#fff', background: ev.color }}
          >
            {ev.icon} {ev.name}
          </div>
        )}
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '18px', marginBottom: '2px' }}>{record.participant_name}</div>
        <div style={{ color: '#94a3b8', fontSize: '13px', fontFamily: 'monospace', marginBottom: '12px' }}>{record.pass_id}</div>

        <div style={{ display: 'grid', gap: '6px', marginBottom: '16px' }}>
          {record.participant_roll && (
            <div style={{ color: '#cbd5e1', fontSize: '13px' }}>🎓 Roll: <span style={{ color: '#f8fafc' }}>{record.participant_roll}</span></div>
          )}
          {record.participant_email && (
            <div style={{ color: '#cbd5e1', fontSize: '13px' }}>✉️ {record.participant_email}</div>
          )}
          {record.participant_phone && (
            <div style={{ color: '#cbd5e1', fontSize: '13px' }}>📞 {record.participant_phone}</div>
          )}
          {record.participant_course && (
            <div style={{ color: '#cbd5e1', fontSize: '13px' }}>📚 {record.participant_course} {record.participant_year ? `· ${record.participant_year}` : ''}</div>
          )}
          {record.participant_university && (
            <div style={{ color: '#cbd5e1', fontSize: '13px' }}>🏫 {record.participant_university}</div>
          )}
          {record.pass_type && (
            <div style={{ color: '#cbd5e1', fontSize: '13px' }}>🏷️ {record.pass_type}</div>
          )}
          <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
            Registered: {new Date(record.created_at).toLocaleString()}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ width: '100%', padding: '14px', background: '#374151', border: 'none', borderRadius: '10px', color: '#9ca3af', fontWeight: 600, cursor: 'pointer', minHeight: '52px', marginBottom: '10px' }}
          type="button"
        >
          Close
        </button>
        <button
          onClick={() => onDelete(record)}
          style={{ width: '100%', padding: '14px', background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: '10px', color: '#fca5a5', fontWeight: 600, cursor: 'pointer', minHeight: '52px' }}
          type="button"
        >
          Delete Entry
        </button>
      </Motion.div>
    </Motion.div>
  )
}

function SubEventRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selected, setSelected] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(createFormTemplate)

  const fetchRegistrations = async () => {
    if (!supabase) { setLoading(false); return }
    const { data, error } = await supabase
      .from('sub_event_registrations')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    setRegistrations(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return registrations.filter((r) => {
      const tabMatch = activeTab === 'all' || r.sub_event_id === activeTab
      const textMatch =
        !q ||
        r.participant_name?.toLowerCase().includes(q) ||
        r.participant_roll?.toLowerCase().includes(q) ||
        r.participant_email?.toLowerCase().includes(q) ||
        r.pass_id?.toLowerCase().includes(q)
      return tabMatch && textMatch
    })
  }, [registrations, search, activeTab])

  const countByEvent = useMemo(() => {
    const map = { all: registrations.length }
    SUB_EVENTS.forEach((ev) => {
      map[ev.id] = registrations.filter((r) => r.sub_event_id === ev.id).length
    })
    return map
  }, [registrations])

  const resetForm = () => {
    setFormData(createFormTemplate())
    setEditingId(null)
    setFormOpen(false)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === 'sub_event_id') {
        updated.pass_id = generatePassId(value)
      }
      return updated
    })
  }

  const openNewForm = () => {
    const template = createFormTemplate()
    template.pass_id = generatePassId(template.sub_event_id)
    if (activeTab !== 'all') {
      template.sub_event_id = activeTab
      template.pass_id = generatePassId(activeTab)
    }
    setFormData(template)
    setEditingId(null)
    setFormOpen(true)
  }

  const handleEdit = (r) => {
    setFormData({
      pass_id: r.pass_id ?? '',
      sub_event_id: r.sub_event_id ?? SUB_EVENTS[0]?.id ?? '',
      participant_name: r.participant_name ?? '',
      participant_roll: r.participant_roll ?? '',
      participant_email: r.participant_email ?? '',
      participant_phone: r.participant_phone ?? '',
      participant_course: r.participant_course ?? '',
      participant_year: r.participant_year ?? '1st',
      participant_university: r.participant_university ?? 'KR Mangalam University',
      pass_type: r.pass_type ?? 'Participant',
    })
    setEditingId(r.id)
    setSelected(null)
    setFormOpen(true)
  }

  const handleDelete = async (record) => {
    if (!supabase) return
    const confirmed = window.confirm(`Delete event registration for ${record.participant_name}?`)
    if (!confirmed) return
    const { error } = await supabase.from('sub_event_registrations').delete().eq('id', record.id)
    if (error) { toast.error(error.message); return }
    setRegistrations((prev) => prev.filter((entry) => entry.id !== record.id))
    setSelected(null)
    toast.success('Event registration deleted')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!supabase) return
    setSaving(true)
    try {
      const eventMeta = SUB_EVENTS.find((ev) => ev.id === formData.sub_event_id)
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
        const { error } = await supabase.from('sub_event_registrations').update(payload).eq('id', editingId)
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

  const activeEvMeta = SUB_EVENTS.find((e) => e.id === activeTab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      {/* Event tab bar */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', overflowX: 'auto', display: 'flex', gap: '4px', padding: '8px 12px', flexShrink: 0, WebkitOverflowScrolling: 'touch' }}>
        {EVENT_TABS.map((tab) => {
          const active = activeTab === tab.id
          const count = countByEvent[tab.id] ?? 0
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: '999px',
                border: 'none',
                background: active ? tab.color : '#0f172a',
                color: active ? '#fff' : '#64748b',
                fontSize: '12px',
                fontWeight: active ? 700 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                minHeight: '32px',
                transition: 'background 0.15s',
              }}
              type="button"
            >
              {tab.icon} {tab.name}
              <span style={{ background: active ? 'rgba(255,255,255,0.25)' : '#334155', color: active ? '#fff' : '#94a3b8', borderRadius: '999px', padding: '1px 7px', fontSize: '11px', fontWeight: 700, marginLeft: '2px' }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active event banner */}
      {activeEvMeta && (
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #334155', background: `${activeEvMeta.color}18`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>{activeEvMeta.icon}</span>
          <div>
            <div style={{ color: activeEvMeta.color, fontWeight: 700, fontSize: '14px' }}>{activeEvMeta.name}</div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>{activeEvMeta.tagline}</div>
          </div>
        </div>
      )}

      {/* Search + actions */}
      <div style={{ padding: '10px 12px', background: '#1e293b', borderBottom: '1px solid #334155', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button
            onClick={openNewForm}
            style={{ background: '#7C3AED', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '10px 12px', cursor: 'pointer', minHeight: '40px' }}
            type="button"
          >
            + Add Registration
          </button>
          <button
            onClick={fetchRegistrations}
            style={{ background: '#334155', border: '1px solid #475569', borderRadius: '10px', color: '#cbd5e1', fontSize: '12px', fontWeight: 600, padding: '10px 12px', cursor: 'pointer', minHeight: '40px' }}
            type="button"
          >
            Refresh
          </button>
        </div>
        <input
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by name, roll, email, pass ID"
          style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          type="text"
          value={search}
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No registrations found.</div>
        ) : (
          filtered.map((r) => {
            const ev = SUB_EVENTS.find((e) => e.id === r.sub_event_id)
            return (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', minHeight: '52px' }}
              >
                <div
                  style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, background: `${ev?.color ?? '#334155'}22` }}
                >
                  {ev?.icon ?? '🎫'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.participant_name || 'Unnamed'}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.pass_id}
                  </div>
                  {r.participant_roll && (
                    <div style={{ color: '#64748b', fontSize: '11px' }}>Roll: {r.participant_roll}</div>
                  )}
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  {ev && (
                    <div style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', color: '#fff', background: ev.color, whiteSpace: 'nowrap' }}>
                      {ev.name.split(' ')[0]}
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(r) }}
                    style={{ marginTop: '4px', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px', background: '#0f172a', color: '#93c5fd', fontSize: '11px', fontWeight: 600, cursor: 'pointer', minHeight: '24px' }}
                    type="button"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add / Edit form modal */}
      {formOpen && (
        <div
          onClick={resetForm}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 60, display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', background: '#1e293b', borderRadius: '20px 20px 0 0', padding: '18px 16px calc(24px + env(safe-area-inset-bottom, 0px))' }}
          >
            <h3 style={{ color: '#f8fafc', margin: '0 0 14px', fontSize: '16px', fontWeight: 700 }}>
              {editingId ? 'Edit Event Registration' : 'Add Event Registration'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
              <label style={{ color: '#94a3b8', fontSize: '13px' }}>
                Event
                <select aria-label="Event" name="sub_event_id" onChange={handleFormChange} style={{ ...inputStyle(), marginTop: '4px' }} value={formData.sub_event_id}>
                  {SUB_EVENTS.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.icon} {ev.name}</option>
                  ))}
                </select>
              </label>
              <input aria-label="Pass ID" name="pass_id" readOnly style={inputStyle(true)} value={formData.pass_id} />
              <input aria-label="Participant name" name="participant_name" onChange={handleFormChange} placeholder="Participant Name *" required style={inputStyle()} value={formData.participant_name} />
              <input aria-label="Roll number" name="participant_roll" onChange={handleFormChange} placeholder="Roll Number" style={inputStyle()} value={formData.participant_roll} />
              <input aria-label="Email" name="participant_email" onChange={handleFormChange} placeholder="Email" style={inputStyle()} type="email" value={formData.participant_email} />
              <input aria-label="Phone" name="participant_phone" onChange={handleFormChange} placeholder="Phone" style={inputStyle()} value={formData.participant_phone} />
              <input aria-label="Course" name="participant_course" onChange={handleFormChange} placeholder="Course / Designation" style={inputStyle()} value={formData.participant_course} />
              <select aria-label="Year of study" name="participant_year" onChange={handleFormChange} style={inputStyle()} value={formData.participant_year}>
                {yearOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <input aria-label="University" name="participant_university" onChange={handleFormChange} placeholder="University" style={inputStyle()} value={formData.participant_university} />
              <input aria-label="Pass type" name="pass_type" onChange={handleFormChange} placeholder="Pass Type (e.g. Participant)" style={inputStyle()} value={formData.pass_type} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button disabled={saving} style={{ ...actionBtn('#7C3AED', '#fff'), opacity: saving ? 0.7 : 1 }} type="submit">
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create'}
                </button>
                <button onClick={resetForm} style={actionBtn('#334155', '#cbd5e1')} type="button">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <DetailModal
            key="detail-modal"
            onClose={() => setSelected(null)}
            onDelete={handleDelete}
            record={selected}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default SubEventRegistrations
