import type { InactiveReportRow } from '../data/inactiveReportApi'
import styles from '../pages/InactiveReport.module.css'

interface InactiveReportResultsTableProps {
  rows: InactiveReportRow[]
  loading: boolean
  searchPerformed: boolean
}

const headings = ['Sl No', 'Exam ID', 'Patient ID', 'Patient Name', 'Age', 'Gender', 'Image Count', 'Notes', 'Username', 'Active', 'Date']

export function InactiveReportResultsTable({ rows, loading, searchPerformed }: InactiveReportResultsTableProps) {
  return (
    <div className={styles.inactiveReportPrintContainer}>
      <div className={styles.inactiveReportTableBodyContainer}>
        <table className={styles.inactiveReportTable}>
          <thead>
            <tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={headings.length}>
                <div className={styles.inactiveReportSpinnerContainer}><div className={styles.inactiveReportLoadingSpinner} /></div>
              </td></tr>
            ) : rows.length ? rows.map((row) => (
              <tr key={`${row.examId}-${row.slNo}`}>
                <td>{row.slNo}</td><td>{row.examId}</td><td>{row.patientId}</td><td>{row.patientName}</td>
                <td>{row.patientAge}</td><td>{row.patientGender}</td><td>{row.imageCount}</td><td>{row.notes}</td>
                <td>{row.username}</td>
                <td><span className={row.active === 'yes' ? styles.statusActive : styles.statusInactive}>{row.active}</span></td>
                <td>{row.date}</td>
              </tr>
            )) : (
              <tr><td colSpan={headings.length} className={styles.emptyState}>
                {searchPerformed ? 'No data available' : 'Please enter search criteria'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
