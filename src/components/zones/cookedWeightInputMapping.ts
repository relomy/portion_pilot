import { gramsToOunces, ouncesToGrams } from '../../utils/calculator'
import type { WeightUnit } from '../../hooks/useSavedMeals'

function roundForInput(value: number, maxDecimals = 3): number {
  return Number(value.toFixed(maxDecimals))
}

export function toCookedInputDisplayValue(
  cookedWeightGrams: number | null,
  cookedInputUnit: WeightUnit,
): number | null {
  if (cookedWeightGrams === null) {
    return null
  }

  return cookedInputUnit === 'oz'
    ? roundForInput(gramsToOunces(cookedWeightGrams), 3)
    : cookedWeightGrams
}

export function toCanonicalCookedWeightGrams(
  cookedInputValue: number | null,
  cookedInputUnit: WeightUnit,
): number | null {
  if (cookedInputValue === null) {
    return null
  }

  return cookedInputUnit === 'oz'
    ? ouncesToGrams(cookedInputValue)
    : cookedInputValue
}
