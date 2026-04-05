import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '@/pages/Login'
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

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      login: vi.fn().mockResolvedValue(undefined),
      loginLoading: false,
    })
  })

  it('renders the login form and validates required fields', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Login />, { route: ROUTES.login })

    expect(screen.getByRole('heading', { name: AUTH_TEXT.loginTitle })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: AUTH_TEXT.loginSubmit }))

    expect(screen.getByText(AUTH_TEXT.emailRequired)).toBeInTheDocument()
    expect(screen.getByText(AUTH_TEXT.passwordRequired)).toBeInTheDocument()
  })

  it('submits valid credentials and navigates to assets', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockResolvedValue(undefined)
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      login,
      loginLoading: false,
    })

    renderWithProviders(<Login />, { route: ROUTES.login })

    await user.type(screen.getByLabelText(AUTH_TEXT.emailLabel), 'pratul@gmail.com')
    await user.type(screen.getByLabelText(AUTH_TEXT.passwordLabel), 'password123')
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.loginSubmit }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'pratul@gmail.com',
        password: 'password123',
      })
    })
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.assets)
  })

  it('shows API errors and redirects authenticated users', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      login,
      loginLoading: false,
    })

    renderWithProviders(<Login />, { route: ROUTES.login })

    await user.type(screen.getByLabelText(AUTH_TEXT.emailLabel), 'alex@example.com')
    await user.type(screen.getByLabelText(AUTH_TEXT.passwordLabel), 'password123')
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.loginSubmit }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      login: vi.fn(),
      loginLoading: false,
    })

    renderWithProviders(<Login />, { route: ROUTES.login })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.assets)
    })
  })
})
