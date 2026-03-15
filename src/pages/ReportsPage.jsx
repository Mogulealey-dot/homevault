import { useState, useMemo } from 'react'
import { useInventory } from '../hooks/useInventory'
import { useFirestore } from '../hooks/useFirestore'
import InsuranceReport from '../components/reports/InsuranceReport'
import ValueSummary from '../components/reports/ValueSummary'
import ExportPanel from '../components/reports/ExportPanel'
import LoadingSpinner from '../components/common/LoadingSpinner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import styles from './ReportsPage.module.css'

// ─── Depreciation rates by category ────────────────────────────────────────
const DEPRECIATION_RATES = {
  electronics: 0.25,
  furniture: 0.10,
  appliances: 0.15,
  clothing: 0.20,
  tools: 0.10,
}

function getDepreciationRate(category) {
  return DEPRECIATION_RATES[category?.toLowerCase()] ?? 0.15
}

function calcDepreciatedValue(item) {
  const price = parseFloat(item.purchasePrice || item.currentValue || 0)
  if (!price || !item.purchaseDate) return { currentValue: price, yearsOwned: 0, totalDepreciation: 0 }
  const yearsOwned = Math.max(0, (Date.now() - new Date(item.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  const rate = getDepreciationRate(item.category)
  const currentValue = Math.max(0, price * Math.pow(1 - rate, yearsOwned))
  return {
    originalValue: price,
    yearsOwned: +yearsOwned.toFixed(1),
    currentValue: +currentValue.toFixed(2),
    totalDepreciation: +(price - currentValue).toFixed(2),
    rate,
  }
}

function DepreciationTab({ items }) {
  const eligible = useMemo(() =>
    items.filter((i) => parseFloat(i.purchasePrice || i.currentValue || 0) > 0),
  [items])

  const rows = useMemo(() =>
    eligible.map((i) => ({ ...i, ...calcDepreciatedValue(i) })),
  [eligible])

  const totalOriginal = rows.reduce((s, r) => s + (r.originalValue || 0), 0)
  const totalCurrent = rows.reduce((s, r) => s + r.currentValue, 0)

  function fmt(n) {
    return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Items with Price Data', value: eligible.length },
          { label: 'Total Purchase Value', value: fmt(totalOriginal) },
          { label: 'Est. Current Value', value: fmt(totalCurrent) },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40 }}>📉</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>No items with purchase prices found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Add purchase prices to your inventory items to see depreciation estimates.</div>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg)' }}>
                {['Item', 'Category', 'Purchase Price', 'Years Owned', 'Rate/yr', 'Est. Current Value', 'Total Depreciation'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--navy)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{r.name}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--muted)', textTransform: 'capitalize' }}>{r.category || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>{fmt(r.originalValue)}</td>
                  <td style={{ padding: '10px 14px' }}>{r.yearsOwned} yrs</td>
                  <td style={{ padding: '10px 14px' }}>{Math.round((r.rate || 0.15) * 100)}%</td>
                  <td style={{ padding: '10px 14px', color: 'var(--teal)', fontWeight: 700 }}>{fmt(r.currentValue)}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--crimson)' }}>-{fmt(r.totalDepreciation)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 700, background: 'var(--bg)' }}>
                <td colSpan={2} style={{ padding: '10px 14px' }}>TOTAL</td>
                <td style={{ padding: '10px 14px' }}>{fmt(totalOriginal)}</td>
                <td colSpan={2} />
                <td style={{ padding: '10px 14px', color: 'var(--teal)' }}>{fmt(totalCurrent)}</td>
                <td style={{ padding: '10px 14px', color: 'var(--crimson)' }}>-{fmt(totalOriginal - totalCurrent)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Insurance Claim Assistant ───────────────────────────────────────────────
function InsuranceClaimTab({ items, user }) {
  const [selected, setSelected] = useState(new Set())
  const [copied, setCopied] = useState(false)

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map((i) => i.id)))
    }
  }

  const toggleItem = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function calcVal(item) {
    const price = parseFloat(item.purchasePrice || item.currentValue || 0)
    if (!price || !item.purchaseDate) return price
    const yearsOwned = Math.max(0, (Date.now() - new Date(item.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    const rate = getDepreciationRate(item.category)
    return Math.max(0, price * Math.pow(1 - rate, yearsOwned))
  }

  function fmt(n) {
    return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const claimItems = items.filter((i) => selected.has(i.id))
  const totalClaim = claimItems.reduce((s, i) => s + calcVal(i), 0)

  const generateText = () => {
    const lines = [
      `INSURANCE CLAIM REPORT`,
      `Prepared by: ${user?.displayName || user?.email || 'Homeowner'}`,
      `Date: ${new Date().toLocaleDateString()}`,
      ``,
      ...claimItems.map((i, idx) => {
        const val = calcVal(i)
        return [
          `${idx + 1}. ${i.name}`,
          `   Brand/Model: ${[i.brand, i.model].filter(Boolean).join(' / ') || '—'}`,
          `   Serial #: ${i.serialNumber || '—'}`,
          `   Purchase Date: ${i.purchaseDate ? new Date(i.purchaseDate).toLocaleDateString() : '—'}`,
          `   Purchase Price: ${fmt(parseFloat(i.purchasePrice || i.currentValue || 0))}`,
          `   Est. Current Value: ${fmt(val)}`,
          ``,
        ].join('\n')
      }),
      `─────────────────────────────────`,
      `TOTAL CLAIM VALUE: ${fmt(totalClaim)}`,
    ]
    return lines.join('\n')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePDF = () => {
    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.getWidth()
    const now = new Date()

    doc.setFillColor(30, 58, 95)
    doc.rect(0, 0, pageW, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('HomeVault — Insurance Claim Report', 14, 16)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${user?.displayName || user?.email || 'Homeowner'}  |  ${now.toLocaleDateString()}`, 14, 27)

    autoTable(doc, {
      startY: 42,
      head: [['Item', 'Brand/Model', 'Serial #', 'Purchase Date', 'Purchase Price', 'Est. Current Value']],
      body: claimItems.map((i) => [
        i.name || '—',
        [i.brand, i.model].filter(Boolean).join(' / ') || '—',
        i.serialNumber || '—',
        i.purchaseDate ? new Date(i.purchaseDate).toLocaleDateString() : '—',
        fmt(parseFloat(i.purchasePrice || i.currentValue || 0)),
        fmt(calcVal(i)),
      ]),
      headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: 14, right: 14 },
      foot: [['', '', '', '', 'TOTAL CLAIM:', fmt(totalClaim)]],
      footStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    })

    doc.save(`HomeVault_Insurance_Claim_${now.toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>
          Select items for claim ({selected.size} selected)
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={toggleAll} style={{ fontSize: 13 }}>
            {selected.size === items.length ? 'Deselect All' : 'Select All'}
          </button>
          <button className="btn btn-secondary" onClick={handleCopy} disabled={selected.size === 0} style={{ fontSize: 13 }}>
            {copied ? '✓ Copied!' : '📋 Copy Text'}
          </button>
          <button className="btn btn-primary" onClick={handlePDF} disabled={selected.size === 0} style={{ fontSize: 13 }}>
            📄 Download PDF
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="card" style={{ padding: '12px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--navy)', color: 'white', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Total Claim Value</span>
          <span style={{ fontSize: 22, fontWeight: 800 }}>{fmt(totalClaim)}</span>
        </div>
      )}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg)' }}>
              <th style={{ padding: '10px 14px', width: 40 }}>
                <input
                  type="checkbox"
                  checked={selected.size === items.length && items.length > 0}
                  onChange={toggleAll}
                  style={{ accentColor: 'var(--teal)' }}
                />
              </th>
              {['Item', 'Brand / Model', 'Serial #', 'Purchase Date', 'Purchase Price', 'Est. Current Value'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--navy)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                  No inventory items found. Add items with purchase prices to generate a claim.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const val = calcVal(item)
                return (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected.has(item.id) ? '#f0fdf4' : 'transparent' }}
                    onClick={() => toggleItem(item.id)}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleItem(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ accentColor: 'var(--teal)' }}
                      />
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{[item.brand, item.model].filter(Boolean).join(' / ') || '—'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{item.serialNumber || '—'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>
                      {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>{fmt(parseFloat(item.purchasePrice || item.currentValue || 0))}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--teal)', fontWeight: 700 }}>{fmt(val)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

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
        <button className={`tab ${activeTab === 'depreciation' ? 'active' : ''}`} onClick={() => setActiveTab('depreciation')}>
          📉 Depreciation
        </button>
        <button className={`tab ${activeTab === 'claim' ? 'active' : ''}`} onClick={() => setActiveTab('claim')}>
          📄 Claim Assistant
        </button>
      </div>

      {activeTab === 'insurance' && <InsuranceReport items={items} user={user} />}
      {activeTab === 'value' && <ValueSummary items={items} />}
      {activeTab === 'export' && <ExportPanel items={items} shoppingItems={shoppingItems} user={user} onImport={handleImport} />}
      {activeTab === 'depreciation' && <DepreciationTab items={items} />}
      {activeTab === 'claim' && <InsuranceClaimTab items={items} user={user} />}
    </div>
  )
}
