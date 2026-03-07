import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { UnitToggle } from './UnitToggle'

describe('UnitToggle', () => {
  it('renders a radiogroup and calls onChange when selecting a unit option', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <UnitToggle
        name="test-units"
        ariaLabel="Test unit"
        value="g"
        onChange={onChange}
      />,
    )

    expect(screen.getByRole('group', { name: /test unit/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^g$/i })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: /^oz$/i }))
    expect(onChange).toHaveBeenCalledWith('oz')
  })
})
