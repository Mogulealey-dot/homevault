import { useState } from 'react'
import { daysUntil, formatDate } from '../../utils/formatters'
import EmptyState from '../common/EmptyState'
import styles from './PantryGrid.module.css'

const STORAGE_TYPES = [
  { id: 'pantry', label: '🏠 Pantry' },
  { id: 'fridge', label: '🧊 Fridge' },
  { id: 'freezer', label: '❄️ Freezer' },
]

function getExpiryClass(expiryDate) {
  if (!expiryDate) return null
  const days = daysUntil(expiryDate)
  if (days === null) return null
  if (days < 0) return styles.expired
  if (days <= 3) return styles.soon3
  if (days <= 7) return styles.soon7
  return styles.ok
}

function getExpiryLabel(expiryDate) {
  if (!expiryDate) return null
  const days = daysUntil(expiryDate)
  if (days === null) return null
  if (days < 0) return `Expired ${Math.abs(days)}d ago`
  if (days === 0) return 'Expires today'
  if (days <= 7) return `${days}d left`
  return formatDate(expiryDate)
}

export default function PantryGrid({ items = [], onUpdateQuantity, onAddItem }) {
  const [activeTab, setActiveTab] = useState('pantry')

  const foodItems = items.filter((i) => i.category === 'food')

  const tabItems = foodItems.filter((i) => {
    const loc = (i.location || '').toLowerCase()
    if (activeTab === 'fridge') return loc.includes('fridge') || loc.includes('refrigerator')
    if (activeTab === 'freezer') return loc.includes('freezer') || loc.includes('frozen')
    return !loc.includes('fridge') && !loc.includes('refrigerator') && !loc.includes('freezer') && !loc.includes('frozen')
  })

  const catSubcatMap = {
    'Fruits & Veg': '🥦', 'Dairy': '🥛', 'Grains & Pasta': '🌾',
    'Canned Goods': '🥫', 'Snacks': '🍿', 'Beverages': '🥤',
    'Condiments': '🧴', 'Spices': '🌶️', 'Frozen': '❄️', 'Baking': '🧁',
  }

  return (
    <div className={styles.root}>
      <div className={styles.tabs}>
        {STORAGE_TYPES.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.active : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.header}>
        <div className={styles.headerTitle}>{tabItems.length} items</div>
        <button className="btn btn-primary btn-sm" onClick={onAddItem}>
          + Add Food
        </button>
      </div>

      {tabItems.length === 0 ? (
        <EmptyState
          icon="🍎"
          title={`No items in ${STORAGE_TYPES.find((t) => t.id === activeTab)?.label}`}
          description="Add food items to track expiry and manage your pantry."
          action={{ label: '+ Add Food Item', onClick: onAddItem }}
        />
      ) : (
        <div className={styles.grid}>
          {tabItems.map((item) => {
            const expiryClass = getExpiryClass(item.expiryDate)
            const expiryLabel = getExpiryLabel(item.expiryDate)
            const emoji = catSubcatMap[item.subcategory] || '🍽️'

            return (
              <div key={item.id} className={styles.foodCard}>
                <div className={styles.foodEmoji}>{emoji}</div>
                <div className={styles.foodName}>{item.name}</div>
                {expiryLabel && (
                  <div className={`${styles.expiryLabel} ${expiryClass || styles.ok}`}>
                    {expiryLabel}
                  </div>
                )}
                <div className={styles.qtyRow}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => onUpdateQuantity(item.id, Math.max(0, (item.quantity || 1) - 1))}
                  >
                    −
                  </button>
                  <span className={styles.qtyDisplay}>{item.quantity ?? 1} {item.unit || ''}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
