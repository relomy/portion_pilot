import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { MealInputs } from '../hooks/useSavedMeals'
import { calculateMealMetrics } from '../utils/calculator'
import { toCalculationInput } from '../utils/toCalculationInput'
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

function buildProps(overrides: Partial<MealInputs> = {}): ZoneLayoutProps {
  const form: MealInputs = { ...baseForm, ...overrides }
  const result = calculateMealMetrics(toCalculationInput(form))

  return {
    form,
    result,
    hasConflictingCalories: false,
    targetCalories: null,
    cookedInputUnit: 'g',
    cookedOutputUnit: 'g',
    savedMeals: [],
    onTextChange: () => {},
    onNumberChange: () => {},
    onUnitChange: () => {},
    onModeChange: () => {},
    onTotalSourceChange: () => {},
    onTargetCaloriesChange: () => {},
    onCookedInputUnitChange: () => {},
    onCookedOutputUnitChange: () => {},
    onLoadMeal: () => {},
    onDeleteMeal: () => {},
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

  it('renders saved meals region from the ZoneLayout path', () => {
    render(<ZoneLayout {...buildProps()} />)

    expect(screen.getByTestId('saved-meals-region')).toBeInTheDocument()
  })

  it('renders shelf meal cards when meals are provided', () => {
    const form: MealInputs = { ...baseForm, mealName: 'Prep bowl' }
    const result = calculateMealMetrics(toCalculationInput(form))
    render(
      <ZoneLayout
        {...buildProps()}
        savedMeals={[
          {
            id: 'meal-1',
            createdAt: '2026-03-07T00:00:00.000Z',
            inputs: form,
            cachedResult: result,
          },
        ]}
      />,
    )

    expect(screen.getByTestId('saved-meal-card-meal-1')).toBeInTheDocument()
  })

  it('renders three zones in order', () => {
    render(<ZoneLayout {...buildProps()} />)

    const packageZone = screen.getByTestId('zone-package')
    const cookedZone = screen.getByTestId('zone-cooked')
    const portionZone = screen.getByTestId('zone-portion')

    expect(
      packageZone.compareDocumentPosition(cookedZone) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0)
    expect(
      cookedZone.compareDocumentPosition(portionZone) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0)
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

  it('marks the selected package unit radios as checked', () => {
    render(
      <ZoneLayout
        {...buildProps({
          packageServingWeightUnit: 'oz',
          rawTotalWeightUnit: 'oz',
        })}
      />,
    )

    const zone = screen.getByTestId('zone-package')
    const servingWeightUnitGroup = within(zone).getByRole('group', {
      name: /serving weight unit/i,
    })
    const rawWeightUnitGroup = within(zone).getByRole('group', {
      name: /raw total weight unit/i,
    })

    expect(
      within(servingWeightUnitGroup).getByRole('radio', { name: /^oz$/i }),
    ).toBeChecked()
    expect(
      within(rawWeightUnitGroup).getByRole('radio', { name: /^oz$/i }),
    ).toBeChecked()
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

  it('keeps calories per serving hidden in total/manual mode', () => {
    render(
      <ZoneLayout
        {...buildProps({
          mode: 'total',
          totalCaloriesSource: 'manualTotal',
          manualTotalCalories: 1200,
          yourServings: 4,
        })}
      />,
    )

    const zone = screen.getByTestId('zone-package')
    expect(within(zone).getByTestId('derived-cal-serving')).toHaveTextContent('—')
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
    expect(within(zone).getByLabelText(/^cooked weight$/i)).toBeInTheDocument()
  })

  it('renders cooked weight with a g/oz unit toggle in Zone 2', () => {
    render(<ZoneLayout {...buildProps()} />)

    const zone = screen.getByTestId('zone-cooked')
    expect(within(zone).getByLabelText(/^cooked weight$/i)).toBeInTheDocument()
    expect(
      within(zone).getByRole('group', { name: /cooked weight unit/i }),
    ).toBeInTheDocument()
  })

  it('calls onCookedInputUnitChange when cooked weight unit is toggled', async () => {
    const user = userEvent.setup()
    const onCookedInputUnitChange = vi.fn()
    render(
      <ZoneLayout
        {...buildProps()}
        onCookedInputUnitChange={onCookedInputUnitChange}
      />,
    )

    const zone = screen.getByTestId('zone-cooked')
    await user.click(within(zone).getByRole('radio', { name: /^oz$/i }))

    expect(onCookedInputUnitChange).toHaveBeenCalledWith('oz')
  })

  it('converts typed cooked weight ounces to grams before calling onNumberChange', async () => {
    const onNumberChange = vi.fn()
    const onCookedOutputUnitChange = vi.fn()
    render(
      <ZoneLayout
        {...buildProps()}
        cookedInputUnit="oz"
        onNumberChange={onNumberChange}
        onCookedOutputUnitChange={onCookedOutputUnitChange}
      />,
    )

    const zone = screen.getByTestId('zone-cooked')
    fireEvent.change(within(zone).getByLabelText(/^cooked weight$/i), {
      target: { value: '10' },
    })

    expect(onNumberChange).toHaveBeenLastCalledWith(
      'cookedWeightGrams',
      expect.closeTo(283.495, 3),
    )
    expect(onCookedOutputUnitChange).not.toHaveBeenCalled()
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
    expect(screen.getByTestId('raw-per-cooked-multiplier')).toHaveTextContent('—')
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
    expect(screen.getByTestId('raw-per-cooked-multiplier')).toHaveTextContent(
      /x$/,
    )
  })

  it('renders Zone 3 portion eaten and target calories inputs', () => {
    render(<ZoneLayout {...buildProps()} />)

    const zone = screen.getByTestId('zone-portion')
    expect(within(zone).getByLabelText(/portion eaten/i)).toBeInTheDocument()
    expect(within(zone).getByLabelText(/target cal/i)).toBeInTheDocument()
  })

  it('marks the selected Zone 3 unit radios as checked', () => {
    render(
      <ZoneLayout
        {...buildProps({
          portionEatenUnit: 'oz',
        })}
        cookedOutputUnit="oz"
      />,
    )

    const zone = screen.getByTestId('zone-portion')
    const portionUnitGroup = within(zone).getByRole('group', {
      name: /portion unit/i,
    })
    const displayUnitGroup = within(zone).getByRole('group', {
      name: /display unit/i,
    })

    expect(
      within(portionUnitGroup).getByRole('radio', { name: /^oz$/i }),
    ).toBeChecked()
    expect(
      within(displayUnitGroup).getByRole('radio', { name: /^oz$/i }),
    ).toBeChecked()
  })

  it('does not render Servings (optional) in Zone 3 when mode is perServing', () => {
    render(<ZoneLayout {...buildProps({ mode: 'perServing' })} />)

    const zone = screen.getByTestId('zone-portion')
    expect(
      within(zone).queryByLabelText(/^servings \(optional\)$/i),
    ).not.toBeInTheDocument()
  })

  it('shows per-serving assumption note in Zone 1 when servings are not provided', () => {
    render(
      <ZoneLayout
        {...buildProps({
          mode: 'perServing',
          caloriesPerServing: 450,
          yourServings: null,
        })}
      />,
    )

    const packageZone = screen.getByTestId('zone-package')
    const portionZone = screen.getByTestId('zone-portion')
    expect(
      within(packageZone).getByText(/assumed 1 serving because none was provided\./i),
    ).toBeInTheDocument()
    expect(
      within(portionZone).queryByText(/assumed 1 serving because none was provided\./i),
    ).not.toBeInTheDocument()
  })

  it('hides per-serving assumption note in Zone 1 when servings are provided', () => {
    render(
      <ZoneLayout
        {...buildProps({
          mode: 'perServing',
          caloriesPerServing: 450,
          yourServings: 3,
        })}
      />,
    )

    const packageZone = screen.getByTestId('zone-package')
    expect(
      within(packageZone).queryByText(/assumed 1 serving because none was provided\./i),
    ).not.toBeInTheDocument()
  })

  it('does not render editable controls in Zone 3 when mode is perServing', () => {
    render(<ZoneLayout {...buildProps({ mode: 'perServing' })} />)

    const zone = screen.getByTestId('zone-portion')
    expect(within(zone).queryByLabelText(/portion eaten/i)).not.toBeInTheDocument()
    expect(within(zone).queryByLabelText(/target cal/i)).not.toBeInTheDocument()
  })

  it('does not render answer rows in Zone 3 when mode is perServing', () => {
    render(<ZoneLayout {...buildProps({ mode: 'perServing' })} />)

    const zone = screen.getByTestId('zone-portion')
    expect(within(zone).queryByTestId('ref-pkg-serving')).not.toBeInTheDocument()
    expect(within(zone).queryByTestId('answer-target-portion')).not.toBeInTheDocument()
    expect(
      within(zone).queryByTestId('answer-pkg-servings-eaten'),
    ).not.toBeInTheDocument()
    expect(
      within(zone).queryByTestId('answer-raw-equivalent-eaten'),
    ).not.toBeInTheDocument()
    expect(within(zone).queryByTestId('hero-portion-cal')).not.toBeInTheDocument()
  })

  it('renders Portion eaten in Zone 3 when mode is total', () => {
    render(<ZoneLayout {...buildProps({ mode: 'total' })} />)

    const zone = screen.getByTestId('zone-portion')
    expect(within(zone).getByLabelText(/portion eaten/i)).toBeInTheDocument()
    expect(
      within(zone).queryByLabelText(/^servings \(optional\)$/i),
    ).not.toBeInTheDocument()
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
    expect(within(zone).getByTestId('answer-raw-equivalent-eaten')).toHaveTextContent(
      '—',
    )
    expect(
      within(zone)
        .getByTestId('answer-raw-equivalent-eaten')
        .querySelector('.answer-row__value'),
    ).toHaveClass('answer-row__value--empty')
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

  it('converts ounce-based portion inputs before calculating hero calories', () => {
    render(
      <ZoneLayout
        {...buildProps({
          rawTotalWeight: 16,
          rawTotalWeightUnit: 'oz',
          packageServingWeight: 4,
          packageServingWeightUnit: 'oz',
          packageCaloriesPerServing: 200,
          cookedWeightGrams: 453.59237,
          portionEaten: 2,
          portionEatenUnit: 'oz',
        })}
      />,
    )

    expect(screen.getByTestId('hero-portion-cal')).toHaveTextContent('100')
  })

  it('renders raw-equivalent eaten in ounces when output unit is oz', () => {
    render(
      <ZoneLayout
        {...buildProps({
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          rawTotalWeight: 120,
          cookedWeightGrams: 100,
          portionEaten: 20,
          packageServingWeight: 60,
          packageCaloriesPerServing: 300,
        })}
        cookedOutputUnit="oz"
      />,
    )

    expect(screen.getByTestId('answer-raw-equivalent-eaten')).toHaveTextContent(
      '0.8 oz',
    )
  })
})
