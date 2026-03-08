import type { WeightUnit } from '../../hooks/useSavedMeals'
import { UnitToggle } from './UnitToggle'

type Zone2CookedSectionProps = {
  cookedInputUnit: WeightUnit
  cookedInputValue: number | null
  primaryDensityLabel: string
  primaryDensityValue: string
  secondaryDensityLabel: string
  secondaryDensityValue: string
  caloriesPer100GramsValue: string
  isPrimaryDensityMuted: boolean
  weightChangeText: string
  weightChangeCopy: string
  hasWeightChange: boolean
  onCookedInputUnitChange: (value: WeightUnit) => void
  onCookedWeightChange: (value: number | null) => void
}

function toInputValue(value: number | null) {
  return value ?? ''
}

export function Zone2CookedSection({
  cookedInputUnit,
  cookedInputValue,
  primaryDensityLabel,
  primaryDensityValue,
  secondaryDensityLabel,
  secondaryDensityValue,
  caloriesPer100GramsValue,
  isPrimaryDensityMuted,
  weightChangeText,
  weightChangeCopy,
  hasWeightChange,
  onCookedInputUnitChange,
  onCookedWeightChange,
}: Zone2CookedSectionProps) {
  return (
    <section className="zone zone--cooked" data-testid="zone-cooked">
      <p className="zone__eyebrow">Zone 2 · After cooking</p>
      <h2 className="zone__title">Cooked batch</h2>

      <div className="field">
        <div className="field__label-row">
          <label className="field__label" htmlFor="cooked-weight">
            Cooked weight
          </label>
          <UnitToggle
            name="cooked-weight-input-unit"
            ariaLabel="Cooked weight unit"
            value={cookedInputUnit}
            onChange={onCookedInputUnitChange}
          />
        </div>
        <input
          id="cooked-weight"
          aria-label="Cooked weight"
          className="field__input"
          type="number"
          value={toInputValue(cookedInputValue)}
          onChange={(event) =>
            onCookedWeightChange(
              event.target.value === '' ? null : Number(event.target.value),
            )
          }
        />
      </div>

      <div className="density-block">
        <div className="density-primary" data-testid="density-primary">
          <span className="density-primary__label">{primaryDensityLabel}</span>
          <span
            className={`density-primary__value${isPrimaryDensityMuted ? ' density-primary__value--empty' : ''}`}
          >
            {primaryDensityValue}
          </span>
        </div>

        <div className="density-secondary" data-testid="density-secondary">
          <div className="density-secondary__item">
            <span className="density-secondary__label">{secondaryDensityLabel}</span>
            <span className="density-secondary__value">{secondaryDensityValue}</span>
          </div>
          <div className="density-secondary__item">
            <span className="density-secondary__label">Calories per 100g</span>
            <span className="density-secondary__value">{caloriesPer100GramsValue}</span>
          </div>
        </div>
      </div>

      <div className="wc-callout" data-testid="weight-change-callout">
        <p className="wc-callout__label">Weight change</p>
        <p
          className={`wc-callout__value${hasWeightChange ? '' : ' wc-callout__value--empty'}`}
        >
          {weightChangeText}
        </p>
        {hasWeightChange ? <p className="wc-callout__copy">{weightChangeCopy}</p> : null}
      </div>
    </section>
  )
}
