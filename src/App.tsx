import { useState } from 'react'
import { InputPanel } from './components/InputPanel'
import {
  type MealInputs,
  type MealMode,
  useSavedMeals,
} from './hooks/useSavedMeals'
import { calculateMealMetrics } from './utils/calculator'

function createEmptyForm(): MealInputs {
  return {
    mealName: '',
    mode: 'total',
    totalCalories: null,
    caloriesPerServing: null,
    servings: null,
    cookedWeightGrams: null,
  }
}

function App() {
  const [form, setForm] = useState<MealInputs>(createEmptyForm)
  const { saveMeal, savedMeals } = useSavedMeals()

  const result = calculateMealMetrics({
    totalCalories: form.mode === 'total' ? form.totalCalories : null,
    cookedWeightGrams: form.cookedWeightGrams,
    servings: form.servings,
    caloriesPerServing:
      form.mode === 'perServing' ? form.caloriesPerServing : null,
  })

  function handleTextChange(field: 'mealName', value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleNumberChange(
    field:
      | 'totalCalories'
      | 'caloriesPerServing'
      | 'servings'
      | 'cookedWeightGrams',
    value: number | null,
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateMode(mode: MealMode) {
    setForm((current) =>
      mode === 'total'
        ? { ...current, mode, caloriesPerServing: null, servings: null }
        : { ...current, mode, totalCalories: null },
    )
  }

  function handleSave() {
    saveMeal(form)
  }

  function handleClear() {
    setForm(createEmptyForm())
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Meal calorie calculator</p>
        <h1>Cook once, keep the numbers straight.</h1>
        <p className="app-subtitle">
          A kitchen worksheet for home cooks who still want disciplined calorie
          math.
        </p>
      </header>

      <div
        className="calculator-layout calculator-layout--asymmetric"
        data-testid="calculator-layout"
      >
        <InputPanel
          form={form}
          onTextChange={handleTextChange}
          onNumberChange={handleNumberChange}
          onModeChange={updateMode}
          onSave={handleSave}
          onClear={handleClear}
        />

        <section className="results-placeholder" data-testid="nutrition-label">
          <p className="eyebrow">Nutrition label</p>
          <h2>Live results</h2>
          <p className="placeholder-value">
            {result.totalCalories === null ? '—' : result.totalCalories}
          </p>
          <p className="placeholder-copy">
            Source: {result.calorie_source_used.replace('_', ' ')}
          </p>
        </section>
      </div>

      <section className="saved-meals-placeholder" data-testid="saved-meals-region">
        <p className="eyebrow">Saved meals</p>
        <h2>Meal prep shelf</h2>
        <p>{savedMeals.length} saved meal{savedMeals.length === 1 ? '' : 's'}</p>
      </section>
    </main>
  )
}

export default App
