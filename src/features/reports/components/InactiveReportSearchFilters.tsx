import type { ChangeEvent } from 'react'
import type { InactiveReportFilters as Filters } from '../data/inactiveReportApi'
import styles from '../pages/InactiveReport.module.css'

interface InactiveReportSearchFiltersProps {
  filters: Filters
  loading: boolean
  onChange: (key: keyof Filters, value: string) => void
  onSearch: () => void
}

export function InactiveReportSearchFilters({ filters, loading, onChange, onSearch }: InactiveReportSearchFiltersProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.currentTarget.name as keyof Filters, event.currentTarget.value)
  }

  return (
    <form className={styles.inactiveReportFilters} onSubmit={(event) => { event.preventDefault(); onSearch() }}>
      <div className={styles.inactiveReportFilterGroup}>
        <label className={styles.inactiveReportLabel} htmlFor="inactive-date-from">Date From:</label>
        <input id="inactive-date-from" type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} />
      </div>
      <div className={styles.inactiveReportFilterGroup}>
        <label className={styles.inactiveReportLabel} htmlFor="inactive-date-to">Date To:</label>
        <input id="inactive-date-to" type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} />
      </div>
      <div className={styles.inactiveReportFilterGroup}>
        <label className={styles.inactiveReportLabel} htmlFor="inactive-patient-id">Patient ID:</label>
        <input id="inactive-patient-id" type="text" name="patientId" value={filters.patientId} onChange={handleChange} />
      </div>
      <div className={styles.inactiveReportFilterGroup}>
        <label className={styles.inactiveReportLabel} htmlFor="inactive-patient-name">Patient Name:</label>
        <input id="inactive-patient-name" type="text" name="patientName" value={filters.patientName} onChange={handleChange} />
      </div>
      <div className={styles.inactiveReportSearch}>
        <button className={styles.inactiveReportSearch} type="submit" disabled={loading}>Search</button>
      </div>
    </form>
  )
}
