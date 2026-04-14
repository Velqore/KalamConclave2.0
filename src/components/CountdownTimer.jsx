import { useEffect, useMemo, useState } from 'react'
import { useAppData } from '../context/useAppData'

function getTimeParts(targetMs) {
  const diff = Math.max(targetMs - Date.now(), 0)
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function CountdownTimer() {
  const { settings } = useAppData()
  const targetMs = useMemo(
    () => new Date(settings.event_date || '2026-04-21T10:00:00+05:30').getTime(),
    [settings.event_date],
  )
  const [time, setTime] = useState(() => getTimeParts(targetMs))

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeParts(targetMs)), 1000)
    return () => clearInterval(interval)
  }, [targetMs])

  const items = useMemo(
    () => [
      { label: 'Days', value: time.days },
      { label: 'Hours', value: time.hours },
      { label: 'Minutes', value: time.minutes },
      { label: 'Seconds', value: time.seconds },
    ],
    [time],
  )

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="topic-card p-4 text-center">
          <p className="font-display text-4xl leading-none text-accent">{String(item.value).padStart(2, '0')}</p>
          <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sand/76">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  )
}

export default CountdownTimer
