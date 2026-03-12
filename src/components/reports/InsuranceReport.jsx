import { formatCurrency, formatDate } from '../../utils/formatters'
import { getCategoryLabel } from '../../config/categories'
import { generateInsuranceReport } from '../../utils/exportPDF'
import { exportItemsCSV } from '../../utils/exportCSV'
import styles from './InsuranceReport.module.css'

export default function InsuranceReport({ items = [], user }) {
  const totalValue = items.reduce((sum, i) => sum + parseFloat(i.currentValue || i.purchasePrice || 0) * parseFloat(i.quantity || 1), 0)
  const totalReplacement = items.reduce((sum, i) => sum + parseFloat(i.replacementValue || i.currentValue || i.purchasePrice || 0) * parseFloat(i.quantity || 1), 0)

  const catGroups = {}
  for (const item of items) {
    const cat = getCategoryLabel(item.category)
    catGroups[cat] = (catGroups[cat] || 0) + 1
  }

  return (
    <div className={styles.root}>
      <div className={styles.headerCard}>
        <div className={styles.reportTitle}>🛡️ Insurance Inventory Report</div>
        <div className={styles.reportMeta}>
          Prepared for: {user?.displayName || user?.email} · Generated: {formatDate(new Date().toISOString())}
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{items.length}</div>
          <div className={styles.summaryLabel}>Total Items</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{formatCurrency(totalValue)}</div>
          <div className={styles.summaryLabel}>Current Value</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{formatCurrency(totalReplacement)}</div>
          <div className={styles.summaryLabel}>Replacement Value</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{Object.keys(catGroups).length}</div>
          <div className={styles.summaryLabel}>Categories</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className="btn btn-primary" onClick={() => generateInsuranceReport(items, user)}>
          📥 Download PDF
        </button>
        <button className="btn btn-secondary" onClick={() => exportItemsCSV(items)}>
          📊 Export CSV
        </button>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderCell}>Item Name</div>
          <div className={styles.tableHeaderCell}>Category</div>
          <div className={styles.tableHeaderCell}>Location</div>
          <div className={styles.tableHeaderCell}>Serial #</div>
          <div className={styles.tableHeaderCell}>Current Value</div>
          <div className={styles.tableHeaderCell}>Repl. Value</div>
        </div>
        {items.map((item) => (
          <div key={item.id} className={styles.tableRow}>
            <div className={styles.tableCell}>
              <strong>{item.name}</strong>
              {item.brand && <span style={{ color: 'var(--muted)', marginLeft: 6, fontSize: 12 }}>{item.brand}</span>}
            </div>
            <div className={`${styles.tableCell} ${styles.muted}`}>{getCategoryLabel(item.category)}</div>
            <div className={`${styles.tableCell} ${styles.muted}`}>{item.location || '—'}</div>
            <div className={`${styles.tableCell} ${styles.muted}`}>{item.serialNumber || '—'}</div>
            <div className={`${styles.tableCell} ${styles.value}`}>{formatCurrency(parseFloat(item.currentValue || item.purchasePrice || 0))}</div>
            <div className={`${styles.tableCell} ${styles.value}`}>{formatCurrency(parseFloat(item.replacementValue || item.currentValue || item.purchasePrice || 0))}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
