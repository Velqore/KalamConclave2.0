import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import AttendeeTable from '../components/AttendeeTable'
import StatCard from '../components/StatCard'
import AdminSpeakers from '../components/admin/AdminSpeakers'
import AdminSchedule from '../components/admin/AdminSchedule'
import AdminSettings from '../components/admin/AdminSettings'
import AdminOrganisers from '../components/admin/AdminOrganisers'
import { useAdmin } from '../hooks/useAdmin'
import { ensureSupabase } from '../lib/supabaseClient'

const TABS = [
  { id: 'registrations', label: 'Registrations' },
  { id: 'speakers', label: 'Guests' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'settings', label: 'Event Settings' },
  { id: 'organisers', label: 'Organisers' },
]

const generateRegId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const buffer = new Uint32Array(4)
  crypto.getRandomValues(buffer)
  const suffix = Array.from(buffer, (value) => chars[value % chars.length]).join('')
  return `KCC2-${suffix}`
}

const yearOfStudyOptions = ['1st', '2nd', '3rd', '4th', 'Working Professional', 'Other']
const heardFromOptions = ['Instagram', 'LinkedIn', 'WhatsApp', 'Friend/Faculty', 'Poster', 'Other']

const createRegistrationTemplate = () => ({
  reg_id: generateRegId(),
  full_name: '',
  email: '',
  phone: '',
  college: '',
  course: '',
  year_of_study: '1st',
  city: '',
  heard_from: 'Instagram',
  utr_id: '',
  payment_status: 'pending',
  attendance: false,
})

