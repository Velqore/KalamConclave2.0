import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { ensureSupabase } from '../lib/supabaseClient'
import { sendRegistrationEmail } from '../lib/emailService'
import { useAppData } from '../context/useAppData'
import { EVENT_LOGO_URL, EVENT_SHORT_TITLE } from '../config/branding'
import { generateQRCode } from '../lib/generateQRCode'
import { SUB_EVENTS } from '../config/subEvents'
import EventPassCard from './EventPassCard'

const initialForm = {
  full_name: '',
  email: '',
  phone: '',
  college: '',
  course: '',
  year_of_study: '1st',
  city: '',
  heard_from: 'Instagram',
  utr_id: '',
}

const yearOptions = ['1st', '2nd', '3rd', '4th', 'Working Professional', 'Other']
const heardFromOptions = ['Instagram', 'LinkedIn', 'WhatsApp', 'Friend/Faculty', 'Poster', 'Other']

const generateRegId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const buffer = new Uint32Array(4)
  crypto.getRandomValues(buffer)
  const suffix = Array.from(buffer, (value) => chars[value % chars.length]).join('')
  return `KCC2-${suffix}`
}

function RegistrationForm() {
  const navigate = useNavigate()
  const { settings } = useAppData()
  const ticketPrice = settings.ticket_price || '149'
  const [formData, setFormData] = useState(initialForm)
  const [selectedEvents, setSelectedEvents] = useState([])
  const [screenshot, setScreenshot] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null)
  const [downloadingPass, setDownloadingPass] = useState(false)
  const passCardRef = useRef(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEventToggle = (eventId) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId],
    )
  }

  const uploadScreenshot = async (regId) => {
    if (!screenshot) return null

    const supabase = ensureSupabase()
    const ext = screenshot.name.split('.').pop()
    const path = `${regId}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('payment-screenshots')
      .upload(path, screenshot, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Screenshot upload failed: ${uploadError.message}`)
    }

    const { data } = supabase.storage.from('payment-screenshots').getPublicUrl(path)
    return data.publicUrl
  }

  const saveRegistration = async (payload) => {
    const supabase = ensureSupabase()

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const regId = generateRegId()
      try {
        const paymentUrl = await uploadScreenshot(regId)
        const { data, error } = await supabase
          .from('registrations')
          .insert({
            ...payload,
            reg_id: regId,
            payment_screenshot_url: paymentUrl,
            payment_status: 'pending',
          })
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        if (attempt === 3) throw error
      }
    }

    throw new Error('Could not generate unique registration ID, please retry.')
  }

  const sendConfirmationEmail = async ({ full_name, email, reg_id }) => {
    await sendRegistrationEmail(full_name, email, reg_id)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const data = await saveRegistration(formData)
      setConfirmation(data)
      toast.success('Registration completed successfully!')
      setFormData(initialForm)
      setScreenshot(null)

      // Generate QR code for the pass
      generateQRCode(data.reg_id, data.full_name).then(setQrCodeDataUrl).catch(() => {})

      sendConfirmationEmail(data).catch(() => {
        toast.error('Registration saved, but confirmation email failed. Please contact us if needed.')
      })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const downloadPass = async () => {
    if (!confirmation || !passCardRef.current) return
    setDownloadingPass(true)
    try {
      const canvas = await html2canvas(passCardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      // 85mm × 135mm portrait
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [85, 135] })
      pdf.addImage(imgData, 'PNG', 0, 0, 85, 135)
      pdf.save(`KalamConclave-Pass-${confirmation.reg_id}.pdf`)
    } catch {
      toast.error('Could not generate pass. Please try again.')
    } finally {
      setDownloadingPass(false)
    }
  }

  if (confirmation) {
    const dept = [confirmation.course, confirmation.college].filter(Boolean).join(' • ')
    const passData = {
      eventName: settings.event_short_title || EVENT_SHORT_TITLE,
      eventDate: `${settings.event_date_label} | ${settings.event_time_label}`,
      eventVenue: settings.event_venue,
      eventOrganizer: 'K.R. Mangalam University',
      eventLogo: settings.event_logo_url || EVENT_LOGO_URL,
      participantName: confirmation.full_name,
      participantId: confirmation.reg_id,
      participantDepartment: dept,
      participantYear: confirmation.year_of_study,
      passId: confirmation.reg_id,
      passType: 'Participant',
    }

    return (
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-blue-900 bg-navyLight/70 p-4 shadow-soft sm:p-8">
        <h2 className="text-xl font-bold text-gold sm:text-2xl">Registration Confirmed! 🎉</h2>
        <p className="mt-2 text-sm text-slate-300">
          Your event pass is ready. Download it as a PDF to bring on the day of the event.
        </p>

        {/* Pass card preview — centered, scrollable on small screens */}
        <div className="mt-6 flex justify-center overflow-x-auto pb-2">
          <EventPassCard pass={passData} qrCodeDataUrl={qrCodeDataUrl} ref={passCardRef} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded bg-gold px-5 py-2 font-semibold text-navy transition hover:bg-amber-400 disabled:opacity-60"
            disabled={downloadingPass}
            onClick={downloadPass}
            type="button"
          >
            {downloadingPass ? 'Generating PDF…' : '⬇ Download Event Pass (PDF)'}
          </button>
        </div>

        {selectedEvents.length > 0 && (
          <div className="mt-4 rounded-xl border border-accent/30 bg-surface/40 p-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
              Complete Event Registrations
            </p>
            <p className="mt-2 text-xs text-slate-300">
              You selected {selectedEvents.length} event{selectedEvents.length > 1 ? 's' : ''}. Use the buttons below to finish separate event registration forms.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedEvents.map((eventId) => {
                const event = SUB_EVENTS.find((item) => item.id === eventId)
                if (!event) return null
                return (
                  <button
                    key={event.id}
                    className="rounded px-3 py-1.5 text-xs font-semibold text-white"
                    onClick={() => navigate(`/register/${event.id}`)}
                    style={{ background: `linear-gradient(135deg, ${event.gradientFrom}, ${event.gradientTo})` }}
                    type="button"
                  >
                    {event.icon} {event.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-4 space-y-1 text-xs text-slate-400">
          <p>Registration ID: <span className="font-mono text-electricBlue">{confirmation.reg_id}</span></p>
          <p>Email: {confirmation.email}</p>
          <p>Your payment is pending verification. You will be notified once confirmed.</p>
        </div>
      </section>
    )
  }

  return (
    <form className="mx-auto grid w-full max-w-3xl gap-4 rounded-2xl border border-blue-900 bg-navyLight/70 p-4 shadow-soft sm:grid-cols-2 sm:p-6" onSubmit={handleSubmit}>
      <h2 className="col-span-full text-2xl font-bold text-gold">Register for ₹{ticketPrice} (Standard Ticket)</h2>

      <label className="text-sm">
        Full Name *
        <input className="input" name="full_name" onChange={handleChange} required value={formData.full_name} />
      </label>
      <label className="text-sm">
        Email Address *
        <input className="input" name="email" onChange={handleChange} required type="email" value={formData.email} />
      </label>
      <label className="text-sm">
        Phone Number *
        <input className="input" name="phone" onChange={handleChange} required value={formData.phone} />
      </label>
      <label className="text-sm">
        College / Organization *
        <input className="input" name="college" onChange={handleChange} required value={formData.college} />
      </label>
      <label className="text-sm">
        Course / Designation *
        <input className="input" name="course" onChange={handleChange} required value={formData.course} />
      </label>
      <label className="text-sm">
        Year of Study
        <select className="input" name="year_of_study" onChange={handleChange} value={formData.year_of_study}>
          {yearOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        City *
        <input className="input" name="city" onChange={handleChange} required value={formData.city} />
      </label>
      <label className="text-sm">
        How did you hear about this event?
        <select className="input" name="heard_from" onChange={handleChange} value={formData.heard_from}>
          {heardFromOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <div className="col-span-full rounded-xl border border-accent/30 bg-surface/40 p-4">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
          Event Selection (Optional)
        </p>
        <p className="mt-2 text-xs text-slate-300">
          Select event(s) now. After main registration, you can complete each event&apos;s separate form.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SUB_EVENTS.map((event) => (
            <label key={event.id} className="flex items-center gap-2 rounded border border-sand/15 px-3 py-2 text-sm">
              <input
                checked={selectedEvents.includes(event.id)}
                onChange={() => handleEventToggle(event.id)}
                type="checkbox"
              />
              <span className="text-base">{event.icon}</span>
              <span>{event.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="col-span-full rounded-xl border border-blue-900 bg-navy p-4 text-center">
        <p className="font-semibold text-gold">Scan to Pay ₹{ticketPrice} via UPI</p>
        {settings.upi_qr_url ? (
          <img alt="UPI QR Code" className="mx-auto mt-3 h-40 w-40 rounded border border-blue-700 object-contain bg-white p-1" src={settings.upi_qr_url} />
        ) : (
          <div className="mx-auto mt-3 flex h-40 w-40 items-center justify-center rounded border border-dashed border-blue-700 bg-blue-950/30 text-xs text-slate-400">
            UPI QR Placeholder
          </div>
        )}
        {settings.upi_id && (
          <p className="mt-2 font-mono text-xs text-slate-300">{settings.upi_id}</p>
        )}
      </div>

      <label className="col-span-full text-sm">
        UTR / Transaction ID *
        <input className="input" name="utr_id" onChange={handleChange} required value={formData.utr_id} />
      </label>

      <label className="col-span-full text-sm">
        Upload Payment Screenshot (Optional)
        <input
          accept="image/*"
          className="mt-2 block w-full text-sm"
          onChange={(event) => setScreenshot(event.target.files?.[0] ?? null)}
          type="file"
        />
      </label>

      <button
        className="col-span-full rounded bg-electricBlue px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={submitting}
        type="submit"
      >
        {submitting ? 'Submitting...' : 'Submit Registration'}
      </button>
    </form>
  )
}

export default RegistrationForm
