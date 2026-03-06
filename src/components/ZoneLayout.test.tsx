import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ZoneLayout } from './ZoneLayout'

describe('ZoneLayout', () => {
  it('renders three zones in order', () => {
    render(<ZoneLayout />)

    const zones = screen.getAllByTestId(/^zone-/)
    expect(zones[0]).toHaveAttribute('data-testid', 'zone-package')
    expect(zones[1]).toHaveAttribute('data-testid', 'zone-cooked')
    expect(zones[2]).toHaveAttribute('data-testid', 'zone-portion')
  })

  it('renders zone eyebrows and titles', () => {
    render(<ZoneLayout />)

    expect(screen.getByText(/before cooking/i)).toBeInTheDocument()
    expect(screen.getByText(/package/i)).toBeInTheDocument()
    expect(screen.getByText(/after cooking/i)).toBeInTheDocument()
    expect(screen.getByText(/cooked batch/i)).toBeInTheDocument()
    expect(screen.getByText(/at the plate/i)).toBeInTheDocument()
    expect(screen.getByText(/portion guide/i)).toBeInTheDocument()
  })
})
