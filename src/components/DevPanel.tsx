import { useState } from 'react'
import type { MealInputs } from '../hooks/useSavedMeals'
import type { CalculationResult } from '../utils/calculator'

type DevPanelProps = {
  hasConflictingCalories: boolean
  form: MealInputs
  result: CalculationResult
}

export function DevPanel({
  hasConflictingCalories,
  form,
  result,
}: DevPanelProps) {
  const [open, setOpen] = useState(false)

  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <section className="dev-panel">
      <button type="button" onClick={() => setOpen((current) => !current)}>
        {open ? 'Hide debug details' : 'Show debug details'}
      </button>

      {open ? (
        <pre>
          {JSON.stringify({ hasConflictingCalories, form, result }, null, 2)}
        </pre>
      ) : null}
    </section>
  )
}
