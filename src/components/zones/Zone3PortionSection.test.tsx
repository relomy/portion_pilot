import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { MealInputs } from '../../hooks/useSavedMeals'
import { Zone3PortionSection } from './Zone3PortionSection'

const totalModeForm: MealInputs = {
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

const perServingModeForm: MealInputs = {
  ...totalModeForm,
  mode: 'perServing',
}

describe('Zone3PortionSection', () => {
  it('renders Zone 3 portion controls for total mode', () => {
    render(
      <Zone3PortionSection
        form={totalModeForm}
        targetCalories={null}
        activeOutputUnit="g"
        referenceServingText="—"
        targetPortionText="—"
        servingsEatenText="—"
        rawEquivalentEatenText="—"
        portionCaloriesText="—"
        onUnitChange={() => {}}
        onCookedOutputUnitChange={() => {}}
        onNumberChange={() => {}}
        onTargetCaloriesChange={() => {}}
      />,
    )

    const zone = screen.getByTestId('zone-portion')
    expect(within(zone).getByLabelText(/portion eaten/i)).toBeInTheDocument()
    expect(within(zone).getByLabelText(/target cal/i)).toBeInTheDocument()
    expect(within(zone).getByTestId('answer-raw-equivalent-eaten')).toHaveTextContent(
      '—',
    )
  })

  it('does not render answer rows in per-serving mode', () => {
    render(
      <Zone3PortionSection
        form={perServingModeForm}
        targetCalories={null}
        activeOutputUnit="g"
        referenceServingText="—"
        targetPortionText="—"
        servingsEatenText="—"
        rawEquivalentEatenText="—"
        portionCaloriesText="—"
        onUnitChange={() => {}}
        onCookedOutputUnitChange={() => {}}
        onNumberChange={() => {}}
        onTargetCaloriesChange={() => {}}
      />,
    )

    const zone = screen.getByTestId('zone-portion')
    expect(
      within(zone).queryByTestId('answer-raw-equivalent-eaten'),
    ).not.toBeInTheDocument()
  })
})
