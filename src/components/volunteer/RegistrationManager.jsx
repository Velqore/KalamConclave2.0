import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'
import { SUB_EVENTS } from '../../config/subEvents'

const yearOptions = ['1st', '2nd', '3rd', '4th', 'Working Professional', 'Other']
const DEBATE_ROLES = ['Scientists', 'UN Delegates', 'Policy Makers']
const DEBATE_EVENT_ID = 'war_room_debate'

const REG_ID_PREFIX = 'KCC2'

const generateRegId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const buffer = new Uint32Array(4)
  crypto.getRandomValues(buffer)
  const suffix = Array.from(buffer, (value) => chars[value % chars.length]).join('')
  return `${REG_ID_PREFIX}-${suffix}`
}

const generateSubEventPassId = (subEventId) => {
  const prefixMap = { war_room_debate: 'WRD', science_slam: 'SS', wartech_quiz: 'WQ', poster: 'PM' }
  const prefix = prefixMap[subEventId] ?? 'EV'
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const buf = new Uint32Array(5)
  crypto.getRandomValues(buf)
  const suffix = Array.from(buf, (v) => chars[v % chars.length]).join('')
  return `KCC2-${prefix}-${suffix}`
}

const createDeskRegistrationTemplate = () => ({
  reg_id: generateRegId(),
  full_name: '',
  email: '',
  phone: '',
  college: '',
  course: '',
  year_of_study: '1st',
  city: '',
  heard_from: 'On Desk',
  utr_id: '',
  payment_status: 'verified',
  attendance: false,
})

