import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { AppErrorBoundary } from './app/errors/AppErrorBoundary'
import { AppProviders } from './app/providers/AppProviders'
import { PathTracker } from './shared/navigation/PathTracker'
import { ThemeProvider } from './shared/Theme/ThemeProvider'
import './styles/global.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root was not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <AppErrorBoundary>
        <AppProviders>
          <BrowserRouter>
            <PathTracker />
            <App />
          </BrowserRouter>
        </AppProviders>
      </AppErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
)