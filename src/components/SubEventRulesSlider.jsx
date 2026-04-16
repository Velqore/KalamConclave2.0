import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'

const RULE_ROTATION_INTERVAL_MS = 5600

function SubEventRulesSlider({ rules, event }) {
  const normalizedRules = useMemo(
    () => rules.map((rule) => String(rule).trim()).filter(Boolean),
    [rules],
  )
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (normalizedRules.length <= 1) return undefined

    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % normalizedRules.length)
    }, RULE_ROTATION_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [normalizedRules.length])

  if (normalizedRules.length === 0) return null

  const safeIndex = activeIndex % normalizedRules.length

  return (
    <div
      className="mt-3 rounded-xl border p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-sm"
      style={{
        borderColor: `${event.color}50`,
        background: `linear-gradient(145deg, ${event.color}24, rgba(12,21,38,0.82))`,
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p
          className="rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em]"
          style={{ backgroundColor: `${event.color}1f`, color: event.color }}
        >
          📋 Rules
        </p>
        <p className="font-mono text-[0.58rem] text-sand/60">
          {safeIndex + 1}/{normalizedRules.length}
        </p>
      </div>

      <div className="relative min-h-[74px] overflow-hidden">
        <AnimatePresence mode="wait">
          <Motion.p
            key={`${event.id}-${safeIndex}`}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="rounded-md border-l-2 px-2.5 py-1.5 text-[0.8rem] leading-6 text-sand/95"
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            style={{ borderColor: `${event.color}90`, backgroundColor: 'rgba(6, 12, 24, 0.32)' }}
          >
            {normalizedRules[safeIndex]}
          </Motion.p>
        </AnimatePresence>
      </div>

      {normalizedRules.length > 1 && (
        <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-sand/10">
          <Motion.div
            key={`${event.id}-rule-progress-${safeIndex}`}
            animate={{ width: '100%' }}
            className="h-full rounded-full"
            initial={{ width: '0%' }}
            transition={{ duration: RULE_ROTATION_INTERVAL_MS / 1000, ease: 'linear' }}
            style={{ backgroundColor: event.color }}
          />
        </div>
      )}

      {normalizedRules.length > 1 && (
        <div className="mt-3 flex items-center gap-1.5">
          {normalizedRules.map((rule, idx) => (
            <button
              key={`${event.id}-rule-dot-${idx}`}
              aria-label={`View rule ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${idx === safeIndex ? 'w-5' : 'w-2'}`}
              onClick={() => setActiveIndex(idx)}
              style={{ backgroundColor: idx === safeIndex ? event.color : `${event.color}50` }}
              title={rule}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SubEventRulesSlider
