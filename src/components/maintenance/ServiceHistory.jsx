import { useState } from 'react'
import { formatDate, formatCurrency } from '../../utils/formatters'
import EmptyState from '../common/EmptyState'
import styles from './ServiceHistory.module.css'

export default function ServiceHistory({ tasks = [] }) {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const completed = tasks.filter((t) => t.status === 'done')

  const filtered = completed.filter((t) => {
    if (fromDate && t.completedDate && t.completedDate < fromDate) return false
    if (toDate && t.completedDate && t.completedDate > toDate) return false
    return true
  })

  const totalCost = filtered.reduce((sum, t) => sum + parseFloat(t.actualCost || t.estimatedCost || 0), 0)

  return (
    <div className={styles.root}>
      <div className={styles.filters}>
        <input
          className={styles.filterInput}
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          placeholder="From date"
        />
        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', fontSize: 13 }}>to</span>
        <input
          className={styles.filterInput}
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        {(fromDate || toDate) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setFromDate(''); setToDate('') }}>
            Clear
          </button>
        )}
      </div>

      {filtered.length > 0 && (
        <div className={styles.summary}>
          {filtered.length} completed tasks · Total cost: {formatCurrency(totalCost)}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="📋" title="No service history" description="Completed maintenance tasks will appear here." />
      ) : (
        <div className={styles.list}>
          {filtered.map((task) => (
            <div key={task.id} className={styles.item}>
              <div className={styles.icon}>✅</div>
              <div className={styles.info}>
                <div className={styles.title}>{task.title}</div>
                <div className={styles.meta}>
                  {task.itemName && <span>📦 {task.itemName}</span>}
                  <span>📅 {formatDate(task.completedDate || task.scheduledDate)}</span>
                  {task.notes && <span>📝 {task.notes}</span>}
                </div>
              </div>
              {(task.actualCost || task.estimatedCost) && (
                <div className={styles.cost}>
                  {formatCurrency(parseFloat(task.actualCost || task.estimatedCost))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
