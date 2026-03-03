export type CalculationInput = {
  totalCalories: number | null
  cookedWeightGrams: number | null
  servings: number | null
  caloriesPerServing: number | null
}

export type CalculationResult = {
  totalCalories: number | null
  caloriesPerServing: number | null
  caloriesPerGram: number | null
  caloriesPerOunce: number | null
  caloriesPer100Grams: number | null
  calorie_source_used: 'total' | 'per_serving' | 'insufficient'
  assumptions: {
    servings_assumed: boolean
  }
}

export const OUNCES_PER_GRAM = 0.03527396195
export const GRAMS_PER_OUNCE = 28.349523125

export function ouncesToGrams(ounces: number): number {
  return ounces * GRAMS_PER_OUNCE
}

export function gramsToOunces(grams: number): number {
  return grams * OUNCES_PER_GRAM
}

export function calculateMealMetrics(input: CalculationInput): CalculationResult {
  const hasUsableTotal =
    typeof input.totalCalories === 'number' && input.totalCalories >= 0
  const hasPerServing =
    typeof input.caloriesPerServing === 'number' &&
    input.caloriesPerServing >= 0
  const servingsAssumed =
    hasPerServing && !(typeof input.servings === 'number' && input.servings > 0)

  const totalCalories = hasUsableTotal
    ? input.totalCalories
    : hasPerServing
      ? input.caloriesPerServing! * (servingsAssumed ? 1 : input.servings!)
      : null

  const source: CalculationResult['calorie_source_used'] = hasUsableTotal
    ? 'total'
    : hasPerServing
      ? 'per_serving'
      : 'insufficient'

  const hasWeight =
    typeof input.cookedWeightGrams === 'number' && input.cookedWeightGrams > 0
  const caloriesPerGram =
    totalCalories !== null && hasWeight
      ? totalCalories / input.cookedWeightGrams!
      : null

  return {
    totalCalories,
    caloriesPerServing: hasPerServing ? input.caloriesPerServing : totalCalories,
    caloriesPerGram,
    caloriesPerOunce:
      caloriesPerGram === null ? null : caloriesPerGram * GRAMS_PER_OUNCE,
    caloriesPer100Grams:
      caloriesPerGram === null ? null : caloriesPerGram * 100,
    calorie_source_used: source,
    assumptions: {
      servings_assumed: Boolean(servingsAssumed),
    },
  }
}
