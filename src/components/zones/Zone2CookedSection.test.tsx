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
})
