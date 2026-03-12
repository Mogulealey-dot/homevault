import { useState } from 'react'
import { useInventory } from '../hooks/useInventory'
import { useFirestore } from '../hooks/useFirestore'
import PantryGrid from '../components/pantry/PantryGrid'
import ExpiryTracker from '../components/pantry/ExpiryTracker'
import MealPlanner from '../components/pantry/MealPlanner'
import RecipeSuggestions from '../components/pantry/RecipeSuggestions'
import Modal from '../components/common/Modal'
import ItemForm from '../components/inventory/ItemForm'
import LoadingSpinner from '../components/common/LoadingSpinner'
import styles from './PantryPage.module.css'

const TABS = [
  { id: 'overview', label: '🏠 Overview' },
  { id: 'expiry', label: '📅 Expiry Tracker' },
  { id: 'meal', label: '🍽️ Meal Planner' },
  { id: 'recipes', label: '👨‍🍳 Recipes' },
]

export default function PantryPage({ user }) {
  const uid = user?.uid
  const { items, loading, add, update, remove } = useInventory(uid)
  const { add: addShoppingItem } = useFirestore(uid, 'shopping_items')
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddFood, setShowAddFood] = useState(false)

  if (loading) return <LoadingSpinner fullPage />

  const handleAddFood = async (data) => {
    await add({ ...data, category: 'food' })
    setShowAddFood(false)
  }

  const handleAddToShopping = async (item) => {
    await addShoppingItem({
      name: item.name,
      quantity: '1',
      unit: item.unit || 'units',
      category: 'food',
      checked: false,
    })
  }

  return (
    <div className={styles.root}>
      <div className="page-header">
        <div>
          <div className="page-title">🍎 Pantry & Food</div>
          <div className="page-sub">{items.filter((i) => i.category === 'food').length} food items tracked</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddFood(true)}>
          + Add Food Item
        </button>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <PantryGrid
          items={items}
          onUpdateQuantity={(id, qty) => update(id, { quantity: qty })}
          onAddItem={() => setShowAddFood(true)}
        />
      )}

      {activeTab === 'expiry' && (
        <ExpiryTracker
          items={items}
          onRemove={(id) => remove(id)}
          onAddToShopping={handleAddToShopping}
        />
      )}

      {activeTab === 'meal' && <MealPlanner uid={uid} />}

      {activeTab === 'recipes' && <RecipeSuggestions items={items} />}

      <Modal isOpen={showAddFood} onClose={() => setShowAddFood(false)} title="Add Food Item" size="xl">
        <ItemForm
          initialData={{ category: 'food' }}
          uid={uid}
          onSave={handleAddFood}
          onCancel={() => setShowAddFood(false)}
        />
      </Modal>
    </div>
  )
}
