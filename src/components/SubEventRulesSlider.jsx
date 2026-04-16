import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'

function SubEventRulesSlider({ rules, event }) {
  const normalizedRules = useMemo(
    () => rules.map((rule) => String(rule).trim()).filter(Boolean),
    [rules],
  )
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (normalizedRules.length <= 1) return undefined

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % normalizedRules.length)
    }, 4200)

    return () => window.clearInterval(id)
  }, [normalizedRules.length])

  if (normalizedRules.length === 0) return null

  const safeIndex = activeIndex % normalizedRules.length

  return (
    <div
      className="mt-3 rounded-lg border p-3"
      style={{
        borderColor: `${event.color}35`,
        background: `linear-gradient(150deg, ${event.color}20, rgba(12,21,38,0.72))`,
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em]" style={{ color: event.color }}>
          📋 Rules Slide
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
            className="text-xs leading-relaxed text-sand/90"
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            {normalizedRules[safeIndex]}
          </Motion.p>
        </AnimatePresence>
      </div>

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
