import { useState, useMemo } from 'react'
import { useFirestore } from '../hooks/useFirestore'
import styles from './UtilitiesPage.module.css'

const TYPE_ICONS = {
  electricity: '⚡',
  water: '💧',
  gas: '🔥',
  internet: '🌐',
  other: '🏠',
}

const TYPE_LABELS = {
  electricity: 'Electricity',
  water: 'Water',
  gas: 'Gas',
  internet: 'Internet',
  other: 'Other',
}

const DEFAULT_FORM = {
  type: 'electricity',
  provider: '',
  amount: '',
  billingDate: '',
  dueDate: '',
  status: 'unpaid',
  notes: '',
  month: new Date().toISOString().slice(0, 7),
}

function formatCurrency(val) {
  const n = parseFloat(val)
  if (isNaN(n)) return '$0'
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString()
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export default function UtilitiesPage({ user }) {
  const uid = user?.uid
  const { data: bills, loading, add, update, remove } = useFirestore(uid, 'utilities')
  const [activeTab, setActiveTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)

  const openAdd = () => {
    setEditItem(null)
    setForm(DEFAULT_FORM)
    setShowModal(true)
  }

  const openEdit = (b) => {
    setEditItem(b)
    setForm({
      type: b.type || 'electricity',
      provider: b.provider || '',
      amount: b.amount || '',
      billingDate: b.billingDate || '',
      dueDate: b.dueDate || '',
      status: b.status || 'unpaid',
      notes: b.notes || '',
      month: b.month || currentMonth(),
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const payload = { ...form, amount: parseFloat(form.amount) || 0 }
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

  const togglePaid = async (bill) => {
    await update(bill.id, { status: bill.status === 'paid' ? 'unpaid' : 'paid' })
  }

  const thisMonth = currentMonth()
  const monthlyBills = bills.filter((b) => b.month === thisMonth)
  const monthlyTotal = monthlyBills.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0)
  const unpaidBills = bills.filter((b) => b.status === 'unpaid')
  const unpaidAmount = unpaidBills.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0)

  const allTypes = [...new Set(bills.map((b) => b.type))]

  const displayed = useMemo(() => {
    if (activeTab === 'all') return bills
    return bills.filter((b) => b.type === activeTab)
  }, [bills, activeTab])

  // Monthly chart data — last 6 months
  const chartData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = d.toISOString().slice(0, 7)
      const label = d.toLocaleString('default', { month: 'short' })
      const total = bills.filter((b) => b.month === key).reduce((s, b) => s + (parseFloat(b.amount) || 0), 0)
      months.push({ key, label, total })
    }
    return months
  }, [bills])

  const maxChart = Math.max(...chartData.map((m) => m.total), 1)

  if (loading) return <div className={styles.root}><p>Loading…</p></div>

  return (
    <div className={styles.root}>
      <div className="page-header">
        <div>
          <div className="page-title">⚡ Utilities</div>
          <div className="page-sub">{bills.length} bills tracked</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Bill</button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatCurrency(monthlyTotal)}</div>
          <div className={styles.statLabel}>This Month's Total</div>
        </div>
        <div className={`${styles.statCard} ${styles.warning}`}>
          <div className={styles.statValue}>{unpaidBills.length}</div>
          <div className={styles.statLabel}>Unpaid Bills</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatCurrency(unpaidAmount)}</div>
          <div className={styles.statLabel}>Unpaid Amount</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All ({bills.length})
        </button>
        {allTypes.map((t) => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {TYPE_ICONS[t]} {TYPE_LABELS[t] || t}
          </button>
        ))}
      </div>

      {bills.length > 0 && (
        <div className={styles.chartSection}>
          <div className={styles.chartTitle}>Monthly Spending (Last 6 Months)</div>
          <div className={styles.chartBars}>
            {chartData.map((m) => (
              <div key={m.key} className={styles.chartBarWrap}>
                <div className={styles.chartBarValue}>{m.total > 0 ? `$${Math.round(m.total)}` : ''}</div>
                <div
                  className={styles.chartBar}
                  style={{ height: `${Math.round((m.total / maxChart) * 90)}px` }}
                />
                <div className={styles.chartBarLabel}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {displayed.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⚡</div>
          <div className={styles.emptyText}>No bills yet</div>
        </div>
      ) : (
        <div className={styles.billList}>
          {displayed.map((b) => (
            <div key={b.id} className={styles.billCard}>
              <div className={styles.billIcon}>{TYPE_ICONS[b.type] || '🏠'}</div>
              <div className={styles.billInfo}>
                <div className={styles.billType}>{TYPE_LABELS[b.type] || b.type}</div>
                {b.provider && <div className={styles.billProvider}>{b.provider}</div>}
                <div className={styles.billMeta}>
                  <span>Due: <span>{formatDate(b.dueDate)}</span></span>
                  <span>Month: <span>{b.month}</span></span>
                </div>
              </div>
              <div className={styles.billAmount}>{formatCurrency(b.amount)}</div>
              <div className={styles.billActions}>
                <button
                  className={`${styles.paidToggle} ${b.status === 'paid' ? styles.paid : styles.unpaid}`}
                  onClick={() => togglePaid(b)}
                >
                  {b.status === 'paid' ? '✓ Paid' : '○ Unpaid'}
                </button>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className={styles.iconBtn} onClick={() => openEdit(b)}>✏️</button>
                  <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => remove(b.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>{editItem ? 'Edit Bill' : 'Add Utility Bill'}</div>
            <form onSubmit={handleSave}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Type *</label>
                  <select name="type" value={form.type} onChange={handleChange}>
                    <option value="electricity">⚡ Electricity</option>
                    <option value="water">💧 Water</option>
                    <option value="gas">🔥 Gas</option>
                    <option value="internet">🌐 Internet</option>
                    <option value="other">🏠 Other</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Provider</label>
                  <input name="provider" value={form.provider} onChange={handleChange} placeholder="e.g. PG&E" />
                </div>
                <div className={styles.formGroup}>
                  <label>Amount ($) *</label>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} required min="0" step="0.01" placeholder="0.00" />
                </div>
                <div className={styles.formGroup}>
                  <label>Month</label>
                  <input type="month" name="month" value={form.month} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Billing Date</label>
                  <input type="date" name="billingDate" value={form.billingDate} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Due Date</label>
                  <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Notes</label>
                  <input name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes" />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Save Changes' : 'Add Bill'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
