import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AgoraButton } from './agora-button'

describe('AgoraButton', () => {
  it('is keyboard and pointer accessible', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<AgoraButton onClick={onClick}>Continuar</AgoraButton>)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
