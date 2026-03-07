import type { WeightUnit } from '../../hooks/useSavedMeals'

type UnitToggleProps = {
  name: string
  ariaLabel: string
  value: WeightUnit
  onChange: (nextValue: WeightUnit) => void
}

export function UnitToggle({
  name,
  ariaLabel,
  value,
  onChange,
}: UnitToggleProps) {
  return (
    <fieldset className="unit-toggle" aria-label={ariaLabel}>
      <label className="unit-toggle__option">
        <input
          type="radio"
          name={name}
          checked={value === 'g'}
          onChange={() => onChange('g')}
        />
        <span>g</span>
      </label>
      <label className="unit-toggle__option">
        <input
          type="radio"
          name={name}
          checked={value === 'oz'}
          onChange={() => onChange('oz')}
        />
        <span>oz</span>
      </label>
    </fieldset>
  )
}
