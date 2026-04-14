import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAppData } from '../../context/useAppData'
import { ensureSupabase } from '../../lib/supabaseClient'

const emptyForm = { name: '', title: '', topic: '', image: '', sort_order: 0 }

function AdminSpeakers() {
  const { speakers, setSpeakers } = useAppData()
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'sort_order' ? Number(value) : value }))
  }

  const openCreate = () => {
    setForm(emptyForm)
    setEditId(null)
    setOpen(true)
  }

  const openEdit = (speaker) => {
    setForm({
      name: speaker.name ?? '',
      title: speaker.title ?? '',
      topic: speaker.topic ?? '',
      image: speaker.image ?? '',
      sort_order: speaker.sort_order ?? 0,
    })
    setEditId(speaker.id)
    setOpen(true)
  }

  const closeForm = () => {
    setForm(emptyForm)
    setEditId(null)
    setOpen(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const supabase = ensureSupabase()
      if (editId) {
        const { error } = await supabase.from('speakers').update(form).eq('id', editId)
        if (error) throw error
        setSpeakers((prev) => prev.map((s) => (s.id === editId ? { ...s, ...form } : s)))
        toast.success('Guest updated')
      } else {
        const { data, error } = await supabase.from('speakers').insert(form).select().single()
        if (error) throw error
        setSpeakers((prev) => [...prev, data])
        toast.success('Guest added')
      }
      closeForm()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (speaker) => {
    if (!window.confirm(`Delete guest "${speaker.name}"?`)) return
    try {
      const supabase = ensureSupabase()
      const { error } = await supabase.from('speakers').delete().eq('id', speaker.id)
      if (error) throw error
      setSpeakers((prev) => prev.filter((s) => s.id !== speaker.id))
      toast.success('Guest deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gold">Guests</h2>
        <button className="rounded bg-gold px-4 py-2 text-sm font-semibold text-navy" onClick={openCreate} type="button">
          Add Guest
        </button>
      </div>

      {open && (
        <form className="mb-6 grid gap-3 rounded-xl border border-blue-900 bg-navyLight/70 p-4 sm:grid-cols-2" onSubmit={handleSave}>
          <h3 className="col-span-full text-lg font-semibold text-gold">{editId ? 'Edit Guest' : 'Add Guest'}</h3>
          <label className="text-sm">
            Name *
            <input className="input" name="name" onChange={handleChange} required value={form.name} />
          </label>
          <label className="text-sm">
            Title / Role *
            <input className="input" name="title" onChange={handleChange} required value={form.title} />
          </label>
          <label className="col-span-full text-sm">
            Topic / Description *
            <input className="input" name="topic" onChange={handleChange} required value={form.topic} />
          </label>
          <label className="col-span-full text-sm">
            Photo URL
            <input className="input" name="image" onChange={handleChange} placeholder="https://..." value={form.image} />
          </label>
          <label className="text-sm">
            Sort Order
            <input className="input" min="0" name="sort_order" onChange={handleChange} type="number" value={form.sort_order} />
          </label>
          <div className="col-span-full flex gap-3">
            <button className="rounded bg-electricBlue px-4 py-2 text-sm font-semibold disabled:opacity-60" disabled={saving} type="submit">
              {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create'}
            </button>
            <button className="rounded border border-blue-700 px-4 py-2 text-sm" onClick={closeForm} type="button">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {speakers.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-900 bg-navyLight/40 px-4 py-3">
            <div className="flex items-center gap-3">
              {s.image ? (
                <img alt={s.name} className="h-10 w-10 rounded-full border border-blue-900 object-cover" src={s.image} />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-950 text-lg">🎙️</span>
              )}
              <div>
                <p className="font-semibold text-gold">{s.name}</p>
                <p className="text-xs text-slate-400">{s.title}</p>
                <p className="max-w-xs truncate text-xs italic text-slate-500">{s.topic}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="rounded bg-electricBlue/20 px-3 py-1 text-xs font-semibold text-electricBlue" onClick={() => openEdit(s)} type="button">
                Edit
              </button>
              <button className="rounded bg-rose-600/20 px-3 py-1 text-xs font-semibold text-rose-300" onClick={() => handleDelete(s)} type="button">
                Delete
              </button>
            </div>
          </div>
        ))}
        {speakers.length === 0 && <p className="text-sm text-slate-400">No guests added yet.</p>}
      </div>
    </div>
  )
}

export default AdminSpeakers
