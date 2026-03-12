import { CATEGORIES } from '../../config/categories'
import styles from './CategoryBrowser.module.css'

export default function CategoryBrowser({ selectedCategory, onSelect, itemCounts = {} }) {
  return (
    <div className={styles.grid}>
      <button
        className={`${styles.allBtn} ${!selectedCategory ? styles.active : ''}`}
        onClick={() => onSelect(null)}
      >
        <span style={{ fontSize: 20 }}>🏠</span>
        <span>All</span>
      </button>
      {CATEGORIES.map((cat) => {
        const count = itemCounts[cat.id] || 0
        return (
          <button
            key={cat.id}
            className={`${styles.catCard} ${selectedCategory === cat.id ? styles.active : ''}`}
            onClick={() => onSelect(cat.id === selectedCategory ? null : cat.id)}
          >
            <span className={styles.catIcon}>{cat.icon}</span>
            <span className={styles.catLabel}>{cat.label.split(' ')[0]}</span>
            {count > 0 && <span className={styles.catCount}>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
