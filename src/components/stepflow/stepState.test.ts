import { describe, expect, it } from 'vitest'
import type { CalculationResult } from '../../utils/calculator'
import { getStepStates } from './stepState'

function buildResult(
  overrides: Partial<CalculationResult> = {},
): CalculationResult {
  return {
    totalCalories: null,
    caloriesPerServing: null,
    caloriesPerGram: null,
    caloriesPerOunce: null,
    caloriesPer100Grams: null,
    rawPackageServings: null,
    portionCalories: null,
    cookedWeightPerPackageServingGrams: null,
    equivalentPackageServingsEaten: null,
    rawPerCookedMultiplier: null,
    rawEquivalentEatenGrams: null,
    weightChangeGrams: null,
    weightChangePercent: null,
    weightChangeDirection: null,
    totalCaloriesDisplaySource: null,
    calorie_source_used: 'insufficient',
    assumptions: {
      servings_assumed: false,
    },
    ...overrides,
  }
}

describe('getStepStates', () => {
  it('marks steps as complete strictly from calculation result availability', () => {
    const states = getStepStates({
      result: buildResult({
        totalCalories: 1000,
        caloriesPerGram: 2,
        portionCalories: 250,
      }),
      activeStep: 'step1',
    })

    expect(states.step1.state).toBe('active')
    expect(states.step2.state).toBe('complete')
    expect(states.step3.state).toBe('complete')
  })

  it('keeps downstream steps untouched until prerequisites are complete', () => {
    const states = getStepStates({
      result: buildResult(),
      activeStep: 'step1',
    })

    expect(states.step1.state).toBe('active')
    expect(states.step2.state).toBe('untouched')
    expect(states.step3.state).toBe('untouched')
  })

  it('marks downstream steps incomplete when prerequisites are satisfied but step output is missing', () => {
    const states = getStepStates({
      result: buildResult({ totalCalories: 1200 }),
      activeStep: 'step1',
    })

    expect(states.step2.state).toBe('incomplete')
    expect(states.step3.state).toBe('untouched')
  })

  it('applies active step override even when the selected step is incomplete', () => {
    const states = getStepStates({
      result: buildResult({ totalCalories: 1200 }),
      activeStep: 'step3',
    })

    expect(states.step1.state).toBe('complete')
    expect(states.step2.state).toBe('incomplete')
    expect(states.step3.state).toBe('active')
  })

  it('surfaces missing prerequisite signals for incomplete steps', () => {
    const states = getStepStates({
      result: buildResult(),
      activeStep: 'step3',
    })

    expect(states.step2.state).toBe('incomplete')
    expect(states.step2.missingPrerequisites).toEqual(['step1'])
    expect(states.step3.state).toBe('active')
    expect(states.step3.missingPrerequisites).toEqual(['step1', 'step2'])
  })
})
