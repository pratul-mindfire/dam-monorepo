import type { JSX } from 'react'
import { Navigate } from 'react-router-dom'
import { ROUTES, STORAGE_KEYS } from '@/constants'

interface Props {
  children: JSX.Element
}

const ProtectedRoute = ({ children }: Props) => {
  const token = localStorage.getItem(STORAGE_KEYS.authToken)

  if (!token) {
    return <Navigate to={ROUTES.login} replace />
  }

  return children
}

export default ProtectedRoute
