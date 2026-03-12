import { useState } from 'react'
import { RECURRENCE_OPTIONS } from '../../config/constants'
import styles from './MaintenanceForm.module.css'

const EMPTY = {
  title: '', description: '', itemId: '', itemName: '',
  scheduledDate: '', recurrence: 'once', estimatedCost: '', assignedTo: '', notes: '',
}

export default function MaintenanceForm({ initialData, items = [], onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialData })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleItemSelect = (e) => {
    const itemId = e.target.value
    const item = items.find((i) => i.id === itemId)
    setForm((f) => ({ ...f, itemId, itemName: item?.name || '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Task title is required.'); return }
    setError('')
    setLoading(true)
    try {
      await onSave({
        ...form,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : null,
        status: form.status || 'pending',
      })
    } catch (err) {
      setError(err.message || 'Failed to save task.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="field">
        <label>Task Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Change HVAC filter"
          required
        />
      </div>

      <div className="field">
        <label>Related Item (optional)</label>
        <select value={form.itemId} onChange={handleItemSelect}>
          <option value="">— No specific item —</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Details about this maintenance task…"
          rows={2}
        />
      </div>

      <div className={styles.grid2}>
        <div className="field">
          <label>Scheduled Date</label>
          <input type="date" value={form.scheduledDate} onChange={(e) => set('scheduledDate', e.target.value)} />
        </div>
        <div className="field">
          <label>Recurrence</label>
          <select value={form.recurrence} onChange={(e) => set('recurrence', e.target.value)}>
            {RECURRENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className="field">
          <label>Estimated Cost ($)</label>
          <input type="number" value={form.estimatedCost} onChange={(e) => set('estimatedCost', e.target.value)} placeholder="0.00" min="0" />
        </div>
        <div className="field">
          <label>Assign To</label>
          <input type="text" value={form.assignedTo} onChange={(e) => set('assignedTo', e.target.value)} placeholder="Household member" />
        </div>
      </div>

      <div className="field">
        <label>Notes</label>
        <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Additional notes…" rows={2} />
      </div>

      <div className={styles.actions}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initialData?.id ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}
