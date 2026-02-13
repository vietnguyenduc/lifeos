import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Modal from './Modal'

describe('Modal', () => {
  it('renders modal when open', () => {
    render(<Modal isOpen={true} onClose={() => {}}>Test</Modal>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<Modal isOpen={false} onClose={() => {}}>Test</Modal>)
    expect(screen.queryByText('Test')).not.toBeInTheDocument()
  })
})
