import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAppData } from '../../context/useAppData'
import { EVENT_SHORT_TITLE } from '../../config/branding'
import { ensureSupabase } from '../../lib/supabaseClient'

const SETTING_LABELS = {
  event_date: 'Event Date (ISO 8601)',
  event_date_label: 'Event Date Label',
  event_time_label: 'Event Time Label',
  event_venue: 'Event Venue',
  event_short_title: 'Event Short Title',
  upi_qr_url: 'UPI QR Code Image URL',
  upi_id: 'UPI ID',
  ticket_price: 'Ticket Price (₹)',
}

const SETTING_HELPERS = {
  event_date: 'ISO datetime used for countdown timer, e.g. 2026-04-21T10:00:00+05:30',
  event_date_label: 'Human readable date shown on site, e.g. 21st April 2026',
  event_time_label: 'Time shown on site, e.g. 10:00 AM Onwards',
  event_venue: 'Venue text shown on site and in confirmation PDF',
  event_short_title: `Short event title used in PDF, e.g. ${EVENT_SHORT_TITLE}`,
  upi_qr_url: 'Public URL of the QR code image shown on the registration form',
  upi_id: 'UPI ID shown below QR code on registration form',
  ticket_price: 'Registration fee in INR (number only, no ₹ symbol)',
}

function AdminSettings() {
  const { settings, setSettings } = useAppData()
  const [form, setForm] = useState({ ...settings })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({ ...settings })
  }, [settings])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const supabase = ensureSupabase()
      const entries = Object.entries(form).map(([key, value]) => ({ key, value: String(value ?? '') }))
      const { error } = await supabase
        .from('app_settings')
        .upsert(entries, { onConflict: 'key' })
      if (error) throw error
      setSettings(form)
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gold">Event Settings</h2>
        <p className="mt-1 text-sm text-slate-400">
          Changes here update the live site — countdown timer, registration form, confirmation PDF, and venue info.
        </p>
      </div>

      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSave}>
        {Object.keys(SETTING_LABELS).map((key) => (
          <label key={key} className={`text-sm ${key === 'event_venue' ? 'sm:col-span-2' : ''}`}>
            <span className="font-semibold text-slate-300">{SETTING_LABELS[key]}</span>
            {SETTING_HELPERS[key] && (
              <span className="mt-0.5 block text-xs text-slate-500">{SETTING_HELPERS[key]}</span>
            )}
            <input
              className="input"
              name={key}
              onChange={handleChange}
              value={form[key] ?? ''}
            />
          </label>
        ))}

        {form.upi_qr_url && (
          <div className="sm:col-span-2">
            <p className="mb-1 text-xs text-slate-400">QR Code Preview</p>
            <img alt="UPI QR" className="h-36 w-36 rounded border border-blue-900 object-contain bg-white p-1" src={form.upi_qr_url} />
          </div>
        )}

        <div className="sm:col-span-2">
          <button
            className="rounded bg-electricBlue px-6 py-2 text-sm font-semibold disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSettings
