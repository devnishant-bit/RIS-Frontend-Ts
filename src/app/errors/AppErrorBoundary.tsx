import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import type { PropsWithChildren } from 'react'
import styles from './AppErrorBoundary.module.css'

function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <main className={styles.errorPage} role="alert">
      <p className={styles.eyebrow}>Application error</p>
      <h1>This page could not be displayed</h1>
      <p>Refresh the page. If the problem continues, contact your administrator.</p>
      <button className={styles.retryButton} onClick={resetErrorBoundary}>
        Refresh application
      </button>
    </main>
  )
}

export function AppErrorBoundary({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // Replace this with the approved application monitoring service later.
        console.error('Unhandled application rendering error', error, info.componentStack)
      }}
      onReset={() => window.location.reload()}
    >
      {children}
    </ErrorBoundary>
  )
}
