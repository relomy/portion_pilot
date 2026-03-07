import type { MealInputs, WeightUnit } from '../hooks/useSavedMeals'
import { type CalculationInput, ouncesToGrams } from './calculator'

function toGrams(value: number | null, unit: WeightUnit): number | null {
  if (value === null) {
    return null
  }

  return unit === 'oz' ? ouncesToGrams(value) : value
}

export function toCalculationInput(form: MealInputs): CalculationInput {
  const isTotalMode = form.mode === 'total'
  const isManualTotal =
    isTotalMode && form.totalCaloriesSource === 'manualTotal'
  const isPackageLabel =
    isTotalMode && form.totalCaloriesSource === 'packageLabel'

  return {
    mode: form.mode,
    totalCaloriesSource: form.totalCaloriesSource,
    manualTotalCalories: isManualTotal ? form.manualTotalCalories : null,
    totalCalories: isManualTotal ? form.manualTotalCalories : null,
    cookedWeightGrams: form.cookedWeightGrams,
    portionEatenGrams: isTotalMode
      ? toGrams(form.portionEaten, form.portionEatenUnit)
      : null,
    yourServings: form.mode === 'perServing' ? form.yourServings : null,
    caloriesPerServing:
      form.mode === 'perServing' ? form.caloriesPerServing : null,
    rawTotalWeightGrams: isPackageLabel
      ? toGrams(form.rawTotalWeight, form.rawTotalWeightUnit)
      : null,
    packageServingWeightGrams: isPackageLabel
      ? toGrams(form.packageServingWeight, form.packageServingWeightUnit)
      : null,
    packageCaloriesPerServing: isPackageLabel
      ? form.packageCaloriesPerServing
      : null,
  }
}
