import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Register from '@/pages/Register'
import { AUTH_TEXT, ROUTES } from '@/constants'
import { renderWithProviders } from '../test-utils'

const mockNavigate = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      register: vi.fn().mockResolvedValue(undefined),
      registerLoading: false,
    })
  })

  it('renders the register form and validates mismatched passwords', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Register />, { route: ROUTES.register })

    await user.type(screen.getByLabelText(AUTH_TEXT.nameLabel), 'Alex Owner')
    await user.type(screen.getByLabelText(AUTH_TEXT.emailLabel), 'alex@example.com')
    await user.type(screen.getByLabelText(AUTH_TEXT.passwordLabel), 'password123')
    await user.type(screen.getByLabelText(AUTH_TEXT.confirmPasswordLabel), 'password456')
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.registerSubmit }))

    expect(screen.getByText(AUTH_TEXT.passwordsMismatch)).toBeInTheDocument()
  })

  it('submits valid registration data and navigates to assets', async () => {
    const user = userEvent.setup()
    const register = vi.fn().mockResolvedValue(undefined)
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      register,
      registerLoading: false,
    })

    renderWithProviders(<Register />, { route: ROUTES.register })

    await user.type(screen.getByLabelText(AUTH_TEXT.nameLabel), 'Alex Owner')
    await user.type(screen.getByLabelText(AUTH_TEXT.emailLabel), 'alex@example.com')
    await user.type(screen.getByLabelText(AUTH_TEXT.passwordLabel), 'password123')
    await user.type(screen.getByLabelText(AUTH_TEXT.confirmPasswordLabel), 'password123')
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.registerSubmit }))

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        name: 'Alex Owner',
        email: 'alex@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
    })
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.assets)
  })

  it('shows API errors and redirects authenticated users', async () => {
    const user = userEvent.setup()
    const register = vi.fn().mockRejectedValue(new Error('Email already in use'))
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      register,
      registerLoading: false,
    })

    renderWithProviders(<Register />, { route: ROUTES.register })

    await user.type(screen.getByLabelText(AUTH_TEXT.nameLabel), 'Alex Owner')
    await user.type(screen.getByLabelText(AUTH_TEXT.emailLabel), 'alex@example.com')
    await user.type(screen.getByLabelText(AUTH_TEXT.passwordLabel), 'password123')
    await user.type(screen.getByLabelText(AUTH_TEXT.confirmPasswordLabel), 'password123')
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.registerSubmit }))

    expect(await screen.findByText('Email already in use')).toBeInTheDocument()

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      register: vi.fn(),
      registerLoading: false,
    })

    renderWithProviders(<Register />, { route: ROUTES.register })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.assets)
    })
  })
})
