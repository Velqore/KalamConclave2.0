import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion as Motion } from 'framer-motion'

const MAX_ATTEMPTS = 5
const LOCKOUT_SECONDS = 120

function VolunteerLogin() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)
  const [lockRemaining, setLockRemaining] = useState(0)
  const intervalRef = useRef(null)

  // Check if already authenticated
  useEffect(() => {
    if (sessionStorage.getItem('volunteerAuthenticated') === 'true') {
      navigate('/volunteer/dashboard', { replace: true })
    }
  }, [navigate])

  // Countdown timer during lockout
  useEffect(() => {
    if (!lockedUntil) return
    intervalRef.current = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockedUntil(null)
        setAttempts(0)
        setLockRemaining(0)
        clearInterval(intervalRef.current)
      } else {
        setLockRemaining(remaining)
      }
    }, 500)
    return () => clearInterval(intervalRef.current)
  }, [lockedUntil])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (lockedUntil && Date.now() < lockedUntil) return

    const trimmedName = name.trim()
    const trimmedCode = code.trim()

    if (!trimmedName) {
      setError('Please enter your name.')
      triggerShake()
      return
    }
    if (!trimmedCode) {
      setError('Please enter the access code.')
      triggerShake()
      return
    }

    const secret = import.meta.env.VITE_VOLUNTEER_SECRET_CODE
    if (trimmedCode === secret) {
      sessionStorage.setItem('volunteerAuthenticated', 'true')
      sessionStorage.setItem('volunteerName', trimmedName)
      sessionStorage.setItem('volunteerSessionStart', new Date().toISOString())
      sessionStorage.setItem('volunteerScanCount', '0')
      navigate('/volunteer/dashboard', { replace: true })
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      triggerShake()
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_SECONDS * 1000
        setLockedUntil(until)
        setError(`Too many wrong attempts. Locked for ${LOCKOUT_SECONDS} seconds.`)
      } else {
        setError(`Incorrect code. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`)
      }
      setCode('')
    }
  }

  const isLocked = lockRemaining > 0

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <Motion.div
        animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          padding: '40px 32px',
          width: '100%',
          maxWidth: '400px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '40px',
              marginBottom: '12px',
            }}
          >
            🎓
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Volunteer Portal
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.55)',
              marginTop: '6px',
            }}
          >
            Kalam Conclave 2.0 — Staff Access
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '6px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Your Name
            </label>
            <input
              autoComplete="name"
              disabled={!!isLocked}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              type="text"
              value={name}
            />
          </div>

          {/* Code input */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '6px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Access Code
            </label>
            <input
              autoComplete="off"
              disabled={!!isLocked}
              maxLength={20}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter secret access code"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '18px',
                fontFamily: 'monospace',
                letterSpacing: '0.2em',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              type="password"
              value={code}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <Motion.p
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0, y: -8 }}
                style={{
                  color: '#f87171',
                  fontSize: '13px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  padding: '10px',
                  background: 'rgba(248,113,113,0.1)',
                  borderRadius: '8px',
                }}
              >
                {isLocked
                  ? `🔒 Locked. Try again in ${lockRemaining}s`
                  : error}
              </Motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            disabled={!!isLocked}
            style={{
              width: '100%',
              padding: '16px',
              background: isLocked
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #7C3AED, #06B6D4)',
              border: 'none',
              borderRadius: '12px',
              color: isLocked ? 'rgba(255,255,255,0.4)' : '#ffffff',
              fontSize: '16px',
              fontWeight: 700,
              cursor: isLocked ? 'not-allowed' : 'pointer',
              minHeight: '52px',
              letterSpacing: '0.04em',
            }}
            type="submit"
          >
            {isLocked ? `🔒 Locked (${lockRemaining}s)` : 'Enter Portal →'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)',
            marginTop: '20px',
          }}
        >
          Session expires when you close this tab
        </p>
      </Motion.div>
    </div>
  )
}

export default VolunteerLogin
