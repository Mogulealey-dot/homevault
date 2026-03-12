import { useState } from 'react'
import { formatCurrency } from '../../utils/formatters'
import { exportShoppingListText } from '../../utils/exportCSV'
import EmptyState from '../common/EmptyState'
import styles from './ShoppingList.module.css'

export default function ShoppingList({ items = [], onAdd, onUpdate, onRemove, onClearCompleted }) {
  const [newName, setNewName] = useState('')
  const [newQty, setNewQty] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)

  const active = items.filter((i) => !i.checked)
  const completed = items.filter((i) => i.checked)
  const totalCost = items.reduce((sum, i) => sum + (i.checked ? parseFloat(i.estimatedPrice || 0) : 0), 0)
  const estimatedTotal = items.reduce((sum, i) => sum + parseFloat(i.estimatedPrice || 0), 0)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    onAdd({
      name: newName.trim(),
      quantity: newQty || '1',
      estimatedPrice: newPrice ? parseFloat(newPrice) : null,
      checked: false,
      category: 'other',
    })
    setNewName('')
    setNewQty('')
    setNewPrice('')
  }

  const ShoppingItem = ({ item }) => (
    <div className={`${styles.item} ${item.checked ? styles.checked : ''}`}>
      <input
        type="checkbox"
        checked={!!item.checked}
        onChange={(e) => onUpdate(item.id, { checked: e.target.checked })}
      />
      <span className={styles.itemName}>
        {item.name}
        {item.isAuto && <span className={styles.autoBadge} style={{ marginLeft: 6 }}>🤖 auto</span>}
      </span>
      <span className={styles.itemMeta}>{item.quantity} {item.unit || ''}</span>
      {item.estimatedPrice && (
        <span className={styles.itemPrice}>{formatCurrency(item.estimatedPrice)}</span>
      )}
      <button className={styles.deleteBtn} onClick={() => onRemove(item.id)}>×</button>
    </div>
  )

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.title}>Shopping List</div>
          <div className={styles.totalCost}>
            {active.length} items · Est. {formatCurrency(estimatedTotal)}
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-secondary btn-sm" onClick={() => exportShoppingListText(items)}>
            📋 Export
          </button>
          {completed.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={onClearCompleted}>
              Clear Completed ({completed.length})
            </button>
          )}
        </div>
      </div>

      <form className={styles.addRow} onSubmit={handleAdd}>
        <input
          className={styles.addInput}
          type="text"
          placeholder="Add item…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className={`${styles.addInput} ${styles.addQty}`}
          type="text"
          placeholder="Qty"
          value={newQty}
          onChange={(e) => setNewQty(e.target.value)}
        />
        <input
          className={`${styles.addInput} ${styles.addPrice}`}
          type="number"
          placeholder="Price $"
          min="0"
          step="0.01"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">Add</button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Shopping list is empty"
          description="Add items manually or they'll appear automatically when you're low on stock."
        />
      ) : (
        <>
          {active.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                To Buy <span className={styles.sectionCount}>{active.length}</span>
              </div>
              <div className={styles.list}>
                {active.map((item) => <ShoppingItem key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div className={styles.section}>
              <div
                className={styles.sectionHeader}
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? '▾' : '▸'} Completed{' '}
                <span className={styles.sectionCount}>{completed.length}</span>
                {totalCost > 0 && (
                  <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--teal)' }}>
                    {formatCurrency(totalCost)} spent
                  </span>
                )}
              </div>
              {showCompleted && (
                <div className={styles.list}>
                  {completed.map((item) => <ShoppingItem key={item.id} item={item} />)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
