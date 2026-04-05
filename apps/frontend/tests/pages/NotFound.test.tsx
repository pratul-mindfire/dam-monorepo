import { screen } from '@testing-library/react'
import NotFound from '@/pages/NotFound'
import { ROUTES, UI_TEXT } from '@/constants'
import { renderWithProviders } from '../test-utils'

describe('NotFound page', () => {
  it('renders the 404 content and points users back to login', () => {
    renderWithProviders(<NotFound />)

    expect(screen.getByRole('heading', { name: UI_TEXT.notFoundTitle })).toBeInTheDocument()
    expect(screen.getByText(UI_TEXT.notFoundDescription)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', ROUTES.login)
    expect(screen.getByRole('button', { name: UI_TEXT.notFoundAction })).toBeInTheDocument()
  })
})
