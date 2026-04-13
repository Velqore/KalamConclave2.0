import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import AttendeeTable from '../components/AttendeeTable'
import StatCard from '../components/StatCard'
import { useAdmin } from '../hooks/useAdmin'
import { ensureSupabase } from '../lib/supabaseClient'

function AdminDashboard() {
  const navigate = useNavigate()
  const { logout } = useAdmin()
  const [attendees, setAttendees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

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

  const handleTogglePayment = (attendee) => {
    const nextStatus = attendee.payment_status === 'verified' ? 'pending' : 'verified'
    updateRegistration(attendee.id, { payment_status: nextStatus })
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-gold">Admin Dashboard</h1>
        <div className="flex gap-3">
          <button className="rounded bg-electricBlue px-4 py-2 text-sm font-semibold" onClick={exportCSV} type="button">
            Export CSV
          </button>
          <button className="rounded bg-rose-600 px-4 py-2 text-sm font-semibold" onClick={handleLogout} type="button">
            Logout
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

      {loading ? (
        <p className="text-slate-300">Loading registrations...</p>
      ) : (
        <AttendeeTable
          attendees={filteredAttendees}
          onToggleAttendance={handleToggleAttendance}
          onTogglePayment={handleTogglePayment}
        />
      )}
    </section>
  )
}

export default AdminDashboard
