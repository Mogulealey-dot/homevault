import { useState, useRef, useEffect } from 'react'
import { getCategoryIcon, getCategoryLabel } from '../../config/categories'
import { formatCurrency, daysUntil } from '../../utils/formatters'
import styles from './ItemCard.module.css'

function ExpiryBadge({ expiryDate }) {
  const days = daysUntil(expiryDate)
  if (days === null) return null

  let cls = styles.expiringOk
  let label = `${days}d`
  if (days < 0) { cls = styles.expired; label = 'Expired' }
  else if (days <= 3) { cls = styles.expiringSoon; label = `${days}d` }
  else if (days <= 7) { cls = styles.expiringSoon; label = `${days}d` }

  return (
    <span className={`${styles.expiryBadge} ${cls}`}>
      🗓️ {label}
    </span>
  )
}

export default function ItemCard({ item, onEdit, onDelete, onViewQR, onLend, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const photo = item.photos?.[0]?.url || item.photos?.[0]

  return (
    <div className={styles.card} onClick={(e) => { if (!menuRef.current?.contains(e.target)) onEdit?.(item) }}>
      <div className={styles.photo}>
        {photo ? (
          <img src={photo} alt={item.name} loading="lazy" />
        ) : (
          <span>{getCategoryIcon(item.category)}</span>
        )}
        <div ref={menuRef} style={{ position: 'absolute', top: 0, right: 0 }}>
          <button
            className={styles.menuBtn}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
            title="Options"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className={styles.menuDropdown} onClick={(e) => e.stopPropagation()}>
              <button className={styles.menuItem} onClick={() => { onEdit?.(item); setMenuOpen(false) }}>
                ✏️ Edit
              </button>
              <button className={styles.menuItem} onClick={() => { onViewQR?.(item); setMenuOpen(false) }}>
                🔲 View QR
              </button>
              <button className={styles.menuItem} onClick={() => { onLend?.(item); setMenuOpen(false) }}>
                🤝 Lend Item
              </button>
              <button className={`${styles.menuItem} ${styles.danger}`} onClick={() => { onDelete?.(item); setMenuOpen(false) }}>
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.name}>{item.name}</div>
        {(item.brand || item.model) && (
          <div className={styles.brandModel}>{[item.brand, item.model].filter(Boolean).join(' · ')}</div>
        )}
        <div className={styles.badges}>
          {item.category && (
            <span className="badge badge-teal">{getCategoryLabel(item.category)}</span>
          )}
          {item.location && (
            <span className="badge badge-muted">📍 {item.location}</span>
          )}
          {item.condition && item.condition !== 'Good' && (
            <span className={`badge ${item.condition === 'New' ? 'badge-emerald' : item.condition === 'Poor' ? 'badge-crimson' : 'badge-amber'}`}>
              {item.condition}
            </span>
          )}
          {item.expiryDate && <ExpiryBadge expiryDate={item.expiryDate} />}
        </div>

        <div className={styles.footer}>
          <span className={styles.qty}>
            {item.quantity ?? 1} {item.unit || 'units'}
          </span>
          {(item.currentValue || item.purchasePrice) && (
            <span className={styles.value}>
              {formatCurrency(parseFloat(item.currentValue || item.purchasePrice))}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
