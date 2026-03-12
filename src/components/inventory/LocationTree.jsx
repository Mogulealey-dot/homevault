import { useState } from 'react'
import { STORAGE_LOCATIONS } from '../../config/categories'
import styles from './LocationTree.module.css'

export default function LocationTree({
  locations = [],
  selectedLocation,
  onSelect,
  onAddLocation,
  onDeleteLocation,
  itemCounts = {},
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('bedroom')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    const type = STORAGE_LOCATIONS.find((l) => l.id === newType)
    onAddLocation?.({ name: newName.trim(), type: newType, icon: type?.icon || '📍' })
    setNewName('')
    setShowAdd(false)
  }

  const displayLocations = locations.length > 0
    ? locations
    : STORAGE_LOCATIONS.map((l) => ({ id: l.id, name: l.label, icon: l.icon, type: l.id }))

  return (
    <div className={styles.root}>
      <div className={styles.title}>
        <span>Locations</span>
        <button className={styles.addBtn} onClick={() => setShowAdd(!showAdd)} title="Add location">
          +
        </button>
      </div>

      <button
        className={`${styles.locationItem} ${!selectedLocation ? styles.active : ''}`}
        onClick={() => onSelect(null)}
      >
        <span className={styles.locIcon}>🏠</span>
        <span className={styles.locLabel}>All Locations</span>
      </button>

      {displayLocations.map((loc) => {
        const count = itemCounts[loc.name] || itemCounts[loc.id] || 0
        return (
          <div
            key={loc.id}
            className={`${styles.locationItem} ${selectedLocation === (loc.name || loc.id) ? styles.active : ''}`}
            onClick={() => onSelect(loc.name || loc.id)}
          >
            <span className={styles.locIcon}>{loc.icon || '📍'}</span>
            <span className={styles.locLabel}>{loc.name}</span>
            {count > 0 && <span className={styles.locCount}>{count}</span>}
            {locations.length > 0 && (
              <div className={styles.actions}>
                <button
                  className={styles.actionBtn}
                  onClick={(e) => { e.stopPropagation(); onDeleteLocation?.(loc) }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        )
      })}

      {showAdd && (
        <form className={styles.addForm} onSubmit={handleAdd}>
          <input
            className={styles.addInput}
            type="text"
            placeholder="Location name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <select
            className={styles.addInput}
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          >
            {STORAGE_LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
            ))}
          </select>
          <div className={styles.addFormActions}>
            <button type="submit" className="btn btn-primary btn-sm">Add</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
