import styles from './RecipeSuggestions.module.css'

const RECIPES = [
  { name: 'Pasta Marinara', emoji: '🍝', time: '20 min', keywords: ['pasta', 'tomato', 'garlic', 'olive oil'], ingredients: ['pasta', 'canned tomatoes', 'garlic', 'olive oil', 'onion'] },
  { name: 'Fried Rice', emoji: '🍳', time: '15 min', keywords: ['rice', 'egg'], ingredients: ['rice', 'eggs', 'soy sauce', 'vegetables', 'garlic'] },
  { name: 'Banana Pancakes', emoji: '🥞', time: '15 min', keywords: ['banana', 'egg', 'flour'], ingredients: ['bananas', 'eggs', 'flour', 'milk', 'baking powder'] },
  { name: 'Greek Salad', emoji: '🥗', time: '10 min', keywords: ['cucumber', 'tomato', 'olives', 'feta'], ingredients: ['cucumbers', 'tomatoes', 'olives', 'feta cheese', 'red onion'] },
  { name: 'Tomato Soup', emoji: '🍲', time: '25 min', keywords: ['tomato', 'onion', 'garlic'], ingredients: ['canned tomatoes', 'onion', 'garlic', 'cream', 'basil'] },
  { name: 'Avocado Toast', emoji: '🥑', time: '5 min', keywords: ['avocado', 'bread'], ingredients: ['avocado', 'bread', 'lemon', 'salt', 'pepper'] },
  { name: 'Stir Fry', emoji: '🥡', time: '20 min', keywords: ['vegetables', 'soy sauce', 'garlic'], ingredients: ['mixed vegetables', 'soy sauce', 'garlic', 'ginger', 'sesame oil'] },
  { name: 'Oatmeal Bowl', emoji: '🥣', time: '10 min', keywords: ['oats', 'milk'], ingredients: ['oats', 'milk', 'banana', 'honey', 'berries'] },
  { name: 'Scrambled Eggs', emoji: '🍳', time: '5 min', keywords: ['egg', 'butter'], ingredients: ['eggs', 'butter', 'salt', 'pepper', 'cheese'] },
  { name: 'Lentil Soup', emoji: '🥣', time: '35 min', keywords: ['lentil', 'onion', 'carrot'], ingredients: ['lentils', 'onion', 'carrots', 'garlic', 'cumin'] },
  { name: 'Cheese Quesadilla', emoji: '🌮', time: '10 min', keywords: ['tortilla', 'cheese'], ingredients: ['tortillas', 'cheese', 'salsa', 'sour cream', 'peppers'] },
  { name: 'Hummus & Veggies', emoji: '🥙', time: '5 min', keywords: ['chickpea', 'tahini', 'garlic'], ingredients: ['chickpeas', 'tahini', 'garlic', 'lemon', 'olive oil'] },
  { name: 'Chicken Noodle Soup', emoji: '🍜', time: '40 min', keywords: ['chicken', 'noodles', 'carrot'], ingredients: ['chicken', 'egg noodles', 'carrots', 'celery', 'onion'] },
  { name: 'Pesto Pasta', emoji: '🍝', time: '15 min', keywords: ['pasta', 'basil', 'pine nuts'], ingredients: ['pasta', 'basil', 'pine nuts', 'parmesan', 'garlic'] },
  { name: 'Bean Tacos', emoji: '🌮', time: '15 min', keywords: ['beans', 'tortilla'], ingredients: ['black beans', 'tortillas', 'cheese', 'salsa', 'avocado'] },
  { name: 'Veggie Omelette', emoji: '🍳', time: '10 min', keywords: ['egg', 'spinach', 'mushroom'], ingredients: ['eggs', 'spinach', 'mushrooms', 'cheese', 'onion'] },
  { name: 'Smoothie Bowl', emoji: '🥤', time: '5 min', keywords: ['banana', 'berries', 'yogurt'], ingredients: ['frozen berries', 'banana', 'yogurt', 'honey', 'granola'] },
  { name: 'Rice & Beans', emoji: '🍚', time: '25 min', keywords: ['rice', 'beans'], ingredients: ['rice', 'black beans', 'cumin', 'garlic', 'onion'] },
  { name: 'Garlic Bread', emoji: '🍞', time: '10 min', keywords: ['bread', 'garlic', 'butter'], ingredients: ['bread', 'garlic', 'butter', 'parsley'] },
  { name: 'Granola with Milk', emoji: '🥣', time: '2 min', keywords: ['granola', 'milk'], ingredients: ['granola', 'milk', 'berries', 'honey'] },
  { name: 'Tuna Salad', emoji: '🥗', time: '5 min', keywords: ['tuna', 'mayonnaise'], ingredients: ['canned tuna', 'mayonnaise', 'celery', 'lemon', 'bread'] },
  { name: 'Mashed Potatoes', emoji: '🥔', time: '25 min', keywords: ['potato', 'butter', 'milk'], ingredients: ['potatoes', 'butter', 'milk', 'salt', 'cream'] },
]

function checkMatch(recipe, pantryItems) {
  const pantryNames = pantryItems.map((i) => i.name.toLowerCase())
  let matched = 0
  for (const ingredient of recipe.ingredients) {
    const inStock = pantryNames.some((n) => n.includes(ingredient) || ingredient.includes(n.split(' ')[0]))
    if (inStock) matched++
  }
  return { matched, total: recipe.ingredients.length }
}

export default function RecipeSuggestions({ items = [] }) {
  const foodItems = items.filter((i) => i.category === 'food')

  const scored = RECIPES.map((recipe) => {
    const { matched, total } = checkMatch(recipe, foodItems)
    return { ...recipe, matched, total, score: matched / total }
  })
    .filter((r) => r.matched > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  const pantryNames = foodItems.map((i) => i.name.toLowerCase())

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>Recipe Suggestions</div>
        <div className={styles.sub}>
          Based on {foodItems.length} items in your pantry
        </div>
      </div>

      {scored.length === 0 ? (
        <p className="text-muted text-sm">Add more food items to get recipe suggestions.</p>
      ) : (
        <div className={styles.grid}>
          {scored.map((recipe) => (
            <div key={recipe.name} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.recipeEmoji}>{recipe.emoji}</span>
                <div className={styles.recipeMeta}>
                  <div className={styles.recipeName}>{recipe.name}</div>
                  <div className={styles.recipeTiming}>⏱️ {recipe.time}</div>
                </div>
                <span className={styles.matchScore}>
                  {recipe.matched}/{recipe.total} in stock
                </span>
              </div>
              <div className={styles.ingredients}>
                <div className={styles.ingredientLabel}>Ingredients</div>
                {recipe.ingredients.map((ing) => {
                  const inStock = pantryNames.some((n) => n.includes(ing) || ing.includes(n.split(' ')[0]))
                  return (
                    <div key={ing} className={`${styles.ingredient} ${inStock ? styles.inStock : styles.missing}`}>
                      {inStock ? '✓' : '○'} {ing}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
