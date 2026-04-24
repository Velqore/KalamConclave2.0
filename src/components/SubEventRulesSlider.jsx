import { useMemo, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'

function SubEventRulesSlider({ rules, event }) {
  const normalizedRules = useMemo(
    () => rules.map((rule) => String(rule).trim()).filter(Boolean),
    [rules],
  )
  const [open, setOpen] = useState(false)

  if (normalizedRules.length === 0) return null

  return (
    <div className="mt-3">
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left shadow-[0_6px_20px_rgba(0,0,0,0.22)] backdrop-blur-sm transition-opacity hover:opacity-90 active:opacity-75"
        onClick={() => setOpen((v) => !v)}
        style={{
          borderColor: `${event.color}50`,
          background: `linear-gradient(145deg, ${event.color}22, rgba(12,21,38,0.80))`,
        }}
        type="button"
      >
        <span
          className="rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em]"
          style={{ backgroundColor: `${event.color}1f`, color: event.color }}
        >
          📋 {open ? 'Hide rules' : 'Tap to see the rules'}
        </span>
        <Motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="text-[0.7rem]"
          style={{ color: event.color }}
          transition={{ duration: 0.25 }}
        >
          ▼
        </Motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <Motion.div
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="mt-2 max-h-48 overflow-y-auto rounded-xl border p-3 shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-sm"
              style={{
                borderColor: `${event.color}50`,
                background: `linear-gradient(145deg, ${event.color}18, rgba(12,21,38,0.82))`,
              }}
            >
              <ol className="space-y-2">
                {normalizedRules.map((rule, idx) => (
                  <li
                    key={`${event.id}-rule-${idx}`}
                    className="flex gap-2.5 rounded-md border-l-2 px-2.5 py-1.5 text-[0.78rem] leading-5 text-sand/95"
                    style={{
                      borderColor: `${event.color}90`,
                      backgroundColor: 'rgba(6, 12, 24, 0.32)',
                    }}
                  >
                    <span
                      className="mt-px shrink-0 text-[0.62rem] font-bold"
                      style={{ color: event.color }}
                    >
                      {idx + 1}.
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SubEventRulesSlider
