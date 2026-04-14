import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAppData } from '../../context/useAppData'
import { ensureSupabase } from '../../lib/supabaseClient'
import { isUuid } from '../../utils/isUuid'

const emptyForm = { time: '', title: '', description: '', sort_order: 0 }

function AdminSchedule() {
  const { schedule, setSchedule } = useAppData()
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

  const openEdit = (item) => {
    setForm({
      time: item.time ?? '',
      title: item.title ?? '',
      description: item.description ?? '',
      sort_order: item.sort_order ?? 0,
    })
    setEditId(item.id)
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
        if (!isUuid(editId)) {
          toast.error('This is a local placeholder item. Add a new agenda item to create a database record.')
          return
        }
        const { error } = await supabase.from('schedule').update(form).eq('id', editId)
        if (error) throw error
        setSchedule((prev) => prev.map((item) => (item.id === editId ? { ...item, ...form } : item)))
        toast.success('Agenda item updated')
      } else {
        const { data, error } = await supabase.from('schedule').insert(form).select().single()
        if (error) throw error
        setSchedule((prev) => [...prev, data].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)))
        toast.success('Agenda item added')
      }
      closeForm()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete agenda item "${item.title}"?`)) return
    if (!isUuid(item.id)) {
      toast.error('This is a local placeholder item and cannot be deleted from database.')
      return
    }
    try {
      const supabase = ensureSupabase()
      const { error } = await supabase.from('schedule').delete().eq('id', item.id)
      if (error) throw error
      setSchedule((prev) => prev.filter((s) => s.id !== item.id))
      toast.success('Agenda item deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gold">Schedule / Agenda</h2>
        <button className="rounded bg-gold px-4 py-2 text-sm font-semibold text-navy" onClick={openCreate} type="button">
          Add Agenda Item
        </button>
      </div>

      {open && (
        <form className="mb-6 grid gap-3 rounded-xl border border-blue-900 bg-navyLight/70 p-4 sm:grid-cols-2" onSubmit={handleSave}>
          <h3 className="col-span-full text-lg font-semibold text-gold">{editId ? 'Edit Agenda Item' : 'Add Agenda Item'}</h3>
          <label className="text-sm">
            Time *
            <input className="input" name="time" onChange={handleChange} placeholder="e.g. 10:00 AM" required value={form.time} />
          </label>
          <label className="text-sm">
            Sort Order
            <input className="input" min="0" name="sort_order" onChange={handleChange} type="number" value={form.sort_order} />
          </label>
          <label className="col-span-full text-sm">
            Title *
            <input className="input" name="title" onChange={handleChange} required value={form.title} />
          </label>
          <label className="col-span-full text-sm">
            Description
            <textarea
              className="input resize-none"
              name="description"
              onChange={handleChange}
              rows={3}
              value={form.description}
            />
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
        {schedule.map((item) => (
          <div key={item.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-blue-900 bg-navyLight/40 px-4 py-3">
            <div>
              <p className="font-mono text-xs text-slate-400">{item.time}</p>
              <p className="font-semibold text-gold">{item.title}</p>
              {item.description && <p className="mt-1 max-w-lg text-xs italic text-slate-400">{item.description}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <button className="rounded bg-electricBlue/20 px-3 py-1 text-xs font-semibold text-electricBlue" onClick={() => openEdit(item)} type="button">
                Edit
              </button>
              <button className="rounded bg-rose-600/20 px-3 py-1 text-xs font-semibold text-rose-300" onClick={() => handleDelete(item)} type="button">
                Delete
              </button>
            </div>
          </div>
        ))}
        {schedule.length === 0 && <p className="text-sm text-slate-400">No agenda items added yet.</p>}
      </div>
    </div>
  )
}

export default AdminSchedule
