import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react'
import styles from './AppErrorBoundary.module.css'

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<
  PropsWithChildren,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Replace this with the approved application monitoring service later.
    console.error('Unhandled application rendering error', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className={styles.errorPage} role="alert">
          <p className={styles.eyebrow}>Application error</p>
          <h1>This page could not be displayed</h1>
          <p>Refresh the page. If the problem continues, contact your administrator.</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>
            Refresh application
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
