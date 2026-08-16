import type { WeightUnit } from '../hooks/useSavedMeals'

export const GRAMS_PER_OUNCE = 28.349523125
export const OUNCES_PER_GRAM = 0.03527396195

export function ouncesToGrams(oz: number): number {
  return oz * GRAMS_PER_OUNCE
}

export function gramsToOunces(g: number): number {
  return g * OUNCES_PER_GRAM
}

export function toGrams(value: number | null, unit: WeightUnit): number | null {
  if (value === null) return null
  return unit === 'oz' ? ouncesToGrams(value) : value
}
