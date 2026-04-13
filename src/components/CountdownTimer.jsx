import { useEffect, useMemo, useState } from 'react'

const eventDate = new Date('2026-04-21T10:00:00+05:30').getTime()

function getTimeParts() {
  const now = Date.now()
  const diff = Math.max(eventDate - now, 0)

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds }
}

function CountdownTimer() {
  const [time, setTime] = useState(getTimeParts)

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeParts()), 1000)
    return () => clearInterval(interval)
  }, [])

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
        <div key={item.label} className="rounded-xl border border-blue-900 bg-navyLight/70 p-4 text-center shadow-soft">
          <p className="text-2xl font-bold text-electricBlue">{String(item.value).padStart(2, '0')}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

export default CountdownTimer
