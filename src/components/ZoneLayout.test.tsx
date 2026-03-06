import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  it('renders the masthead kicker, title, and subtitle', () => {
    render(<ZoneLayout {...buildProps()} />)

    expect(screen.getByText(/meal calorie calculator/i)).toBeInTheDocument()
    expect(screen.getByText(/cook once/i)).toBeInTheDocument()
  })

  it('renders total calories mode and per serving mode toggles', () => {
    render(<ZoneLayout {...buildProps()} />)

    expect(
      screen.getByRole('radio', { name: /total calories/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /per serving/i })).toBeInTheDocument()
  })

  it('renders save meal and clear buttons', () => {
    render(<ZoneLayout {...buildProps()} />)

    expect(screen.getByRole('button', { name: /save meal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^clear$/i })).toBeInTheDocument()
  })

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
    expect(
      screen.getByRole('heading', { level: 2, name: /^package$/i }),
    ).toBeInTheDocument()
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

  it('renders Total calories input in manual total source mode', () => {
    render(
      <ZoneLayout
        {...buildProps({
          mode: 'total',
          totalCaloriesSource: 'manualTotal',
        })}
      />,
    )

    const zone = screen.getByTestId('zone-package')
    expect(
      within(zone).getByLabelText(/^total calories$/i, { selector: 'input[type="number"]' }),
    ).toBeInTheDocument()
    expect(
      within(zone).queryByLabelText(/^raw total weight$/i),
    ).not.toBeInTheDocument()
  })

  it('renders per-serving inputs in per serving mode', () => {
    render(<ZoneLayout {...buildProps({ mode: 'perServing' })} />)

    const zone = screen.getByTestId('zone-package')
    expect(
      within(zone).getByLabelText(/^calories per serving$/i),
    ).toBeInTheDocument()
    expect(
      within(zone).getByLabelText(/^servings \(optional\)$/i),
    ).toBeInTheDocument()
    expect(
      within(zone).queryByLabelText(/^raw total weight$/i),
    ).not.toBeInTheDocument()
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

  it('renders Zone 2 cooked weight input', () => {
    render(<ZoneLayout {...buildProps()} />)

    const zone = screen.getByTestId('zone-cooked')
    expect(within(zone).getByLabelText(/cooked.*weight/i)).toBeInTheDocument()
  })

  it('renders Zone 2 density block with formatter copy when cooked weight is absent', () => {
    render(
      <ZoneLayout
        {...buildProps({
          rawTotalWeight: 458,
          packageServingWeight: 130,
          packageCaloriesPerServing: 370,
        })}
      />,
    )

    const zone = screen.getByTestId('zone-cooked')
    expect(within(zone).getByTestId('density-primary')).toHaveTextContent(
      /need cooked weight/i,
    )
    expect(zone.querySelector('.density-primary__value')).toHaveClass(
      'density-primary__value--empty',
    )
    expect(within(zone).getByTestId('density-secondary')).toBeInTheDocument()
  })

  it('shows insufficient source copy when calculation data is incomplete', () => {
    render(<ZoneLayout {...buildProps()} />)

    expect(screen.getByText(/^source: insufficient data$/i)).toBeInTheDocument()
  })

  it('uses the DevPanel contract for debug diagnostics payload', async () => {
    const user = userEvent.setup()
    render(<ZoneLayout {...buildProps({ rawTotalWeight: 560 })} />)

    await user.click(screen.getByRole('button', { name: /show debug details/i }))
    expect(screen.getByText(/"hasConflictingCalories": false/i)).toBeInTheDocument()
    expect(screen.getByText(/"form":/i)).toBeInTheDocument()
    expect(screen.getByText(/"result":/i)).toBeInTheDocument()
  })

  it('renders Zone 2 weight change callout with dash when weights are absent', () => {
    render(<ZoneLayout {...buildProps()} />)

    expect(screen.getByTestId('weight-change-callout')).toHaveTextContent('—')
  })

  it('renders Zone 2 weight change callout with value and direction copy when weights are present', () => {
    render(
      <ZoneLayout
        {...buildProps({
          rawTotalWeight: 560,
          packageServingWeight: 134,
          packageCaloriesPerServing: 370,
          cookedWeightGrams: 744,
        })}
      />,
    )

    expect(screen.getByTestId('weight-change-callout')).toHaveTextContent(
      /gained|lost/i,
    )
  })

  it('renders Zone 3 portion eaten and target calories inputs', () => {
    render(<ZoneLayout {...buildProps()} />)

    const zone = screen.getByTestId('zone-portion')
    expect(within(zone).getByLabelText(/portion eaten/i)).toBeInTheDocument()
    expect(within(zone).getByLabelText(/target cal/i)).toBeInTheDocument()
  })

  it('renders the pkg serving reference row as muted and always visible', () => {
    render(<ZoneLayout {...buildProps()} />)

    const zone = screen.getByTestId('zone-portion')
    expect(within(zone).getByTestId('ref-pkg-serving')).toBeInTheDocument()
    expect(within(zone).getByTestId('ref-pkg-serving')).toHaveTextContent('—')
  })

  it('renders answer rows with dashes when prerequisites are missing', () => {
    render(<ZoneLayout {...buildProps()} />)

    const zone = screen.getByTestId('zone-portion')
    expect(within(zone).getByTestId('answer-target-portion')).toHaveTextContent('—')
    expect(within(zone).getByTestId('answer-pkg-servings-eaten')).toHaveTextContent(
      '—',
    )
    expect(within(zone).getByTestId('hero-portion-cal')).toHaveTextContent('—')
  })

  it('renders hero portion calories when all inputs are present', () => {
    render(
      <ZoneLayout
        {...buildProps({
          rawTotalWeight: 560,
          packageServingWeight: 134,
          packageCaloriesPerServing: 370,
          cookedWeightGrams: 744,
          portionEaten: 192.5,
        })}
      />,
    )

    expect(screen.getByTestId('hero-portion-cal')).not.toHaveTextContent('—')
  })
})
