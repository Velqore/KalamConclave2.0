import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAppData } from '../../context/useAppData'
import { ensureSupabase } from '../../lib/supabaseClient'
import { SUB_EVENTS } from '../../config/subEvents'

const rulesKey = (id) => `sub_event_rules_${id}`

function parseRules(value) {
  try {
    if (value) return JSON.parse(value)
  } catch (err) {
    console.warn('[KalamConclave] Failed to parse sub-event rules from settings:', err)
  }
  return []
}

function AdminSubEventRules() {
  const { settings, setSettings } = useAppData()

  // Local textarea state: initialized from live app_settings only (no static defaults)
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(
      SUB_EVENTS.map((ev) => [ev.id, parseRules(settings[rulesKey(ev.id)]).join('\n')]),
    ),
  )
  const [saving, setSaving] = useState({})
  const [clearing, setClearing] = useState({})

  // Sync when realtime pushes a settings update from another admin session
  useEffect(() => {
    setDrafts((prev) =>
      Object.fromEntries(
        SUB_EVENTS.map((ev) => {
          const liveText = parseRules(settings[rulesKey(ev.id)]).join('\n')
          const isUnedited = prev[ev.id] === liveText
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

  const handleClear = async (ev) => {
    const confirmed = window.confirm(
      `Clear all rules for "${ev.name}"? They will no longer appear on the home page.`,
    )
    if (!confirmed) return
    setClearing((prev) => ({ ...prev, [ev.id]: true }))
    try {
      const supabase = ensureSupabase()
      const key = rulesKey(ev.id)
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value: '[]' }, { onConflict: 'key' })
      if (error) throw error
      setSettings((prev) => ({ ...prev, [key]: '[]' }))
      setDrafts((prev) => ({ ...prev, [ev.id]: '' }))
      toast.success(`Rules cleared for ${ev.name}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setClearing((prev) => ({ ...prev, [ev.id]: false }))
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gold">Sub-Event Rules</h2>
        <p className="mt-1 text-sm text-slate-400">
          Add or edit rules for each sub-event. Enter one rule per line and click{' '}
          <strong>Save Rules</strong>. Rules appear live on the home page immediately. Leave the
          textarea blank (or click <strong>Clear Rules</strong>) to hide the rules panel for that
          event.
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
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={saving[ev.id]}
                onClick={() => handleSave(ev)}
                style={{ background: `linear-gradient(135deg, ${ev.gradientFrom}, ${ev.gradientTo})` }}
                type="button"
              >
                {saving[ev.id] ? 'Saving…' : 'Save Rules'}
              </button>
              <button
                className="rounded border border-rose-700/50 px-4 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-700/20 disabled:opacity-60"
                disabled={clearing[ev.id]}
                onClick={() => handleClear(ev)}
                type="button"
              >
                {clearing[ev.id] ? 'Clearing…' : 'Clear Rules'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminSubEventRules
