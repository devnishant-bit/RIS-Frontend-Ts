import { useState } from 'react'
import { TatReportSearchFilters } from '../components/TatReportSearchFilters'
import { TatReportResultsTable } from '../components/TatReportResultsTable'
import { fetchTatReport } from '../data/tatReportData'
import type { TatReportFilters as Filters, TatReportRecord } from '../data/tatReportData'
import styles from './TatReport.module.css'

const emptyFilters: Filters = { patientName: '', patientId: '', procedure: '', dateFrom: '', dateTo: '' }

export function TatReportPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [rows, setRows] = useState<TatReportRecord[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const search = async () => {
    setLoading(true)
    setError(null)
    setRows([])
    try {
      setRows(await fetchTatReport(filters))
    } catch (cause) {
      console.error('Error fetching TAT report:', cause)
      setError('Failed to fetch data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const clear = () => {
    setFilters({ ...emptyFilters })
    setRows(null)
    setError(null)
  }

  return (
    <section className={styles.tatReportContainer}>
      <header className={styles.pageHeading}>
        <h1>TAT Report</h1>
        <div className={styles.reportSubtitle}>Patient waiting time and report turnaround details</div>
      </header>
      <TatReportSearchFilters filters={filters} loading={loading} onChange={updateFilter} onSearch={search} onClear={clear} />
      <TatReportResultsTable rows={rows} loading={loading} error={error} />
    </section>
  )
}
