import { useEffect, useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import AttendeeTable from '../components/AttendeeTable'
import EventPassCard from '../components/EventPassCard'
import StatCard from '../components/StatCard'
import AdminSpeakers from '../components/admin/AdminSpeakers'
import AdminSchedule from '../components/admin/AdminSchedule'
import AdminSettings from '../components/admin/AdminSettings'
import AdminOrganisers from '../components/admin/AdminOrganisers'
import SubEventRegistrationsTab from '../components/admin/SubEventRegistrationsTab'
import { useAdmin } from '../hooks/useAdmin'
import { useAppData } from '../context/useAppData'
import { ensureSupabase } from '../lib/supabaseClient'
import { sendVerificationEmail } from '../lib/emailService'
import { fetchPageViewSummary, resetPageViews } from '../lib/pageViewService'
import { generateQRCode } from '../lib/generateQRCode'
import { EVENT_LOGO_URL, EVENT_SHORT_TITLE } from '../config/branding'

const TABS = [
  { id: 'registrations', label: 'Registrations' },
  { id: 'sub_events', label: 'Events' },
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
const MAX_PATH_ENTRIES = 6

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
  payment_screenshot_url: '',
  verification_email_sent: false,
  debate_topic: '',
})

function AdminDashboard() {
  const navigate = useNavigate()
  const { logout } = useAdmin()
  const { settings } = useAppData()
  const [activeTab, setActiveTab] = useState('registrations')
  const [attendees, setAttendees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(createRegistrationTemplate)
  const [pageViews, setPageViews] = useState({ total: 0, unique: 0, byPath: [] })
  const [pageViewsError, setPageViewsError] = useState('')
  const [resettingViews, setResettingViews] = useState(false)
  const [passModalAttendee, setPassModalAttendee] = useState(null)
  const [passQrCodeDataUrl, setPassQrCodeDataUrl] = useState(null)
  const [downloadingPass, setDownloadingPass] = useState(false)
  const passCardRef = useRef(null)

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

  useEffect(() => {
    const loadPageViews = async () => {
      try {
        const summary = await fetchPageViewSummary()
        setPageViews(summary)
        setPageViewsError('')
      } catch (error) {
        setPageViewsError('Unable to load page view analytics.')
        console.error('Failed to load page view analytics:', error)
      }
    }
    loadPageViews()
    const interval = setInterval(loadPageViews, 30_000)
    return () => clearInterval(interval)
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

  const updateRegistration = async (id, updates, options = {}) => {
    const { showToast = true, successMessage = 'Updated successfully' } = options
    try {
      const supabase = ensureSupabase()
      const { error } = await supabase.from('registrations').update(updates).eq('id', id)
      if (error) throw error
      setAttendees((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)))
      if (showToast) toast.success(successMessage)
      return true
    } catch (error) {
      toast.error(error.message)
      return false
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
      payment_screenshot_url: attendee.payment_screenshot_url ?? '',
      verification_email_sent: Boolean(attendee.verification_email_sent),
      debate_topic: attendee.debate_topic ?? '',
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
    const updated = await updateRegistration(
      attendee.id,
      { payment_status: nextStatus },
      { showToast: false },
    )
    if (!updated) return

    if (nextStatus === 'verified' && !attendee.verification_email_sent) {
      try {
        await sendVerificationEmail(attendee.full_name, attendee.email, attendee.reg_id)
        const emailFlagUpdated = await updateRegistration(
          attendee.id,
          { verification_email_sent: true, verification_email_sent_at: new Date().toISOString() },
          { showToast: false },
        )
        if (emailFlagUpdated) {
          toast.success('Payment verified and confirmation email sent')
        } else {
          toast.success('Payment verified and confirmation email sent (flag update failed)')
        }
      } catch (error) {
        toast.error(error?.message || 'Payment verified, but confirmation email could not be sent.')
      }
      return
    }

    toast.success(nextStatus === 'verified' ? 'Payment verified' : 'Payment marked pending')
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

  const handleResetPageViews = async () => {
    const confirmed = window.confirm('Reset all page view data to 0? This cannot be undone.')
    if (!confirmed) return
    setResettingViews(true)
    try {
      await resetPageViews()
      setPageViews({ total: 0, unique: 0, byPath: [] })
      setPageViewsError('')
      toast.success('Page views reset to 0')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setResettingViews(false)
    }
  }

  const handleViewPass = (attendee) => {
    setPassModalAttendee(attendee)
    setPassQrCodeDataUrl(null)
    generateQRCode(attendee.reg_id, attendee.full_name).then(setPassQrCodeDataUrl).catch(() => {})
  }

  const handleClosePassModal = () => {
    setPassModalAttendee(null)
    setPassQrCodeDataUrl(null)
  }

  const handleDownloadPass = async () => {
    if (!passCardRef.current) return
    setDownloadingPass(true)
    try {
      const canvas = await html2canvas(passCardRef.current, {
        scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [85, 135] })
      pdf.addImage(imgData, 'PNG', 0, 0, 85, 135)
      pdf.save(`KalamConclave-Pass-${passModalAttendee.reg_id}.pdf`)
    } catch {
      toast.error('Could not generate pass. Please try again.')
    } finally {
      setDownloadingPass(false)
    }
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

          <div className="mt-4 rounded-xl border border-blue-900 bg-navyLight/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-gold">Page View Analytics</h3>
              <button
                className="rounded bg-rose-700/80 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                disabled={resettingViews}
                onClick={handleResetPageViews}
                type="button"
              >
                {resettingViews ? 'Resetting…' : '🔄 Reset Views to 0'}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Total views: <span className="text-slate-200">{pageViews.total}</span> • Unique visitors:{' '}
              <span className="text-slate-200">{pageViews.unique}</span>
            </p>
            {pageViewsError && <p className="mt-2 text-xs text-rose-300">{pageViewsError}</p>}
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {pageViews.byPath.slice(0, MAX_PATH_ENTRIES).map((entry) => (
                <div key={entry.path} className="rounded-lg border border-blue-900/80 bg-blue-950/40 px-3 py-2 text-xs">
                  <p className="font-mono text-slate-300">{entry.path}</p>
                  <p className="mt-1 text-gold">{entry.count} views</p>
                </div>
              ))}
            </div>
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
              <label className="text-sm">
                Debate Role (War Room only)
                <select className="input" name="debate_topic" onChange={handleFormChange} value={formData.debate_topic}>
                  <option value="">— None —</option>
                  <option value="Scientists">Scientists</option>
                  <option value="UN Delegates">UN Delegates</option>
                  <option value="Policy Makers">Policy Makers</option>
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
              onViewPass={handleViewPass}
            />
          )}
        </>
      )}

      {activeTab === 'sub_events' && <SubEventRegistrationsTab />}
      {activeTab === 'speakers' && <AdminSpeakers />}
      {activeTab === 'schedule' && <AdminSchedule />}
      {activeTab === 'settings' && <AdminSettings />}
      {activeTab === 'organisers' && <AdminOrganisers />}

      {/* Pass preview modal */}
      {passModalAttendee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={handleClosePassModal}
        >
          <div
            className="relative flex flex-col items-center gap-4 rounded-2xl border border-blue-900 bg-navy p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-3 top-3 rounded-full bg-blue-900/60 px-3 py-1 text-xs text-slate-300 hover:bg-blue-800"
              onClick={handleClosePassModal}
              type="button"
            >
              ✕ Close
            </button>
            <h2 className="text-lg font-semibold text-gold">Event Pass — {passModalAttendee.full_name}</h2>
            <div className="overflow-x-auto pb-2">
              <EventPassCard
                pass={{
                  eventName: settings.event_short_title || EVENT_SHORT_TITLE,
                  eventDate: `${settings.event_date_label ?? '21st April 2026'} | ${settings.event_time_label ?? '10:00 AM Onwards'}`,
                  eventVenue: settings.event_venue ?? 'K.R. Mangalam University',
                  eventOrganizer: 'K.R. Mangalam University',
                  eventLogo: settings.event_logo_url || EVENT_LOGO_URL,
                  participantName: passModalAttendee.full_name,
                  participantId: passModalAttendee.reg_id,
                  participantDepartment: [passModalAttendee.course, passModalAttendee.college].filter(Boolean).join(' • '),
                  participantYear: passModalAttendee.year_of_study,
                  passId: passModalAttendee.reg_id,
                  passType: 'Participant',
                }}
                qrCodeDataUrl={passQrCodeDataUrl}
                ref={passCardRef}
              />
            </div>
            <button
              className="rounded bg-gold px-5 py-2 text-sm font-semibold text-navy disabled:opacity-60"
              disabled={downloadingPass}
              onClick={handleDownloadPass}
              type="button"
            >
              {downloadingPass ? 'Generating PDF…' : '⬇ Download Pass (PDF)'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminDashboard
