import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { supabase } from '../lib/supabaseClient'
import { generateQRCode } from '../lib/generateQRCode'
import EventPassCard from '../components/EventPassCard'
import { EVENT_LOGO_URL } from '../config/branding'
import { useAppData } from '../context/useAppData'
import { getSubEvent } from '../config/subEvents'

function EventPassPage() {
  const { passId } = useParams()
  const navigate = useNavigate()
  const { settings } = useAppData()
  const passCardRef = useRef(null)

  const [reg, setReg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!supabase || !passId) { setLoading(false); return }
    supabase
      .from('sub_event_registrations')
      .select('*')
      .eq('pass_id', passId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setLoading(false); return }
        setReg(data)
        generateQRCode(data.pass_id, data.participant_name).then(setQrCodeDataUrl).catch(() => {})
        setLoading(false)
      })
  }, [passId])

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
      pdf.save(`KalamConclave-Pass-${passId}.pdf`)
    } catch {
      toast.error('Could not generate pass. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4 py-14">
        <p className="text-sand/60">Loading pass…</p>
      </section>
    )
  }

  if (!reg) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center px-4 py-14 text-center">
        <p className="text-lg text-sand/70">Pass not found.</p>
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

  const subEvent = getSubEvent(reg.sub_event_id)

  const passData = {
    eventName: subEvent ? `${subEvent.icon} ${subEvent.name}` : reg.sub_event_name,
    eventDate: `${settings.event_date_label ?? '21st April 2026'} | ${settings.event_time_label ?? '10:00 AM Onwards'}`,
    eventVenue: subEvent?.venue ?? settings.event_venue ?? '',
    eventOrganizer: 'Dr. APJ Abdul Kalam Science Club · KR Mangalam University',
    eventLogo: settings.event_logo_url ?? EVENT_LOGO_URL,
    participantName: reg.participant_name,
    participantId: reg.pass_id,
    participantDepartment: [reg.participant_course, reg.participant_university].filter(Boolean).join(' · '),
    participantYear: reg.participant_year,
    passId: reg.pass_id,
    passType: reg.pass_type ?? 'Participant',
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
      <button
        className="mb-6 font-mono text-xs uppercase tracking-[0.15em] text-sand/55 hover:text-sand"
        onClick={() => navigate('/')}
        type="button"
      >
        ← Back to Home
      </button>

      <div className="mb-6">
        <h1 className="font-display text-4xl leading-none text-accent sm:text-5xl">Your Event Pass</h1>
        <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-sand/55">
          {reg.sub_event_name} — {passId}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="overflow-x-auto pb-2">
          <EventPassCard pass={passData} qrCodeDataUrl={qrCodeDataUrl} ref={passCardRef} />
        </div>

        <button
          className="rounded bg-accent px-6 py-3 font-semibold text-bg transition hover:brightness-110 disabled:opacity-60"
          disabled={downloading}
          onClick={downloadPass}
          type="button"
        >
          {downloading ? 'Generating PDF…' : '⬇ Download Pass (PDF)'}
        </button>
      </div>
    </section>
  )
}

export default EventPassPage
