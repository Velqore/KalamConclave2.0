import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAppData } from '../../context/useAppData'
import { ensureSupabase } from '../../lib/supabaseClient'

const emptyForm = { name: '', role: '', image: '', bio: '', sort_order: 0 }
const sortOrganisers = (items) =>
  [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.name ?? '').localeCompare(b.name ?? ''))

function AdminOrganisers() {
  const { organisers, setOrganisers } = useAppData()
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const sortedOrganisers = useMemo(() => sortOrganisers(organisers), [organisers])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'sort_order' ? Number(value) : value }))
  }

  const openCreate = () => {
    setForm(emptyForm)
    setEditId(null)
    setOpen(true)
  }

  const openEdit = (org) => {
    setForm({
      name: org.name ?? '',
      role: org.role ?? '',
      image: org.image ?? '',
      bio: org.bio ?? '',
      sort_order: org.sort_order ?? 0,
    })
    setEditId(org.id)
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
        const { data, error } = await supabase.from('organisers').update(form).eq('id', editId).select().single()
        if (error) throw error
        setOrganisers((prev) => sortOrganisers(prev.map((o) => (o.id === editId ? data : o))))
        toast.success('Organiser updated')
      } else {
        const { data, error } = await supabase.from('organisers').insert(form).select().single()
        if (error) throw error
        setOrganisers((prev) => sortOrganisers([...prev, data]))
        toast.success('Organiser added')
      }
      closeForm()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (org) => {
    if (!window.confirm(`Delete organiser "${org.name}"?`)) return
    try {
      const supabase = ensureSupabase()
      const { error } = await supabase.from('organisers').delete().eq('id', org.id)
      if (error) throw error
      setOrganisers((prev) => prev.filter((o) => o.id !== org.id))
      toast.success('Organiser deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gold">Organisers</h2>
        <button className="rounded bg-gold px-4 py-2 text-sm font-semibold text-navy" onClick={openCreate} type="button">
          Add Organiser
        </button>
      </div>

      {open && (
        <form className="mb-6 grid gap-3 rounded-xl border border-blue-900 bg-navyLight/70 p-4 sm:grid-cols-2" onSubmit={handleSave}>
          <h3 className="col-span-full text-lg font-semibold text-gold">{editId ? 'Edit Organiser' : 'Add Organiser'}</h3>
          <label className="text-sm">
            Name *
            <input className="input" name="name" onChange={handleChange} required value={form.name} />
          </label>
          <label className="text-sm">
            Role *
            <input className="input" name="role" onChange={handleChange} placeholder="e.g. Event Coordinator" required value={form.role} />
          </label>
          <label className="col-span-full text-sm">
            Photo URL
            <input className="input" name="image" onChange={handleChange} placeholder="https://..." value={form.image} />
          </label>
          <label className="col-span-full text-sm">
            Bio
            <textarea
              className="input resize-none"
              name="bio"
              onChange={handleChange}
              placeholder="Short bio or note"
              rows={2}
              value={form.bio}
            />
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sortedOrganisers.map((org) => (
          <div key={org.id} className="rounded-xl border border-blue-900 bg-navyLight/40 p-4">
            <div className="flex items-center gap-3">
              {org.image ? (
                <img alt={org.name} className="h-10 w-10 rounded-full border border-blue-900 object-cover" src={org.image} />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-950 text-lg">👤</span>
              )}
              <div>
                <p className="font-semibold text-gold">{org.name}</p>
                <p className="text-xs text-slate-400">{org.role}</p>
              </div>
            </div>
            {org.bio && <p className="mt-2 text-xs italic text-slate-500">{org.bio}</p>}
            <p className="mt-1 text-[11px] text-slate-500">Order: {org.sort_order ?? 0}</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded bg-electricBlue/20 px-3 py-1 text-xs font-semibold text-electricBlue" onClick={() => openEdit(org)} type="button">
                Edit
              </button>
              <button className="rounded bg-rose-600/20 px-3 py-1 text-xs font-semibold text-rose-300" onClick={() => handleDelete(org)} type="button">
                Delete
              </button>
            </div>
          </div>
        ))}
        {sortedOrganisers.length === 0 && <p className="col-span-full text-sm text-slate-400">No organisers added yet.</p>}
      </div>
    </div>
  )
}

export default AdminOrganisers
