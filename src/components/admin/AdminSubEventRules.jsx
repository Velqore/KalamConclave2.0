import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAppData } from '../../context/useAppData'
import { ensureSupabase } from '../../lib/supabaseClient'
import { SUB_EVENTS } from '../../config/subEvents'

const rulesKey = (id) => `sub_event_rules_${id}`

function parseRules(value, fallback) {
  try {
    if (value) return JSON.parse(value)
  } catch {}
  return fallback ?? []
}

function AdminSubEventRules() {
  const { settings, setSettings } = useAppData()

  // Local state: one textarea string per sub-event (rules joined by newlines)
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(
      SUB_EVENTS.map((ev) => [
        ev.id,
        parseRules(settings[rulesKey(ev.id)], ev.rules).join('\n'),
      ]),
    ),
  )
  const [saving, setSaving] = useState({})

  // Sync when live settings arrive (e.g. after realtime push from another admin)
  useEffect(() => {
    setDrafts((prev) =>
      Object.fromEntries(
        SUB_EVENTS.map((ev) => {
          const key = rulesKey(ev.id)
          // Only update if there's a live value we haven't locally edited yet
          const liveRules = parseRules(settings[key], ev.rules)
          const liveText = liveRules.join('\n')
          // Preserve any unsaved local edits — only overwrite if the key wasn't
          // touched since last mount (i.e. draft equals the static default).
          const staticDefault = (ev.rules ?? []).join('\n')
          const isUnedited = prev[ev.id] === staticDefault
          return [ev.id, isUnedited ? liveText : prev[ev.id]]
        }),
      ),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  const handleChange = (id, value) => {
    setDrafts((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async (ev) => {
    setSaving((prev) => ({ ...prev, [ev.id]: true }))
    try {
      const supabase = ensureSupabase()
      const rules = drafts[ev.id]
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      const value = JSON.stringify(rules)
      const key = rulesKey(ev.id)
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value }, { onConflict: 'key' })
      if (error) throw error
      setSettings((prev) => ({ ...prev, [key]: value }))
      toast.success(`Rules saved for ${ev.name}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving((prev) => ({ ...prev, [ev.id]: false }))
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gold">Sub-Event Rules</h2>
        <p className="mt-1 text-sm text-slate-400">
          Edit the rules displayed on each sub-event card. Enter one rule per line. Changes
          update the live site immediately.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {SUB_EVENTS.map((ev) => (
          <div
            key={ev.id}
            className="rounded-xl border p-4"
            style={{ borderColor: `${ev.color}44`, background: `${ev.color}0d` }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">{ev.icon}</span>
              <h3 className="font-display text-xl leading-none" style={{ color: ev.color }}>
                {ev.name}
              </h3>
            </div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Rules (one per line)
            </label>
            <textarea
              className="input mt-1 min-h-[160px] resize-y font-mono text-xs leading-relaxed"
              onChange={(e) => handleChange(ev.id, e.target.value)}
              placeholder="Enter each rule on a new line…"
              value={drafts[ev.id]}
            />
            <button
              className="mt-3 rounded px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={saving[ev.id]}
              onClick={() => handleSave(ev)}
              style={{ background: `linear-gradient(135deg, ${ev.gradientFrom}, ${ev.gradientTo})` }}
              type="button"
            >
              {saving[ev.id] ? 'Saving…' : 'Save Rules'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminSubEventRules
