import { formatCurrency } from '../../utils/formatters'
import { CATEGORIES } from '../../config/categories'
import styles from './ValueByCategory.module.css'

export default function ValueByCategory({ stats }) {
  const byCategory = stats?.byCategory || {}

  const rows = Object.entries(byCategory)
    .map(([catId, data]) => {
      const cat = CATEGORIES.find((c) => c.id === catId)
      return {
        id: catId,
        icon: cat?.icon || '📋',
        label: cat?.label || catId,
        color: cat?.color || '#94a3b8',
        value: data.value,
        count: data.count,
      }
    })
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const maxValue = rows[0]?.value || 1

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>Value by Category</div>
        <div className={styles.sub}>Top {rows.length} categories by current value</div>
      </div>

      {rows.length === 0 ? (
        <div className={styles.empty}>No items with value yet</div>
      ) : (
        <div className={styles.list}>
          {rows.map((row) => (
            <div key={row.id} className={styles.row}>
              <div className={styles.rowHeader}>
                <div className={styles.catLabel}>
                  <span className={styles.catIcon}>{row.icon}</span>
                  {row.label}
                  <span className="badge badge-muted">{row.count}</span>
                </div>
                <div className={styles.catValue}>{formatCurrency(row.value)}</div>
              </div>
              <div className={styles.barWrap}>
                <div
                  className={styles.bar}
                  style={{
                    width: `${(row.value / maxValue) * 100}%`,
                    background: row.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
