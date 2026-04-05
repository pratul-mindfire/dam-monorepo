import React from 'react'
import { UI_TEXT } from '@/constants'
import '../styles/error.css'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(UI_TEXT.boundaryLog, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <div className="error-card">
            <h1>{UI_TEXT.boundaryTitle}</h1>
            <p>{UI_TEXT.boundaryDescription}</p>

            <button className="reload-btn" onClick={() => window.location.reload()}>
              {UI_TEXT.boundaryAction}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
