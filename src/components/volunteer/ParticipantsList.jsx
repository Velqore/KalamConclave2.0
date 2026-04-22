import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'
import { SUB_EVENTS } from '../../config/subEvents'

const STATUS_LABEL = { not_arrived: 'Not Arrived', checked_in: 'Checked In', checked_out: 'Checked Out' }
const STATUS_COLOR = {
  not_arrived: { bg: '#f1f5f9', color: '#475569' },
  checked_in: { bg: '#dcfce7', color: '#15803d' },
  checked_out: { bg: '#dbeafe', color: '#1d4ed8' },
}
const PASS_TYPE_COLORS = {
  Participant: '#7C3AED',
  Volunteer: '#059669',
  Speaker: '#D97706',
  Guest: '#2563EB',
}
const STATUS_FILTERS = ['All', 'Checked In', 'Not Arrived', 'Checked Out']
const FILTER_STATUS = {
  All: null,
  'Checked In': 'checked_in',
  'Not Arrived': 'not_arrived',
  'Checked Out': 'checked_out',
}
const REFRESH_INTERVAL = 10_000

// Sub-event filter chips labels
const SUB_EVENT_FILTER_OPTIONS = ['All Sub-Events', ...SUB_EVENTS.map((e) => e.name)]

function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

function StatusBadge({ status }) {
  const s = STATUS_COLOR[status] || STATUS_COLOR.not_arrived
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function AvatarInitials({ name, passType }) {
  const color = PASS_TYPE_COLORS[passType] || '#7C3AED'
  return (
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
      {getInitials(name) || '?'}
    </div>
  )
}

function ParticipantModal({ record, debateRole, onClose, onUpdate, onDelete }) {
  const [saving, setSaving] = useState(false)

  const update = async (status) => {
    if (!supabase || !record) return
    setSaving(true)
    const now = new Date().toISOString()
    const updates = { status }
    if (status === 'checked_in') updates.checked_in_at = now
    if (status === 'checked_out') updates.checked_out_at = now
    await supabase.from('attendance').update(updates).eq('id', record.id)
    setSaving(false)
    onUpdate()
  }

  if (!record) return null
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <AvatarInitials name={record.participant_name} passType={record.pass_type} />
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '17px' }}>{record.participant_name}</div>
            <div style={{ color: '#94a3b8', fontSize: '13px' }}>{record.participant_id}</div>
          </div>
        </div>

        <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>{record.department}</div>
        {debateRole && (
          <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '8px', background: 'rgba(127,29,29,0.4)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#fca5a5', fontWeight: 600 }}>
            🗣️ War Room Role: {debateRole}
          </div>
        )}
        <div style={{ marginBottom: '16px' }}><StatusBadge status={record.status} /></div>

        {record.checked_in_at && (
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>
            Checked in: {new Date(record.checked_in_at).toLocaleTimeString()}
          </div>
        )}
        {record.checked_out_at && (
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>
            Checked out: {new Date(record.checked_out_at).toLocaleTimeString()}
          </div>
        )}

        <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px' }}>Manual Override:</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['not_arrived', 'checked_in', 'checked_out'].map((s) => (
            <button
              disabled={saving || record.status === s}
              key={s}
              onClick={() => update(s)}
              style={{
                padding: '10px 14px',
                background: record.status === s ? '#334155' : '#475569',
                border: 'none',
                borderRadius: '8px',
                color: record.status === s ? '#64748b' : '#f1f5f9',
                fontSize: '13px',
                fontWeight: 600,
                cursor: record.status === s ? 'default' : 'pointer',
                minHeight: '52px',
              }}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: '16px', width: '100%', padding: '14px', background: '#374151', border: 'none', borderRadius: '10px', color: '#9ca3af', fontWeight: 600, cursor: 'pointer', minHeight: '52px' }}>
          Close
        </button>
        <button
          disabled={saving}
          onClick={() => onDelete(record)}
          style={{
            marginTop: '10px',
            width: '100%',
            padding: '14px',
            background: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid rgba(248, 113, 113, 0.4)',
            borderRadius: '10px',
            color: '#fca5a5',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '52px',
          }}
          type="button"
        >
          Delete Entry
        </button>
      </Motion.div>
    </Motion.div>
  )
}

