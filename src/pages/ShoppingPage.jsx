import { useState } from 'react'
import { useFirestore } from '../hooks/useFirestore'
import ShoppingList from '../components/shopping/ShoppingList'
import BudgetTracker from '../components/shopping/BudgetTracker'
import LoadingSpinner from '../components/common/LoadingSpinner'
import styles from './ShoppingPage.module.css'

export default function ShoppingPage({ user }) {
  const uid = user?.uid
  const { data: items, loading, add, update, remove } = useFirestore(uid, 'shopping_items')
  const { data: prefs, add: addPref, update: updatePref } = useFirestore(uid, 'preferences')
  const [budget, setBudget] = useState(null)

  if (loading) return <LoadingSpinner fullPage />

  const budgetPref = prefs.find((p) => p.key === 'monthly_budget')

  const handleBudgetChange = async (val) => {
    setBudget(val)
    if (budgetPref) {
      await updatePref(budgetPref.id, { value: val })
    } else {
      await addPref({ key: 'monthly_budget', value: val })
    }
  }

  const handleClearCompleted = async () => {
    const completed = items.filter((i) => i.checked)
    await Promise.all(completed.map((i) => remove(i.id)))
  }

  return (
    <div className={styles.root}>
      <BudgetTracker
        shoppingItems={items}
        budget={budgetPref?.value || budget}
        onBudgetChange={handleBudgetChange}
      />
      <ShoppingList
        items={items}
        onAdd={add}
        onUpdate={(id, changes) => update(id, changes)}
        onRemove={remove}
        onClearCompleted={handleClearCompleted}
      />
    </div>
  )
}
