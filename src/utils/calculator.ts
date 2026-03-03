export type CalculationInput = {
  mode: 'total' | 'perServing'
  totalCaloriesSource: 'manualTotal' | 'packageLabel'
  manualTotalCalories: number | null
  totalCalories: number | null
  cookedWeightGrams: number | null
  yourServings: number | null
  caloriesPerServing: number | null
  rawTotalWeightGrams: number | null
  packageServingWeightGrams: number | null
  packageCaloriesPerServing: number | null
}

export type CalculationResult = {
  totalCalories: number | null
  caloriesPerServing: number | null
  caloriesPerGram: number | null
  caloriesPerOunce: number | null
  caloriesPer100Grams: number | null
  rawPackageServings: number | null
  totalCaloriesDisplaySource:
    | 'manualTotal'
    | 'packageLabel'
    | 'perServing'
    | null
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
  const hasUserServings =
    typeof input.yourServings === 'number' && input.yourServings > 0
  const hasUsableManualTotal =
    typeof input.manualTotalCalories === 'number' &&
    input.manualTotalCalories >= 0
  const hasUsableLegacyTotal =
    typeof input.totalCalories === 'number' && input.totalCalories >= 0
  const hasPerServing =
    typeof input.caloriesPerServing === 'number' &&
    input.caloriesPerServing >= 0
  const hasUsablePackageLabel =
    typeof input.rawTotalWeightGrams === 'number' &&
    input.rawTotalWeightGrams > 0 &&
    typeof input.packageServingWeightGrams === 'number' &&
    input.packageServingWeightGrams > 0 &&
    typeof input.packageCaloriesPerServing === 'number' &&
    input.packageCaloriesPerServing >= 0
  const servingsAssumed =
    input.mode === 'perServing' && hasPerServing && !hasUserServings

  let totalCalories: number | null = null
  let rawPackageServings: number | null = null
  let totalCaloriesDisplaySource: CalculationResult['totalCaloriesDisplaySource'] =
    null
  let source: CalculationResult['calorie_source_used'] = 'insufficient'

  if (input.mode === 'total' && input.totalCaloriesSource === 'packageLabel') {
    if (hasUsablePackageLabel) {
      rawPackageServings =
        input.rawTotalWeightGrams! / input.packageServingWeightGrams!
      totalCalories = rawPackageServings * input.packageCaloriesPerServing!
      totalCaloriesDisplaySource = 'packageLabel'
      source = 'total'
    }
  } else if (input.mode === 'total' && input.totalCaloriesSource === 'manualTotal') {
    if (hasUsableManualTotal || hasUsableLegacyTotal) {
      totalCalories = input.manualTotalCalories ?? input.totalCalories
      totalCaloriesDisplaySource = 'manualTotal'
      source = 'total'
    }
  } else if (input.mode === 'perServing' && hasPerServing) {
    totalCalories =
      input.caloriesPerServing! * (servingsAssumed ? 1 : input.yourServings!)
    totalCaloriesDisplaySource = 'perServing'
    source = 'per_serving'
  }

  const hasWeight =
    typeof input.cookedWeightGrams === 'number' && input.cookedWeightGrams > 0
  const caloriesPerGram =
    totalCalories !== null && hasWeight
      ? totalCalories / input.cookedWeightGrams!
      : null
  const caloriesPerServing =
    source === 'per_serving'
      ? input.caloriesPerServing
      : source === 'total' && totalCalories !== null && hasUserServings
        ? totalCalories / input.yourServings!
        : null

  return {
    totalCalories,
    caloriesPerServing,
    caloriesPerGram,
    caloriesPerOunce:
      caloriesPerGram === null ? null : caloriesPerGram * GRAMS_PER_OUNCE,
    caloriesPer100Grams:
      caloriesPerGram === null ? null : caloriesPerGram * 100,
    rawPackageServings,
    totalCaloriesDisplaySource,
    calorie_source_used: source,
    assumptions: {
      servings_assumed: Boolean(servingsAssumed),
    },
  }
}
