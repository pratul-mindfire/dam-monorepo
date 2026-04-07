import { screen } from '@testing-library/react'
import TextField from '@/components/TextField'
import { renderWithProviders } from '../test-utils'

describe('TextField', () => {
  it('renders the label, input and error text', () => {
    renderWithProviders(
      <TextField
        id="email"
        label="Email"
        placeholder="Enter your email"
        error="Email is required"
      />
    )

    expect(screen.getByLabelText('Email')).toHaveAttribute('placeholder', 'Enter your email')
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })
})
