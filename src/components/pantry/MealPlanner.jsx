import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import { useFirestore } from '../../hooks/useFirestore'
import styles from './MealPlanner.module.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEALS = ['Breakfast', 'Lunch', 'Dinner']

export default function MealPlanner({ uid }) {
  const { data: plans, add, update } = useFirestore(uid, 'meal_plans')
  const [editing, setEditing] = useState(null) // { dayIdx, meal }
  const [editText, setEditText] = useState('')

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekKey = format(weekStart, 'yyyy-MM-dd')

  const currentPlan = plans.find((p) => p.weekKey === weekKey)
  const meals = currentPlan?.meals || {}

  const getMeal = (dayIdx, meal) => meals[`${dayIdx}-${meal}`] || ''

  const handleSlotClick = (dayIdx, meal) => {
    setEditing({ dayIdx, meal })
    setEditText(getMeal(dayIdx, meal))
  }

  const handleSave = async () => {
    if (!editing) return
    const key = `${editing.dayIdx}-${editing.meal}`
    const newMeals = { ...meals, [key]: editText }

    if (currentPlan) {
      await update(currentPlan.id, { meals: newMeals })
    } else {
      await add({ weekKey, meals: newMeals })
    }
    setEditing(null)
    setEditText('')
  }

  const today = new Date().getDay() // 0=Sun
  const todayIdx = today === 0 ? 6 : today - 1

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>
          Week of {format(weekStart, 'MMM d, yyyy')}
        </div>
      </div>

      <div className={styles.grid}>
        {DAYS.map((day, dayIdx) => (
          <div key={day} className={styles.dayCol}>
            <div className={`${styles.dayHeader} ${dayIdx === todayIdx ? styles.today : ''}`}>
              {day}
            </div>
            {MEALS.map((meal) => {
              const mealText = getMeal(dayIdx, meal)
              const isEditing = editing?.dayIdx === dayIdx && editing?.meal === meal

              return (
                <div
                  key={meal}
                  className={`${styles.mealSlot} ${mealText ? styles.filled : ''}`}
                  onClick={() => !isEditing && handleSlotClick(dayIdx, meal)}
                >
                  <div className={styles.mealType}>{meal}</div>
                  {isEditing ? (
                    <textarea
                      className={styles.mealInput}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={handleSave}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      autoFocus
                    />
                  ) : mealText ? (
                    <div className={styles.mealText}>{mealText}</div>
                  ) : (
                    <div className={styles.mealEmpty}>+ Add meal</div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
