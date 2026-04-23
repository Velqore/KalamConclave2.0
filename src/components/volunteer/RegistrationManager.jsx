import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'

const yearOptions = ['1st', '2nd', '3rd', '4th', 'Working Professional', 'Other']

const generateRegId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const buffer = new Uint32Array(4)
  crypto.getRandomValues(buffer)
  const suffix = Array.from(buffer, (value) => chars[value % chars.length]).join('')
  return `KCC2-${suffix}`
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

  const fetchRegistrations = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('registrations')
      .select('id, reg_id, full_name, email, phone, college, course, year_of_study, city, heard_from, utr_id, payment_status, attendance, created_at')
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
    setEditingId(row.id)
    setFormOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!supabase) return

    if (formData.payment_status === 'verified' && !formData.utr_id.trim()) {
      toast.error('UTR / Transaction ID is required for verified registrations.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        const { error } = await supabase.from('registrations').update(formData).eq('id', editingId)
        if (error) throw error
        toast.success('Registration updated')
        resetForm()
        fetchRegistrations()
      } else {
        // Retry loop — regenerate reg_id if a unique constraint violation occurs (up to 3 attempts)
        let lastError = null
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          const payload = attempt === 1 ? formData : { ...formData, reg_id: generateRegId() }
          const { error } = await supabase.from('registrations').insert(payload)
          if (!error) {
            if (payload.reg_id !== formData.reg_id) {
              setFormData((prev) => ({ ...prev, reg_id: payload.reg_id }))
            }
            toast.success('On-desk registration added')
            resetForm()
            fetchRegistrations()
            lastError = null
            break
          }
          lastError = error
          // Only retry on unique violation (Postgres error code 23505)
          if (error.code !== '23505') break
        }
        if (lastError) throw lastError
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const openNewRegistrationForm = () => {
    setFormData(createDeskRegistrationTemplate())
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
                <input aria-label="UTR or transaction ID" name="utr_id" onChange={handleFormChange} placeholder="UTR / Transaction ID" required style={inputStyle()} value={formData.utr_id} />
                {formData.payment_status === 'verified' && !formData.utr_id.trim() && (
                  <p style={{ margin: '4px 0 0', color: '#fca5a5', fontSize: '11px' }}>Required for verified registrations</p>
                )}
              </div>
              <label style={{ color: '#cbd5e1', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input checked={formData.attendance} name="attendance" onChange={handleFormChange} type="checkbox" />
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
