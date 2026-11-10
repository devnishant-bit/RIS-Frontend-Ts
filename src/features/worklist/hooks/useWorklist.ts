import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchWorklistPage, WorklistAuthError, type WorklistItem, type WorklistQuery } from '../api/worklistApi'

export function useWorklist(query: WorklistQuery, page: number, pageSize: number) {
  const [rows, setRows] = useState<WorklistItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [tick, setTick] = useState(0)
  const totalRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setMessage('')

    fetchWorklistPage(query, page, pageSize)
      .then((res) => {
        if (cancelled) return
        if (res.total >= 0) totalRef.current = res.total // only page 1 returns the count
        setRows(res.rows)
        setTotal(totalRef.current)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Error fetching worklist:', err)
        setRows([])
        setMessage(err instanceof WorklistAuthError ? err.message : 'Failed to fetch worklist')
      })
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query), page, pageSize, tick])

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  return { rows, total, loading, message, refetch }
}