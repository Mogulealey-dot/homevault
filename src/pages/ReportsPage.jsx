import { useState } from 'react'
import { useInventory } from '../hooks/useInventory'
import { useFirestore } from '../hooks/useFirestore'
import InsuranceReport from '../components/reports/InsuranceReport'
import ValueSummary from '../components/reports/ValueSummary'
import ExportPanel from '../components/reports/ExportPanel'
import LoadingSpinner from '../components/common/LoadingSpinner'
import styles from './ReportsPage.module.css'

export default function ReportsPage({ user }) {
  const uid = user?.uid
  const { items, loading, add } = useInventory(uid)
  const { data: shoppingItems } = useFirestore(uid, 'shopping_items')
  const [activeTab, setActiveTab] = useState('insurance')

  if (loading) return <LoadingSpinner fullPage />

  const handleImport = async (parsedItems) => {
    for (const item of parsedItems) {
      await add(item)
    }
  }

  return (
    <div className={styles.root}>
      <div className="page-header">
        <div>
          <div className="page-title">📋 Reports</div>
          <div className="page-sub">Generate reports and export your inventory data</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'insurance' ? 'active' : ''}`} onClick={() => setActiveTab('insurance')}>
          🛡️ Insurance Report
        </button>
        <button className={`tab ${activeTab === 'value' ? 'active' : ''}`} onClick={() => setActiveTab('value')}>
          💰 Value Summary
        </button>
        <button className={`tab ${activeTab === 'export' ? 'active' : ''}`} onClick={() => setActiveTab('export')}>
          📤 Export & Import
        </button>
      </div>

      {activeTab === 'insurance' && <InsuranceReport items={items} user={user} />}
      {activeTab === 'value' && <ValueSummary items={items} />}
      {activeTab === 'export' && <ExportPanel items={items} shoppingItems={shoppingItems} user={user} onImport={handleImport} />}
    </div>
  )
}
