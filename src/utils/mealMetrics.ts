import type { MealInputs } from '../hooks/useSavedMeals'
import { calculateMealMetrics, type CalculationResult } from './calculator'
import { toGrams } from './units'

export type { CalculationResult }

export function calculateFromForm(form: MealInputs): CalculationResult {
  const isTotalMode = form.mode === 'total'
  const isManualTotal = isTotalMode && form.totalCaloriesSource === 'manualTotal'
  const isPackageLabel = isTotalMode && form.totalCaloriesSource === 'packageLabel'

  return calculateMealMetrics({
    mode: form.mode,
    totalCaloriesSource: form.totalCaloriesSource,
    manualTotalCalories: isManualTotal ? form.manualTotalCalories : null,
    totalCalories: isManualTotal ? form.manualTotalCalories : null,
    cookedWeightGrams: form.cookedWeightGrams,
    portionEatenGrams: isTotalMode
      ? toGrams(form.portionEaten, form.portionEatenUnit)
      : null,
    yourServings: form.mode === 'perServing' ? form.yourServings : null,
    caloriesPerServing: form.mode === 'perServing' ? form.caloriesPerServing : null,
    rawTotalWeightGrams: isPackageLabel
      ? toGrams(form.rawTotalWeight, form.rawTotalWeightUnit)
      : null,
    packageServingWeightGrams: isPackageLabel
      ? toGrams(form.packageServingWeight, form.packageServingWeightUnit)
      : null,
    packageCaloriesPerServing: isPackageLabel
      ? form.packageCaloriesPerServing
      : null,
  })
}