function AdminDashboard() {
  const navigate = useNavigate()
  const { logout } = useAdmin()
  const [activeTab, setActiveTab] = useState('registrations')
  const [attendees, setAttendees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(createRegistrationTemplate)

  const fetchRegistrations = async () => {
    try {
      const supabase = ensureSupabase()
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAttendees(data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const filteredAttendees = useMemo(
    () =>
      attendees.filter((attendee) => {
        const term = search.toLowerCase()
        return (
          attendee.full_name?.toLowerCase().includes(term) ||
          attendee.email?.toLowerCase().includes(term) ||
          attendee.college?.toLowerCase().includes(term)
        )
      }),
    [attendees, search],
  )

  const stats = useMemo(() => {
    const total = attendees.length
    const verified = attendees.filter((entry) => entry.payment_status === 'verified').length
    const pending = total - verified
    return {
      total,
      verified,
      pending,
      revenue: verified * 149,
    }
  }, [attendees])

  const updateRegistration = async (id, updates) => {
    try {
      const supabase = ensureSupabase()
      const { error } = await supabase.from('registrations').update(updates).eq('id', id)
      if (error) throw error
      setAttendees((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)))
      toast.success('Updated successfully')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const resetForm = () => {
    setFormData(createRegistrationTemplate())
    setEditingId(null)
    setFormOpen(false)
  }

  const handleFormChange = (event) => {
    const { name, type, checked, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCreateNew = () => {
    setFormData(createRegistrationTemplate())
    setEditingId(null)
    setFormOpen(true)
  }

  const handleEdit = (attendee) => {
    setFormData({
      reg_id: attendee.reg_id ?? '',
      full_name: attendee.full_name ?? '',
      email: attendee.email ?? '',
      phone: attendee.phone ?? '',
      college: attendee.college ?? '',
      course: attendee.course ?? '',
      year_of_study: attendee.year_of_study ?? '1st',
      city: attendee.city ?? '',
      heard_from: attendee.heard_from ?? 'Instagram',
      utr_id: attendee.utr_id ?? '',
      payment_status: attendee.payment_status ?? 'pending',
      attendance: Boolean(attendee.attendance),
    })
    setEditingId(attendee.id)
    setFormOpen(true)
  }

  const handleDelete = async (attendee) => {
    const confirmed = window.confirm(`Delete registration for ${attendee.full_name}?`)
    if (!confirmed) return

    try {
      const supabase = ensureSupabase()
      const { error } = await supabase.from('registrations').delete().eq('id', attendee.id)
      if (error) throw error
      setAttendees((prev) => prev.filter((entry) => entry.id !== attendee.id))
      toast.success('Registration deleted')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const supabase = ensureSupabase()

      if (editingId) {
        const { error } = await supabase.from('registrations').update(formData).eq('id', editingId)
        if (error) throw error
        setAttendees((prev) => prev.map((entry) => (entry.id === editingId ? { ...entry, ...formData } : entry)))
        toast.success('Registration updated')
      } else {
        const { data, error } = await supabase.from('registrations').insert(formData).select().single()
        if (error) throw error
        setAttendees((prev) => [data, ...prev])
        toast.success('Registration added')
      }

      resetForm()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePayment = async (attendee) => {
    const nextStatus = attendee.payment_status === 'verified' ? 'pending' : 'verified'
    await updateRegistration(attendee.id, { payment_status: nextStatus })
    if (nextStatus === 'verified') {
      try {
        const supabase = ensureSupabase()
        await supabase.functions.invoke('send-confirmation', {
          body: { name: attendee.full_name, email: attendee.email, reg_id: attendee.reg_id, type: 'verified' },
        })
      } catch {
        toast.error('Payment verified, but confirmation email could not be sent.')
      }
    }
  }

  const handleToggleAttendance = (attendee) => {
    updateRegistration(attendee.id, { attendance: !attendee.attendance })
  }

  const exportCSV = () => {
    if (!attendees.length) {
      toast.error('No attendee data to export.')
      return
    }
    const csv = Papa.unparse(attendees)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'kalam-conclave-attendees.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10">
      {/* Dashboard header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-gold">Admin Dashboard</h1>
        <button className="rounded bg-rose-600 px-4 py-2 text-sm font-semibold" onClick={handleLogout} type="button">
          Logout
        </button>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-blue-900 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`rounded-t px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-gold text-navy'
                : 'bg-navyLight/60 text-slate-300 hover:bg-navyLight hover:text-gold'
            }`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Registrations tab */}
      {activeTab === 'registrations' && (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3">
              <button className="rounded bg-gold px-4 py-2 text-sm font-semibold text-navy" onClick={handleCreateNew} type="button">
                Add Registration
              </button>
              <button className="rounded bg-electricBlue px-4 py-2 text-sm font-semibold" onClick={exportCSV} type="button">
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Registrations" value={stats.total} />
            <StatCard title="Verified Payments" value={stats.verified} />
            <StatCard title="Pending Verification" value={stats.pending} />
            <StatCard title="Total Revenue (₹)" value={stats.revenue} />
          </div>

          <div className="my-6">
            <input
              className="input max-w-md"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or college"
              value={search}
            />
          </div>

          {formOpen && (
            <form className="mb-6 grid gap-3 rounded-xl border border-blue-900 bg-navyLight/70 p-4 sm:grid-cols-2" onSubmit={handleSave}>
              <h2 className="col-span-full text-xl font-semibold text-gold">
                {editingId ? 'Edit Registration' : 'Add Registration'}
              </h2>

              <label className="text-sm">
                Registration ID
                <input className="input" name="reg_id" onChange={handleFormChange} readOnly required value={formData.reg_id} />
              </label>
              <label className="text-sm">
                Full Name
                <input className="input" name="full_name" onChange={handleFormChange} required value={formData.full_name} />
              </label>
              <label className="text-sm">
                Email
                <input className="input" name="email" onChange={handleFormChange} required type="email" value={formData.email} />
              </label>
              <label className="text-sm">
                Phone
                <input className="input" name="phone" onChange={handleFormChange} required value={formData.phone} />
              </label>
              <label className="text-sm">
                College
                <input className="input" name="college" onChange={handleFormChange} required value={formData.college} />
              </label>
              <label className="text-sm">
                Course
                <input className="input" name="course" onChange={handleFormChange} required value={formData.course} />
              </label>
              <label className="text-sm">
                Year Of Study
                <select className="input" name="year_of_study" onChange={handleFormChange} value={formData.year_of_study}>
                  {yearOfStudyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                City
                <input className="input" name="city" onChange={handleFormChange} required value={formData.city} />
              </label>
              <label className="text-sm">
                Heard From
                <select className="input" name="heard_from" onChange={handleFormChange} value={formData.heard_from}>
                  {heardFromOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                UTR ID
                <input
                  className="input"
                  name="utr_id"
                  onChange={handleFormChange}
                  required={formData.payment_status === 'verified'}
                  value={formData.utr_id}
                />
              </label>
              <label className="text-sm">
                Payment Status
                <select className="input" name="payment_status" onChange={handleFormChange} value={formData.payment_status}>
                  <option value="pending">pending</option>
                  <option value="verified">verified</option>
                </select>
              </label>
              <label className="flex items-center gap-2 pt-7 text-sm">
                <input checked={formData.attendance} name="attendance" onChange={handleFormChange} type="checkbox" />
                Mark as Present
              </label>

              <div className="col-span-full flex gap-3">
                <button
                  className="rounded bg-electricBlue px-4 py-2 text-sm font-semibold disabled:opacity-60"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create'}
                </button>
                <button className="rounded border border-blue-700 px-4 py-2 text-sm" onClick={resetForm} type="button">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p className="text-slate-300">Loading registrations...</p>
          ) : (
            <AttendeeTable
              attendees={filteredAttendees}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onToggleAttendance={handleToggleAttendance}
              onTogglePayment={handleTogglePayment}
            />
          )}
        </>
      )}

      {activeTab === 'speakers' && <AdminSpeakers />}
      {activeTab === 'schedule' && <AdminSchedule />}
      {activeTab === 'settings' && <AdminSettings />}
      {activeTab === 'organisers' && <AdminOrganisers />}
    </section>
  )
}

export default AdminDashboard

