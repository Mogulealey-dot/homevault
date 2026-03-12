import { useState } from 'react'
import Modal from '../common/Modal'
import QRLabel from '../common/QRLabel'
import ItemForm from './ItemForm'
import { getCategoryIcon, getCategoryLabel } from '../../config/categories'
import { formatCurrency, formatDate, formatRelativeDate } from '../../utils/formatters'
import styles from './ItemModal.module.css'

const TABS = ['Details', 'Photos', 'QR Label', 'History']

export default function ItemModal({ item, isOpen, onClose, onSave, onDelete, uid, locations }) {
  const [activeTab, setActiveTab] = useState('Details')
  const [editing, setEditing] = useState(false)

  if (!item) return null

  const photo = item.photos?.[0]?.url || item.photos?.[0]

  const DetailField = ({ label, value }) => (
    value ? (
      <div className={styles.detailField}>
        <div className={styles.detailLabel}>{label}</div>
        <div className={styles.detailValue}>{value}</div>
      </div>
    ) : null
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { onClose(); setEditing(false); setActiveTab('Details') }}
      title={editing ? `Edit: ${item.name}` : item.name}
      size="xl"
    >
      {editing ? (
        <ItemForm
          initialData={item}
          uid={uid}
          locations={locations}
          onSave={async (data) => { await onSave(item.id, data); setEditing(false) }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div>
          {/* Item header */}
          <div className={styles.itemHeader}>
            <div className={styles.itemIcon}>
              {photo ? <img src={photo} alt={item.name} /> : <span>{getCategoryIcon(item.category)}</span>}
            </div>
            <div className={styles.itemTitle}>
              <div className={styles.itemName}>{item.name}</div>
              <div className={styles.itemMeta}>
                {item.category && <span className="badge badge-teal">{getCategoryLabel(item.category)}</span>}
                {item.location && <span className="badge badge-muted">📍 {item.location}</span>}
                {item.condition && <span className="badge badge-amber">{item.condition}</span>}
              </div>
            </div>
            <div className={styles.editActions}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                ✏️ Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(item)}>
                🗑️
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'Details' && (
              <div className={styles.detailGrid}>
                <DetailField label="Brand" value={item.brand} />
                <DetailField label="Model" value={item.model} />
                <DetailField label="Serial Number" value={item.serialNumber} />
                <DetailField label="Barcode" value={item.barcode} />
                <DetailField label="Quantity" value={item.quantity ? `${item.quantity} ${item.unit || 'units'}` : null} />
                <DetailField label="Condition" value={item.condition} />
                <DetailField label="Location" value={item.location} />
                <DetailField label="Container" value={item.container} />
                <DetailField label="Purchase Price" value={item.purchasePrice ? formatCurrency(item.purchasePrice) : null} />
                <DetailField label="Current Value" value={item.currentValue ? formatCurrency(item.currentValue) : null} />
                <DetailField label="Replacement Value" value={item.replacementValue ? formatCurrency(item.replacementValue) : null} />
                <DetailField label="Purchase Date" value={formatDate(item.purchaseDate)} />
                <DetailField label="Purchase Location" value={item.purchaseLocation} />
                <DetailField label="Warranty Expiry" value={item.warrantyExpiry ? `${formatDate(item.warrantyExpiry)} (${formatRelativeDate(item.warrantyExpiry)})` : null} />
                <DetailField label="Expiry Date" value={item.expiryDate ? `${formatDate(item.expiryDate)} (${formatRelativeDate(item.expiryDate)})` : null} />
                <DetailField label="Added" value={formatDate(item.createdAt)} />
                {item.description && (
                  <div className={styles.detailField} style={{ gridColumn: '1 / -1' }}>
                    <div className={styles.detailLabel}>Notes</div>
                    <div className={styles.detailValue} style={{ whiteSpace: 'pre-wrap' }}>{item.description}</div>
                  </div>
                )}
                {item.tags?.length > 0 && (
                  <div className={styles.detailField} style={{ gridColumn: '1 / -1' }}>
                    <div className={styles.detailLabel}>Tags</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {item.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Photos' && (
              <div>
                {item.photos?.length > 0 ? (
                  <div className={styles.photoGrid}>
                    {item.photos.map((p, i) => (
                      <div key={i} className={styles.photo}>
                        <img src={p.url || p} alt={`Photo ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm" style={{ padding: '24px 0' }}>No photos added yet. Click Edit to add photos.</p>
                )}
              </div>
            )}

            {activeTab === 'QR Label' && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <QRLabel item={item} />
              </div>
            )}

            {activeTab === 'History' && (
              <div className={styles.historyList}>
                <div className={styles.historyItem}>
                  <span>➕</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Item added</div>
                    <div className="text-muted text-sm">{formatDate(item.createdAt)}</div>
                  </div>
                </div>
                {item.updatedAt && item.updatedAt !== item.createdAt && (
                  <div className={styles.historyItem}>
                    <span>✏️</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Last updated</div>
                      <div className="text-muted text-sm">{formatDate(item.updatedAt)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
