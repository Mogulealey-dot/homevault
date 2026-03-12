import { useState } from 'react'
import { STORAGE_LOCATIONS } from '../../config/categories'
import ConfirmDialog from '../common/ConfirmDialog'
import EmptyState from '../common/EmptyState'
import styles from './LocationSettings.module.css'

export default function LocationSettings({ locations, onAdd, onDelete, onReorder, itemCounts = {} }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('bedroom')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    const type = STORAGE_LOCATIONS.find((l) => l.id === newType)
    onAdd({ name: newName.trim(), type: newType, icon: type?.icon || '📍' })
    setNewName('')
    setShowAdd(false)
  }

  const move = (index, dir) => {
    const newList = [...locations]
    const target = index + dir
    if (target < 0 || target >= newList.length) return
    ;[newList[index], newList[target]] = [newList[target], newList[index]]
    onReorder(newList)
  }

  return (
    <div className={styles.root}>
      {locations.length === 0 ? (
        <EmptyState icon="📍" title="No custom locations" description="Add rooms and storage areas to organize your inventory." />
      ) : (
        <div className={styles.list}>
          {locations.map((loc, i) => (
            <div key={loc.id} className={styles.item}>
              <div className={styles.orderBtns}>
                <button className={styles.orderBtn} onClick={() => move(i, -1)} disabled={i === 0}>▲</button>
                <button className={styles.orderBtn} onClick={() => move(i, 1)} disabled={i === locations.length - 1}>▼</button>
              </div>
              <span className={styles.icon}>{loc.icon || '📍'}</span>
              <span className={styles.name}>{loc.name}</span>
              {itemCounts[loc.name] > 0 && (
                <span className={styles.count}>{itemCounts[loc.name]} items</span>
              )}
              <div className={styles.actions}>
                <button className="btn btn-icon" onClick={() => setDeleteTarget(loc)} title="Delete">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
        + Add Location
      </button>

      {showAdd && (
        <form className={styles.addForm} onSubmit={handleAdd} style={{ marginTop: 12 }}>
          <div className={styles.addTitle}>New Location</div>
          <div className={styles.addGrid}>
            <input
              className={styles.addInput}
              type="text"
              placeholder="Location name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <select className={styles.addInput} value={newType} onChange={(e) => setNewType(e.target.value)}>
              {STORAGE_LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.addActions}>
            <button type="submit" className="btn btn-primary btn-sm">Add</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </form>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Location"
        message={`Delete "${deleteTarget?.name}"? Items in this location will not be deleted.`}
        onConfirm={() => { onDelete(deleteTarget.id); setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  )
}
