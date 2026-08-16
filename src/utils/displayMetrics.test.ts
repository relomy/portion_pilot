import { describe, expect, it } from 'vitest'
import type { MealInputs } from '../hooks/useSavedMeals'
import { calculateFromForm } from './mealMetrics'
import { computeDisplayMetrics } from './displayMetrics'
import { GRAMS_PER_OUNCE } from './units'

function makeForm(overrides: Partial<MealInputs> = {}): MealInputs {
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
    ...overrides,
  }
}

function makeInput(
  formOverrides: Partial<MealInputs> = {},
  opts: {
    targetCalories?: number | null
    cookedInputUnit?: 'g' | 'oz'
    cookedOutputUnit?: 'g' | 'oz'
  } = {},
) {
  const form = makeForm(formOverrides)
  return {
    result: calculateFromForm(form),
    form,
    targetCalories: opts.targetCalories ?? null,
    cookedInputUnit: opts.cookedInputUnit ?? 'g',
    cookedOutputUnit: opts.cookedOutputUnit ?? 'g',
  }
}

describe('computeDisplayMetrics', () => {
  describe('Zone 1', () => {
    it('shows — for totalCaloriesText when data is missing', () => {
      const dm = computeDisplayMetrics(makeInput())
      expect(dm.totalCaloriesText).toBe('—')
    })

    it('formats totalCaloriesText from manual total', () => {
      const dm = computeDisplayMetrics(
        makeInput({ mode: 'total', totalCaloriesSource: 'manualTotal', manualTotalCalories: 900 }),
      )
      expect(dm.totalCaloriesText).toBe('900')
    })

    it('uses form.packageCaloriesPerServing for caloriesPerServingText in packageLabel mode', () => {
      const dm = computeDisplayMetrics(
        makeInput({
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          packageCaloriesPerServing: 140,
        }),
      )
      expect(dm.caloriesPerServingText).toBe('140')
    })

    it('uses result.caloriesPerServing for caloriesPerServingText in perServing mode', () => {
      const dm = computeDisplayMetrics(
        makeInput({
          mode: 'perServing',
          caloriesPerServing: 250,
          yourServings: 4,
          cookedWeightGrams: 500,
        }),
      )
      expect(dm.caloriesPerServingText).toBe('250')
    })

    it('shows correct sourceLabel for each calorie source', () => {
      const manualDm = computeDisplayMetrics(
        makeInput({ mode: 'total', totalCaloriesSource: 'manualTotal', manualTotalCalories: 500 }),
      )
      expect(manualDm.sourceLabel).toBe('Source: total calories')

      const emptyDm = computeDisplayMetrics(makeInput())
      expect(emptyDm.sourceLabel).toBe('Source: insufficient data')
    })
  })

  describe('Zone 2', () => {
    it('returns null cookedInputValue when cookedWeightGrams is null', () => {
      const dm = computeDisplayMetrics(makeInput({ cookedWeightGrams: null }))
      expect(dm.cookedInputValue).toBeNull()
    })

    it('passes cookedWeightGrams through unchanged in g mode', () => {
      const dm = computeDisplayMetrics(makeInput({ cookedWeightGrams: 450 }))
      expect(dm.cookedInputValue).toBe(450)
    })

    it('converts cookedInputValue to oz when cookedInputUnit is oz', () => {
      const grams = 450
      const dm = computeDisplayMetrics(
        makeInput({ cookedWeightGrams: grams }, { cookedInputUnit: 'oz' }),
      )
      expect(dm.cookedInputValue).toBeCloseTo(grams * (1 / GRAMS_PER_OUNCE), 2)
    })

    it('sets primaryDensityLabel and secondaryDensityLabel correctly for g output', () => {
      const dm = computeDisplayMetrics(makeInput({}, { cookedOutputUnit: 'g' }))
      expect(dm.primaryDensityLabel).toBe('Calories per gram')
      expect(dm.secondaryDensityLabel).toBe('Calories per ounce')
    })

    it('swaps density labels when cookedOutputUnit is oz', () => {
      const dm = computeDisplayMetrics(makeInput({}, { cookedOutputUnit: 'oz' }))
      expect(dm.primaryDensityLabel).toBe('Calories per ounce')
      expect(dm.secondaryDensityLabel).toBe('Calories per gram')
    })

    it('sets isPrimaryDensityMuted when no cooked weight is available', () => {
      const dm = computeDisplayMetrics(makeInput({ cookedWeightGrams: null }))
      expect(dm.isPrimaryDensityMuted).toBe(true)
    })

    it('clears isPrimaryDensityMuted when density is computable', () => {
      const dm = computeDisplayMetrics(
        makeInput({
          mode: 'total',
          totalCaloriesSource: 'manualTotal',
          manualTotalCalories: 900,
          cookedWeightGrams: 450,
        }),
      )
      expect(dm.isPrimaryDensityMuted).toBe(false)
    })

    it('sets hasWeightChange only when weight change data is present', () => {
      const noChange = computeDisplayMetrics(makeInput())
      expect(noChange.hasWeightChange).toBe(false)

      const withChange = computeDisplayMetrics(
        makeInput({
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          rawTotalWeight: 800,
          packageServingWeight: 100,
          packageCaloriesPerServing: 140,
          cookedWeightGrams: 600,
        }),
      )
      expect(withChange.hasWeightChange).toBe(true)
    })
  })

  describe('Zone 3', () => {
    it('shows — for targetPortionText when targetCalories is null', () => {
      const dm = computeDisplayMetrics(makeInput({}, { targetCalories: null }))
      expect(dm.targetPortionText).toBe('—')
    })

    it('computes targetPortionText from targetCalories and caloriesPerGram', () => {
      const dm = computeDisplayMetrics(
        makeInput(
          {
            mode: 'total',
            totalCaloriesSource: 'manualTotal',
            manualTotalCalories: 900,
            cookedWeightGrams: 450,
          },
          { targetCalories: 300 },
        ),
      )
      // 900 cal / 450g = 2 cal/g; 300 cal / 2 cal/g = 150g
      expect(dm.targetPortionText).toBe('150 g')
    })

    it('formats portionCaloriesText as — when portion is not entered', () => {
      const dm = computeDisplayMetrics(makeInput())
      expect(dm.portionCaloriesText).toBe('—')
    })
  })
})
