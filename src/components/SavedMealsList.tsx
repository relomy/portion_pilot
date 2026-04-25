import type { SavedMeal } from '../hooks/useSavedMeals'
import { MealCard } from './MealCard'

type SavedMealsSurface = 'zone' | 'utility'

type SavedMealsListProps = {
  meals: SavedMeal[]
  onLoad: (id: string) => void
  onDelete: (id: string) => void
  surface?: SavedMealsSurface
}

export function SavedMealsList({
  meals,
  onLoad,
  onDelete,
  surface = 'zone',
}: SavedMealsListProps) {
  const isUtilitySurface = surface === 'utility'
  const eyebrowText = isUtilitySurface
    ? 'Utility · Saved meals'
    : 'Zone 4 · Your shelf'

  return (
    <section
      className="zone zone--shelf saved-meals-placeholder"
      data-surface={surface}
      data-testid="saved-meals-region"
    >
      <p className="zone__eyebrow">{eyebrowText}</p>
      <h2 className="zone__title">Meal prep shelf</h2>

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
