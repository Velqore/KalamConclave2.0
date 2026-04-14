import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { useAppData } from '../context/useAppData'
import QRScanner from '../components/volunteer/QRScanner'
import ParticipantsList from '../components/volunteer/ParticipantsList'
import EventStats from '../components/volunteer/EventStats'
import EventInfo from '../components/volunteer/EventInfo'

const TABS = [
  { key: 'scanner', label: 'Scanner', emoji: '📷' },
  { key: 'participants', label: 'Attendees', emoji: '👥' },
  { key: 'stats', label: 'Stats', emoji: '📊' },
  { key: 'info', label: 'Info', emoji: 'ℹ️' },
]

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

function VolunteerDashboard() {
  const navigate = useNavigate()
  const { settings } = useAppData()
  const [activeTab, setActiveTab] = useState('scanner')
  const [direction, setDirection] = useState(0)

  const volunteerName = sessionStorage.getItem('volunteerName') || 'Volunteer'

  // Protect route
  useEffect(() => {
    if (sessionStorage.getItem('volunteerAuthenticated') !== 'true') {
      navigate('/volunteer', { replace: true })
    }
  }, [navigate])

  const handleExit = () => {
    sessionStorage.removeItem('volunteerAuthenticated')
    sessionStorage.removeItem('volunteerName')
    sessionStorage.removeItem('volunteerSessionStart')
    sessionStorage.removeItem('volunteerScanCount')
    navigate('/volunteer', { replace: true })
  }

  const tabContent = {
    scanner: <QRScanner volunteerName={volunteerName} />,
    participants: <ParticipantsList />,
    stats: <EventStats />,
    info: <EventInfo />,
  }

  const handleTabChange = (key) => {
    const currIdx = TABS.findIndex((t) => t.key === activeTab)
    const nextIdx = TABS.findIndex((t) => t.key === key)
    setDirection(nextIdx > currIdx ? 1 : -1)
    setActiveTab(key)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0f172a',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
        }}
      >
        <div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: '14px', lineHeight: 1.1 }}>{settings.event_short_title || 'Kalam Conclave 2.0'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>{volunteerName}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>•</span>
            <LiveClock />
          </div>
        </div>
        <button
          onClick={handleExit}
          style={{
            background: 'rgba(220,38,38,0.85)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            padding: '8px 12px',
            cursor: 'pointer',
            minHeight: '36px',
          }}
        >
          Exit
        </button>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence initial={false} mode="wait">
          <Motion.div
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            initial={{ opacity: 0, x: direction * 30 }}
            key={activeTab}
            style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
            transition={{ duration: 0.2 }}
          >
            {tabContent[activeTab]}
          </Motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom tab bar */}
      <div
        style={{
          background: '#1e293b',
          borderTop: '1px solid #334155',
          display: 'flex',
          flexShrink: 0,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                borderTop: `2px solid ${active ? '#7C3AED' : 'transparent'}`,
                padding: '10px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                cursor: 'pointer',
                minHeight: '56px',
              }}
            >
              <span style={{ fontSize: '20px' }}>{tab.emoji}</span>
              <span style={{ fontSize: '10px', color: active ? '#7C3AED' : '#64748b', fontWeight: active ? 700 : 400 }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default VolunteerDashboard
