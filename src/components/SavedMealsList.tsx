import type { SavedMeal } from '../hooks/useSavedMeals'
import { MealCard } from './MealCard'

type SavedMealsListProps = {
  meals: SavedMeal[]
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}

export function SavedMealsList({
  meals,
  onLoad,
  onDelete,
}: SavedMealsListProps) {
  return (
    <section className="saved-meals-placeholder" data-testid="saved-meals-region">
      <p className="eyebrow">Saved meals</p>
      <h2>Meal prep shelf</h2>

      {meals.length === 0 ? (
        <p className="saved-meals-empty">
          Save a meal to keep a reusable prep card on the shelf.
        </p>
      ) : (
        <div className="saved-meals-grid">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onLoad={onLoad}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}
