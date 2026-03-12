import { daysUntil, formatDate } from '../../utils/formatters'
import EmptyState from '../common/EmptyState'
import styles from './ExpiryTracker.module.css'

function groupByExpiry(items) {
  const expired = [], thisWeek = [], thisMonth = [], later = [], noDate = []

  for (const item of items) {
    if (!item.expiryDate) { noDate.push(item); continue }
    const days = daysUntil(item.expiryDate)
    if (days === null) { noDate.push(item); continue }
    if (days < 0) expired.push(item)
    else if (days <= 7) thisWeek.push(item)
    else if (days <= 31) thisMonth.push(item)
    else later.push(item)
  }

  return { expired, thisWeek, thisMonth, later, noDate }
}

export default function ExpiryTracker({ items = [], onRemove, onAddToShopping }) {
  const foodItems = items.filter((i) => i.category === 'food' || i.expiryDate)
  const sorted = [...foodItems].sort((a, b) => {
    const da = daysUntil(a.expiryDate) ?? 9999
    const db = daysUntil(b.expiryDate) ?? 9999
    return da - db
  })

  const groups = groupByExpiry(sorted)

  if (foodItems.length === 0) {
    return <EmptyState icon="📅" title="No expiry dates tracked" description="Add food items with expiry dates to track them here." />
  }

  const ExpiryGroup = ({ title, items: groupItems, cls }) => {
    if (groupItems.length === 0) return null
    return (
      <div className={styles.group}>
        <div className={styles.groupHeader}>
          {title}
          <span className={styles.groupCount}>{groupItems.length}</span>
        </div>
        <div className={styles.list}>
          {groupItems.map((item) => {
            const days = daysUntil(item.expiryDate)
            let daysCls = styles.daysOk
            let daysLabel = `${days}d`
            if (days === null) { daysCls = ''; daysLabel = '—' }
            else if (days < 0) { daysCls = styles.daysExpired; daysLabel = `${Math.abs(days)}d ago` }
            else if (days <= 7) { daysCls = styles.daysSoon; daysLabel = days === 0 ? 'Today' : `${days}d` }

            return (
              <div key={item.id} className={`${styles.item} ${cls || ''}`}>
                <div style={{ fontSize: 24 }}>🍽️</div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemMeta}>
                    {item.quantity} {item.unit || 'units'} · Expires {formatDate(item.expiryDate)}
                  </div>
                </div>
                <span className={`${styles.daysLeft} ${daysCls}`}>{daysLabel}</span>
                <div className={styles.actions}>
                  <button
                    className="btn btn-secondary btn-sm"
                    title="Add to shopping list"
                    onClick={() => onAddToShopping?.(item)}
                  >
                    🛒
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    title="Mark as used up"
                    onClick={() => onRemove?.(item.id)}
                  >
                    Used Up
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <ExpiryGroup title="🔴 Expired" items={groups.expired} cls={styles.expired} />
      <ExpiryGroup title="🟡 This Week" items={groups.thisWeek} cls={styles.expiringSoon} />
      <ExpiryGroup title="🟠 This Month" items={groups.thisMonth} />
      <ExpiryGroup title="🟢 Later" items={groups.later} />
    </div>
  )
}
