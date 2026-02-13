import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Input from './Input'

describe('Input', () => {
  it('renders input with label', () => {
    render(<Input label="Test" />)
    expect(screen.getByLabelText('Test')).toBeInTheDocument()
  })
})
