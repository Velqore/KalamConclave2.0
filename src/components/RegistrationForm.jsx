import { useState } from 'react'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'
import { ensureSupabase } from '../lib/supabaseClient'

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
  const [formData, setFormData] = useState(initialForm)
  const [screenshot, setScreenshot] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const data = await saveRegistration(formData)
      setConfirmation(data)
      toast.success('Registration completed successfully!')
      setFormData(initialForm)
      setScreenshot(null)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const downloadConfirmation = () => {
    if (!confirmation) return

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('1st Kalam Conclave 2.0 - Registration Confirmation', 10, 20)
    doc.setFontSize(12)
    doc.text(`Registration ID: ${confirmation.reg_id}`, 10, 35)
    doc.text(`Name: ${confirmation.full_name}`, 10, 45)
    doc.text(`Email: ${confirmation.email}`, 10, 55)
    doc.text('Date: 21st April 2026 | Time: 10:00 AM Onwards', 10, 65)
    doc.text('Venue: K.R. Mangalam University, Aryabhatta Block, 4th Floor', 10, 75)
    doc.save(`KalamConclave-${confirmation.reg_id}.pdf`)
  }

  if (confirmation) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-blue-900 bg-navyLight/70 p-8 shadow-soft">
        <h2 className="text-2xl font-bold text-gold">Registration Confirmed</h2>
        <p className="mt-4 text-lg text-electricBlue">Your Registration ID: {confirmation.reg_id}</p>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <p>Name: {confirmation.full_name}</p>
          <p>Email: {confirmation.email}</p>
          <p>Date: 21st April 2026 | Time: 10:00 AM Onwards</p>
          <p>Venue: K.R. Mangalam University, Aryabhatta Block, 4th Floor</p>
        </div>
        <button
          className="mt-6 rounded bg-gold px-5 py-2 font-semibold text-navy transition hover:bg-amber-400"
          onClick={downloadConfirmation}
          type="button"
        >
          Download Confirmation
        </button>
      </section>
    )
  }

  return (
    <form className="mx-auto grid w-full max-w-3xl gap-4 rounded-2xl border border-blue-900 bg-navyLight/70 p-6 shadow-soft sm:grid-cols-2" onSubmit={handleSubmit}>
      <h2 className="col-span-full text-2xl font-bold text-gold">Register for ₹149 (Standard Ticket)</h2>

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

      <div className="col-span-full rounded-xl border border-blue-900 bg-navy p-4 text-center">
        <p className="font-semibold text-gold">Scan to Pay ₹149 via UPI</p>
        <div className="mx-auto mt-3 flex h-40 w-40 items-center justify-center rounded border border-dashed border-blue-700 bg-blue-950/30 text-xs text-slate-400">
          UPI QR Placeholder
        </div>
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
