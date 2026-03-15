import { useState, useMemo } from 'react'
import { useFirestore } from '../hooks/useFirestore'
import styles from './ContractorsPage.module.css'

const SPECIALTIES = [
  'Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Landscaping', 'Painting',
  'Carpentry', 'Flooring', 'Masonry', 'General Contractor', 'Cleaning', 'Other',
]

const DEFAULT_FORM = {
  name: '',
  specialty: '',
  phone: '',
  email: '',
  rating: 5,
  notes: '',
  lastUsed: '',
  website: '',
}

function Stars({ rating }) {
  const n = Math.round(parseFloat(rating) || 0)
  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map((i) => (
        <span key={i} style={{ color: i <= n ? '#f59e0b' : '#e2e8f0' }}>★</span>
      ))}
    </div>
  )
}

export default function ContractorsPage({ user }) {
  const uid = user?.uid
  const { data: contractors, loading, add, update, remove } = useFirestore(uid, 'contractors')
  const [search, setSearch] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)

  const openAdd = () => {
    setEditItem(null)
    setForm(DEFAULT_FORM)
    setShowModal(true)
  }

  const openEdit = (c) => {
    setEditItem(c)
    setForm({
      name: c.name || '',
      specialty: c.specialty || '',
      phone: c.phone || '',
      email: c.email || '',
      rating: c.rating ?? 5,
      notes: c.notes || '',
      lastUsed: c.lastUsed || '',
      website: c.website || '',
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const payload = { ...form, rating: parseInt(form.rating) || 5 }
    if (editItem) {
      await update(editItem.id, payload)
    } else {
      await add(payload)
    }
    setShowModal(false)
    setEditItem(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const allSpecialties = useMemo(() => {
    const s = new Set(contractors.map((c) => c.specialty).filter(Boolean))
    return [...s].sort()
  }, [contractors])

  const displayed = useMemo(() => {
    let list = contractors
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((c) =>
        c.name?.toLowerCase().includes(q) ||
        c.specialty?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q)
      )
    }
    if (filterSpecialty) {
      list = list.filter((c) => c.specialty === filterSpecialty)
    }
    return list
  }, [contractors, search, filterSpecialty])

  if (loading) return <div className={styles.root}><p>Loading…</p></div>

  return (
    <div className={styles.root}>
      <div className="page-header">
        <div>
          <div className="page-title">👷 Contractors</div>
          <div className="page-sub">{contractors.length} contacts in directory</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Contractor</button>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search by name, specialty, or notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.filterSelect} value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)}>
          <option value="">All Specialties</option>
          {allSpecialties.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {displayed.length === 0 ? (
        <div className={styles.grid}>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>👷</div>
            <div className={styles.emptyText}>{contractors.length === 0 ? 'No contractors yet' : 'No results'}</div>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {displayed.map((c) => (
            <div key={c.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.nameBlock}>
                  <div className={styles.contractorName}>{c.name}</div>
                  {c.specialty && (
                    <div className={styles.specialty}>
                      <span className="badge">{c.specialty}</span>
                    </div>
                  )}
                  <Stars rating={c.rating} />
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.iconBtn} onClick={() => openEdit(c)}>✏️</button>
                  <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => remove(c.id)}>🗑️</button>
                </div>
              </div>

              <div className={styles.contactLinks}>
                {c.phone && (
                  <a className={styles.contactLink} href={`tel:${c.phone}`}>📞 {c.phone}</a>
                )}
                {c.email && (
                  <a className={styles.contactLink} href={`mailto:${c.email}`}>✉️ {c.email}</a>
                )}
                {c.website && (
                  <a className={styles.contactLink} href={c.website} target="_blank" rel="noreferrer">🌐 {c.website}</a>
                )}
              </div>

              {c.lastUsed && (
                <div className={styles.metaRow}>
                  <span>Last used: {new Date(c.lastUsed).toLocaleDateString()}</span>
                </div>
              )}

              {c.notes && <div className={styles.notes}>{c.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>{editItem ? 'Edit Contractor' : 'Add Contractor'}</div>
            <form onSubmit={handleSave}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.full}`}>
                  <label>Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Contractor or company name" />
                </div>
                <div className={styles.formGroup}>
                  <label>Specialty</label>
                  <select name="specialty" value={form.specialty} onChange={handleChange}>
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Rating (1–5) ⭐</label>
                  <select name="rating" value={form.rating} onChange={handleChange}>
                    {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} star{r !== 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 000-0000" />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="contact@example.com" />
                </div>
                <div className={`${styles.formGroup} ${styles.full}`}>
                  <label>Website</label>
                  <input name="website" value={form.website} onChange={handleChange} placeholder="https://…" />
                </div>
                <div className={styles.formGroup}>
                  <label>Last Used</label>
                  <input type="date" name="lastUsed" value={form.lastUsed} onChange={handleChange} />
                </div>
                <div className={`${styles.formGroup} ${styles.full}`}>
                  <label>Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Work quality, recommendations…" />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Save Changes' : 'Add Contractor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
