import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ROUTES } from '@/constants'
import MainLayout from '@/layout/MainLayout'
import Assets from '@/pages/Assets'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Register from '@/pages/Register'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.register} element={<Register />} />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.assets} element={<Assets />} />
        </Route>
        <Route path={ROUTES.fallback} element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
