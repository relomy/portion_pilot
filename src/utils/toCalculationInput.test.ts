import { describe, expect, it } from 'vitest'
import type { MealInputs } from '../hooks/useSavedMeals'
import { GRAMS_PER_OUNCE } from './calculator'
import { toCalculationInput } from './toCalculationInput'

function makeForm(overrides: Partial<MealInputs> = {}): MealInputs {
  return {
    mealName: 'Test meal',
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
    ...overrides,
  }
}

describe('toCalculationInput', () => {
  it('forwards manual total fields in total mode and neutralizes per-serving inputs', () => {
    const form = makeForm({
      mode: 'total',
      totalCaloriesSource: 'manualTotal',
      manualTotalCalories: 900,
      cookedWeightGrams: 744,
      portionEaten: 192.5,
      portionEatenUnit: 'g',
      caloriesPerServing: 250,
      yourServings: 3,
    })

    expect(toCalculationInput(form)).toMatchObject({
      mode: 'total',
      totalCaloriesSource: 'manualTotal',
      manualTotalCalories: 900,
      totalCalories: 900,
      cookedWeightGrams: 744,
      portionEatenGrams: 192.5,
      caloriesPerServing: null,
      yourServings: null,
      rawTotalWeightGrams: null,
      packageServingWeightGrams: null,
      packageCaloriesPerServing: null,
    })
  })

  it('forwards package-label fields in total mode and neutralizes per-serving inputs', () => {
    const form = makeForm({
      mode: 'total',
      totalCaloriesSource: 'packageLabel',
      rawTotalWeight: 680,
      packageServingWeight: 85,
      packageCaloriesPerServing: 140,
      caloriesPerServing: 310,
      yourServings: 4,
    })

    expect(toCalculationInput(form)).toMatchObject({
      mode: 'total',
      totalCaloriesSource: 'packageLabel',
      manualTotalCalories: null,
      totalCalories: null,
      rawTotalWeightGrams: 680,
      packageServingWeightGrams: 85,
      packageCaloriesPerServing: 140,
      caloriesPerServing: null,
      yourServings: null,
      portionEatenGrams: null,
    })
  })

  it('forwards per-serving inputs and nulls total-source fields in per-serving mode', () => {
    const form = makeForm({
      mode: 'perServing',
      totalCaloriesSource: 'manualTotal',
      manualTotalCalories: 1200,
      totalCalories: 1200,
      cookedWeightGrams: 510,
      portionEaten: 200,
      rawTotalWeight: 900,
      packageServingWeight: 100,
      packageCaloriesPerServing: 350,
      caloriesPerServing: 240,
      yourServings: 2,
    })

    expect(toCalculationInput(form)).toMatchObject({
      mode: 'perServing',
      caloriesPerServing: 240,
      yourServings: 2,
      manualTotalCalories: null,
      totalCalories: null,
      portionEatenGrams: null,
      rawTotalWeightGrams: null,
      packageServingWeightGrams: null,
      packageCaloriesPerServing: null,
    })
  })

  it('converts ounce inputs to grams for raw/package/portion fields', () => {
    const form = makeForm({
      mode: 'total',
      totalCaloriesSource: 'packageLabel',
      rawTotalWeight: 16.155,
      rawTotalWeightUnit: 'oz',
      packageServingWeight: 4.586,
      packageServingWeightUnit: 'oz',
      portionEaten: 2.5,
      portionEatenUnit: 'oz',
    })

    const mapped = toCalculationInput(form)

    expect(mapped.rawTotalWeightGrams).toBeCloseTo(16.155 * GRAMS_PER_OUNCE, 6)
    expect(mapped.packageServingWeightGrams).toBeCloseTo(
      4.586 * GRAMS_PER_OUNCE,
      6,
    )
    expect(mapped.portionEatenGrams).toBeCloseTo(2.5 * GRAMS_PER_OUNCE, 6)
  })
})
