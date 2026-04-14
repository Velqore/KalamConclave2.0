import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { ensureSupabase } from '../lib/supabaseClient'
import { generateQRCode } from '../lib/generateQRCode'
import { getSubEvent } from '../config/subEvents'
import EventPassCard from '../components/EventPassCard'
import { EVENT_LOGO_URL, EVENT_SHORT_TITLE } from '../config/branding'
import { useAppData } from '../context/useAppData'

const YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th', '5th', 'Working Professional', 'Other']
const DURATION_OPTIONS = ['Under 10 min', '10–20 min', '20–30 min']
const PERFORMANCE_TYPES = ['Monoact', 'Poetry', 'Open Mic']
const POSTER_THEMES = [
  'Science Under the Shadow of War',
  'When Innovation Meets Destruction',
  'War vs Humanity: A Scientific Perspective',
]

const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function generatePassId(prefix) {
  const buf = new Uint32Array(5)
  crypto.getRandomValues(buf)
  const suffix = Array.from(buf, (v) => chars[v % chars.length]).join('')
  return `KCC2-${prefix}-${suffix}`
}

// ─── Shared field component ───────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <label className="block text-sm text-sand/90">
      {label}
      {required && <span className="ml-0.5 text-primary">*</span>}
      {children}
    </label>
  )
}

function Input({ name, value, onChange, type = 'text', placeholder, required, className = '' }) {
  return (
    <input
      className={`input mt-1 ${className}`}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      type={type}
      value={value}
    />
  )
}

