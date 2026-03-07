import { useState } from 'react'
import { SavedMealsList } from './components/SavedMealsList'
import { ZoneLayout } from './components/ZoneLayout'
import {
  type MealInputs,
  type MealMode,
  type TotalCaloriesSource,
  type WeightUnit,
  useSavedMeals,
} from './hooks/useSavedMeals'
import { calculateMealMetrics } from './utils/calculator'
import { toCalculationInput } from './utils/toCalculationInput'

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

  const result = calculateMealMetrics(toCalculationInput(form))

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
      <ZoneLayout
        form={form}
        result={result}
        hasConflictingCalories={hasConflictingCalories}
        targetCalories={targetCalories}
        cookedOutputUnit={cookedOutputUnit}
        onTextChange={handleTextChange}
        onNumberChange={handleNumberChange}
        onUnitChange={handleUnitChange}
        onModeChange={updateMode}
        onTotalSourceChange={handleTotalSourceChange}
        onTargetCaloriesChange={setTargetCalories}
        onCookedOutputUnitChange={setCookedOutputUnit}
        onSave={handleSave}
        onClear={handleClear}
      />

      <SavedMealsList
        meals={savedMeals}
        onLoad={handleLoadMeal}
        onDelete={deleteMeal}
      />
    </main>
  )
}

export default App
