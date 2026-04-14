import { useNavigate } from 'react-router-dom'

const GUIDE_CARDS = [
  { bg: '#dcfce7', border: '#16a34a', color: '#14532d', emoji: '✅', title: 'Green Card — Valid Pass', desc: 'Allow entry. Confirm check-in.' },
  { bg: '#dbeafe', border: '#2563eb', color: '#1e3a8a', emoji: '🔵', title: 'Blue Card — Already Inside', desc: 'Already checked in. Confirm check-out or allow re-entry if needed.' },
  { bg: '#fef9c3', border: '#ca8a04', color: '#78350f', emoji: '🟡', title: 'Yellow Card — Already Exited', desc: 'Ask organizer before allowing re-entry.' },
  { bg: '#fee2e2', border: '#dc2626', color: '#7f1d1d', emoji: '❌', title: 'Red Card — Invalid Pass', desc: 'Do NOT allow entry. Contact organizer immediately.' },
]

function EventInfo() {
  const navigate = useNavigate()
  const volunteerName = sessionStorage.getItem('volunteerName') || 'Volunteer'
  const sessionStart = sessionStorage.getItem('volunteerSessionStart')
  const scanCount = sessionStorage.getItem('volunteerScanCount') || '0'

  let emergencyContacts = []
  try {
    emergencyContacts = JSON.parse(import.meta.env.VITE_EMERGENCY_CONTACTS || '[]')
  } catch { /* ignore parse error */ }

  const handleEndSession = () => {
    sessionStorage.removeItem('volunteerAuthenticated')
    sessionStorage.removeItem('volunteerName')
    sessionStorage.removeItem('volunteerSessionStart')
    sessionStorage.removeItem('volunteerScanCount')
    navigate('/volunteer', { replace: true })
  }

  return (
    <div style={{ background: '#0f172a', height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ padding: '16px' }}>

        {/* Event Details */}
        <Section title="📅 Event Details">
          <Row label="Event" value="1st Kalam Conclave 2.0" />
          <Row label="Date" value="21st April 2026" />
          <Row label="Time" value="10:00 AM Onwards" />
          <Row label="Venue" value="MultiPurpose Hall, A-Block, K.R. Mangalam University" />
          <Row label="Organizer" value="K.R. Mangalam University" />
          <Row label="Support Email" value="Mr_GhostKing@proton.me" />
        </Section>

        {/* Volunteer Guidelines */}
        <Section title="📋 Volunteer Guidelines">
          {GUIDE_CARDS.map((card) => (
            <div
              key={card.title}
              style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '18px' }}>{card.emoji}</span>
                <span style={{ color: card.color, fontWeight: 700, fontSize: '13px' }}>{card.title}</span>
              </div>
              <p style={{ color: card.color, fontSize: '12px', margin: 0, opacity: 0.85 }}>{card.desc}</p>
            </div>
          ))}
        </Section>

        {/* Emergency Contacts */}
        {emergencyContacts.length > 0 && (
          <Section title="🚨 Emergency Contacts">
            {emergencyContacts.map((c) => (
              <a
                href={`tel:${c.phone}`}
                key={c.name}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#1e293b', borderRadius: '10px', marginBottom: '8px', textDecoration: 'none', minHeight: '52px' }}
              >
                <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '14px' }}>{c.name}</span>
                <span style={{ color: '#06B6D4', fontFamily: 'monospace', fontSize: '14px' }}>📞 {c.phone}</span>
              </a>
            ))}
          </Section>
        )}

        {/* Your Session */}
        <Section title="👤 Your Session">
          <Row label="Volunteer" value={volunteerName} />
          {sessionStart && (
            <Row label="Session Start" value={new Date(sessionStart).toLocaleTimeString()} />
          )}
          <Row label="Scans Done" value={scanCount} />
        </Section>

        {/* End Session */}
        <button
          onClick={handleEndSession}
          style={{
            width: '100%',
            padding: '16px',
            background: '#dc2626',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
            marginTop: '8px',
            minHeight: '52px',
            marginBottom: '24px',
          }}
        >
          End Session & Log Out
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>{title}</h3>
      <div style={{ background: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #334155', gap: '12px' }}>
      <span style={{ color: '#64748b', fontSize: '13px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#f1f5f9', fontSize: '13px', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export default EventInfo
