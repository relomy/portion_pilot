import { describe, expect, it } from 'vitest'
import type { MealInputs } from '../hooks/useSavedMeals'
import { GRAMS_PER_OUNCE } from './units'
import { calculateFromForm, hasConflictingCalories } from './mealMetrics'

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

describe('calculateFromForm', () => {
  it('computes calorie density from manual total in total mode', () => {
    const result = calculateFromForm(
      makeForm({
        mode: 'total',
        totalCaloriesSource: 'manualTotal',
        manualTotalCalories: 900,
        cookedWeightGrams: 450,
      }),
    )

    expect(result.totalCalories).toBe(900)
    expect(result.caloriesPerGram).toBeCloseTo(2, 10)
    expect(result.totalCaloriesDisplaySource).toBe('manualTotal')
  })

  it('neutralizes per-serving fields when in total manual mode', () => {
    const result = calculateFromForm(
      makeForm({
        mode: 'total',
        totalCaloriesSource: 'manualTotal',
        manualTotalCalories: 900,
        cookedWeightGrams: 450,
        caloriesPerServing: 250,
        yourServings: 3,
      }),
    )

    expect(result.totalCalories).toBe(900)
    expect(result.caloriesPerServing).toBeNull()
  })

  it('derives total calories from package label fields', () => {
    const result = calculateFromForm(
      makeForm({
        mode: 'total',
        totalCaloriesSource: 'packageLabel',
        rawTotalWeight: 680,
        packageServingWeight: 85,
        packageCaloriesPerServing: 140,
        cookedWeightGrams: 600,
      }),
    )

    expect(result.totalCalories).toBeCloseTo(1120, 5)
    expect(result.totalCaloriesDisplaySource).toBe('packageLabel')
  })

  it('neutralizes packageLabel fields when in per-serving mode', () => {
    const result = calculateFromForm(
      makeForm({
        mode: 'perServing',
        caloriesPerServing: 240,
        yourServings: 2,
        cookedWeightGrams: 510,
        rawTotalWeight: 900,
        packageServingWeight: 100,
        packageCaloriesPerServing: 350,
      }),
    )

    expect(result.totalCalories).toBeCloseTo(480, 5)
    expect(result.totalCaloriesDisplaySource).toBe('perServing')
    expect(result.rawPerCookedMultiplier).toBeNull()
  })

  it('converts oz inputs to grams for raw, package, and portion fields', () => {
    const result = calculateFromForm(
      makeForm({
        mode: 'total',
        totalCaloriesSource: 'packageLabel',
        rawTotalWeight: 16,
        rawTotalWeightUnit: 'oz',
        packageServingWeight: 4,
        packageServingWeightUnit: 'oz',
        packageCaloriesPerServing: 140,
        cookedWeightGrams: 16 * GRAMS_PER_OUNCE,
        portionEaten: 2,
        portionEatenUnit: 'oz',
      }),
    )

    expect(result.rawPackageServings).toBeCloseTo(4, 5)
    expect(result.totalCalories).toBeCloseTo(560, 5)
    expect(result.portionCalories).toBeCloseTo(70, 5)
  })
})

describe('hasConflictingCalories', () => {
  it('returns false when only one calorie source is entered', () => {
    expect(
      hasConflictingCalories(makeForm({ mode: 'total', totalCaloriesSource: 'manualTotal', manualTotalCalories: 900 })),
    ).toBe(false)
  })

  it('flags conflict in perServing mode when total-mode fields are also filled', () => {
    expect(
      hasConflictingCalories(
        makeForm({ mode: 'perServing', caloriesPerServing: 250, manualTotalCalories: 900 }),
      ),
    ).toBe(true)
  })

  it('flags conflict in perServing mode when packageLabel fields are also filled', () => {
    expect(
      hasConflictingCalories(
        makeForm({ mode: 'perServing', caloriesPerServing: 250, rawTotalWeight: 500 }),
      ),
    ).toBe(true)
  })

  it('does not flag conflict in perServing mode when only per-serving fields are filled', () => {
    expect(
      hasConflictingCalories(
        makeForm({ mode: 'perServing', caloriesPerServing: 250, yourServings: 4 }),
      ),
    ).toBe(false)
  })

  it('flags conflict in manualTotal mode when caloriesPerServing is also entered', () => {
    expect(
      hasConflictingCalories(
        makeForm({ mode: 'total', totalCaloriesSource: 'manualTotal', manualTotalCalories: 900, caloriesPerServing: 250 }),
      ),
    ).toBe(true)
  })

  it('flags conflict in packageLabel mode when caloriesPerServing is also entered', () => {
    expect(
      hasConflictingCalories(
        makeForm({ mode: 'total', totalCaloriesSource: 'packageLabel', rawTotalWeight: 680, caloriesPerServing: 250 }),
      ),
    ).toBe(true)
  })

  it('does not flag conflict in packageLabel mode without caloriesPerServing', () => {
    expect(
      hasConflictingCalories(
        makeForm({ mode: 'total', totalCaloriesSource: 'packageLabel', rawTotalWeight: 680, packageServingWeight: 85, packageCaloriesPerServing: 140 }),
      ),
    ).toBe(false)
  })
})
