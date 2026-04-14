import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { SUB_EVENTS } from '../../config/subEvents'

const REFRESH_INTERVAL = 15_000

function StatBox({ label, value, color, emoji }) {
  return (
    <div
      style={{
        flex: '1 1 calc(50% - 8px)',
        background: '#1e293b',
        borderRadius: '14px',
        padding: '16px',
        border: `1px solid ${color}33`,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: '28px', marginBottom: '4px' }}>{emoji}</div>
      <div style={{ fontSize: '28px', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{label}</div>
    </div>
  )
}

function RingChart({ percent }) {
  const r = 45
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
      <svg height="120" viewBox="0 0 120 120" width="120">
        <circle cx="60" cy="60" fill="none" r={r} stroke="#334155" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          fill="none"
          r={r}
          stroke="#7C3AED"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="12"
          style={{ transition: 'stroke-dashoffset 0.6s ease', transformOrigin: '60px 60px', transform: 'rotate(-90deg)' }}
        />
        <text dominantBaseline="middle" fill="#f1f5f9" fontSize="18" fontWeight="bold" textAnchor="middle" x="60" y="60">
          {Math.round(percent)}%
        </text>
      </svg>
    </div>
  )
}

function exportCSV(records) {
  const headers = ['Name', 'ID', 'Department', 'Pass Type', 'Status', 'Check-In Time', 'Check-Out Time']
  const rows = records.map((r) => [
    r.participant_name,
    r.participant_id,
    r.department || '',
    r.pass_type || '',
    r.status,
    r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : '',
    r.checked_out_at ? new Date(r.checked_out_at).toLocaleString() : '',
  ])
  const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `attendance_export_${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function EventStats() {
  const [records, setRecords] = useState([])
  const [totalReg, setTotalReg] = useState(0)
  const [subEventCounts, setSubEventCounts] = useState([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    const doFetch = async () => {
      if (!supabase) { setLoading(false); return }
      const [attRes, regRes, subRes] = await Promise.all([
        supabase.from('attendance').select('*').order('checked_in_at', { ascending: true }),
        supabase.from('registrations').select('id', { count: 'exact', head: true }),
        supabase.from('sub_event_registrations').select('sub_event_id, sub_event_name'),
      ])
      if (attRes.data) setRecords(attRes.data)
      if (regRes.count != null) setTotalReg(regRes.count)

      if (subRes.data) {
        const counts = SUB_EVENTS.map((ev) => ({
          id: ev.id,
          name: ev.name,
          icon: ev.icon,
          color: ev.color,
          count: subRes.data.filter((r) => r.sub_event_id === ev.id).length,
        }))
        setSubEventCounts(counts)
      }
      setLoading(false)
    }

    doFetch()
    intervalRef.current = setInterval(doFetch, REFRESH_INTERVAL)
    if (supabase) {
      const channels = [
        supabase.channel('stats-attendance').on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, doFetch).subscribe(),
        supabase.channel('stats-registrations').on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, doFetch).subscribe(),
        supabase.channel('stats-sub-events').on('postgres_changes', { event: '*', schema: 'public', table: 'sub_event_registrations' }, doFetch).subscribe(),
      ]
      return () => {
        clearInterval(intervalRef.current)
        channels.forEach((ch) => supabase.removeChannel(ch))
      }
    }
    return () => clearInterval(intervalRef.current)
  }, [])

  const checkedIn = records.filter((r) => r.status === 'checked_in').length
  const checkedOut = records.filter((r) => r.status === 'checked_out').length
  const notArrived = (totalReg || records.length) - checkedIn - checkedOut
  const total = totalReg || records.length
  const attendancePercent = total > 0 ? ((checkedIn + checkedOut) / total) * 100 : 0

  // Hourly bar chart
  const hourlyCounts = {}
  records.forEach((r) => {
    if (!r.checked_in_at) return
    const h = new Date(r.checked_in_at).getHours()
    hourlyCounts[h] = (hourlyCounts[h] || 0) + 1
  })
  const hours = Object.keys(hourlyCounts).map(Number).sort((a, b) => a - b)
  const maxCount = Math.max(...Object.values(hourlyCounts), 1)

  // Last 5 scans
  const lastFive = [...records]
    .filter((r) => r.checked_in_at || r.checked_out_at)
    .sort((a, b) => {
      const ta = new Date(a.checked_out_at || a.checked_in_at || 0).getTime()
      const tb = new Date(b.checked_out_at || b.checked_in_at || 0).getTime()
      return tb - ta
    })
    .slice(0, 5)

  if (loading) {
    return <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', background: '#0f172a', height: '100%' }}>Loading stats…</div>
  }

  return (
    <div style={{ background: '#0f172a', height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ padding: '16px' }}>
        {/* Stat cards */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          <StatBox color="#7C3AED" emoji="👥" label="Total Registered" value={total} />
          <StatBox color="#16a34a" emoji="✅" label="Checked In" value={checkedIn} />
          <StatBox color="#2563eb" emoji="🚪" label="Checked Out" value={checkedOut} />
          <StatBox color="#94a3b8" emoji="⏳" label="Not Arrived" value={notArrived < 0 ? 0 : notArrived} />
        </div>

        {/* Sub-event breakdown */}
        {subEventCounts.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Sub-Event Registrations
            </div>
            {subEventCounts.map((ev) => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{ev.icon}</span>
                  <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 600 }}>{ev.name}</span>
                </div>
                <span style={{ color: ev.color, fontSize: '16px', fontWeight: 800 }}>{ev.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Attendance ring */}
        <div style={{ background: '#1e293b', borderRadius: '14px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Attendance Rate
          </div>
          <RingChart percent={attendancePercent} />
        </div>

        {/* Hourly bar chart */}
        {hours.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Check-ins by Hour
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
              {hours.map((h) => {
                const count = hourlyCounts[h]
                const pct = (count / maxCount) * 100
                return (
                  <div key={h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ width: '100%', background: '#7C3AED', borderRadius: '4px 4px 0 0', height: `${pct}%`, minHeight: '4px', transition: 'height 0.4s ease' }} />
                    <div style={{ fontSize: '9px', color: '#64748b' }}>{h}h</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Last 5 scans */}
        {lastFive.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Last 5 Scans
            </div>
            {lastFive.map((r) => {
              const t = r.checked_out_at || r.checked_in_at
              return (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                  <div>
                    <div style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 600 }}>{r.participant_name}</div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{r.status === 'checked_out' ? 'Checked Out' : 'Checked In'}</div>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                    {t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CSV export */}
        <button
          onClick={() => exportCSV(records)}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
            minHeight: '52px',
            marginBottom: '8px',
          }}
        >
          ⬇ Export Attendance CSV
        </button>
      </div>
    </div>
  )
}

export default EventStats
