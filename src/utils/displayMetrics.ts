import type { CalculationResult } from './calculator'
import type { MealInputs, WeightUnit } from '../hooks/useSavedMeals'
import {
  formatCaloriesPer100Grams,
  formatCaloriesPerGram,
  formatCaloriesPerOunce,
  formatCaloriesPerServing,
  formatCookedWeightValue,
  formatEquivalentPackageServings,
  formatRawPerCookedMultiplier,
  formatPortionCalories,
  formatWeightChange,
  getWeightChangeCopy,
  formatRawPackageServings,
  formatTotalCalories,
} from './format'
import { gramsToOunces } from './units'

const SOURCE_LABELS = {
  total: 'Source: total calories',
  per_serving: 'Source: calories per serving',
  insufficient: 'Source: insufficient data',
} as const

export type DisplayMetricsInput = {
  result: CalculationResult
  form: MealInputs
  targetCalories: number | null
  cookedInputUnit: WeightUnit
  cookedOutputUnit: WeightUnit
}

export type DisplayMetrics = {
  // Zone 1
  totalCaloriesText: string
  rawServingsText: string
  caloriesPerServingText: string
  sourceLabel: string
  // Zone 2
  cookedInputValue: number | null
  primaryDensityLabel: string
  primaryDensityValue: string
  secondaryDensityLabel: string
  secondaryDensityValue: string
  caloriesPer100GramsValue: string
  weightChangeText: string
  weightChangeCopy: string
  hasWeightChange: boolean
  rawPerCookedMultiplierText: string
  isPrimaryDensityMuted: boolean
  // Zone 3
  referenceServingText: string
  targetPortionText: string
  servingsEatenText: string
  rawEquivalentEatenText: string
  portionCaloriesText: string
}

export function computeDisplayMetrics({
  result,
  form,
  targetCalories,
  cookedInputUnit,
  cookedOutputUnit,
}: DisplayMetricsInput): DisplayMetrics {
  const totalCaloriesText = formatTotalCalories(
    result.totalCalories,
    result.totalCaloriesDisplaySource,
  )
  const rawServingsText = formatRawPackageServings(result.rawPackageServings)
  const caloriesPerServingText = formatCaloriesPerServing(
    form.mode === 'total' && form.totalCaloriesSource === 'packageLabel'
      ? form.packageCaloriesPerServing
      : result.caloriesPerServing,
  )
  const sourceLabel = SOURCE_LABELS[result.calorie_source_used]
  const cookedInputValue =
    form.cookedWeightGrams === null
      ? null
      : cookedInputUnit === 'oz'
        ? Number(gramsToOunces(form.cookedWeightGrams).toFixed(3))
        : form.cookedWeightGrams
  const isOz = cookedOutputUnit === 'oz'
  const primaryDensityLabel = isOz ? 'Calories per ounce' : 'Calories per gram'
  const primaryDensityValue = isOz
    ? formatCaloriesPerOunce(result.caloriesPerOunce)
    : formatCaloriesPerGram(result.caloriesPerGram)
  const secondaryDensityLabel = isOz ? 'Calories per gram' : 'Calories per ounce'
  const secondaryDensityValue = isOz
    ? formatCaloriesPerGram(result.caloriesPerGram)
    : formatCaloriesPerOunce(result.caloriesPerOunce)
  const caloriesPer100GramsValue = formatCaloriesPer100Grams(result.caloriesPer100Grams)
  const weightChangeText = formatWeightChange(
    result.weightChangeGrams,
    result.weightChangePercent,
    cookedOutputUnit,
  )
  const weightChangeCopy = getWeightChangeCopy(result.weightChangeDirection)
  const hasWeightChange = weightChangeText !== '—'
  const rawPerCookedMultiplierText = formatRawPerCookedMultiplier(result.rawPerCookedMultiplier)
  const isPrimaryDensityMuted =
    primaryDensityValue === '—' || primaryDensityValue === 'Need cooked weight'
  const targetPortionGrams =
    targetCalories !== null && result.caloriesPerGram !== null
      ? targetCalories / result.caloriesPerGram
      : null
  const referenceServingText = formatCookedWeightValue(
    result.cookedWeightPerPackageServingGrams,
    cookedOutputUnit,
  )
  const targetPortionText = formatCookedWeightValue(targetPortionGrams, cookedOutputUnit)
  const servingsEatenText = formatEquivalentPackageServings(result.equivalentPackageServingsEaten)
  const rawEquivalentEatenText = formatCookedWeightValue(
    result.rawEquivalentEatenGrams,
    cookedOutputUnit,
  )
  const portionCaloriesText = formatPortionCalories(result.portionCalories)

  return {
    totalCaloriesText,
    rawServingsText,
    caloriesPerServingText,
    sourceLabel,
    cookedInputValue,
    primaryDensityLabel,
    primaryDensityValue,
    secondaryDensityLabel,
    secondaryDensityValue,
    caloriesPer100GramsValue,
    weightChangeText,
    weightChangeCopy,
    hasWeightChange,
    rawPerCookedMultiplierText,
    isPrimaryDensityMuted,
    referenceServingText,
    targetPortionText,
    servingsEatenText,
    rawEquivalentEatenText,
    portionCaloriesText,
  }
}
