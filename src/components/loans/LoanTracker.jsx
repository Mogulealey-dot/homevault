import { useState } from 'react'
import { formatDate, daysUntil } from '../../utils/formatters'
import EmptyState from '../common/EmptyState'
import styles from './LoanTracker.module.css'

export default function LoanTracker({ loans = [], onMarkReturned, onEdit, onDelete, onAdd }) {
  const [tab, setTab] = useState('lent')

  const lent = loans.filter((l) => l.direction === 'lend')
  const borrowed = loans.filter((l) => l.direction === 'borrow')
  const displayed = tab === 'lent' ? lent : borrowed

  const overdueCount = loans.filter((l) => {
    if (l.status === 'returned') return false
    const days = daysUntil(l.returnDate)
    return days !== null && days < 0
  }).length

  const LoanCard = ({ loan }) => {
    const days = loan.returnDate ? daysUntil(loan.returnDate) : null
    const isOverdue = days !== null && days < 0 && loan.status !== 'returned'
    const status = loan.status === 'returned' ? 'returned' : isOverdue ? 'overdue' : 'active'
    const photo = loan.itemPhoto

    return (
      <div className={`${styles.card} ${isOverdue ? styles.overdue : ''}`}>
        <div className={styles.itemPhoto}>
          {photo ? <img src={photo} alt={loan.itemName} /> : '🤝'}
        </div>
        <div className={styles.info}>
          <div className={styles.itemName}>{loan.itemName}</div>
          <div className={styles.person}>
            {loan.direction === 'lend' ? '↗️ Lent to' : '↙️ Borrowed from'} <strong>{loan.personName}</strong>
          </div>
          <div className={styles.dates}>
            <span>📅 {formatDate(loan.lentDate)}</span>
            {loan.returnDate && <span>Due {formatDate(loan.returnDate)}</span>}
            {loan.contact && <span>📧 {loan.contact}</span>}
          </div>
        </div>
        <span className={`${styles.statusBadge} ${styles['status' + status.charAt(0).toUpperCase() + status.slice(1)]}`}>
          {status === 'overdue' ? `${Math.abs(days)}d overdue` : status}
        </span>
        <div className={styles.actions}>
          {loan.status !== 'returned' && (
            <button className="btn btn-primary btn-sm" onClick={() => onMarkReturned(loan.id)}>
              ✓ Returned
            </button>
          )}
          {loan.contact && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => window.location.href = `mailto:${loan.contact}?subject=Reminder: ${loan.itemName}`}
            >
              📧
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(loan)}>Edit</button>
          <button className="btn btn-icon" onClick={() => onDelete(loan.id)}>🗑️</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{lent.filter((l) => l.status !== 'returned').length}</div>
          <div className={styles.statLabel}>Items lent out</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{borrowed.filter((l) => l.status !== 'returned').length}</div>
          <div className={styles.statLabel}>Items borrowed</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue} style={{ color: overdueCount > 0 ? 'var(--crimson)' : 'inherit' }}>
            {overdueCount}
          </div>
          <div className={styles.statLabel}>Overdue</div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'lent' ? styles.active : ''}`} onClick={() => setTab('lent')}>
          ↗️ Lent Out ({lent.filter((l) => l.status !== 'returned').length})
        </button>
        <button className={`${styles.tab} ${tab === 'borrowed' ? styles.active : ''}`} onClick={() => setTab('borrowed')}>
          ↙️ Borrowed ({borrowed.filter((l) => l.status !== 'returned').length})
        </button>
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon="🤝"
          title={tab === 'lent' ? 'Nothing lent out' : 'Nothing borrowed'}
          description="Track items you lend to or borrow from others."
          action={{ label: '+ Add Loan', onClick: onAdd }}
        />
      ) : (
        <div className={styles.list}>
          {displayed.map((loan) => <LoanCard key={loan.id} loan={loan} />)}
        </div>
      )}
    </div>
  )
}
