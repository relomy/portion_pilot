import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { MealInputs } from '../../hooks/useSavedMeals'
import { calculateMealMetrics } from '../../utils/calculator'
import { toCalculationInput } from '../../utils/toCalculationInput'
import { Zone1PackageSection } from './Zone1PackageSection'

const baseForm: MealInputs = {
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
}

describe('Zone1PackageSection', () => {
  it('renders Zone 1 root test id and key package controls', () => {
    const form = { ...baseForm }
    const result = calculateMealMetrics(toCalculationInput(form))
    render(
      <Zone1PackageSection
        form={form}
        result={result}
        totalCaloriesText="—"
        rawServingsText="—"
        caloriesPerServingText="—"
        onTextChange={() => {}}
        onNumberChange={() => {}}
        onUnitChange={() => {}}
        onModeChange={() => {}}
        onTotalSourceChange={() => {}}
      />,
    )

    const zone = screen.getByTestId('zone-package')
    expect(within(zone).getByLabelText(/^meal name$/i)).toBeInTheDocument()
    expect(within(zone).getByLabelText(/^raw total weight$/i)).toBeInTheDocument()
    expect(within(zone).getByLabelText(/^serving weight$/i)).toBeInTheDocument()
    expect(within(zone).getByLabelText(/^calories \/ serving$/i)).toBeInTheDocument()
  })
})
