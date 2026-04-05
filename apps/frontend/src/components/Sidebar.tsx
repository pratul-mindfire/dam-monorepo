import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { APP_TEXT, ROUTES, UI_TEXT } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import '@/styles/sidebar.css'

const Sidebar = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const { logout, logoutLoading, user } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error(UI_TEXT.logoutFailed, error)
    } finally {
      navigate(ROUTES.login)
    }
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="menu-btn" onClick={toggleSidebar}>
        {APP_TEXT.mobileMenuToggle}
      </button>

      {/* Overlay */}
      {isOpen && <div className="overlay" onClick={closeSidebar}></div>}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <h2 className="logo">{UI_TEXT.sidebarTitle}</h2>
          {user && <p className="sidebar-link">{user.name}</p>}

          <nav>
            <NavLink to={ROUTES.assets} className="sidebar-link" onClick={closeSidebar}>
              {UI_TEXT.assetsNavLabel}
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} disabled={logoutLoading}>
            {logoutLoading ? UI_TEXT.loggingOut : UI_TEXT.logout}
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
