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

  it('stacks package-label fields full-width and places calories before serving weight', () => {
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
    expect(zone.querySelector('.field-pair')).not.toBeInTheDocument()

    const caloriesInput = within(zone).getByLabelText(/^calories \/ serving$/i)
    const servingInput = within(zone).getByLabelText(/^serving weight$/i)
    expect(
      caloriesInput.compareDocumentPosition(servingInput) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0)
  })

  it('renders serving and raw weight unit toggles in label rows', () => {
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
    const servingInput = within(zone).getByLabelText(/^serving weight$/i)
    const rawWeightInput = within(zone).getByLabelText(/^raw total weight$/i)
    const servingRow = servingInput
      .closest('.field')
      ?.querySelector('.field__label-row')
    const rawWeightRow = rawWeightInput
      .closest('.field')
      ?.querySelector('.field__label-row')

    expect(servingRow).not.toBeNull()
    expect(rawWeightRow).not.toBeNull()
    expect(
      within(servingRow as HTMLElement).getByRole('group', {
        name: /serving weight unit/i,
      }),
    ).toBeInTheDocument()
    expect(
      within(rawWeightRow as HTMLElement).getByRole('group', {
        name: /raw total weight unit/i,
      }),
    ).toBeInTheDocument()
  })
})
