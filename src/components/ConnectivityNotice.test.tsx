import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ConnectivityNotice } from './ConnectivityNotice'

afterEach(cleanup)

describe('ConnectivityNotice', () => {
  it('explains that local conversations remain available offline', () => {
    render(<ConnectivityNotice isOnline={false} mode="local" />)

    expect(screen.getByRole('status')).toHaveTextContent('local conversations are still available')
  })

  it('explains that cloud features may be unavailable offline', () => {
    render(<ConnectivityNotice isOnline={false} mode="supabase" />)

    expect(screen.getByRole('status')).toHaveTextContent('Cloud features may be unavailable')
  })

  it('does not render while online', () => {
    render(<ConnectivityNotice isOnline mode="local" />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
