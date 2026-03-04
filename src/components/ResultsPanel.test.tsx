import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ResultsPanel } from './ResultsPanel'

describe('ResultsPanel', () => {
  it('shows source-neutral batch calorie stats and cooked batch stats in total mode', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          caloriesPerGram: 2,
          caloriesPerOunce: 56.7,
          caloriesPer100Grams: 200,
          rawPackageServings: 3.5230769,
          portionCalories: 300,
          cookedWeightPerPackageServingGrams: null,
          equivalentPackageServingsEaten: null,
          weightChangeGrams: null,
          weightChangePercent: null,
          weightChangeDirection: null,
          totalCaloriesDisplaySource: 'packageLabel',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Ravioli',
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          manualTotalCalories: null,
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: 300,
          portionEaten: 150,
          portionEatenUnit: 'g',
          rawTotalWeight: 458,
          rawTotalWeightUnit: 'g',
          packageServingWeight: 130,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: 370,
        }}
        portionEaten={150}
        portionEatenUnit="g"
        onPortionEatenChange={() => {}}
        onPortionEatenUnitChange={() => {}}
        targetCalories={null}
        onTargetCaloriesChange={() => {}}
        cookedOutputUnit="g"
        onCookedOutputUnitChange={() => {}}
      />,
    )

    const panel = screen.getByTestId('nutrition-label')

    expect(screen.getByText(/^batch calorie stats$/i)).toBeInTheDocument()
    expect(
      screen.getByText(/^based on raw package weight and label serving size$/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/^cooked batch stats$/i)).toBeInTheDocument()
    expect(
      within(panel).getByTestId('results-section-batch'),
    ).toBeInTheDocument()
    expect(
      within(panel).getByTestId('results-section-cooked'),
    ).toBeInTheDocument()
    expect(
      within(panel).getByTestId('results-section-portion-guide'),
    ).toBeInTheDocument()
    expect(screen.getByText(/^3.523$/i)).toBeInTheDocument()
    expect(screen.getByText(/^300$/i)).toBeInTheDocument()
  })

  it('shows cooked batch stats as unavailable when cooked batch weight is missing', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 500,
          caloriesPerServing: null,
          caloriesPerGram: null,
          caloriesPerOunce: null,
          caloriesPer100Grams: null,
          rawPackageServings: null,
          portionCalories: null,
          cookedWeightPerPackageServingGrams: null,
          equivalentPackageServingsEaten: null,
          weightChangeGrams: null,
          weightChangePercent: null,
          weightChangeDirection: null,
          totalCaloriesDisplaySource: 'manualTotal',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Roasted chicken',
          mode: 'total',
          totalCaloriesSource: 'manualTotal',
          manualTotalCalories: 500,
          totalCalories: 500,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: null,
          portionEaten: 150,
          portionEatenUnit: 'g',
          rawTotalWeight: null,
          rawTotalWeightUnit: 'g',
          packageServingWeight: null,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: null,
        }}
        portionEaten={150}
        portionEatenUnit="g"
        onPortionEatenChange={() => {}}
        onPortionEatenUnitChange={() => {}}
        targetCalories={null}
        onTargetCaloriesChange={() => {}}
        cookedOutputUnit="g"
        onCookedOutputUnitChange={() => {}}
      />,
    )

    expect(screen.getByText(/source: total calories/i)).toBeInTheDocument()
    expect(screen.getByText(/^batch calorie stats$/i)).toBeInTheDocument()
    expect(screen.getByText(/^cooked batch stats$/i)).toBeInTheDocument()
    expect(screen.getByText(/^based on entered batch calories$/i)).toBeInTheDocument()
    expect(screen.getByText(/^needs cooked batch weight$/i)).toBeInTheDocument()
  })

  it('keeps the dev diagnostics drawer for conflicting inputs in development', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 500,
          caloriesPerServing: null,
          caloriesPerGram: null,
          caloriesPerOunce: null,
          caloriesPer100Grams: null,
          rawPackageServings: null,
          portionCalories: null,
          cookedWeightPerPackageServingGrams: null,
          equivalentPackageServingsEaten: null,
          weightChangeGrams: null,
          weightChangePercent: null,
          weightChangeDirection: null,
          totalCaloriesDisplaySource: 'manualTotal',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories
        form={{
          mealName: 'Roasted chicken',
          mode: 'total',
          totalCaloriesSource: 'manualTotal',
          manualTotalCalories: 500,
          totalCalories: 500,
          caloriesPerServing: 125,
          yourServings: 4,
          servings: 4,
          cookedWeightGrams: null,
          portionEaten: null,
          portionEatenUnit: 'g',
          rawTotalWeight: null,
          rawTotalWeightUnit: 'g',
          packageServingWeight: null,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: null,
        }}
        portionEaten={null}
        portionEatenUnit="g"
        onPortionEatenChange={() => {}}
        onPortionEatenUnitChange={() => {}}
        targetCalories={null}
        onTargetCaloriesChange={() => {}}
        cookedOutputUnit="g"
        onCookedOutputUnitChange={() => {}}
      />,
    )

    expect(
      screen.getByRole('button', { name: /show debug details/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /show debug details/i }),
    ).toHaveClass('dev-panel__toggle--quiet')
  })

  it('still updates portion eaten unit from the portion guide', async () => {
    const user = userEvent.setup()

    function WrappedResultsPanel() {
      const [portionEatenUnit, setPortionEatenUnit] = useState<'g' | 'oz'>('g')

      return (
        <ResultsPanel
          result={{
            totalCalories: 1303.5384,
            caloriesPerServing: null,
            caloriesPerGram: 2,
            caloriesPerOunce: 56.7,
            caloriesPer100Grams: 200,
            rawPackageServings: 3.5230769,
            portionCalories: 300,
            cookedWeightPerPackageServingGrams: null,
            equivalentPackageServingsEaten: null,
            weightChangeGrams: null,
            weightChangePercent: null,
            weightChangeDirection: null,
            totalCaloriesDisplaySource: 'packageLabel',
            calorie_source_used: 'total',
            assumptions: { servings_assumed: false },
          }}
          hasConflictingCalories={false}
          form={{
            mealName: 'Ravioli',
            mode: 'total',
            totalCaloriesSource: 'packageLabel',
            manualTotalCalories: null,
            totalCalories: 1303.5384,
            caloriesPerServing: null,
            yourServings: null,
            servings: null,
            cookedWeightGrams: 300,
            portionEaten: 150,
            portionEatenUnit,
            rawTotalWeight: 458,
            rawTotalWeightUnit: 'g',
            packageServingWeight: 130,
            packageServingWeightUnit: 'g',
            packageCaloriesPerServing: 370,
          }}
          portionEaten={150}
          portionEatenUnit={portionEatenUnit}
          onPortionEatenChange={() => {}}
          onPortionEatenUnitChange={setPortionEatenUnit}
          targetCalories={null}
          onTargetCaloriesChange={() => {}}
          cookedOutputUnit="g"
          onCookedOutputUnitChange={() => {}}
        />
      )
    }

    render(<WrappedResultsPanel />)

    const guide = screen.getByTestId('results-section-portion-guide')
    const portionUnitGroup = within(guide).getByRole('group', {
      name: /^portion eaten \(cooked weight\) unit$/i,
    })
    await user.click(within(portionUnitGroup).getByRole('radio', { name: /^oz$/i }))

    expect(
      within(portionUnitGroup).getByRole('radio', { name: /^oz$/i }),
    ).toBeChecked()
  })

  it('keeps all cooked density metrics visible while emphasizing only the active unit row', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          caloriesPerGram: 2,
          caloriesPerOunce: 56.7,
          caloriesPer100Grams: 200,
          rawPackageServings: 3.5230769,
          portionCalories: 300,
          cookedWeightPerPackageServingGrams: 178.0286,
          equivalentPackageServingsEaten: 1.08,
          weightChangeGrams: 184,
          weightChangePercent: 32.857,
          weightChangeDirection: 'gain',
          totalCaloriesDisplaySource: 'packageLabel',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Ravioli',
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          manualTotalCalories: null,
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: 744,
          portionEaten: 192.5,
          portionEatenUnit: 'g',
          rawTotalWeight: 560,
          rawTotalWeightUnit: 'g',
          packageServingWeight: 134,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: 370,
        }}
        portionEaten={192.5}
        portionEatenUnit="g"
        onPortionEatenChange={() => {}}
        onPortionEatenUnitChange={() => {}}
        targetCalories={400}
        onTargetCaloriesChange={() => {}}
        cookedOutputUnit="g"
        onCookedOutputUnitChange={() => {}}
      />,
    )

    expect(screen.getByText(/^calories per gram$/i)).toBeInTheDocument()
    expect(screen.getByText(/^calories per ounce$/i)).toBeInTheDocument()
    expect(screen.getByText(/^calories per 100g$/i)).toBeInTheDocument()
    expect(screen.getByTestId('density-primary')).toHaveTextContent(
      /calories per gram/i,
    )
  })

  it('switches the primary density emphasis when cookedOutputUnit is oz', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          caloriesPerGram: 2,
          caloriesPerOunce: 56.7,
          caloriesPer100Grams: 200,
          rawPackageServings: 3.5230769,
          portionCalories: 300,
          cookedWeightPerPackageServingGrams: 178.0286,
          equivalentPackageServingsEaten: 1.08,
          weightChangeGrams: 184,
          weightChangePercent: 32.857,
          weightChangeDirection: 'gain',
          totalCaloriesDisplaySource: 'packageLabel',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Ravioli',
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          manualTotalCalories: null,
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: 744,
          portionEaten: 192.5,
          portionEatenUnit: 'oz',
          rawTotalWeight: 560,
          rawTotalWeightUnit: 'g',
          packageServingWeight: 134,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: 370,
        }}
        portionEaten={192.5}
        portionEatenUnit="oz"
        onPortionEatenChange={() => {}}
        onPortionEatenUnitChange={() => {}}
        targetCalories={400}
        onTargetCaloriesChange={() => {}}
        cookedOutputUnit="oz"
        onCookedOutputUnitChange={() => {}}
      />,
    )

    expect(screen.getByTestId('density-primary')).toHaveTextContent(
      /calories per ounce/i,
    )
  })

  it('renders secondary density references in a grouped secondary block when display unit is g', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          caloriesPerGram: 2,
          caloriesPerOunce: 56.7,
          caloriesPer100Grams: 200,
          rawPackageServings: 3.5230769,
          portionCalories: 300,
          cookedWeightPerPackageServingGrams: 178.0286,
          equivalentPackageServingsEaten: 1.08,
          weightChangeGrams: 184,
          weightChangePercent: 32.857,
          weightChangeDirection: 'gain',
          totalCaloriesDisplaySource: 'packageLabel',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Ravioli',
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          manualTotalCalories: null,
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: 744,
          portionEaten: 192.5,
          portionEatenUnit: 'g',
          rawTotalWeight: 560,
          rawTotalWeightUnit: 'g',
          packageServingWeight: 134,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: 370,
        }}
        portionEaten={192.5}
        portionEatenUnit="g"
        onPortionEatenChange={() => {}}
        onPortionEatenUnitChange={() => {}}
        targetCalories={400}
        onTargetCaloriesChange={() => {}}
        cookedOutputUnit="g"
        onCookedOutputUnitChange={() => {}}
      />,
    )

    expect(screen.getByTestId('density-primary')).toHaveTextContent(
      /calories per gram/i,
    )
    expect(screen.getByTestId('density-secondary')).toHaveTextContent(
      /calories per ounce/i,
    )
    expect(screen.getByTestId('density-secondary')).toHaveTextContent(
      /calories per 100g/i,
    )
  })

  it('renders secondary density references in a grouped secondary block when display unit is oz', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          caloriesPerGram: 2,
          caloriesPerOunce: 56.7,
          caloriesPer100Grams: 200,
          rawPackageServings: 3.5230769,
          portionCalories: 300,
          cookedWeightPerPackageServingGrams: 178.0286,
          equivalentPackageServingsEaten: 1.08,
          weightChangeGrams: 184,
          weightChangePercent: 32.857,
          weightChangeDirection: 'gain',
          totalCaloriesDisplaySource: 'packageLabel',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Ravioli',
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          manualTotalCalories: null,
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: 744,
          portionEaten: 192.5,
          portionEatenUnit: 'oz',
          rawTotalWeight: 560,
          rawTotalWeightUnit: 'g',
          packageServingWeight: 134,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: 370,
        }}
        portionEaten={192.5}
        portionEatenUnit="oz"
        onPortionEatenChange={() => {}}
        onPortionEatenUnitChange={() => {}}
        targetCalories={400}
        onTargetCaloriesChange={() => {}}
        cookedOutputUnit="oz"
        onCookedOutputUnitChange={() => {}}
      />,
    )

    expect(screen.getByTestId('density-primary')).toHaveTextContent(
      /calories per ounce/i,
    )
    expect(screen.getByTestId('density-secondary')).toHaveTextContent(
      /calories per gram/i,
    )
    expect(screen.getByTestId('density-secondary')).toHaveTextContent(
      /calories per 100g/i,
    )
  })

  it('places cooked weight per package serving and weight change in cooked batch stats', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          caloriesPerGram: 2,
          caloriesPerOunce: 56.7,
          caloriesPer100Grams: 200,
          rawPackageServings: 3.5230769,
          portionCalories: 300,
          cookedWeightPerPackageServingGrams: 178.0286,
          equivalentPackageServingsEaten: 1.08,
          weightChangeGrams: 184,
          weightChangePercent: 32.857,
          weightChangeDirection: 'gain',
          totalCaloriesDisplaySource: 'packageLabel',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Ravioli',
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          manualTotalCalories: null,
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: 744,
          portionEaten: 192.5,
          portionEatenUnit: 'g',
          rawTotalWeight: 560,
          rawTotalWeightUnit: 'g',
          packageServingWeight: 134,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: 370,
        }}
        portionEaten={192.5}
        portionEatenUnit="g"
        onPortionEatenChange={() => {}}
        onPortionEatenUnitChange={() => {}}
        targetCalories={400}
        onTargetCaloriesChange={() => {}}
        cookedOutputUnit="g"
        onCookedOutputUnitChange={() => {}}
      />,
    )

    expect(screen.getByText(/^cooked weight per package serving$/i)).toBeInTheDocument()
    expect(screen.getByText(/^weight change$/i)).toBeInTheDocument()
    expect(screen.getByText(/gained during cooking/i)).toBeInTheDocument()
  })

  it('renders weight change as a stacked callout instead of a normal metric row', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 1546.3,
          caloriesPerServing: null,
          caloriesPerGram: 2.008,
          caloriesPerOunce: 56.93,
          caloriesPer100Grams: 200.8,
          rawPackageServings: 4.179,
          portionCalories: 300,
          cookedWeightPerPackageServingGrams: 184.3,
          equivalentPackageServingsEaten: 1.08,
          weightChangeGrams: 210,
          weightChangePercent: 37.5,
          weightChangeDirection: 'gain',
          totalCaloriesDisplaySource: 'packageLabel',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Ravioli',
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          manualTotalCalories: null,
          totalCalories: 1546.3,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: 770,
          portionEaten: 192.5,
          portionEatenUnit: 'g',
          rawTotalWeight: 560,
          rawTotalWeightUnit: 'g',
          packageServingWeight: 134,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: 370,
        }}
        portionEaten={192.5}
        portionEatenUnit="g"
        onPortionEatenChange={() => {}}
        onPortionEatenUnitChange={() => {}}
        targetCalories={400}
        onTargetCaloriesChange={() => {}}
        cookedOutputUnit="g"
        onCookedOutputUnitChange={() => {}}
      />,
    )

    const cookedSection = screen.getByTestId('results-section-cooked')
    const callout = screen.getByTestId('weight-change-callout')

    expect(within(callout).getByText(/\+210 g \(\+37.5%\)/i)).toBeInTheDocument()
    expect(within(callout).getByText(/gained during cooking/i)).toBeInTheDocument()
    expect(
      within(cookedSection).queryByRole('term', { name: /^weight change$/i }),
    ).not.toBeInTheDocument()
  })

  it('renders portion-guide rows with muted unavailable values when prerequisites are missing', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          caloriesPerGram: 2,
          caloriesPerOunce: 56.7,
          caloriesPer100Grams: 200,
          rawPackageServings: 3.5230769,
          portionCalories: null,
          cookedWeightPerPackageServingGrams: 178.0286,
          equivalentPackageServingsEaten: null,
          weightChangeGrams: 184,
          weightChangePercent: 32.857,
          weightChangeDirection: 'gain',
          totalCaloriesDisplaySource: 'packageLabel',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Ravioli',
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          manualTotalCalories: null,
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: 744,
          portionEaten: null,
          portionEatenUnit: 'g',
          rawTotalWeight: 560,
          rawTotalWeightUnit: 'g',
          packageServingWeight: 134,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: 370,
        }}
        portionEaten={null}
        portionEatenUnit="g"
        onPortionEatenChange={() => {}}
        onPortionEatenUnitChange={() => {}}
        targetCalories={null}
        onTargetCaloriesChange={() => {}}
        cookedOutputUnit="g"
        onCookedOutputUnitChange={() => {}}
      />,
    )

    const guide = screen.getByTestId('results-section-portion-guide')
    expect(within(guide).getAllByText('—').length).toBeGreaterThan(0)
  })

  it('renders portion guide as eyebrow/control row plus a full-width title below', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          caloriesPerGram: 2,
          caloriesPerOunce: 56.7,
          caloriesPer100Grams: 200,
          rawPackageServings: 3.5230769,
          portionCalories: 300,
          cookedWeightPerPackageServingGrams: 178.0286,
          equivalentPackageServingsEaten: 1.08,
          weightChangeGrams: 184,
          weightChangePercent: 32.857,
          weightChangeDirection: 'gain',
          totalCaloriesDisplaySource: 'packageLabel',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Ravioli',
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          manualTotalCalories: null,
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: 744,
          portionEaten: 192.5,
          portionEatenUnit: 'g',
          rawTotalWeight: 560,
          rawTotalWeightUnit: 'g',
          packageServingWeight: 134,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: 370,
        }}
        portionEaten={192.5}
        portionEatenUnit="g"
        onPortionEatenChange={() => {}}
        onPortionEatenUnitChange={() => {}}
        targetCalories={400}
        onTargetCaloriesChange={() => {}}
        cookedOutputUnit="g"
        onCookedOutputUnitChange={() => {}}
      />,
    )

    const guide = screen.getByTestId('results-section-portion-guide')
    const headerRow = within(guide).getByTestId('portion-guide-header-row')

    expect(within(headerRow).getByText(/portion planning/i)).toBeInTheDocument()
    expect(within(headerRow).getByTestId('portion-guide-controls')).toBeInTheDocument()
    expect(within(headerRow).queryByText(/^portion guide$/i)).not.toBeInTheDocument()
    expect(within(guide).getByTestId('portion-guide-title')).toHaveTextContent(
      'Portion guide',
    )
  })

  it('shortens the visible portion row copy to portion eaten', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          caloriesPerGram: 2,
          caloriesPerOunce: 56.7,
          caloriesPer100Grams: 200,
          rawPackageServings: 3.5230769,
          portionCalories: 300,
          cookedWeightPerPackageServingGrams: 178.0286,
          equivalentPackageServingsEaten: 1.08,
          weightChangeGrams: 184,
          weightChangePercent: 32.857,
          weightChangeDirection: 'gain',
          totalCaloriesDisplaySource: 'packageLabel',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Ravioli',
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          manualTotalCalories: null,
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: 744,
          portionEaten: 192.5,
          portionEatenUnit: 'g',
          rawTotalWeight: 560,
          rawTotalWeightUnit: 'g',
          packageServingWeight: 134,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: 370,
        }}
        portionEaten={192.5}
        portionEatenUnit="g"
        onPortionEatenChange={() => {}}
        onPortionEatenUnitChange={() => {}}
        targetCalories={400}
        onTargetCaloriesChange={() => {}}
        cookedOutputUnit="g"
        onCookedOutputUnitChange={() => {}}
      />,
    )

    const guide = screen.getByTestId('results-section-portion-guide')

    expect(within(guide).getByText(/^portion eaten$/i)).toBeInTheDocument()
    expect(
      within(guide).queryByText(/^portion eaten \(cooked weight\)$/i),
    ).not.toBeInTheDocument()
  })
})