function ParticipantsList() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [subEventFilter, setSubEventFilter] = useState('All Sub-Events')
  const [selected, setSelected] = useState(null)
  const [totalReg, setTotalReg] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [subEventMap, setSubEventMap] = useState({}) // pass_id → sub_event_name
  const [debateRoleMap, setDebateRoleMap] = useState({}) // reg_id → debate_topic
  const intervalRef = useRef(null)

  useEffect(() => {
    const doFetch = async () => {
      if (!supabase) { setLoading(false); return }
      const [attRes, regRes, subRes, roleRes] = await Promise.all([
        supabase.from('attendance').select('*').order('created_at', { ascending: false }),
        supabase.from('registrations').select('id', { count: 'exact', head: true }),
        supabase.from('sub_event_registrations').select('pass_id, sub_event_name, sub_event_id'),
        supabase.from('registrations').select('reg_id, debate_topic').not('debate_topic', 'is', null),
      ])
      if (attRes.data) setRecords(attRes.data)
      if (regRes.count != null) setTotalReg(regRes.count)
      if (subRes.data) {
        const map = {}
        subRes.data.forEach((r) => { map[r.pass_id] = r.sub_event_name })
        setSubEventMap(map)
      }
      if (roleRes.data) {
        const map = {}
        roleRes.data.forEach((r) => { if (r.debate_topic) map[r.reg_id] = r.debate_topic })
        setDebateRoleMap(map)
      }
      setLoading(false)
    }

    doFetch()
    intervalRef.current = setInterval(doFetch, REFRESH_INTERVAL)
    window.addEventListener('attendance-updated', doFetch)

    if (supabase) {
      const channels = [
        supabase.channel('attendance-list').on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, doFetch).subscribe(),
        supabase.channel('participants-registrations').on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, doFetch).subscribe(),
        supabase.channel('participants-sub-events').on('postgres_changes', { event: '*', schema: 'public', table: 'sub_event_registrations' }, doFetch).subscribe(),
      ]
      return () => {
        clearInterval(intervalRef.current)
        window.removeEventListener('attendance-updated', doFetch)
        channels.forEach((ch) => supabase.removeChannel(ch))
      }
    }
    return () => {
      clearInterval(intervalRef.current)
      window.removeEventListener('attendance-updated', doFetch)
    }
  }, [refreshKey])

  const filtered = records.filter((r) => {
    const statusMatch = !FILTER_STATUS[filter] || r.status === FILTER_STATUS[filter]
    const subName = subEventMap[r.participant_id] ?? ''
    const subEventMatch =
      subEventFilter === 'All Sub-Events' ||
      subName.toLowerCase().includes(subEventFilter.toLowerCase()) ||
      SUB_EVENTS.find((e) => e.name === subEventFilter)?.id === subName
    const q = search.toLowerCase()
    const textMatch = !q || r.participant_name?.toLowerCase().includes(q) || r.participant_id?.toLowerCase().includes(q) || r.department?.toLowerCase().includes(q)
    return statusMatch && subEventMatch && textMatch
  })

  const checkedIn = records.filter((r) => r.status === 'checked_in').length

  const handleDelete = async (record) => {
    if (!supabase) return
    if (!record?.id) return
    const confirmed = window.confirm(`Delete attendee entry for ${record.participant_name}?`)
    if (!confirmed) return

    const { error } = await supabase.from('attendance').delete().eq('id', record.id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Attendee entry deleted')
    setRefreshKey((k) => k + 1)
    setSelected(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
          {checkedIn} of {totalReg || records.length} participants arrived
        </div>
        <input
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by name, ID, department..."
          style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          type="text"
          value={search}
        />
        {/* Status filter chips */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', paddingBottom: '2px' }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                background: filter === f ? '#7C3AED' : '#1e293b',
                border: `1px solid ${filter === f ? '#7C3AED' : '#334155'}`,
                borderRadius: '999px',
                color: filter === f ? '#fff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: filter === f ? 700 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: '32px',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        {/* Sub-event filter chips */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {SUB_EVENT_FILTER_OPTIONS.map((f) => {
            const ev = SUB_EVENTS.find((e) => e.name === f)
            const active = subEventFilter === f
            return (
              <button
                key={f}
                onClick={() => setSubEventFilter(f)}
                style={{
                  padding: '4px 12px',
                  background: active ? (ev?.color ?? '#334155') : '#0f172a',
                  border: `1px solid ${active ? (ev?.color ?? '#334155') : '#334155'}`,
                  borderRadius: '999px',
                  color: active ? '#fff' : '#64748b',
                  fontSize: '11px',
                  fontWeight: active ? 700 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  minHeight: '28px',
                }}
              >
                {ev ? `${ev.icon} ${f}` : f}
              </button>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No participants found.</div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelected(r)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderBottom: '1px solid #1e293b',
                cursor: 'pointer',
                minHeight: '52px',
              }}
            >
              <AvatarInitials name={r.participant_name} passType={r.pass_type} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.participant_name}
                </div>
                <div style={{ color: '#64748b', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.participant_id} {r.department ? `• ${r.department}` : ''}
                </div>
                {subEventMap[r.participant_id] && (
                  <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '1px' }}>
                    {subEventMap[r.participant_id]}
                  </div>
                )}
                {debateRoleMap[r.participant_id] && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: '2px', background: 'rgba(127,29,29,0.4)', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', color: '#fca5a5', fontWeight: 600 }}>
                    🗣️ {debateRoleMap[r.participant_id]}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                <StatusBadge status={r.status} />
                {r.checked_in_at && (
                  <span style={{ fontSize: '10px', color: '#64748b' }}>
                    {new Date(r.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <ParticipantModal
            key="modal"
            debateRole={debateRoleMap[selected?.participant_id]}
            onClose={() => setSelected(null)}
            onDelete={handleDelete}
            onUpdate={() => { setRefreshKey((k) => k + 1); setSelected(null) }}
            record={selected}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ParticipantsList
