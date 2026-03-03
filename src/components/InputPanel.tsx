import type {
  MealInputs,
  MealMode,
  TotalCaloriesSource,
  WeightUnit,
} from '../hooks/useSavedMeals'

type InputPanelProps = {
  form: MealInputs
  onTextChange: (field: 'mealName', value: string) => void
  onNumberChange: (
    field:
      | 'manualTotalCalories'
      | 'caloriesPerServing'
      | 'yourServings'
      | 'cookedWeightGrams'
      | 'portionEaten'
      | 'rawTotalWeight'
      | 'packageServingWeight'
      | 'packageCaloriesPerServing',
    value: number | null,
  ) => void
  onUnitChange: (
    field:
      | 'rawTotalWeightUnit'
      | 'packageServingWeightUnit'
      | 'portionEatenUnit',
    value: WeightUnit,
  ) => void
  onModeChange: (mode: MealMode) => void
  onTotalSourceChange: (value: TotalCaloriesSource) => void
  onSave: () => void
  onClear: () => void
}

function toInputValue(value: number | null) {
  return value ?? ''
}

type WeightFieldProps = {
  label: string
  name: string
  value: number | null
  unit: WeightUnit
  onValueChange: (value: number | null) => void
  onUnitChange: (unit: WeightUnit) => void
}

function WeightField({
  label,
  name,
  value,
  unit,
  onValueChange,
  onUnitChange,
}: WeightFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-with-unit">
        <input
          aria-label={label}
          type="number"
          value={toInputValue(value)}
          onChange={(event) =>
            onValueChange(
              event.target.value === '' ? null : Number(event.target.value),
            )
          }
        />
        <fieldset className="unit-segmented" aria-label={`${label} unit`}>
          <label>
            <input
              checked={unit === 'g'}
              name={name}
              type="radio"
              value="g"
              onChange={() => onUnitChange('g')}
            />
            <span>g</span>
          </label>
          <label>
            <input
              checked={unit === 'oz'}
              name={name}
              type="radio"
              value="oz"
              onChange={() => onUnitChange('oz')}
            />
            <span>oz</span>
          </label>
        </fieldset>
      </div>
    </label>
  )
}

function TotalModeFields({
  form,
  onNumberChange,
  onUnitChange,
  onTotalSourceChange,
}: Pick<
  InputPanelProps,
  'form' | 'onNumberChange' | 'onUnitChange' | 'onTotalSourceChange'
>) {
  return (
    <>
      <fieldset className="segmented-control" aria-label="Total source">
        <label className="segmented-control__option">
          <input
            checked={form.totalCaloriesSource === 'packageLabel'}
            name="total-source"
            type="radio"
            onChange={() => onTotalSourceChange('packageLabel')}
          />
          <span>Package label</span>
        </label>

        <label className="segmented-control__option">
          <input
            checked={form.totalCaloriesSource === 'manualTotal'}
            name="total-source"
            type="radio"
            onChange={() => onTotalSourceChange('manualTotal')}
          />
          <span>Manual total</span>
        </label>
      </fieldset>

      {form.totalCaloriesSource === 'packageLabel' ? (
        <section
          className="worksheet-section"
          aria-labelledby="package-label-inputs-heading"
        >
          <div className="section-heading">
            <h3 id="package-label-inputs-heading">Package label inputs</h3>
          </div>

          <div className="field-grid">
            <WeightField
              label="Raw total weight"
              name="raw-total-weight-unit"
              value={form.rawTotalWeight}
              unit={form.rawTotalWeightUnit}
              onValueChange={(value) => onNumberChange('rawTotalWeight', value)}
              onUnitChange={(value) => onUnitChange('rawTotalWeightUnit', value)}
            />

            <WeightField
              label="Package serving weight"
              name="package-serving-weight-unit"
              value={form.packageServingWeight}
              unit={form.packageServingWeightUnit}
              onValueChange={(value) =>
                onNumberChange('packageServingWeight', value)
              }
              onUnitChange={(value) =>
                onUnitChange('packageServingWeightUnit', value)
              }
            />

            <label className="field">
              <span>Package calories per serving</span>
              <input
                aria-label="Package calories per serving"
                type="number"
                value={toInputValue(form.packageCaloriesPerServing)}
                onChange={(event) =>
                  onNumberChange(
                    'packageCaloriesPerServing',
                    event.target.value === ''
                      ? null
                      : Number(event.target.value),
                  )
                }
              />
            </label>
          </div>
        </section>
      ) : (
        <label className="field">
          <span>Total calories</span>
          <input
            aria-label="Total calories"
            type="number"
            value={toInputValue(form.manualTotalCalories)}
            onChange={(event) =>
              onNumberChange(
                'manualTotalCalories',
                event.target.value === '' ? null : Number(event.target.value),
              )
            }
          />
        </label>
      )}

      <section
        className="worksheet-section"
        aria-labelledby="cooked-batch-inputs-heading"
      >
        <div className="section-heading">
          <h3 id="cooked-batch-inputs-heading">Cooked batch inputs</h3>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Cooked weight (g)</span>
            <input
              aria-label="Cooked weight (g)"
              type="number"
              value={toInputValue(form.cookedWeightGrams)}
              onChange={(event) =>
                onNumberChange(
                  'cookedWeightGrams',
                  event.target.value === '' ? null : Number(event.target.value),
                )
              }
            />
          </label>

          <WeightField
            label="Portion eaten (cooked weight)"
            name="portion-eaten-unit"
            value={form.portionEaten}
            unit={form.portionEatenUnit}
            onValueChange={(value) => onNumberChange('portionEaten', value)}
            onUnitChange={(value) => onUnitChange('portionEatenUnit', value)}
          />
        </div>
      </section>
    </>
  )
}

function PerServingFields({
  form,
  onNumberChange,
}: Pick<InputPanelProps, 'form' | 'onNumberChange'>) {
  return (
    <div className="field-grid">
      <label className="field">
        <span>Cooked weight (g)</span>
        <input
          aria-label="Cooked weight (g)"
          type="number"
          value={toInputValue(form.cookedWeightGrams)}
          onChange={(event) =>
            onNumberChange(
              'cookedWeightGrams',
              event.target.value === '' ? null : Number(event.target.value),
            )
          }
        />
      </label>

      <label className="field">
        <span>Calories per serving</span>
        <input
          aria-label="Calories per serving"
          type="number"
          value={toInputValue(form.caloriesPerServing)}
          onChange={(event) =>
            onNumberChange(
              'caloriesPerServing',
              event.target.value === '' ? null : Number(event.target.value),
            )
          }
        />
      </label>

      <label className="field">
        <span>Servings (optional)</span>
        <input
          aria-label="Servings (optional)"
          type="number"
          value={toInputValue(form.yourServings)}
          onChange={(event) =>
            onNumberChange(
              'yourServings',
              event.target.value === '' ? null : Number(event.target.value),
            )
          }
        />
      </label>
    </div>
  )
}

export function InputPanel({
  form,
  onTextChange,
  onNumberChange,
  onUnitChange,
  onModeChange,
  onTotalSourceChange,
  onSave,
  onClear,
}: InputPanelProps) {
  return (
    <section className="worksheet-panel" data-testid="input-worksheet">
      <header className="panel-heading">
        <p className="eyebrow">Recipe worksheet</p>
        <h2>Build your meal</h2>
      </header>

      <label className="field">
        <span>Meal name</span>
        <input
          type="text"
          value={form.mealName}
          onChange={(event) => onTextChange('mealName', event.target.value)}
          placeholder="Chicken bowl, chili, stir-fry..."
        />
      </label>

      <fieldset className="segmented-control" aria-label="Calorie mode">
        <label className="segmented-control__option">
          <input
            checked={form.mode === 'total'}
            name="mode"
            type="radio"
            onChange={() => onModeChange('total')}
          />
          <span>Total calories mode</span>
        </label>

        <label className="segmented-control__option">
          <input
            checked={form.mode === 'perServing'}
            name="mode"
            type="radio"
            onChange={() => onModeChange('perServing')}
          />
          <span>Per serving</span>
        </label>
      </fieldset>

      {form.mode === 'total' ? (
        <TotalModeFields
          form={form}
          onNumberChange={onNumberChange}
          onUnitChange={onUnitChange}
          onTotalSourceChange={onTotalSourceChange}
        />
      ) : (
        <PerServingFields form={form} onNumberChange={onNumberChange} />
      )}

      <div className="action-row">
        <button type="button" onClick={onSave}>
          Save meal
        </button>
        <button type="button" onClick={onClear}>
          Clear
        </button>
      </div>
    </section>
  )
}
