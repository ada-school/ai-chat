import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppearanceControls } from './AppearanceControls'

afterEach(cleanup)

describe('AppearanceControls', () => {
  it('provides labeled theme and reading-size controls', () => {
    render(
      <AppearanceControls
        theme="system"
        textSize="default"
        onThemeChange={vi.fn()}
        onTextSizeChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'System theme' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Message text size')).toHaveValue('default')
  })

  it('reports theme and font-size changes to the application', () => {
    const onThemeChange = vi.fn()
    const onTextSizeChange = vi.fn()
    render(
      <AppearanceControls
        theme="system"
        textSize="default"
        onThemeChange={onThemeChange}
        onTextSizeChange={onTextSizeChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Dark theme' }))
    fireEvent.change(screen.getByLabelText('Message text size'), { target: { value: 'large' } })

    expect(onThemeChange).toHaveBeenCalledWith('dark')
    expect(onTextSizeChange).toHaveBeenCalledWith('large')
  })
})
