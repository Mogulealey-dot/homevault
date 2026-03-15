import { useState, useMemo } from 'react'
import { useInventory } from '../hooks/useInventory'
import { useFirestore } from '../hooks/useFirestore'
import ItemCard from '../components/inventory/ItemCard'
import ItemModal from '../components/inventory/ItemModal'
import ItemForm from '../components/inventory/ItemForm'
import CategoryBrowser from '../components/inventory/CategoryBrowser'
import LocationTree from '../components/inventory/LocationTree'
import SearchFilter from '../components/common/SearchFilter'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import LoanForm from '../components/loans/LoanForm'
import { parseImportCSV } from '../utils/exportCSV'
import styles from './InventoryPage.module.css'

const CONDITION_OPTIONS = ['excellent', 'good', 'fair', 'poor', 'needs_repair']
const CONDITION_COLORS = {
  excellent: 'badge-success',
  good: 'badge-success',
  fair: 'badge-warning',
  poor: 'badge-danger',
  needs_repair: 'badge-danger',
}

// ─── Condition History Modal ─────────────────────────────────────────────────
function ConditionHistoryModal({ item, isOpen, onClose, onSave }) {
  const [condition, setCondition] = useState(item?.condition || 'good')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isOpen || !item) return null

  const log = item.conditionLog || []

  const handleLog = async (e) => {
    e.preventDefault()
    setSaving(true)
    const entry = {
      date: new Date().toISOString().split('T')[0],
      condition,
      note: note.trim(),
    }
    const updatedLog = [entry, ...log]
    await onSave(item.id, { condition, conditionLog: updatedLog })
    setNote('')
    setSaving(false)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: 28,
        width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
          Condition History — {item.name}
        </div>
        <div style={{ marginBottom: 20 }}>
          Current:{' '}
          <span className={`badge ${CONDITION_COLORS[item.condition] || ''}`} style={{ textTransform: 'capitalize' }}>
            {item.condition || 'not set'}
          </span>
        </div>

        <form onSubmit={handleLog}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Log a Condition Change</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, width: '100%', marginBottom: 10, background: 'var(--bg)', color: 'var(--text)' }}
            >
              {CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.replace('_', ' ')}</option>
              ))}
            </select>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note (e.g. scratched surface)"
              style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, width: '100%', background: 'var(--bg)', color: 'var(--text)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginBottom: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Log Change'}
            </button>
          </div>
        </form>

        {log.length > 0 && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>History</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {log.map((entry, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--radius)', alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`badge ${CONDITION_COLORS[entry.condition] || ''}`} style={{ textTransform: 'capitalize', fontSize: 11 }}>
                        {entry.condition?.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{entry.date}</span>
                    </div>
                    {entry.note && <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 4 }}>{entry.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Receipt Scan Modal ───────────────────────────────────────────────────────
function ReceiptScanModal({ isOpen, onClose, onAddItem }) {
  const [imagePreview, setImagePreview] = useState(null)
  const [form, setForm] = useState({ name: '', quantity: 1, price: '', category: 'other' })
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    await onAddItem({
      name: form.name.trim(),
      quantity: parseInt(form.quantity) || 1,
      purchasePrice: parseFloat(form.price) || 0,
      category: form.category,
    })
    setForm({ name: '', quantity: 1, price: '', category: 'other' })
    setSaving(false)
  }

  const handleClose = () => {
    setImagePreview(null)
    setForm({ name: '', quantity: 1, price: '', category: 'other' })
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>📷 Scan Receipt</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
          Upload a receipt image, then manually add the item below.
          <br />
          <em>Note: Full OCR requires a cloud vision API.</em>
        </div>

        {/* File input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Receipt Image</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            style={{ fontSize: 14 }}
          />
        </div>

        {/* Preview */}
        {imagePreview && (
          <div style={{ marginBottom: 20, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img src={imagePreview} alt="Receipt preview" style={{ width: '100%', maxHeight: 240, objectFit: 'contain', background: '#f8f8f8' }} />
          </div>
        )}

        {/* Add item form */}
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>Add Item from Receipt</div>
        <form onSubmit={handleAdd}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Item Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Coffee Maker"
                style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min={1}
                style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Price ($)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min={0}
                step="0.01"
                placeholder="0.00"
                style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }}
              />
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }}
              >
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="appliances">Appliances</option>
                <option value="clothing">Clothing</option>
                <option value="tools">Tools</option>
                <option value="food">Food</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={handleClose}>Close</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !form.name.trim()}>
              {saving ? 'Adding…' : '+ Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InventoryPage({ user }) {
  const uid = user?.uid
  const { items, loading, add, update, remove, getStats, searchItems } = useInventory(uid)
  const { data: locations, add: addLocation, remove: removeLocation, update: updateLocations } = useFirestore(uid, 'locations')

  const [view, setView] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [editItem, setEditItem] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loanItem, setLoanItem] = useState(null)
  const [conditionItem, setConditionItem] = useState(null)
  const [showReceiptScan, setShowReceiptScan] = useState(false)
  const { add: addLoan } = useFirestore(uid, 'loans')
  const { add: logActivity } = useFirestore(uid, 'activity_log')

  const stats = useMemo(() => getStats(), [getStats])

  const itemCounts = useMemo(() => {
    const counts = {}
    for (const item of items) {
      if (item.category) counts[item.category] = (counts[item.category] || 0) + 1
    }
    return counts
  }, [items])

  const locationCounts = useMemo(() => {
    const counts = {}
    for (const item of items) {
      if (item.location) counts[item.location] = (counts[item.location] || 0) + 1
    }
    return counts
  }, [items])

  const filtered = useMemo(() => {
    let result = searchQuery ? searchItems(searchQuery) : items
    if (selectedCategory) result = result.filter((i) => i.category === selectedCategory)
    if (selectedLocation) result = result.filter((i) => i.location === selectedLocation)
    if (activeFilters.category) result = result.filter((i) => i.category === activeFilters.category)
    if (activeFilters.location) result = result.filter((i) => i.location === activeFilters.location)
    if (activeFilters.condition) result = result.filter((i) => i.condition === activeFilters.condition)
    return result
  }, [items, searchQuery, selectedCategory, selectedLocation, activeFilters, searchItems])

  const handleAdd = async (data) => {
    const id = await add(data)
    await logActivity({ action: 'add', description: `Added: ${data.name}`, itemName: data.name })
    setShowAddForm(false)
    return id
  }

  const handleUpdate = async (id, data) => {
    await update(id, data)
    await logActivity({ action: 'update', description: `Updated: ${data.name || ''}`, itemName: data.name })
    setViewItem(null)
  }

  const handleDelete = async (item) => {
    await remove(deleteTarget?.id || item?.id)
    await logActivity({ action: 'delete', description: `Deleted: ${deleteTarget?.name || item?.name}` })
    setDeleteTarget(null)
    setViewItem(null)
  }

  const handleLend = async (data) => {
    await addLoan(data)
    await logActivity({ action: 'loan', description: `Lent: ${data.itemName} to ${data.personName}` })
    setLoanItem(null)
  }

  const handleAddLocation = async (locData) => {
    await addLocation(locData)
  }

  const handleDeleteLocation = async (loc) => {
    await removeLocation(loc.id)
  }

  const handleConditionSave = async (id, data) => {
    await update(id, data)
    await logActivity({ action: 'condition', description: `Condition updated for item` })
    setConditionItem(null)
  }

  const handleReceiptAdd = async (data) => {
    const id = await add({
      ...data,
      purchaseDate: new Date().toISOString().split('T')[0],
    })
    await logActivity({ action: 'add', description: `Receipt scan added: ${data.name}`, itemName: data.name })
    return id
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <div className={styles.sidebarLabel}>Categories</div>
          <CategoryBrowser
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            itemCounts={itemCounts}
          />
        </div>
        <div className={styles.sidebarSection}>
          <div className={styles.sidebarLabel}>Locations</div>
          <LocationTree
            locations={locations}
            selectedLocation={selectedLocation}
            onSelect={setSelectedLocation}
            onAddLocation={handleAddLocation}
            onDeleteLocation={handleDeleteLocation}
            itemCounts={locationCounts}
          />
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.mainHeader}>
          <div className={styles.mainHeaderLeft}>
            <SearchFilter
              onSearch={setSearchQuery}
              onFilter={setActiveFilters}
              activeFilters={activeFilters}
              locations={locations.length > 0 ? locations : []}
            />
          </div>
          <div className={styles.viewToggle}>
            <button className={`${styles.viewBtn} ${view === 'grid' ? styles.active : ''}`} onClick={() => setView('grid')}>⊞</button>
            <button className={`${styles.viewBtn} ${view === 'list' ? styles.active : ''}`} onClick={() => setView('list')}>≡</button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowReceiptScan(true)} title="Scan Receipt">
            📷 Scan Receipt
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
            + Add Item
          </button>
        </div>

        <div className={styles.count}>
          {filtered.length} of {items.length} items
          {(selectedCategory || selectedLocation || searchQuery) && ' (filtered)'}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '0 24px' }}>
            <EmptyState
              icon="📦"
              title={items.length === 0 ? 'No items yet' : 'No items match your filters'}
              description={items.length === 0 ? 'Start building your home inventory.' : 'Try adjusting your search or filters.'}
              action={items.length === 0 ? { label: '+ Add First Item', onClick: () => setShowAddForm(true) } : undefined}
            />
          </div>
        ) : (
          <div className={view === 'grid' ? styles.grid : styles.listView}>
            {filtered.map((item) => (
              <div key={item.id} style={{ position: 'relative' }}>
                <ItemCard
                  item={item}
                  onEdit={(i) => setViewItem(i)}
                  onDelete={(i) => setDeleteTarget(i)}
                  onViewQR={(i) => setViewItem(i)}
                  onLend={(i) => setLoanItem(i)}
                />
                {/* Condition badge overlay button */}
                <button
                  title="Log condition"
                  onClick={() => setConditionItem(item)}
                  style={{
                    position: 'absolute', bottom: 8, right: 8,
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '3px 7px', fontSize: 11, cursor: 'pointer',
                    color: 'var(--muted)', fontWeight: 600,
                  }}
                >
                  {item.condition ? `${item.condition.replace('_', ' ')}` : '+ condition'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className={styles.fab} onClick={() => setShowAddForm(true)} title="Add item">
        +
      </button>

      {/* Add item modal */}
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="Add New Item" size="xl">
        <ItemForm uid={uid} locations={locations} onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
      </Modal>

      {/* View/edit modal */}
      <ItemModal
        item={viewItem}
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        onSave={handleUpdate}
        onDelete={(i) => { setDeleteTarget(i); setViewItem(null) }}
        uid={uid}
        locations={locations}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={() => handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        danger
      />

      {/* Lend modal */}
      <Modal isOpen={!!loanItem} onClose={() => setLoanItem(null)} title="Lend Item" size="md">
        <LoanForm
          initialData={{ itemId: loanItem?.id, itemName: loanItem?.name, direction: 'lend' }}
          items={items}
          onSave={handleLend}
          onCancel={() => setLoanItem(null)}
        />
      </Modal>

      {/* Condition history modal */}
      <ConditionHistoryModal
        item={conditionItem}
        isOpen={!!conditionItem}
        onClose={() => setConditionItem(null)}
        onSave={handleConditionSave}
      />

      {/* Receipt scan modal */}
      <ReceiptScanModal
        isOpen={showReceiptScan}
        onClose={() => setShowReceiptScan(false)}
        onAddItem={handleReceiptAdd}
      />
    </div>
  )
}
