import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TextField from '@/components/TextField'
import { AUTH_TEXT, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { validateRegisterForm } from '@/schemas/auth'
import { getAuthErrorMessage } from '@/utils/auth'
import '@/styles/login.css'

const Register = () => {
  const navigate = useNavigate()
  const { isAuthenticated, register, registerLoading } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.assets)
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    setNameError('')
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')
    setApiError('')

    const validation = validateRegisterForm({
      name,
      email,
      password,
      confirmPassword,
    })

    setNameError(validation.errors.name || '')
    setEmailError(validation.errors.email || '')
    setPasswordError(validation.errors.password || '')
    setConfirmPasswordError(validation.errors.confirmPassword || '')

    if (!validation.data) {
      return
    }

    try {
      await register(validation.data)
      navigate(ROUTES.assets)
    } catch (error) {
      setApiError(getAuthErrorMessage(error, AUTH_TEXT.registerFallbackError))
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{AUTH_TEXT.registerTitle}</h2>
        <p className="subtitle">{AUTH_TEXT.registerSubtitle}</p>

        <form onSubmit={handleSubmit}>
          <TextField
            id="register-name"
            label={AUTH_TEXT.nameLabel}
            placeholder={AUTH_TEXT.namePlaceholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={nameError}
          />

          <TextField
            id="register-email"
            label={AUTH_TEXT.emailLabel}
            placeholder={AUTH_TEXT.emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailError}
          />

          <TextField
            id="register-password"
            label={AUTH_TEXT.passwordLabel}
            type="password"
            placeholder={AUTH_TEXT.createPasswordPlaceholder}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={passwordError}
          />

          <TextField
            id="register-confirm-password"
            label={AUTH_TEXT.confirmPasswordLabel}
            type="password"
            placeholder={AUTH_TEXT.confirmPasswordPlaceholder}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={confirmPasswordError}
          />

          {apiError ? <p className="error-text">{apiError}</p> : null}

          <button type="submit" disabled={registerLoading}>
            {registerLoading ? AUTH_TEXT.registerSubmitting : AUTH_TEXT.registerSubmit}
          </button>
        </form>

        <p className="auth-switch-copy">
          {AUTH_TEXT.loginPrompt} <Link to={ROUTES.login}>{AUTH_TEXT.loginSubmit}</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
