import { useState } from 'react'
import { CATEGORIES } from '../../config/categories'
import styles from './QuickAdd.module.css'

export default function QuickAdd({ onAdd }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('other')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await onAdd({ name: name.trim(), category, quantity: Number(quantity), unit: 'units' })
      setName('')
      setQuantity(1)
      setCategory('other')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.title}>⚡ Quick Add Item</div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          placeholder="Item name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className={styles.row}>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
          <input
            className={`${styles.input} ${styles.qtyInput}`}
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <button className={styles.submitBtn} type="submit" disabled={loading || !name.trim()}>
          {loading ? 'Adding…' : '+ Add to Inventory'}
        </button>
      </form>
      {success && <div className={styles.success}>✓ Item added successfully!</div>}
    </div>
  )
}
