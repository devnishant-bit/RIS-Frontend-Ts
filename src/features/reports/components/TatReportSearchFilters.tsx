import type { FormEvent } from 'react'
import type { TatReportFilters as Filters } from '../data/tatReportData'
import styles from '../pages/TatReport.module.css'

interface TatReportSearchFiltersProps {
  filters: Filters
  loading: boolean
  onChange: (key: keyof Filters, value: string) => void
  onSearch: () => void
  onClear: () => void
}

const fields: Array<{ key: keyof Pick<Filters, 'patientName' | 'patientId' | 'procedure'>; label: string }> = [
  { key: 'patientName', label: 'Patient Name' },
  { key: 'patientId', label: 'Patient ID' },
  { key: 'procedure', label: 'Procedure' },
]

export function TatReportSearchFilters({ filters, loading, onChange, onSearch, onClear }: TatReportSearchFiltersProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch()
  }

  return (
    <form className={styles.tatReportFilters} onSubmit={handleSubmit}>
      {fields.map(({ key, label }) => {
        const id = `tat-${key}`
        return (
          <div className={styles.filterGroup} key={key}>
            <label className={styles.filterLabel} htmlFor={id}>{label}</label>
            <input id={id} type="text" value={filters[key]} onChange={(event) => onChange(key, event.target.value)} />
          </div>
        )
      })}
      {(['dateFrom', 'dateTo'] as const).map((key) => {
        const label = key === 'dateFrom' ? 'Date From' : 'Date To'
        return (
          <div className={styles.filterGroup} key={key}>
            <label className={styles.filterLabel} htmlFor={`tat-${key}`}>{label}</label>
            <input id={`tat-${key}`} type="date" value={filters[key]} onChange={(event) => onChange(key, event.target.value)} />
          </div>
        )
      })}
      <div className={styles.filterButtons}>
        <button className={styles.searchButton} type="submit" disabled={loading}>Search</button>
        <button className={styles.clearButton} type="button" onClick={onClear} disabled={loading}>Clear</button>
      </div>
    </form>
  )
}
