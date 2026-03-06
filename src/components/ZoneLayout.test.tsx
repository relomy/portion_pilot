import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { MealInputs, WeightUnit } from '../hooks/useSavedMeals'
import { calculateMealMetrics, ouncesToGrams } from '../utils/calculator'
import { ZoneLayout, type ZoneLayoutProps } from './ZoneLayout'

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

function toGrams(value: number | null, unit: WeightUnit): number | null {
  if (value === null) {
    return null
  }

  return unit === 'oz' ? ouncesToGrams(value) : value
}

function buildProps(overrides: Partial<MealInputs> = {}): ZoneLayoutProps {
  const form: MealInputs = { ...baseForm, ...overrides }
  const result = calculateMealMetrics({
    mode: form.mode,
    totalCaloriesSource: form.totalCaloriesSource,
    manualTotalCalories:
      form.mode === 'total' && form.totalCaloriesSource === 'manualTotal'
        ? form.manualTotalCalories
        : null,
    totalCalories:
      form.mode === 'total' && form.totalCaloriesSource === 'manualTotal'
        ? form.manualTotalCalories
        : null,
    cookedWeightGrams: form.cookedWeightGrams,
    portionEatenGrams:
      form.mode === 'total'
        ? toGrams(form.portionEaten, form.portionEatenUnit)
        : null,
    yourServings: form.yourServings,
    caloriesPerServing:
      form.mode === 'perServing' ? form.caloriesPerServing : null,
    rawTotalWeightGrams:
      form.mode === 'total' && form.totalCaloriesSource === 'packageLabel'
        ? toGrams(form.rawTotalWeight, form.rawTotalWeightUnit)
        : null,
    packageServingWeightGrams:
      form.mode === 'total' && form.totalCaloriesSource === 'packageLabel'
        ? toGrams(form.packageServingWeight, form.packageServingWeightUnit)
        : null,
    packageCaloriesPerServing:
      form.mode === 'total' && form.totalCaloriesSource === 'packageLabel'
        ? form.packageCaloriesPerServing
        : null,
  })

  return {
    form,
    result,
    hasConflictingCalories: false,
    targetCalories: null,
    cookedOutputUnit: 'g',
    onTextChange: () => {},
    onNumberChange: () => {},
    onUnitChange: () => {},
    onModeChange: () => {},
    onTotalSourceChange: () => {},
    onTargetCaloriesChange: () => {},
    onCookedOutputUnitChange: () => {},
    onSave: () => {},
    onClear: () => {},
  }
}

describe('ZoneLayout', () => {
  it('renders three zones in order', () => {
    render(<ZoneLayout {...buildProps()} />)

    const zones = screen.getAllByTestId(/^zone-/)
    expect(zones[0]).toHaveAttribute('data-testid', 'zone-package')
    expect(zones[1]).toHaveAttribute('data-testid', 'zone-cooked')
    expect(zones[2]).toHaveAttribute('data-testid', 'zone-portion')
  })

  it('renders zone eyebrows and titles', () => {
    render(<ZoneLayout {...buildProps()} />)

    expect(screen.getByText(/before cooking/i)).toBeInTheDocument()
    expect(screen.getByText(/package/i)).toBeInTheDocument()
    expect(screen.getByText(/after cooking/i)).toBeInTheDocument()
    expect(screen.getByText(/cooked batch/i)).toBeInTheDocument()
    expect(screen.getByText(/at the plate/i)).toBeInTheDocument()
    expect(screen.getByText(/portion guide/i)).toBeInTheDocument()
  })

  it('renders Zone 1 package label inputs', () => {
    render(<ZoneLayout {...buildProps()} />)

    const zone = screen.getByTestId('zone-package')
    expect(within(zone).getByLabelText(/^serving weight$/i)).toBeInTheDocument()
    expect(within(zone).getByLabelText(/^calories \/ serving$/i)).toBeInTheDocument()
    expect(within(zone).getByLabelText(/^raw total weight$/i)).toBeInTheDocument()
  })

  it('renders Zone 1 derived values with dashes when inputs are empty', () => {
    render(<ZoneLayout {...buildProps()} />)

    const zone = screen.getByTestId('zone-package')
    expect(within(zone).getByTestId('derived-total-cal')).toHaveTextContent('—')
    expect(within(zone).getByTestId('derived-raw-servings')).toHaveTextContent('—')
    expect(within(zone).getByTestId('derived-cal-serving')).toHaveTextContent('—')
  })

  it('renders Zone 1 derived values when inputs are populated', () => {
    render(
      <ZoneLayout
        {...buildProps({
          rawTotalWeight: 458,
          packageServingWeight: 130,
          packageCaloriesPerServing: 370,
        })}
      />,
    )

    const zone = screen.getByTestId('zone-package')
    expect(within(zone).getByTestId('derived-total-cal')).not.toHaveTextContent('—')
  })
})
