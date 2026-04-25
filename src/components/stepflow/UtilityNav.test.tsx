import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { UtilityNav } from './UtilityNav'

describe('UtilityNav', () => {
  it('shows required utilities and hides settings by default', () => {
    render(
      <UtilityNav
        selectedUtility="calculator"
        onUtilityChange={() => {}}
      />,
    )

    expect(
      screen.getByRole('button', { name: /calculator/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /saved/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /settings/i }),
    ).not.toBeInTheDocument()
  })

  it('renders settings only when caller includes it', () => {
    render(
      <UtilityNav
        selectedUtility="saved"
        utilities={['calculator', 'saved', 'settings']}
        onUtilityChange={() => {}}
      />,
    )

    expect(
      screen.getByRole('button', { name: /settings/i }),
    ).toBeInTheDocument()
  })

  it('exposes selected utility accessibly and handles selection changes', async () => {
    const user = userEvent.setup()
    const onUtilityChange = vi.fn()

    render(
      <UtilityNav
        selectedUtility="saved"
        onUtilityChange={onUtilityChange}
      />,
    )

    const saved = screen.getByRole('button', { name: /saved/i })
    const calculator = screen.getByRole('button', { name: /calculator/i })

    expect(saved).toHaveAttribute('aria-pressed', 'true')
    expect(calculator).toHaveAttribute('aria-pressed', 'false')

    await user.click(calculator)

    expect(onUtilityChange).toHaveBeenCalledWith('calculator')
  })

  it('falls back to first visible utility when selected utility is not rendered', () => {
    render(
      <UtilityNav
        selectedUtility="settings"
        utilities={['calculator', 'saved']}
        onUtilityChange={() => {}}
      />,
    )

    expect(
      screen.getByRole('button', { name: /calculator/i }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /saved/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('exposes layout mode contract via data-layout', () => {
    const { rerender } = render(
      <UtilityNav
        selectedUtility="calculator"
        onUtilityChange={() => {}}
      />,
    )

    expect(
      screen.getByRole('navigation', { name: /utility navigation/i }),
    ).toHaveAttribute('data-layout', 'rail')

    rerender(
      <UtilityNav
        selectedUtility="calculator"
        onUtilityChange={() => {}}
        layout="bottom-bar"
      />,
    )

    expect(
      screen.getByRole('navigation', { name: /utility navigation/i }),
    ).toHaveAttribute('data-layout', 'bottom-bar')
  })
})
