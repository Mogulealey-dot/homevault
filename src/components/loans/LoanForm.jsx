import { useState } from 'react'
import styles from './LoanForm.module.css'

const EMPTY = {
  direction: 'lend', itemId: '', itemName: '', personName: '',
  contact: '', lentDate: new Date().toISOString().split('T')[0],
  returnDate: '', notes: '',
}

export default function LoanForm({ initialData, items = [], onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialData })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleItemSelect = (e) => {
    const itemId = e.target.value
    const item = items.find((i) => i.id === itemId)
    setForm((f) => ({
      ...f, itemId,
      itemName: item?.name || '',
      itemPhoto: item?.photos?.[0]?.url || item?.photos?.[0] || null,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.itemId && !form.itemName) { setError('Please select or name an item.'); return }
    if (!form.personName.trim()) { setError('Person name is required.'); return }
    setError('')
    setLoading(true)
    try {
      await onSave({ ...form, status: form.status || 'active' })
    } catch (err) {
      setError(err.message || 'Failed to save.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="field">
        <label>Direction</label>
        <div className={styles.directionRow}>
          <button type="button" className={`${styles.dirBtn} ${form.direction === 'lend' ? styles.active : ''}`} onClick={() => set('direction', 'lend')}>
            ↗️ I'm lending out
          </button>
          <button type="button" className={`${styles.dirBtn} ${form.direction === 'borrow' ? styles.active : ''}`} onClick={() => set('direction', 'borrow')}>
            ↙️ I'm borrowing
          </button>
        </div>
      </div>

      <div className="field">
        <label>Item from Inventory</label>
        <select value={form.itemId} onChange={handleItemSelect}>
          <option value="">— Select item —</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      {!form.itemId && (
        <div className="field">
          <label>Item Name (if not in inventory)</label>
          <input type="text" value={form.itemName} onChange={(e) => set('itemName', e.target.value)} placeholder="Item name" />
        </div>
      )}

      <div className="field">
        <label>Person Name *</label>
        <input type="text" value={form.personName} onChange={(e) => set('personName', e.target.value)} placeholder="e.g. John Smith" required />
      </div>

      <div className="field">
        <label>Contact (email or phone)</label>
        <input type="text" value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="john@example.com or 555-1234" />
      </div>

      <div className={styles.grid2}>
        <div className="field">
          <label>Date Lent/Borrowed</label>
          <input type="date" value={form.lentDate} onChange={(e) => set('lentDate', e.target.value)} />
        </div>
        <div className="field">
          <label>Expected Return Date</label>
          <input type="date" value={form.returnDate} onChange={(e) => set('returnDate', e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Notes</label>
        <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Any notes about this loan…" rows={2} />
      </div>

      <div className={styles.actions}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initialData?.id ? 'Save Changes' : 'Add Loan'}
        </button>
      </div>
    </form>
  )
}
