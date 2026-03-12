import { useRef, useState } from 'react'
import { generateInsuranceReport, generateInventoryReport } from '../../utils/exportPDF'
import { exportItemsCSV, exportShoppingListText, getCSVTemplate, parseImportCSV } from '../../utils/exportCSV'
import styles from './ExportPanel.module.css'

export default function ExportPanel({ items = [], shoppingItems = [], user, onImport }) {
  const fileInputRef = useRef(null)
  const [importResult, setImportResult] = useState(null)
  const [importing, setImporting] = useState(false)

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const parsed = await parseImportCSV(file)
      setImportResult(parsed.length)
      await onImport?.(parsed)
    } catch (err) {
      setImportResult(-1)
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const EXPORTS = [
    {
      icon: '📦',
      title: 'All Items (CSV)',
      desc: 'Export complete inventory as a spreadsheet. Compatible with Excel and Google Sheets.',
      action: () => exportItemsCSV(items),
      label: 'Export CSV',
    },
    {
      icon: '🛡️',
      title: 'Insurance Report (PDF)',
      desc: 'Full inventory report with values and serial numbers. For insurance claims.',
      action: () => generateInsuranceReport(items, user),
      label: 'Download PDF',
    },
    {
      icon: '📋',
      title: 'Inventory Report (PDF)',
      desc: 'Printable inventory list with all item details.',
      action: () => generateInventoryReport(items, {}),
      label: 'Download PDF',
    },
    {
      icon: '🛒',
      title: 'Shopping List (Text)',
      desc: 'Export your shopping list as a plain text file for printing or sharing.',
      action: () => exportShoppingListText(shoppingItems),
      label: 'Export List',
    },
  ]

  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        {EXPORTS.map((exp) => (
          <div key={exp.title} className={styles.card}>
            <div className={styles.cardIcon}>{exp.icon}</div>
            <div className={styles.cardTitle}>{exp.title}</div>
            <div className={styles.cardDesc}>{exp.desc}</div>
            <button className="btn btn-primary btn-sm" onClick={exp.action}>
              {exp.label}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.importSection}>
        <div className={styles.importTitle}>📥 Import from CSV</div>
        <div className={styles.importDesc}>
          Import items from a CSV file. Download the template to see the expected format.
        </div>
        <div className={styles.importActions}>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? 'Importing…' : '📂 Choose CSV File'}
          </button>
          <button className="btn btn-secondary" onClick={getCSVTemplate}>
            📋 Download Template
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className={styles.fileInput} onChange={handleImport} />
        </div>
        {importResult !== null && (
          <div className={styles.importResult}>
            {importResult < 0 ? '❌ Import failed. Please check your file format.' : `✅ Successfully imported ${importResult} items!`}
          </div>
        )}
      </div>
    </div>
  )
}
