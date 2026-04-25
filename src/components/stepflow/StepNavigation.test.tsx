import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { StepKey, StepVisualState } from './stepState'
import { StepNavigation } from './StepNavigation'

type NavStep = {
  key: StepKey
  label: string
  state: StepVisualState
}

const steps: NavStep[] = [
  { key: 'step1', label: 'Step 1', state: 'active' },
  { key: 'step2', label: 'Step 2', state: 'incomplete' },
  { key: 'step3', label: 'Step 3', state: 'untouched' },
]

describe('StepNavigation', () => {
  it('marks the active step with aria-current=step', () => {
    render(
      <StepNavigation
        steps={steps}
        activeStep="step1"
        onStepChange={() => {}}
      />,
    )

    expect(screen.getByRole('button', { name: /step 1/i })).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(
      screen.getByRole('button', { name: /step 2/i }),
    ).not.toHaveAttribute('aria-current')
  })

  it('announces incomplete state with accessible missing data text', () => {
    render(
      <StepNavigation
        steps={steps}
        activeStep="step1"
        onStepChange={() => {}}
      />,
    )

    const step2 = screen.getByRole('button', { name: /step 2/i })
    expect(step2).toHaveTextContent(/missing data/i)
    expect(step2).toHaveAttribute('data-state', 'incomplete')
  })

  it('allows non-blocking click navigation across all steps', async () => {
    const user = userEvent.setup()
    const onStepChange = vi.fn()

    render(
      <StepNavigation
        steps={steps}
        activeStep="step1"
        onStepChange={onStepChange}
      />,
    )

    const step2 = screen.getByRole('button', { name: /step 2/i })
    const step3 = screen.getByRole('button', { name: /step 3/i })

    expect(step2).toBeEnabled()
    expect(step3).toBeEnabled()

    await user.click(step2)
    await user.click(step3)

    expect(onStepChange).toHaveBeenNthCalledWith(1, 'step2')
    expect(onStepChange).toHaveBeenNthCalledWith(2, 'step3')
  })

  it('supports keyboard activation for step changes', async () => {
    const user = userEvent.setup()
    const onStepChange = vi.fn()

    render(
      <StepNavigation
        steps={steps}
        activeStep="step1"
        onStepChange={onStepChange}
      />,
    )

    await user.tab()
    await user.keyboard('{Enter}')
    await user.tab()
    await user.keyboard(' ')

    expect(onStepChange).toHaveBeenNthCalledWith(1, 'step1')
    expect(onStepChange).toHaveBeenNthCalledWith(2, 'step2')
  })
})