function RegistrationManager() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(createDeskRegistrationTemplate)
  const [selectedEvents, setSelectedEvents] = useState([])
  const [debateRole, setDebateRole] = useState('')

  const fetchRegistrations = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('registrations')
      .select('id, reg_id, full_name, email, phone, college, course, year_of_study, city, heard_from, utr_id, payment_status, attendance, selected_events, debate_topic, created_at')
      .order('created_at', { ascending: false })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return rows
    return rows.filter((row) =>
      [row.reg_id, row.full_name, row.email, row.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q)),
    )
  }, [rows, search])

  const resetForm = () => {
    setFormData(createDeskRegistrationTemplate())
    setSelectedEvents([])
    setDebateRole('')
    setEditingId(null)
    setFormOpen(false)
  }

  const handleFormChange = (event) => {
    const { name, type, value, checked } = event.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleEdit = (row) => {
    setFormData({
      reg_id: row.reg_id ?? '',
      full_name: row.full_name ?? '',
      email: row.email ?? '',
      phone: row.phone ?? '',
      college: row.college ?? '',
      course: row.course ?? '',
      year_of_study: row.year_of_study ?? '1st',
      city: row.city ?? '',
      heard_from: row.heard_from ?? 'On Desk',
      utr_id: row.utr_id ?? '',
      payment_status: row.payment_status ?? 'pending',
      attendance: Boolean(row.attendance),
    })
    setSelectedEvents(Array.isArray(row.selected_events) ? row.selected_events : [])
    setDebateRole(row.debate_topic ?? '')
    setEditingId(row.id)
    setFormOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!supabase) return

    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event.')
      return
    }
    if (selectedEvents.includes(DEBATE_EVENT_ID) && !debateRole) {
      toast.error('Please select a role for The War Room - Debate Battle.')
      return
    }
    if (formData.payment_status === 'verified' && !formData.utr_id.trim()) {
      toast.error('UTR / Transaction ID is required for verified registrations.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...formData,
        selected_events: selectedEvents,
        debate_topic: selectedEvents.includes(DEBATE_EVENT_ID) ? debateRole : null,
      }

      if (editingId) {
        const { error } = await supabase.from('registrations').update(payload).eq('id', editingId)
        if (error) throw error
        toast.success('Registration updated')
        resetForm()
        fetchRegistrations()
      } else {
        // Retry loop — regenerate reg_id on unique constraint violation (up to 3 attempts)
        let lastError = null
        let insertedData = null
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          const attemptPayload = attempt === 1 ? payload : { ...payload, reg_id: generateRegId() }
          const { data, error } = await supabase.from('registrations').insert(attemptPayload).select().single()
          if (!error) {
            insertedData = data
            lastError = null
            break
          }
          lastError = error
          if (error.code !== '23505') break
        }
        if (lastError) throw lastError

        // Auto-create sub_event_registrations rows
        try {
          const subEventRows = selectedEvents.map((eventId) => {
            const ev = SUB_EVENTS.find((e) => e.id === eventId)
            return {
              pass_id: generateSubEventPassId(eventId),
              sub_event_id: eventId,
              sub_event_name: ev?.fullName ?? ev?.name ?? eventId,
              participant_name: insertedData.full_name,
              participant_roll: '',
              participant_email: insertedData.email,
              participant_phone: insertedData.phone,
              participant_course: insertedData.course,
              participant_year: insertedData.year_of_study,
              participant_university: insertedData.college,
              pass_type: 'Participant',
            }
          })
          await supabase.from('sub_event_registrations').insert(subEventRows)
        } catch (subErr) {
          console.warn('Could not auto-create sub_event_registrations:', subErr)
        }

        toast.success('On-desk registration added')
        resetForm()
        fetchRegistrations()
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEventToggle = (eventId) => {
    setSelectedEvents((prev) => {
      const next = prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
      if (eventId === DEBATE_EVENT_ID && !next.includes(DEBATE_EVENT_ID)) {
        setDebateRole('')
      }
      return next
    })
  }

  const openNewRegistrationForm = () => {
    setFormData(createDeskRegistrationTemplate())
    setSelectedEvents([])
    setDebateRole('')
    setEditingId(null)
    setFormOpen(true)
  }

  const togglePaymentStatus = async (row) => {
    if (!supabase) return
    const nextStatus = row.payment_status === 'verified' ? 'pending' : 'verified'
    if (nextStatus === 'verified' && !row.utr_id?.trim()) {
      toast.error('Cannot authorize: UTR / Transaction ID is missing. Use Update to add it first.')
      return
    }
    const { error } = await supabase
      .from('registrations')
      .update({ payment_status: nextStatus })
      .eq('id', row.id)
    if (error) {
      toast.error(error.message)
      return
    }
    setRows((prev) => prev.map((entry) => (entry.id === row.id ? { ...entry, payment_status: nextStatus } : entry)))
    toast.success(nextStatus === 'verified' ? 'Registration authorized' : 'Marked pending')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      <div style={{ padding: '12px 16px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <button
            onClick={openNewRegistrationForm}
            style={{ background: '#7C3AED', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '10px 12px', cursor: 'pointer', minHeight: '40px' }}
            type="button"
          >
            + On-Desk Registration
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
          placeholder="🔍 Search by reg ID, name, email, or phone"
          style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          type="text"
          value={search}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No registrations found.</div>
        ) : (
          filtered.map((row) => (
            <div key={row.id} style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.full_name || 'Unnamed'} <span style={{ color: '#94a3b8', fontWeight: 500 }}>({row.reg_id})</span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.email || 'No email'} • {row.phone || 'No phone'}
                </div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>
                  {row.heard_from || '—'} • {new Date(row.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <button
                  onClick={() => togglePaymentStatus(row)}
                  style={{
                    border: 'none',
                    borderRadius: '999px',
                    padding: '5px 10px',
                    background: row.payment_status === 'verified' ? '#14532d' : '#78350f',
                    color: row.payment_status === 'verified' ? '#86efac' : '#fcd34d',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minHeight: '28px',
                  }}
                  type="button"
                >
                  {row.payment_status}
                </button>
                <button
                  onClick={() => handleEdit(row)}
                  style={{ border: '1px solid #334155', borderRadius: '8px', padding: '6px 10px', background: '#0f172a', color: '#93c5fd', fontSize: '11px', fontWeight: 600, cursor: 'pointer', minHeight: '28px' }}
                  type="button"
                >
                  Update
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {formOpen && (
        <div onClick={resetForm} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 60, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#1e293b', borderRadius: '20px 20px 0 0', padding: '18px 16px calc(20px + env(safe-area-inset-bottom, 0px))' }}>
            <h3 style={{ color: '#f8fafc', margin: 0, fontSize: '16px' }}>{editingId ? 'Update Registration' : 'Create On-Desk Registration'}</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: '12px', display: 'grid', gap: '10px' }}>
              <input aria-label="Registration ID" name="reg_id" onChange={handleFormChange} readOnly style={inputStyle(true)} value={formData.reg_id} />
              <input aria-label="Full name" name="full_name" onChange={handleFormChange} placeholder="Full name" required style={inputStyle()} value={formData.full_name} />
              <input aria-label="Email" name="email" onChange={handleFormChange} placeholder="Email" required style={inputStyle()} type="email" value={formData.email} />
              <input aria-label="Phone" name="phone" onChange={handleFormChange} placeholder="Phone" required style={inputStyle()} value={formData.phone} />
              <input aria-label="College" name="college" onChange={handleFormChange} placeholder="College" required style={inputStyle()} value={formData.college} />
              <input aria-label="Course or designation" name="course" onChange={handleFormChange} placeholder="Course / Designation" required style={inputStyle()} value={formData.course} />
              <select aria-label="Year of study" name="year_of_study" onChange={handleFormChange} style={inputStyle()} value={formData.year_of_study}>
                {yearOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input aria-label="City" name="city" onChange={handleFormChange} placeholder="City" required style={inputStyle()} value={formData.city} />
              <input aria-label="Source (how they heard about the event)" name="heard_from" onChange={handleFormChange} placeholder="Source" style={inputStyle()} value={formData.heard_from} />
              <select aria-label="Payment status" name="payment_status" onChange={handleFormChange} style={inputStyle()} value={formData.payment_status}>
                <option value="pending">pending</option>
                <option value="verified">verified</option>
              </select>
              <div>
                <input aria-label="UTR or transaction ID" name="utr_id" onChange={handleFormChange} placeholder="UTR / Transaction ID" style={inputStyle()} value={formData.utr_id} />
                {formData.payment_status === 'verified' && !formData.utr_id.trim() && (
                  <p style={{ margin: '4px 0 0', color: '#fca5a5', fontSize: '11px' }}>Required for verified registrations</p>
                )}
              </div>

              {/* Sub-event selection */}
              <div style={{ border: '1px solid #334155', borderRadius: '12px', padding: '12px', background: '#0f172a' }}>
                <p style={{ margin: '0 0 8px', color: '#06B6D4', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Sub Events (select at least one) *
                </p>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {SUB_EVENTS.map((ev) => (
                    <label
                      key={ev.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${selectedEvents.includes(ev.id) ? ev.color : '#334155'}`, background: selectedEvents.includes(ev.id) ? `${ev.color}22` : 'transparent', cursor: 'pointer' }}
                    >
                      <input
                        checked={selectedEvents.includes(ev.id)}
                        onChange={() => handleEventToggle(ev.id)}
                        style={{ accentColor: ev.color, width: '16px', height: '16px', flexShrink: 0 }}
                        type="checkbox"
                      />
                      <span style={{ fontSize: '16px' }}>{ev.icon}</span>
                      <span style={{ color: selectedEvents.includes(ev.id) ? '#f8fafc' : '#94a3b8', fontSize: '13px', fontWeight: selectedEvents.includes(ev.id) ? 700 : 400 }}>{ev.name}</span>
                    </label>
                  ))}
                </div>

                {/* Debate role picker */}
                {selectedEvents.includes(DEBATE_EVENT_ID) && (
                  <div style={{ marginTop: '12px', border: '1px solid rgba(220,38,38,0.4)', borderRadius: '10px', padding: '10px', background: 'rgba(127,29,29,0.2)' }}>
                    <p style={{ margin: '0 0 8px', color: '#f87171', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Debate Role *
                    </p>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {DEBATE_ROLES.map((role) => (
                        <label
                          key={role}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', border: `1px solid ${debateRole === role ? '#ef4444' : '#334155'}`, background: debateRole === role ? 'rgba(239,68,68,0.15)' : 'transparent', cursor: 'pointer' }}
                        >
                          <input
                            checked={debateRole === role}
                            name="debate_role"
                            onChange={() => setDebateRole(role)}
                            style={{ accentColor: '#ef4444', width: '16px', height: '16px', flexShrink: 0 }}
                            type="radio"
                            value={role}
                          />
                          <span style={{ color: debateRole === role ? '#fca5a5' : '#94a3b8', fontSize: '13px', fontWeight: debateRole === role ? 700 : 400 }}>{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <label style={{ color: '#cbd5e1', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input aria-label="Mark as present" checked={formData.attendance} name="attendance" onChange={handleFormChange} type="checkbox" />
                Mark as present
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button disabled={saving} style={{ ...actionBtn('#7C3AED', '#fff'), opacity: saving ? 0.7 : 1 }} type="submit">
                  {saving ? 'Saving…' : editingId ? 'Save' : 'Create'}
                </button>
                <button onClick={resetForm} style={actionBtn('#334155', '#cbd5e1')} type="button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

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
})

export default RegistrationManager
