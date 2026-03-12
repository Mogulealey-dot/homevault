import { useState } from 'react'
import { CATEGORIES, ITEM_CONDITIONS, STORAGE_LOCATIONS } from '../../config/categories'
import { UNIT_OPTIONS } from '../../config/constants'
import Modal from '../common/Modal'
import BarcodeScanner from './BarcodeScanner'
import PhotoUpload from '../common/PhotoUpload'
import styles from './ItemForm.module.css'

const EMPTY_FORM = {
  name: '', category: 'other', subcategory: '', brand: '', model: '',
  serialNumber: '', barcode: '', quantity: 1, unit: 'units', condition: 'Good',
  location: '', container: '', purchasePrice: '', currentValue: '', replacementValue: '',
  purchaseDate: '', purchaseLocation: '', warrantyExpiry: '', expiryDate: '',
  description: '', tags: [],
}

function Field({ label, name, type = 'text', required, placeholder, children, form, set }) {
  return (
    <div className="field">
      <label>{label}{required && ' *'}</label>
      {children || (
        <input
          type={type}
          value={form[name] ?? ''}
          onChange={(e) => set(name, e.target.value)}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  )
}

export default function ItemForm({ initialData, onSave, onCancel, uid, locations = [] }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialData })
  const [photos, setPhotos] = useState(initialData?.photos || [])
  const [tagInput, setTagInput] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedCat = CATEGORIES.find((c) => c.id === form.category)

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim()
      if (tag && !form.tags.includes(tag)) {
        set('tags', [...form.tags, tag])
      }
      setTagInput('')
    }
  }

  const removeTag = (t) => set('tags', form.tags.filter((x) => x !== t))

  const handleBarcodeConfirm = (product) => {
    setScannerOpen(false)
    setForm((f) => ({
      ...f,
      name: product.name || f.name,
      brand: product.brand || f.brand,
      barcode: product.barcode || f.barcode,
      category: product.category || f.category,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Item name is required.'); return }
    setError('')
    setLoading(true)
    try {
      await onSave({
        ...form,
        photos,
        quantity: parseFloat(form.quantity) || 1,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null,
        currentValue: form.currentValue ? parseFloat(form.currentValue) : null,
        replacementValue: form.replacementValue ? parseFloat(form.replacementValue) : null,
      })
    } catch (err) {
      setError(err.message || 'Failed to save item.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Basic Info */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Basic Information</div>
        <Field form={form} set={set} label="Item Name" name="name" required placeholder="e.g. iPhone 14 Pro" />
        <div className={styles.grid2}>
          <div className="field">
            <label>Category *</label>
            <select value={form.category} onChange={(e) => { set('category', e.target.value); set('subcategory', '') }}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Subcategory</label>
            <select value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)}>
              <option value="">— None —</option>
              {selectedCat?.subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.grid2}>
          <Field form={form} set={set} label="Brand" name="brand" placeholder="Apple, Samsung…" />
          <Field form={form} set={set} label="Model" name="model" placeholder="Model number" />
        </div>
        <div className={styles.grid2}>
          <Field form={form} set={set} label="Serial Number" name="serialNumber" placeholder="S/N" />
          <div className={styles.barcodeRow}>
            <Field form={form} set={set} label="Barcode / UPC" name="barcode" placeholder="Scan or enter" />
            <button type="button" className={styles.scanBtn} onClick={() => setScannerOpen(true)}>
              📷 Scan
            </button>
          </div>
        </div>
      </div>

      {/* Quantity & Location */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Quantity & Location</div>
        <div className={styles.grid3}>
          <Field form={form} set={set} label="Quantity *" name="quantity" type="number" placeholder="1" />
          <div className="field">
            <label>Unit</label>
            <select value={form.unit} onChange={(e) => set('unit', e.target.value)}>
              {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Condition</label>
            <select value={form.condition} onChange={(e) => set('condition', e.target.value)}>
              {ITEM_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.grid2}>
          <div className="field">
            <label>Room / Location</label>
            <select value={form.location} onChange={(e) => set('location', e.target.value)}>
              <option value="">— Select location —</option>
              {locations.length > 0
                ? locations.map((l) => <option key={l.id} value={l.name || l.id}>{l.icon || '📍'} {l.name}</option>)
                : STORAGE_LOCATIONS.map((l) => <option key={l.id} value={l.label}>{l.icon} {l.label}</option>)
              }
            </select>
          </div>
          <Field form={form} set={set} label="Container / Shelf" name="container" placeholder="e.g. Top shelf" />
        </div>
      </div>

      {/* Value & Purchase */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Value & Purchase</div>
        <div className={styles.grid3}>
          <Field form={form} set={set} label="Purchase Price ($)" name="purchasePrice" type="number" placeholder="0.00" />
          <Field form={form} set={set} label="Current Value ($)" name="currentValue" type="number" placeholder="0.00" />
          <Field form={form} set={set} label="Replacement Value ($)" name="replacementValue" type="number" placeholder="0.00" />
        </div>
        <div className={styles.grid2}>
          <Field form={form} set={set} label="Purchase Date" name="purchaseDate" type="date" />
          <Field form={form} set={set} label="Purchase Location" name="purchaseLocation" placeholder="e.g. Best Buy" />
        </div>
      </div>

      {/* Dates */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Important Dates</div>
        <div className={styles.grid3}>
          <Field form={form} set={set} label="Warranty Expiry" name="warrantyExpiry" type="date" />
          <Field form={form} set={set} label="Expiry Date (food)" name="expiryDate" type="date" />
          <Field form={form} set={set} label="Last Service Date" name="serviceDate" type="date" />
        </div>
      </div>

      {/* Photos */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Photos</div>
        {uid ? (
          <PhotoUpload uid={uid} photos={photos} onChange={setPhotos} />
        ) : (
          <p className="text-muted text-sm">Photos require authentication.</p>
        )}
      </div>

      {/* Notes & Tags */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Notes & Tags</div>
        <div className="field">
          <label>Description / Notes</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Any additional details about this item…"
            rows={3}
          />
        </div>
        <div className="field">
          <label>Tags (press Enter or comma to add)</label>
          <input
            className={styles.tagsInput}
            type="text"
            placeholder="e.g. bedroom, gift, important…"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKey}
          />
          {form.tags.length > 0 && (
            <div className={styles.tagList}>
              {form.tags.map((t) => (
                <span key={t} className={styles.tagChip}>
                  {t}
                  <button type="button" className={styles.tagRemove} onClick={() => removeTag(t)}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initialData?.id ? 'Save Changes' : 'Add Item'}
        </button>
      </div>

      <Modal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} title="Scan Barcode" size="md">
        <BarcodeScanner onConfirm={handleBarcodeConfirm} onCancel={() => setScannerOpen(false)} />
      </Modal>
    </form>
  )
}
