import { Link } from 'react-router-dom'
import { APP_TEXT, ROUTES, UI_TEXT } from '@/constants'
import '../styles/notFound.css'

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <h1 className="notfound-code">{APP_TEXT.pageNotFoundCode}</h1>

        <h2 className="notfound-title">{UI_TEXT.notFoundTitle}</h2>

        <p className="notfound-text">{UI_TEXT.notFoundDescription}</p>

        <Link to={ROUTES.login}>
          <button className="notfound-button">{UI_TEXT.notFoundAction}</button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
