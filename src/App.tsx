import { useState } from 'react'
import { ResultsPanel } from './components/ResultsPanel'
import { InputPanel } from './components/InputPanel'
import { SavedMealsList } from './components/SavedMealsList'
import {
  type MealInputs,
  type MealMode,
  type TotalCaloriesSource,
  type WeightUnit,
  useSavedMeals,
} from './hooks/useSavedMeals'
import { calculateMealMetrics, ouncesToGrams } from './utils/calculator'

function createEmptyForm(): MealInputs {
  return {
    mealName: '',
    mode: 'total',
    totalCaloriesSource: 'packageLabel',
    manualTotalCalories: null,
    totalCalories: null,
    caloriesPerServing: null,
    yourServings: null,
    servings: null,
    cookedWeightGrams: null,
    portionEaten: null,
    portionEatenUnit: 'g',
    rawTotalWeight: null,
    rawTotalWeightUnit: 'g',
    packageServingWeight: null,
    packageServingWeightUnit: 'g',
    packageCaloriesPerServing: null,
  }
}

function toGrams(value: number | null, unit: WeightUnit): number | null {
  if (value === null) {
    return null
  }

  return unit === 'oz' ? ouncesToGrams(value) : value
}

function hasEnteredPackageLabelSource(form: MealInputs): boolean {
  return (
    form.rawTotalWeight !== null ||
    form.packageServingWeight !== null ||
    form.packageCaloriesPerServing !== null
  )
}

function computeHasConflictingCalories(form: MealInputs): boolean {
  if (form.mode === 'perServing') {
    return (
      form.caloriesPerServing !== null &&
      (form.manualTotalCalories !== null || hasEnteredPackageLabelSource(form))
    )
  }

  if (form.totalCaloriesSource === 'manualTotal') {
    return (
      form.manualTotalCalories !== null && form.caloriesPerServing !== null
    )
  }

  return hasEnteredPackageLabelSource(form) && form.caloriesPerServing !== null
}

function App() {
  const [form, setForm] = useState<MealInputs>(createEmptyForm)
  const [targetCalories, setTargetCalories] = useState<number | null>(null)
  const [cookedOutputUnit, setCookedOutputUnit] = useState<WeightUnit>('g')
  const { deleteMeal, loadMeal, saveMeal, savedMeals } = useSavedMeals()
  const hasConflictingCalories = computeHasConflictingCalories(form)

  const result = calculateMealMetrics({
    mode: form.mode,
    totalCaloriesSource: form.totalCaloriesSource,
    manualTotalCalories:
      form.mode === 'total' && form.totalCaloriesSource === 'manualTotal'
        ? form.manualTotalCalories
        : null,
    totalCalories:
      form.mode === 'total' && form.totalCaloriesSource === 'manualTotal'
        ? form.manualTotalCalories
        : null,
    cookedWeightGrams: form.cookedWeightGrams,
    portionEatenGrams:
      form.mode === 'total'
        ? toGrams(form.portionEaten, form.portionEatenUnit)
        : null,
    yourServings: form.yourServings,
    caloriesPerServing:
      form.mode === 'perServing' ? form.caloriesPerServing : null,
    rawTotalWeightGrams:
      form.mode === 'total' && form.totalCaloriesSource === 'packageLabel'
        ? toGrams(form.rawTotalWeight, form.rawTotalWeightUnit)
        : null,
    packageServingWeightGrams:
      form.mode === 'total' && form.totalCaloriesSource === 'packageLabel'
        ? toGrams(
            form.packageServingWeight,
            form.packageServingWeightUnit,
          )
        : null,
    packageCaloriesPerServing:
      form.mode === 'total' && form.totalCaloriesSource === 'packageLabel'
        ? form.packageCaloriesPerServing
        : null,
  })

  function handleTextChange(field: 'mealName', value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleNumberChange(
    field:
      | 'manualTotalCalories'
      | 'caloriesPerServing'
      | 'yourServings'
      | 'cookedWeightGrams'
      | 'portionEaten'
      | 'rawTotalWeight'
      | 'packageServingWeight'
      | 'packageCaloriesPerServing',
    value: number | null,
  ) {
    setForm((current) => {
      if (field === 'manualTotalCalories') {
        return {
          ...current,
          manualTotalCalories: value,
          totalCalories: value,
        }
      }

      if (field === 'yourServings') {
        return {
          ...current,
          yourServings: value,
          servings: value,
        }
      }

      return { ...current, [field]: value }
    })
  }

  function handleUnitChange(
    field:
      | 'rawTotalWeightUnit'
      | 'packageServingWeightUnit'
      | 'portionEatenUnit',
    value: WeightUnit,
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleTotalSourceChange(value: TotalCaloriesSource) {
    setForm((current) => ({ ...current, totalCaloriesSource: value }))
  }

  function updateMode(mode: MealMode) {
    setForm((current) =>
      mode === 'total'
        ? { ...current, mode, caloriesPerServing: null }
        : { ...current, mode },
    )
  }

  function handleSave() {
    saveMeal(form)
  }

  function handleClear() {
    setForm(createEmptyForm())
    setTargetCalories(null)
    setCookedOutputUnit('g')
  }

  function handleLoadMeal(id: string) {
    const loadedMeal = loadMeal(id)

    if (loadedMeal) {
      setForm(loadedMeal.inputs)
      setTargetCalories(null)
      setCookedOutputUnit('g')
    }
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
          onUnitChange={handleUnitChange}
          onModeChange={updateMode}
          onTotalSourceChange={handleTotalSourceChange}
          onSave={handleSave}
          onClear={handleClear}
        />

        <ResultsPanel
          result={result}
          hasConflictingCalories={hasConflictingCalories}
          form={form}
          targetCalories={targetCalories}
          onTargetCaloriesChange={setTargetCalories}
          cookedOutputUnit={cookedOutputUnit}
          onCookedOutputUnitChange={setCookedOutputUnit}
        />
      </div>

      <SavedMealsList
        meals={savedMeals}
        onLoad={handleLoadMeal}
        onDelete={deleteMeal}
      />
    </main>
  )
}

export default App
