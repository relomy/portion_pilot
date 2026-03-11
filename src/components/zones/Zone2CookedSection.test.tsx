import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Zone2CookedSection } from './Zone2CookedSection'

describe('Zone2CookedSection', () => {
  it('renders Zone 2 cooked weight control and density container', () => {
    render(
      <Zone2CookedSection
        cookedInputUnit="g"
        cookedInputValue={null}
        primaryDensityLabel="Calories per gram"
        primaryDensityValue="Need cooked weight"
        secondaryDensityLabel="Calories per ounce"
        secondaryDensityValue="Need cooked weight"
        caloriesPer100GramsValue="Need cooked weight"
        isPrimaryDensityMuted={true}
        weightChangeText="—"
        rawPerCookedMultiplierText="—"
        weightChangeCopy="—"
        hasWeightChange={false}
        onCookedInputUnitChange={() => {}}
        onCookedWeightChange={() => {}}
      />,
    )

    const zone = screen.getByTestId('zone-cooked')
    expect(within(zone).getByLabelText(/^cooked weight$/i)).toBeInTheDocument()
    expect(within(zone).getByTestId('density-primary')).toBeInTheDocument()
    expect(within(zone).getByTestId('density-secondary')).toBeInTheDocument()
    expect(within(zone).getByTestId('raw-per-cooked-multiplier')).toHaveTextContent('—')
  })

  it('renders cooked weight unit toggle in label row and input below', () => {
    render(
      <Zone2CookedSection
        cookedInputUnit="g"
        cookedInputValue={null}
        primaryDensityLabel="Calories per gram"
        primaryDensityValue="Need cooked weight"
        secondaryDensityLabel="Calories per ounce"
        secondaryDensityValue="Need cooked weight"
        caloriesPer100GramsValue="Need cooked weight"
        isPrimaryDensityMuted={true}
        weightChangeText="—"
        rawPerCookedMultiplierText="—"
        weightChangeCopy="—"
        hasWeightChange={false}
        onCookedInputUnitChange={() => {}}
        onCookedWeightChange={() => {}}
      />,
    )

    const zone = screen.getByTestId('zone-cooked')
    const cookedInput = within(zone).getByLabelText(/^cooked weight$/i)
    const labelRow = cookedInput.closest('.field')?.querySelector('.field__label-row')

    expect(zone.querySelector('.field-with-unit')).not.toBeInTheDocument()
    expect(labelRow).not.toBeNull()
    expect(
      within(labelRow as HTMLElement).getByRole('group', {
        name: /cooked weight unit/i,
      }),
    ).toBeInTheDocument()
  })

  it('renders raw-per-cooked multiplier value when available', () => {
    render(
      <Zone2CookedSection
        cookedInputUnit="g"
        cookedInputValue={100}
        primaryDensityLabel="Calories per gram"
        primaryDensityValue="3.21"
        secondaryDensityLabel="Calories per ounce"
        secondaryDensityValue="91.1"
        caloriesPer100GramsValue="321"
        isPrimaryDensityMuted={false}
        weightChangeText="-20 g (-16.7%)"
        rawPerCookedMultiplierText="1.20x"
        weightChangeCopy="Lost during cooking"
        hasWeightChange={true}
        onCookedInputUnitChange={() => {}}
        onCookedWeightChange={() => {}}
      />,
    )

    const zone = screen.getByTestId('zone-cooked')
    expect(within(zone).getByTestId('raw-per-cooked-multiplier')).toHaveTextContent(
      '1.20x',
    )
  })
})
