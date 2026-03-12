import { useState } from 'react'
import { formatCurrency } from '../../utils/formatters'
import styles from './BudgetTracker.module.css'

export default function BudgetTracker({ shoppingItems = [], budget, onBudgetChange }) {
  const [editing, setEditing] = useState(false)
  const [tempBudget, setTempBudget] = useState(budget || '')

  const spent = shoppingItems
    .filter((i) => i.checked)
    .reduce((sum, i) => sum + parseFloat(i.estimatedPrice || 0), 0)

  const estimated = shoppingItems.reduce((sum, i) => sum + parseFloat(i.estimatedPrice || 0), 0)

  const pct = budget ? Math.min((spent / budget) * 100, 100) : 0
  const remaining = budget ? budget - spent : null
  const isOver = remaining !== null && remaining < 0

  const handleSaveBudget = () => {
    onBudgetChange?.(parseFloat(tempBudget) || null)
    setEditing(false)
  }

  const barColor = pct > 90 ? 'var(--crimson)' : pct > 70 ? 'var(--amber)' : 'var(--teal)'

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>💳 Monthly Budget</div>
        <div className={styles.budgetEdit}>
          {editing ? (
            <>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>$</span>
              <input
                className={styles.budgetInput}
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget()}
                autoFocus
              />
              <button className="btn btn-primary btn-sm" onClick={handleSaveBudget}>Save</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
              {budget ? `Budget: ${formatCurrency(budget)}` : 'Set Budget'}
            </button>
          )}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{formatCurrency(spent)}</div>
          <div className={styles.statLabel}>Spent (checked)</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{formatCurrency(estimated)}</div>
          <div className={styles.statLabel}>Estimated total</div>
        </div>
        <div className={styles.stat}>
          <div className={`${styles.statValue} ${isOver ? styles.overBudget : styles.underBudget}`}>
            {remaining !== null ? formatCurrency(Math.abs(remaining)) : '—'}
          </div>
          <div className={styles.statLabel}>{isOver ? 'Over budget' : remaining !== null ? 'Remaining' : 'No budget set'}</div>
        </div>
      </div>

      {budget && (
        <div className={styles.progressWrap}>
          <div className={styles.progressHeader}>
            <span>Spent: {formatCurrency(spent)}</span>
            <span>{Math.round(pct)}% of budget</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
