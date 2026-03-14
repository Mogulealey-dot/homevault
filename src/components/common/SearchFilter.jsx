import { useState, useRef } from 'react'
import { CATEGORIES } from '../../config/categories'
import styles from './SearchFilter.module.css'

export default function SearchFilter({ onSearch, onFilter, locations = [], activeFilters = {} }) {
  const [search, setSearch] = useState('')
  const searchTimerRef = useRef(null)

  const handleSearch = (val) => {
    setSearch(val)
    // Debounce the upstream filter callback — avoids re-filtering on every keystroke
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => onSearch?.(val), 300)
  }

  const handleFilter = (key, value) => {
    const newFilters = { ...activeFilters }
    if (newFilters[key] === value) {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    onFilter?.(newFilters)
  }

  const clearAll = () => {
    setSearch('')
    onSearch?.('')
    onFilter?.({})
  }

  const hasFilters = search || Object.keys(activeFilters).length > 0

  return (
    <div className={styles.root}>
      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search items…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearSearch} onClick={() => handleSearch('')}>×</button>
        )}
      </div>

      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={activeFilters.category || ''}
          onChange={(e) => handleFilter('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
          ))}
        </select>

        {locations.length > 0 && (
          <select
            className={styles.filterSelect}
            value={activeFilters.location || ''}
            onChange={(e) => handleFilter('location', e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id || loc} value={loc.name || loc}>{loc.name || loc}</option>
            ))}
          </select>
        )}

        <select
          className={styles.filterSelect}
          value={activeFilters.condition || ''}
          onChange={(e) => handleFilter('condition', e.target.value)}
        >
          <option value="">Any Condition</option>
          {['New', 'Excellent', 'Good', 'Fair', 'Poor'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {hasFilters && (
          <button className={`btn btn-ghost btn-sm ${styles.clearBtn}`} onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
