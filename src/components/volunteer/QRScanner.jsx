import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'

const DUPLICATE_WINDOW_MS = 30_000
const DISMISS_DELAY_MS = 2500

// ---------- Audio helpers (Web Audio API) ----------
function beepSuccess() {
  try {
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(880, ctx.currentTime)
    g.gain.setValueAtTime(0.3, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    o.start()
    o.stop(ctx.currentTime + 0.4)
  } catch {
    // AudioContext not available
  }
}

function beepError() {
  try {
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(220, ctx.currentTime)
    g.gain.setValueAtTime(0.3, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    o.start()
    o.stop(ctx.currentTime + 0.5)
  } catch {
    // AudioContext not available
  }
}

// ---------- Scan result card component ----------
const STATE_STYLES = {
  checkin: { bg: '#dcfce7', border: '#16a34a', headerBg: '#16a34a', emoji: '✅', label: 'VALID PASS — CHECK IN' },
  checkout: { bg: '#dbeafe', border: '#2563eb', headerBg: '#2563eb', emoji: '🔵', label: 'CHECKED IN — MARK EXIT?' },
  exited: { bg: '#fef9c3', border: '#ca8a04', headerBg: '#ca8a04', emoji: '🟡', label: 'ALREADY EXITED' },
  invalid: { bg: '#fee2e2', border: '#dc2626', headerBg: '#dc2626', emoji: '❌', label: 'INVALID PASS' },
  duplicate: { bg: '#ffedd5', border: '#ea580c', headerBg: '#ea580c', emoji: '⚠️', label: 'ALREADY SCANNED' },
}

function ResultCard({ result, onConfirm, onDismiss }) {
  if (!result) return null
  const s = STATE_STYLES[result.state]
  const { record } = result

  return (
    <Motion.div
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      initial={{ opacity: 0, y: 20 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'flex-end',
        padding: '16px',
        background: 'rgba(0,0,0,0.65)',
      }}
    >
      <div
        style={{
          width: '100%',
          background: s.bg,
          border: `2px solid ${s.border}`,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: s.headerBg,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px' }}>{s.emoji}</span>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '14px', letterSpacing: '0.04em' }}>
            {s.label}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px' }}>
          {result.state === 'invalid' && (
            <>
              <p style={{ color: '#7f1d1d', fontSize: '14px', margin: '0 0 4px' }}>
                This QR code is not recognized.
              </p>
              <p style={{ color: '#991b1b', fontWeight: 700, fontSize: '13px', margin: 0 }}>
                Do not allow entry.
              </p>
            </>
          )}

          {result.state === 'duplicate' && (
            <p style={{ color: '#7c2d12', fontSize: '14px', margin: 0 }}>
              This pass was just scanned {result.elapsedSeconds}s ago.
            </p>
          )}

          {['checkin', 'checkout', 'exited'].includes(result.state) && record && (
            <div style={{ fontSize: '13px', color: '#1e293b' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong style={{ fontSize: '16px' }}>{record.participant_name}</strong>
              </div>
              <div style={{ color: '#475569' }}>ID: {record.participant_id}</div>
              {record.department && <div style={{ color: '#475569' }}>Dept: {record.department}</div>}
              {record.pass_type && <div style={{ color: '#475569' }}>Pass: {record.pass_type}</div>}
              {result.state === 'checkout' && record.checked_in_at && (
                <div style={{ marginTop: '4px', color: '#1d4ed8' }}>
                  Checked in at: {new Date(record.checked_in_at).toLocaleTimeString()}
                </div>
              )}
              {result.state === 'exited' && (
                <>
                  <div style={{ marginTop: '4px', color: '#92400e' }}>
                    In: {record.checked_in_at ? new Date(record.checked_in_at).toLocaleTimeString() : '—'}
                  </div>
                  <div style={{ color: '#92400e' }}>
                    Out: {record.checked_out_at ? new Date(record.checked_out_at).toLocaleTimeString() : '—'}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            {result.state === 'checkin' && (
              <>
                <button
                  onClick={() => onConfirm('checkin')}
                  style={btnStyle('#16a34a')}
                >
                  ✓ Confirm Check-In
                </button>
                <button onClick={onDismiss} style={btnStyle('#6b7280', true)}>
                  ✗ Cancel
                </button>
              </>
            )}
            {result.state === 'checkout' && (
              <>
                <button
                  onClick={() => onConfirm('checkout')}
                  style={btnStyle('#2563eb')}
                >
                  ✓ Confirm Check-Out
                </button>
                <button onClick={onDismiss} style={btnStyle('#6b7280', true)}>
                  ✗ Cancel
                </button>
              </>
            )}
            {result.state === 'exited' && (
              <>
                <button
                  onClick={() => onConfirm('reentry')}
                  style={btnStyle('#ca8a04')}
                >
                  Allow Re-entry
                </button>
                <button onClick={onDismiss} style={btnStyle('#6b7280', true)}>
                  Dismiss
                </button>
              </>
            )}
            {(result.state === 'invalid' || result.state === 'duplicate') && (
              <button onClick={onDismiss} style={btnStyle('#6b7280', true)}>
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </Motion.div>
  )
}

function btnStyle(color, outline = false) {
  return {
    flex: 1,
    padding: '12px',
    background: outline ? 'transparent' : color,
    border: outline ? `2px solid ${color}` : 'none',
    borderRadius: '10px',
    color: outline ? color : '#ffffff',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    minHeight: '52px',
  }
}

// ---------- Main QRScanner component ----------
function QRScanner({ volunteerName }) {
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)
  const lastScansRef = useRef({}) // passId → timestamp
  const dismissTimerRef = useRef(null)
  const wakeLockRef = useRef(null)

  const [started, setStarted] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const [scanResult, setScanResult] = useState(null)
  const [manualMode, setManualMode] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [processing, setProcessing] = useState(false)

  const stopScanner = useCallback(async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop() } catch { /* ignore */ }
      html5QrRef.current = null
    }
    setStarted(false)
  }, [])

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      } catch { /* wake lock not available */ }
    }
  }, [])

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {})
      wakeLockRef.current = null
    }
  }, [])

  // Reacquire wake lock on visibility change
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && started) {
        requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [started, requestWakeLock])

  const processPassId = useCallback(async (passId) => {
    if (processing || !passId) return
    setProcessing(true)

    // Duplicate scan check (within 30s)
    const lastScan = lastScansRef.current[passId]
    if (lastScan && Date.now() - lastScan < DUPLICATE_WINDOW_MS) {
      beepError()
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
      setScanResult({ state: 'duplicate', elapsedSeconds: Math.round((Date.now() - lastScan) / 1000) })
      setProcessing(false)
      return
    }

    // Update last scan time
    lastScansRef.current[passId] = Date.now()

    if (!supabase) {
      beepError()
      setScanResult({ state: 'invalid' })
      setProcessing(false)
      return
    }

    try {
      // Look up attendance record
      const { data: records } = await supabase
        .from('attendance')
        .select('*')
        .eq('pass_id', passId)
        .limit(1)

      if (!records || records.length === 0) {
        // No attendance record → check if pass exists in registrations
        const { data: regData } = await supabase
          .from('registrations')
          .select('reg_id, full_name, course, college, year_of_study')
          .eq('reg_id', passId)
          .limit(1)

        if (!regData || regData.length === 0) {
          beepError()
          if (navigator.vibrate) navigator.vibrate([100, 50, 100])
          setScanResult({ state: 'invalid' })
          setProcessing(false)
          return
        }

        // First scan — create attendance record
        const reg = regData[0]
        const dept = [reg.course, reg.college].filter(Boolean).join(' • ')
        const { data: newRecord, error: createError } = await supabase
          .from('attendance')
          .insert({
            pass_id: passId,
            participant_name: reg.full_name,
            participant_id: reg.reg_id,
            department: dept,
            pass_type: 'Participant',
            status: 'not_arrived',
            scan_count: 0,
            scanned_by: volunteerName,
          })
          .select()
          .single()
        if (createError) throw createError

        beepSuccess()
        if (navigator.vibrate) navigator.vibrate(200)
        window.dispatchEvent(new Event('attendance-updated'))
        setScanResult({ state: 'checkin', record: newRecord })
        setProcessing(false)
        return
      }

      const record = records[0]
      if (record.status === 'not_arrived') {
        beepSuccess()
        if (navigator.vibrate) navigator.vibrate(200)
        setScanResult({ state: 'checkin', record })
      } else if (record.status === 'checked_in') {
        beepSuccess()
        if (navigator.vibrate) navigator.vibrate(200)
        setScanResult({ state: 'checkout', record })
      } else {
        // checked_out
        beepSuccess()
        if (navigator.vibrate) navigator.vibrate(200)
        setScanResult({ state: 'exited', record })
      }
    } catch {
      beepError()
      setScanResult({ state: 'invalid' })
    } finally {
      setProcessing(false)
    }
  }, [processing, volunteerName])

  const onScanSuccess = useCallback((decodedText) => {
    if (scanResult) return // already showing a result
    try {
      const parsed = JSON.parse(decodedText)
      if (parsed && parsed.passId) {
        processPassId(parsed.passId)
      } else {
        beepError()
        if (navigator.vibrate) navigator.vibrate([100, 50, 100])
        setScanResult({ state: 'invalid' })
      }
    } catch {
      // Not JSON — try treating as plain pass ID
      processPassId(decodedText.trim())
    }
  }, [scanResult, processPassId])

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return
    const html5Qr = new Html5Qrcode(scannerRef.current.id)
    html5QrRef.current = html5Qr
    try {
      await html5Qr.start(
        { facingMode },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        onScanSuccess,
        undefined,
      )
      setStarted(true)
      requestWakeLock()
    } catch {
      setStarted(false)
    }
  }, [facingMode, onScanSuccess, requestWakeLock])

  useEffect(() => {
    return () => {
      stopScanner()
      releaseWakeLock()
      clearTimeout(dismissTimerRef.current)
    }
  }, [stopScanner, releaseWakeLock])

  // Restart scanner when facing mode changes
  useEffect(() => {
    if (started) {
      stopScanner().then(() => startScanner())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode])

  const handleConfirm = async (action) => {
    if (!scanResult?.record || !supabase) { dismissResult(); return }
    const { record } = scanResult
    const now = new Date().toISOString()
    try {
      if (action === 'checkin') {
        const { error } = await supabase.from('attendance').update({
          status: 'checked_in',
          checked_in_at: now,
          scan_count: (record.scan_count || 0) + 1,
          scanned_by: volunteerName,
        }).eq('id', record.id)
        if (error) throw error
      } else if (action === 'checkout') {
        const { error } = await supabase.from('attendance').update({
          status: 'checked_out',
          checked_out_at: now,
          scan_count: (record.scan_count || 0) + 1,
          scanned_by: volunteerName,
        }).eq('id', record.id)
        if (error) throw error
      } else if (action === 'reentry') {
        const { error } = await supabase.from('attendance').update({
          status: 'checked_in',
          checked_in_at: now,
          checked_out_at: null,
          scan_count: (record.scan_count || 0) + 1,
          scanned_by: volunteerName,
        }).eq('id', record.id)
        if (error) throw error
      }
      const { error: regError } = await supabase
        .from('registrations')
        .update({ attendance: true })
        .eq('reg_id', record.pass_id)
      if (regError) throw regError
      // Update session scan count
      const sc = parseInt(sessionStorage.getItem('volunteerScanCount') || '0', 10)
      sessionStorage.setItem('volunteerScanCount', String(sc + 1))
      window.dispatchEvent(new Event('attendance-updated'))
    } catch (error) {
      console.error('Attendance confirmation failed:', error)
      toast.error('Could not update attendance. Please retry.')
      beepError()
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
      return
    }
    dismissTimerRef.current = setTimeout(dismissResult, DISMISS_DELAY_MS)
  }

  const dismissResult = () => {
    setScanResult(null)
    clearTimeout(dismissTimerRef.current)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    const id = manualInput.trim()
    if (id) {
      processPassId(id)
      setManualInput('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Camera viewfinder */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          background: '#000',
          overflow: 'hidden',
          minHeight: '300px',
        }}
      >
        <div
          id="qr-reader-volunteer"
          ref={scannerRef}
          style={{ width: '100%', height: '100%' }}
        />

        {/* Corner overlay frame */}
        {started && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '220px', height: '220px', position: 'relative' }}>
              {[
                { top: 0, left: 0, borderTop: '3px solid #7C3AED', borderLeft: '3px solid #7C3AED' },
                { top: 0, right: 0, borderTop: '3px solid #7C3AED', borderRight: '3px solid #7C3AED' },
                { bottom: 0, left: 0, borderBottom: '3px solid #7C3AED', borderLeft: '3px solid #7C3AED' },
                { bottom: 0, right: 0, borderBottom: '3px solid #7C3AED', borderRight: '3px solid #7C3AED' },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: '24px', height: '24px', borderRadius: '2px', ...s }} />
              ))}
              {/* Animated scan line */}
              <Motion.div
                animate={{ y: [0, 220, 0] }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #7C3AED, #06B6D4, transparent)',
                  boxShadow: '0 0 8px rgba(124,58,237,0.8)',
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
        )}

        {/* Scan result overlay */}
        <AnimatePresence>
          {scanResult && (
            <ResultCard
              key="result"
              onConfirm={handleConfirm}
              onDismiss={dismissResult}
              result={scanResult}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div style={{ padding: '12px 16px', background: '#0f0f0f' }}>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', textAlign: 'center', margin: '0 0 10px' }}>
          Point camera at participant&apos;s event pass QR code
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          {!started ? (
            <button
              onClick={startScanner}
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                minHeight: '52px',
              }}
            >
              📷 Start Scanner
            </button>
          ) : (
            <>
              <button
                onClick={stopScanner}
                style={{ flex: 1, padding: '12px', background: '#374151', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', minHeight: '52px' }}
              >
                ⏹ Stop
              </button>
              <button
                onClick={() => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))}
                style={{ flex: 1, padding: '12px', background: '#374151', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', minHeight: '52px' }}
              >
                🔄 Flip Camera
              </button>
            </>
          )}
        </div>

        {/* Manual entry */}
        <button
          onClick={() => setManualMode((v) => !v)}
          style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: '13px', cursor: 'pointer', padding: '4px 0', textDecoration: 'underline' }}
        >
          {manualMode ? 'Hide manual entry' : 'Enter Pass ID manually'}
        </button>

        <AnimatePresence>
          {manualMode && (
            <Motion.form
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              onSubmit={handleManualSubmit}
              style={{ overflow: 'hidden', marginTop: '8px', display: 'flex', gap: '8px' }}
            >
              <input
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="e.g. KCC2-ABCD"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '10px',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  outline: 'none',
                }}
                type="text"
                value={manualInput}
              />
              <button
                style={{
                  padding: '12px 16px',
                  background: '#7C3AED',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '52px',
                }}
                type="submit"
              >
                Check
              </button>
            </Motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default QRScanner
