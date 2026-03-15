import { useState } from 'react'
import { useFirestore } from '../hooks/useFirestore'
import styles from './WarrantiesPage.module.css'

const DEFAULT_FORM = {
  itemName: '',
  brand: '',
  purchaseDate: '',
  warrantyExpiry: '',
  warrantyType: 'manufacturer',
  notes: '',
  alertDays: 30,
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function expiryBadge(days) {
  if (days === null) return null
  if (days < 0) return <span className="badge badge-danger">Expired</span>
  if (days <= 30) return <span className="badge badge-warning">{days}d left</span>
  return <span className="badge badge-success">{days}d left</span>
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString()
}

export default function WarrantiesPage({ user }) {
  const uid = user?.uid
  const { data: warranties, loading, add, update, remove } = useFirestore(uid, 'warranties')
  const [activeTab, setActiveTab] = useState('active')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)

  const openAdd = () => {
    setEditItem(null)
    setForm(DEFAULT_FORM)
    setShowModal(true)
  }

  const openEdit = (w) => {
    setEditItem(w)
    setForm({
      itemName: w.itemName || '',
      brand: w.brand || '',
      purchaseDate: w.purchaseDate || '',
      warrantyExpiry: w.warrantyExpiry || '',
      warrantyType: w.warrantyType || 'manufacturer',
      notes: w.notes || '',
      alertDays: w.alertDays ?? 30,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (editItem) {
      await update(editItem.id, form)
    } else {
      await add(form)
    }
    setShowModal(false)
    setEditItem(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const total = warranties.length
  const expiringSoon = warranties.filter((w) => {
    const d = daysUntil(w.warrantyExpiry)
    return d !== null && d >= 0 && d <= 30
  }).length
  const expired = warranties.filter((w) => daysUntil(w.warrantyExpiry) < 0).length

  const activeList = warranties.filter((w) => {
    const d = daysUntil(w.warrantyExpiry)
    return d === null || d >= 0
  })
  const expiredList = warranties.filter((w) => daysUntil(w.warrantyExpiry) < 0)
  const displayed = activeTab === 'active' ? activeList : expiredList

  if (loading) return <div className={styles.root}><p>Loading…</p></div>

  return (
    <div className={styles.root}>
      <div className="page-header">
        <div>
          <div className="page-title">🛡️ Warranties</div>
          <div className="page-sub">{total} warranties tracked</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Warranty</button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{total}</div>
          <div className={styles.statLabel}>Total Tracked</div>
        </div>
        <div className={`${styles.statCard} ${styles.warning}`}>
          <div className={styles.statValue}>{expiringSoon}</div>
          <div className={styles.statLabel}>Expiring ≤ 30 Days</div>
        </div>
        <div className={`${styles.statCard} ${styles.danger}`}>
          <div className={styles.statValue}>{expired}</div>
          <div className={styles.statLabel}>Expired</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
          ✅ Active ({activeList.length})
        </button>
        <button className={`tab ${activeTab === 'expired' ? 'active' : ''}`} onClick={() => setActiveTab('expired')}>
          ❌ Expired ({expiredList.length})
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🛡️</div>
          <div className={styles.emptyText}>No warranties here</div>
          <div className={styles.emptyDesc}>{activeTab === 'active' ? 'Add your first warranty to get started.' : 'No expired warranties.'}</div>
        </div>
      ) : (
        <div className={styles.grid}>
          {displayed.map((w) => {
            const days = daysUntil(w.warrantyExpiry)
            return (
              <div key={w.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.itemName}>{w.itemName}</div>
                    <div className={styles.brand}>{w.brand || 'No brand'}</div>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.iconBtn} onClick={() => openEdit(w)} title="Edit">✏️</button>
                    <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => remove(w.id)} title="Delete">🗑️</button>
                  </div>
                </div>
                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    Purchased
                    <span>{formatDate(w.purchaseDate)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    Expires
                    <span>{formatDate(w.warrantyExpiry)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    Type
                    <span style={{ textTransform: 'capitalize' }}>{w.warrantyType || '—'}</span>
                  </div>
                  <div className={styles.metaItem}>
                    Alert
                    <span>{w.alertDays ?? 30} days before</span>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.daysLabel}>{days !== null && days < 0 ? 'Expired' : ''}</span>
                  {expiryBadge(days)}
                </div>
                {w.notes && <div className={styles.notes}>{w.notes}</div>}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>{editItem ? 'Edit Warranty' : 'Add Warranty'}</div>
            <form onSubmit={handleSave}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Item Name *</label>
                  <input name="itemName" value={form.itemName} onChange={handleChange} required placeholder="e.g. LG Refrigerator" />
                </div>
                <div className={styles.formGroup}>
                  <label>Brand</label>
                  <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. LG" />
                </div>
                <div className={styles.formGroup}>
                  <label>Purchase Date</label>
                  <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Warranty Expiry</label>
                  <input type="date" name="warrantyExpiry" value={form.warrantyExpiry} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Warranty Type</label>
                  <select name="warrantyType" value={form.warrantyType} onChange={handleChange}>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="extended">Extended</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Alert Days Before Expiry</label>
                  <input type="number" name="alertDays" value={form.alertDays} onChange={handleChange} min={1} max={365} />
                </div>
                <div className={`${styles.formGroup} ${styles.full}`}>
                  <label>Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Warranty number, contact info…" />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Save Changes' : 'Add Warranty'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
