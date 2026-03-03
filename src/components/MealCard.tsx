import type { SavedMeal } from '../hooks/useSavedMeals'
import {
  formatCaloriesPer100Grams,
  formatCaloriesPerGram,
  formatTotalCalories,
} from '../utils/format'

type MealCardProps = {
  meal: SavedMeal
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}

function formatSavedAt(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function MealCard({ meal, onLoad, onDelete }: MealCardProps) {
  const title = meal.inputs.mealName.trim() || 'Untitled meal'

  return (
    <article
      className="meal-card meal-card--prep"
      data-testid={`saved-meal-card-${meal.id}`}
    >
      <div className="meal-card__header">
        <div>
          <p className="eyebrow">Saved {formatSavedAt(meal.createdAt)}</p>
          <h3>{title}</h3>
        </div>
        <p className="meal-card__total">
          {formatTotalCalories(meal.cachedResult.totalCalories)} cal
        </p>
      </div>

      <dl className="meal-card__metrics">
        <div>
          <dt>Cal / g</dt>
          <dd>{formatCaloriesPerGram(meal.cachedResult.caloriesPerGram)}</dd>
        </div>
        <div>
          <dt>Cal / 100g</dt>
          <dd>
            {formatCaloriesPer100Grams(meal.cachedResult.caloriesPer100Grams)}
          </dd>
        </div>
      </dl>

      <div className="meal-card__actions">
        <button type="button" onClick={() => onLoad(meal.id)}>
          Load
        </button>
        <button type="button" onClick={() => onDelete(meal.id)}>
          Delete
        </button>
      </div>
    </article>
  )
}
