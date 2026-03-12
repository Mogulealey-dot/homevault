import { formatCurrency } from '../../utils/formatters'
import { CATEGORIES, ITEM_CONDITIONS } from '../../config/categories'
import styles from './ValueSummary.module.css'

export default function ValueSummary({ items = [] }) {
  const totalValue = items.reduce((sum, i) => sum + parseFloat(i.currentValue || i.purchasePrice || 0) * parseFloat(i.quantity || 1), 0)

  // By category
  const catData = {}
  for (const item of items) {
    const cat = item.category || 'other'
    if (!catData[cat]) catData[cat] = { value: 0, count: 0 }
    catData[cat].value += parseFloat(item.currentValue || item.purchasePrice || 0) * parseFloat(item.quantity || 1)
    catData[cat].count++
  }

  const catRows = Object.entries(catData)
    .map(([id, d]) => ({ id, ...d, cat: CATEGORIES.find((c) => c.id === id) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const maxCatValue = catRows[0]?.value || 1

  // By location
  const locData = {}
  for (const item of items) {
    const loc = item.location || 'Unknown'
    if (!locData[loc]) locData[loc] = 0
    locData[loc] += parseFloat(item.currentValue || item.purchasePrice || 0)
  }

  const locRows = Object.entries(locData).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxLocValue = locRows[0]?.[1] || 1

  // Top 10 most valuable
  const top10 = [...items]
    .sort((a, b) => parseFloat(b.currentValue || b.purchasePrice || 0) - parseFloat(a.currentValue || a.purchasePrice || 0))
    .slice(0, 10)

  // By condition
  const condData = {}
  for (const item of items) {
    const c = item.condition || 'Good'
    condData[c] = (condData[c] || 0) + 1
  }

  return (
    <div className={styles.root}>
      <div className={styles.totalCard}>
        <div className={styles.totalLabel}>Total Inventory Value</div>
        <div className={styles.totalValue}>{formatCurrency(totalValue)}</div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>Value by Category</div>
          <div className={styles.barRow}>
            {catRows.map((row) => (
              <div key={row.id} className={styles.bar}>
                <div className={styles.barHeader}>
                  <span className={styles.barLabel}>{row.cat?.icon} {row.cat?.label || row.id}</span>
                  <span className={styles.barValue}>{formatCurrency(row.value)}</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${(row.value / maxCatValue) * 100}%`, background: row.cat?.color || 'var(--teal)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>Value by Room</div>
          <div className={styles.barRow}>
            {locRows.map(([loc, val]) => (
              <div key={loc} className={styles.bar}>
                <div className={styles.barHeader}>
                  <span className={styles.barLabel}>📍 {loc}</span>
                  <span className={styles.barValue}>{formatCurrency(val)}</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${(val / maxLocValue) * 100}%`, background: 'var(--navy)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>Top 10 Most Valuable Items</div>
          <div className={styles.topList}>
            {top10.map((item, i) => (
              <div key={item.id} className={styles.topItem}>
                <div className={styles.rank}>{i + 1}</div>
                <div className={styles.topName}>{item.name}</div>
                <div className={styles.topValue}>{formatCurrency(parseFloat(item.currentValue || item.purchasePrice || 0))}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>Items by Condition</div>
          <div className={styles.conditionRow}>
            {ITEM_CONDITIONS.map((cond) => {
              const count = condData[cond] || 0
              const pct = items.length > 0 ? (count / items.length) * 100 : 0
              return (
                <div key={cond} className={styles.conditionItem}>
                  <span className={styles.conditionLabel}>{cond}</span>
                  <div className={styles.conditionTrack}>
                    <div className={styles.conditionFill} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={styles.conditionCount}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