function Select({ name, value, onChange, options, required }) {
  return (
    <select className="input mt-1" name={name} onChange={onChange} required={required} value={value}>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

// ─── Theatre Form ─────────────────────────────────────────────────────
function TheatreForm({ onSubmit, submitting }) {
  const empty = { name: '', roll: '' }
  const [leader, setLeader] = useState({
    team_name: '', full_name: '', roll: '', course: '', year: '1st', phone: '', email: '',
    performance_title: '', performance_duration: 'Under 10 min',
    university: 'KR Mangalam University',
  })
  const [members, setMembers] = useState([{ ...empty }, { ...empty }])

  const handleLeader = (e) => {
    const { name, value } = e.target
    setLeader((prev) => ({ ...prev, [name]: value }))
  }

  const handleMember = (idx, field, value) => {
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)))
  }

  const addMember = () => {
    if (members.length < 9) setMembers((prev) => [...prev, { ...empty }])
  }

  const removeMember = (idx) => {
    if (members.length > 2) setMembers((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      participant_name: leader.full_name,
      participant_roll: leader.roll,
      participant_email: leader.email,
      participant_phone: leader.phone,
      participant_course: leader.course,
      participant_year: leader.year,
      participant_university: leader.university,
      team_name: leader.team_name,
      team_members: members,
      extra_fields: {
        performance_title: leader.performance_title,
        performance_duration: leader.performance_duration,
      },
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Team Name" required>
          <Input name="team_name" onChange={handleLeader} required value={leader.team_name} />
        </Field>
        <Field label="University" required>
          <Input name="university" onChange={handleLeader} required value={leader.university} />
        </Field>
      </div>

      <h3 className="border-b border-sand/15 pb-2 font-mono text-xs uppercase tracking-[0.2em] text-sand/60">
        Team Leader
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" required>
          <Input name="full_name" onChange={handleLeader} required value={leader.full_name} />
        </Field>
        <Field label="Roll Number" required>
          <Input name="roll" onChange={handleLeader} required value={leader.roll} />
        </Field>
        <Field label="Course" required>
          <Input name="course" onChange={handleLeader} required value={leader.course} />
        </Field>
        <Field label="Year of Study">
          <Select name="year" onChange={handleLeader} options={YEAR_OPTIONS} value={leader.year} />
        </Field>
        <Field label="Phone" required>
          <Input name="phone" onChange={handleLeader} required type="tel" value={leader.phone} />
        </Field>
        <Field label="Email" required>
          <Input name="email" onChange={handleLeader} required type="email" value={leader.email} />
        </Field>
      </div>

      <h3 className="border-b border-sand/15 pb-2 font-mono text-xs uppercase tracking-[0.2em] text-sand/60">
        Team Members ({members.length}/9 — min 2 required)
      </h3>
      {members.map((m, idx) => (
        <div key={idx} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Field label={`Member ${idx + 1} Name`} required={idx < 2}>
            <Input
              name={`member_name_${idx}`}
              onChange={(e) => handleMember(idx, 'name', e.target.value)}
              required={idx < 2}
              value={m.name}
            />
          </Field>
          <Field label="Roll Number" required={idx < 2}>
            <Input
              name={`member_roll_${idx}`}
              onChange={(e) => handleMember(idx, 'roll', e.target.value)}
              required={idx < 2}
              value={m.roll}
            />
          </Field>
          {members.length > 2 && (
            <button
              className="mt-6 self-start rounded border border-primary/60 px-3 py-2 text-xs text-primary hover:bg-primary/10"
              onClick={() => removeMember(idx)}
              type="button"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      {members.length < 9 && (
        <button
          className="rounded border border-sand/30 px-4 py-2 text-sm text-sand/80 hover:border-accent hover:text-accent"
          onClick={addMember}
          type="button"
        >
          + Add Member
        </button>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Performance Title" required>
          <Input name="performance_title" onChange={handleLeader} required value={leader.performance_title} />
        </Field>
        <Field label="Performance Duration">
          <Select name="performance_duration" onChange={handleLeader} options={DURATION_OPTIONS} value={leader.performance_duration} />
        </Field>
      </div>

      <SubmitButton submitting={submitting} />
    </form>
  )
}

// ─── Science Slam Form ────────────────────────────────────────────────
function ScienceSlamForm({ onSubmit, submitting }) {
  const [form, setForm] = useState({
    full_name: '', roll: '', course: '', year: '1st', department: '',
    phone: '', email: '', performance_type: 'Monoact',
    performance_title: '', university: 'KR Mangalam University',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      participant_name: form.full_name,
      participant_roll: form.roll,
      participant_email: form.email,
      participant_phone: form.phone,
      participant_course: form.course,
      participant_year: form.year,
      participant_university: form.university,
      extra_fields: {
        department: form.department,
        performance_type: form.performance_type,
        performance_title: form.performance_title,
      },
    })
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
      <Field label="Full Name" required>
        <Input name="full_name" onChange={handleChange} required value={form.full_name} />
      </Field>
      <Field label="Roll Number" required>
        <Input name="roll" onChange={handleChange} required value={form.roll} />
      </Field>
      <Field label="Course" required>
        <Input name="course" onChange={handleChange} required value={form.course} />
      </Field>
      <Field label="Year of Study">
        <Select name="year" onChange={handleChange} options={YEAR_OPTIONS} value={form.year} />
      </Field>
      <Field label="Department" required>
        <Input name="department" onChange={handleChange} required value={form.department} />
      </Field>
      <Field label="Phone" required>
        <Input name="phone" onChange={handleChange} required type="tel" value={form.phone} />
      </Field>
      <Field label="Email" required>
        <Input name="email" onChange={handleChange} required type="email" value={form.email} />
      </Field>
      <Field label="University" required>
        <Input name="university" onChange={handleChange} required value={form.university} />
      </Field>
      <Field label="Performance Type">
        <Select name="performance_type" onChange={handleChange} options={PERFORMANCE_TYPES} value={form.performance_type} />
      </Field>
      <Field label="Performance Title" required>
        <Input name="performance_title" onChange={handleChange} required value={form.performance_title} />
      </Field>
      <div className="col-span-full">
        <SubmitButton submitting={submitting} />
      </div>
    </form>
  )
}

// ─── WarTech Quiz Form ────────────────────────────────────────────────
function WarTechQuizForm({ onSubmit, submitting }) {
  const [form, setForm] = useState({
    team_name: '', leader_name: '', leader_roll: '', leader_course: '',
    leader_year: '1st', leader_phone: '', leader_email: '',
    m2_name: '', m2_roll: '', m3_name: '', m3_roll: '',
    university: 'KR Mangalam University',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const members = [{ name: form.m2_name, roll: form.m2_roll }]
    if (form.m3_name || form.m3_roll) members.push({ name: form.m3_name, roll: form.m3_roll })
    onSubmit({
      participant_name: form.leader_name,
      participant_roll: form.leader_roll,
      participant_email: form.leader_email,
      participant_phone: form.leader_phone,
      participant_course: form.leader_course,
      participant_year: form.leader_year,
      participant_university: form.university,
      team_name: form.team_name,
      team_members: members,
      extra_fields: {},
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Team Name" required>
          <Input name="team_name" onChange={handleChange} required value={form.team_name} />
        </Field>
        <Field label="University" required>
          <Input name="university" onChange={handleChange} required value={form.university} />
        </Field>
      </div>

      <h3 className="border-b border-sand/15 pb-2 font-mono text-xs uppercase tracking-[0.2em] text-sand/60">
        Team Leader
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" required>
          <Input name="leader_name" onChange={handleChange} required value={form.leader_name} />
        </Field>
        <Field label="Roll Number" required>
          <Input name="leader_roll" onChange={handleChange} required value={form.leader_roll} />
        </Field>
        <Field label="Course" required>
          <Input name="leader_course" onChange={handleChange} required value={form.leader_course} />
        </Field>
        <Field label="Year of Study">
          <Select name="leader_year" onChange={handleChange} options={YEAR_OPTIONS} value={form.leader_year} />
        </Field>
        <Field label="Phone" required>
          <Input name="leader_phone" onChange={handleChange} required type="tel" value={form.leader_phone} />
        </Field>
        <Field label="Email" required>
          <Input name="leader_email" onChange={handleChange} required type="email" value={form.leader_email} />
        </Field>
      </div>

      <h3 className="border-b border-sand/15 pb-2 font-mono text-xs uppercase tracking-[0.2em] text-sand/60">
        Member 2 (Required)
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <Input name="m2_name" onChange={handleChange} required value={form.m2_name} />
        </Field>
        <Field label="Roll Number" required>
          <Input name="m2_roll" onChange={handleChange} required value={form.m2_roll} />
        </Field>
      </div>

      <h3 className="border-b border-sand/15 pb-2 font-mono text-xs uppercase tracking-[0.2em] text-sand/60">
        Member 3 (Optional)
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <Input name="m3_name" onChange={handleChange} value={form.m3_name} />
        </Field>
        <Field label="Roll Number">
          <Input name="m3_roll" onChange={handleChange} value={form.m3_roll} />
        </Field>
      </div>

      <SubmitButton submitting={submitting} />
    </form>
  )
}

// ─── Poster Making Form ───────────────────────────────────────────────
function PosterForm({ onSubmit, submitting }) {
  const [form, setForm] = useState({
    full_name: '', roll: '', course: '', year: '1st', department: '',
    phone: '', email: '', poster_theme: POSTER_THEMES[0],
    partner_name: '', partner_roll: '', university: 'KR Mangalam University',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const members = form.partner_name ? [{ name: form.partner_name, roll: form.partner_roll }] : []
    onSubmit({
      participant_name: form.full_name,
      participant_roll: form.roll,
      participant_email: form.email,
      participant_phone: form.phone,
      participant_course: form.course,
      participant_year: form.year,
      participant_university: form.university,
      team_members: members,
      extra_fields: {
        department: form.department,
        poster_theme: form.poster_theme,
        partner_name: form.partner_name,
        partner_roll: form.partner_roll,
      },
    })
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
      <Field label="Full Name" required>
        <Input name="full_name" onChange={handleChange} required value={form.full_name} />
      </Field>
      <Field label="Roll Number" required>
        <Input name="roll" onChange={handleChange} required value={form.roll} />
      </Field>
      <Field label="Course" required>
        <Input name="course" onChange={handleChange} required value={form.course} />
      </Field>
      <Field label="Year of Study">
        <Select name="year" onChange={handleChange} options={YEAR_OPTIONS} value={form.year} />
      </Field>
      <Field label="Department" required>
        <Input name="department" onChange={handleChange} required value={form.department} />
      </Field>
      <Field label="Phone" required>
        <Input name="phone" onChange={handleChange} required type="tel" value={form.phone} />
      </Field>
      <Field label="Email" required>
        <Input name="email" onChange={handleChange} required type="email" value={form.email} />
      </Field>
      <Field label="University" required>
        <Input name="university" onChange={handleChange} required value={form.university} />
      </Field>
      <Field label="Poster Theme">
        <Select name="poster_theme" onChange={handleChange} options={POSTER_THEMES} value={form.poster_theme} />
      </Field>
      <div className="sm:col-span-2">
        <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-sand/55">
          Partner (Optional — solo or duo)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Partner Name">
            <Input name="partner_name" onChange={handleChange} value={form.partner_name} />
          </Field>
          <Field label="Partner Roll">
            <Input name="partner_roll" onChange={handleChange} value={form.partner_roll} />
          </Field>
        </div>
      </div>
      <div className="sm:col-span-2">
        <SubmitButton submitting={submitting} />
      </div>
    </form>
  )
}

// ─── Shared submit button ─────────────────────────────────────────────
function SubmitButton({ submitting }) {
  return (
    <button
      className="mt-2 w-full rounded border border-accent bg-accent px-6 py-3 font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      disabled={submitting}
      type="submit"
    >
      {submitting ? 'Registering…' : 'Register →'}
    </button>
  )
}

// ─── Payment gate ─────────────────────────────────────────────────────
function PaymentGateView({ paymentUrl, onPaid }) {
  return (
    <div className="space-y-6 text-center">
      <div className="rounded-xl border border-yellow-500/40 bg-yellow-900/20 p-6 sm:p-8">
        <p className="text-4xl">💳</p>
        <h2 className="mt-3 text-xl font-bold text-yellow-300 sm:text-2xl">Payment Required</h2>
        <p className="mt-2 text-sm text-sand/80">
          To receive your event pass, please complete the payment first.
        </p>
        <a
          className="mt-5 inline-block rounded bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-amber-400"
          href={paymentUrl}
          rel="noreferrer"
          target="_blank"
        >
          💸 Proceed to Payment →
        </a>
      </div>
      <p className="text-sm text-sand/60">
        Once you have completed the payment, click below to get your pass.
      </p>
      <button
        className="rounded border border-accent bg-accent/20 px-6 py-3 font-semibold text-accent transition hover:bg-accent/30"
        onClick={onPaid}
        type="button"
      >
        ✅ I&apos;ve Paid — Show My Pass
      </button>
    </div>
  )
}

// ─── Confirmation view with pass ─────────────────────────────────────
function ConfirmationView({ passData, qrCodeDataUrl, passCardRef, onDownload, downloading }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/40 bg-surface/50 p-4 sm:p-6">
        <h2 className="text-xl font-bold text-accent sm:text-2xl">Registration Confirmed! 🎉</h2>
        <p className="mt-2 text-sm text-sand/80">
          Your event pass is ready. Download it to bring on the day of the event.
        </p>
        <div className="mt-4 space-y-1 text-xs text-sand/60">
          <p>
            Pass ID: <span className="font-mono text-accent">{passData.passId}</span>
          </p>
          <p>Sub-Event: {passData.eventName}</p>
        </div>
      </div>

      <div className="flex justify-center overflow-x-auto pb-2">
        <EventPassCard pass={passData} qrCodeDataUrl={qrCodeDataUrl} ref={passCardRef} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded bg-accent px-5 py-2.5 font-semibold text-bg transition hover:brightness-110 disabled:opacity-60"
          disabled={downloading}
          onClick={onDownload}
          type="button"
        >
          {downloading ? 'Generating PDF…' : '⬇ Download Pass (PDF)'}
        </button>
      </div>
    </div>
  )
}

// ─── Main page component ──────────────────────────────────────────────
const isPaymentLink = (str) => {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function SubEventRegister() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const subEvent = getSubEvent(eventId)
  const { settings } = useAppData()
  const passCardRef = useRef(null)

  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [pendingConfirmation, setPendingConfirmation] = useState(null)
  const [paymentGate, setPaymentGate] = useState(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null)
  const [downloading, setDownloading] = useState(false)

  if (!subEvent) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-14 text-center">
        <p className="text-lg text-sand/70">Sub-event not found.</p>
        <button
          className="mt-4 rounded border border-accent px-5 py-2 text-accent"
          onClick={() => navigate('/')}
          type="button"
        >
          ← Back to Home
        </button>
      </section>
    )
  }

  const prefixMap = { theatre: 'TH', science_slam: 'SS', wartech_quiz: 'WQ', poster: 'PM' }

  const handleSubmit = async (formPayload) => {
    setSubmitting(true)
    try {
      const supabase = ensureSupabase()

      // Duplicate check
      if (formPayload.participant_email || formPayload.participant_roll) {
        const filters = []
        if (formPayload.participant_email)
          filters.push(`participant_email.eq.${formPayload.participant_email}`)
        if (formPayload.participant_roll)
          filters.push(`participant_roll.eq.${formPayload.participant_roll}`)

        const { data: existing } = await supabase
          .from('sub_event_registrations')
          .select('id')
          .eq('sub_event_id', subEvent.id)
          .or(filters.join(','))
          .limit(1)

        if (existing?.length) {
          toast.error('You have already registered for this sub-event.')
          setSubmitting(false)
          return
        }
      }

      const passId = generatePassId(prefixMap[subEvent.id] ?? 'EV')
      const payload = {
        pass_id: passId,
        sub_event_id: subEvent.id,
        sub_event_name: subEvent.fullName,
        pass_type: 'Participant',
        ...formPayload,
      }

      const { data, error } = await supabase
        .from('sub_event_registrations')
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      toast.success('Registration successful!')

      const passDisplayData = {
        eventName: `${subEvent.icon} ${subEvent.name}`,
        eventDate: `${settings.event_date_label ?? '21st April 2026'} | ${settings.event_time_label ?? '10:00 AM Onwards'}`,
        eventVenue: subEvent.venue,
        eventOrganizer: 'Dr. APJ Abdul Kalam Science Club · KR Mangalam University',
        eventLogo: settings.event_logo_url ?? EVENT_LOGO_URL,
        participantName: data.participant_name,
        participantId: data.pass_id,
        participantDepartment: [data.participant_course, data.participant_university].filter(Boolean).join(' · '),
        participantYear: data.participant_year,
        passId: data.pass_id,
        passType: 'Participant',
      }

      // Start generating QR in background regardless of which step shows next
      generateQRCode(data.pass_id, data.participant_name)
        .then(setQrCodeDataUrl)
        .catch(() => { toast.error('QR code generation failed. Your pass is still valid.') })

      // If admin has set a payment link in the UPI ID field, gate the pass behind it
      if (isPaymentLink(settings.upi_id)) {
        setPendingConfirmation(passDisplayData)
        setPaymentGate(settings.upi_id)
      } else {
        setConfirmation(passDisplayData)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const downloadPass = async () => {
    if (!passCardRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(passCardRef.current, {
        scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [85, 135] })
      pdf.addImage(imgData, 'PNG', 0, 0, 85, 135)
      pdf.save(`KalamConclave-Pass-${confirmation.passId}.pdf`)
    } catch {
      toast.error('Could not generate pass. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-8">
        <button
          className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-sand/55 hover:text-sand"
          onClick={() => navigate('/')}
          type="button"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{subEvent.icon}</span>
          <div>
            <h1
              className="font-display text-4xl leading-none sm:text-5xl"
              style={{ color: subEvent.color }}
            >
              {subEvent.name}
            </h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-sand/60">
              {subEvent.fullName}
            </p>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm italic text-sand/80">{subEvent.description}</p>
        <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-sand/50">
          📍 {subEvent.venue}
        </p>
      </div>

      {/* Form, payment gate, or confirmation */}
      <div className="topic-card p-4 sm:p-8">
        {confirmation ? (
          <ConfirmationView
            downloading={downloading}
            onDownload={downloadPass}
            passCardRef={passCardRef}
            passData={confirmation}
            qrCodeDataUrl={qrCodeDataUrl}
          />
        ) : paymentGate ? (
          <PaymentGateView
            onPaid={() => {
              setConfirmation(pendingConfirmation)
              setPaymentGate(null)
            }}
            paymentUrl={paymentGate}
          />
        ) : (
          <>
            <h2 className="mb-6 font-display text-3xl leading-none text-accent">
              Register for {subEvent.name}
            </h2>
            {subEvent.id === 'theatre' && <TheatreForm onSubmit={handleSubmit} submitting={submitting} />}
            {subEvent.id === 'science_slam' && <ScienceSlamForm onSubmit={handleSubmit} submitting={submitting} />}
            {subEvent.id === 'wartech_quiz' && <WarTechQuizForm onSubmit={handleSubmit} submitting={submitting} />}
            {subEvent.id === 'poster' && <PosterForm onSubmit={handleSubmit} submitting={submitting} />}
          </>
        )}
      </div>
    </section>
  )
}

export default SubEventRegister
