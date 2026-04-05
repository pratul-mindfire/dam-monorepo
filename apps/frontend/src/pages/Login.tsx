import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TextField from '@/components/TextField'
import { AUTH_TEXT, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { validateLoginForm } from '@/schemas/auth'
import { getAuthErrorMessage } from '@/utils/auth'
import '@/styles/login.css'

const Login = () => {
  const navigate = useNavigate()
  const { isAuthenticated, login, loginLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.assets)
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setEmailError('')
    setPasswordError('')
    setApiError('')

    const validation = validateLoginForm({ email, password })

    setEmailError(validation.errors.email || '')
    setPasswordError(validation.errors.password || '')

    if (!validation.data) {
      return
    }

    try {
      await login(validation.data)
      navigate(ROUTES.assets)
    } catch (error) {
      setApiError(getAuthErrorMessage(error, AUTH_TEXT.loginFallbackError))
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{AUTH_TEXT.loginTitle}</h2>
        <p className="subtitle">{AUTH_TEXT.loginSubtitle}</p>

        <form onSubmit={handleSubmit}>
          <TextField
            id="login-email"
            label={AUTH_TEXT.emailLabel}
            placeholder={AUTH_TEXT.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
          />

          <TextField
            id="login-password"
            label={AUTH_TEXT.passwordLabel}
            type="password"
            placeholder={AUTH_TEXT.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
          />

          {apiError ? <p className="error-text">{apiError}</p> : null}

          <button type="submit" disabled={loginLoading}>
            {loginLoading ? AUTH_TEXT.loginSubmitting : AUTH_TEXT.loginSubmit}
          </button>
        </form>

        <p className="auth-switch-copy">
          {AUTH_TEXT.registerPrompt} <Link to={ROUTES.register}>{AUTH_TEXT.registerSubmit}</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
