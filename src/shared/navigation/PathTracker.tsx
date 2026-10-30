import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const maxTrackedPaths = 10

function readPathStack(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('pathStack') ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

/** Mirrors the legacy app's last-path tracking and online resume behavior. */
export function PathTracker() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const path = location.pathname
    if (path !== '/login' && path !== '/worklist-window') {
      const pathStack = [...readPathStack(), path].slice(-maxTrackedPaths)
      localStorage.setItem('pathStack', JSON.stringify(pathStack))
      localStorage.setItem('lastVisitedPath', path)
    }

    const handleOnline = () => {
      const lastPath = localStorage.getItem('lastVisitedPath')
      if (lastPath) navigate(lastPath)
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [location.pathname, navigate])

  return null
}
