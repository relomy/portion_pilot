import type { MealInputs } from '../hooks/useSavedMeals'
import type { CalculationResult } from '../utils/calculator'
import { DevPanel } from './DevPanel'
import {
  formatCaloriesPer100Grams,
  formatCaloriesPerGram,
  formatCaloriesPerOunce,
  formatCaloriesPerServing,
  formatRawPackageServings,
  formatTotalCalories,
} from '../utils/format'

const sourceLabels = {
  total: 'Source: total calories',
  per_serving: 'Source: calories per serving',
  insufficient: 'Source: insufficient data',
} as const

type ResultsPanelProps = {
  result: CalculationResult
  hasConflictingCalories: boolean
  form: MealInputs
}

export function ResultsPanel({
  result,
  hasConflictingCalories,
  form,
}: ResultsPanelProps) {
  return (
    <section className="results-panel" data-testid="nutrition-label">
      <p className="eyebrow">Nutrition label</p>
      <h2>Live results</h2>
      <p className="placeholder-value">
        {formatTotalCalories(
          result.totalCalories,
          result.totalCaloriesDisplaySource,
        )}
      </p>
      <p className="placeholder-copy">
        {sourceLabels[result.calorie_source_used]}
      </p>

      {result.assumptions.servings_assumed ? (
        <p className="assumption-note">Assumed 1 serving because none was provided.</p>
      ) : null}

      <DevPanel
        hasConflictingCalories={hasConflictingCalories}
        form={form}
        result={result}
      />

      <dl className="results-metrics" data-testid="results-metrics">
        <div>
          <dt>Raw package servings</dt>
          <dd>{formatRawPackageServings(result.rawPackageServings)}</dd>
        </div>
        <div>
          <dt>Calories per serving</dt>
          <dd>{formatCaloriesPerServing(result.caloriesPerServing)}</dd>
        </div>
        <div>
          <dt>Calories per gram</dt>
          <dd>{formatCaloriesPerGram(result.caloriesPerGram)}</dd>
        </div>
        <div>
          <dt>Calories per ounce</dt>
          <dd>{formatCaloriesPerOunce(result.caloriesPerOunce)}</dd>
        </div>
        <div>
          <dt>Calories per 100g</dt>
          <dd>{formatCaloriesPer100Grams(result.caloriesPer100Grams)}</dd>
        </div>
      </dl>
    </section>
  )
}
