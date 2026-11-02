import type { TatReportRecord } from '../data/tatReportData'
import styles from '../pages/TatReport.module.css'

interface TatReportResultsTableProps {
  rows: TatReportRecord[] | null
  loading: boolean
  error: string | null
}

const columns = [
  { key: 'slno', label: 'Slno', width: 60 },
  { key: 'patientId', label: 'PatientID', width: 100 },
  { key: 'patientName', label: 'Patient Name', width: 140 },
  { key: 'billNo', label: 'Bill#', width: 90 },
  { key: 'procedure', label: 'Procedure', width: 140 },
  { key: 'investigationOrderTime', label: 'Investigation Order Time', width: 150, center: true },
  { key: 'billDateTime', label: 'Bill Date & Time', width: 150, center: true },
  { key: 'patientArrivalTime', label: 'Patient Arrival Time', width: 150, center: true },
  { key: 'procedureStartTime', label: 'Procedure Start Time', width: 150, center: true },
  { key: 'imageAcquiredTime', label: 'Image Acquired Time', width: 150, center: true },
  { key: 'waitingTime', label: 'Waiting Time', width: 110, center: true },
  { key: 'reportDraftDateTime', label: 'Report Draft Date & Time', width: 150, center: true },
  { key: 'reportProvisionDateTime', label: 'Report Provision Date & Time', width: 160, center: true },
  { key: 'reportFinalDateTime', label: 'Report Final Date & Time', width: 150, center: true },
  { key: 'tat', label: 'TAT', width: 120, center: true },
] as const

const tableMinWidth = columns.reduce((sum, column) => sum + column.width, 0)
const emptyValue = '—'
const pad = (value: number) => String(value).padStart(2, '0')

function formatDateTime(value: string | null) {
  if (!value) return emptyValue
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return emptyValue
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function differenceInMinutes(from: string | null, to: string | null): number | null {
  if (!from || !to) return null
  const start = new Date(from).getTime()
  const end = new Date(to).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null
  return Math.round((end - start) / 60_000)
}

function formatWaitingTime(row: TatReportRecord) {
  const minutes = differenceInMinutes(row.patientArrivalTime, row.procedureStartTime)
  return minutes === null ? emptyValue : `${minutes} min`
}

function formatTat(row: TatReportRecord) {
  const minutes = differenceInMinutes(row.patientArrivalTime, row.reportFinalDateTime)
  return minutes === null ? emptyValue : `${Math.floor(minutes / 60)}:${pad(minutes % 60)} HOURS`
}

export function TatReportResultsTable({ rows, loading, error }: TatReportResultsTableProps) {
  let message: string | null = null
  if (loading) message = 'Loading TAT report…'
  else if (error) message = error
  else if (rows === null) message = 'Please enter search criteria'
  else if (rows.length === 0) message = 'No data found'

  return (
    <section className={styles.tatReportResults} aria-label="TAT report results" aria-busy={loading}>
      <div className={styles.tableScroll}>
        <table className={styles.tatReportTable} style={{ minWidth: tableMinWidth }}>
          <colgroup>{columns.map((column) => <col key={column.key} style={{ width: column.width }} />)}</colgroup>
          <thead>
            <tr>{columns.map((column) => <th key={column.key} className={'center' in column && column.center ? styles.cellCenter : undefined}>{column.label}</th>)}</tr>
          </thead>
          <tbody>
            {message ? (
              <tr><td colSpan={columns.length} className={`${styles.emptyState} ${error ? styles.errorState : ''}`}>{message}</td></tr>
            ) : rows?.map((row, index) => {
              const tat = formatTat(row)
              return (
                <tr key={row.id}>
                  <td className={styles.cellCenter}>{index + 1}</td>
                  <td>{row.patientId}</td>
                  <td title={row.patientName}>{row.patientName}</td>
                  <td>{row.billNo}</td>
                  <td title={row.procedure}>{row.procedure}</td>
                  <td className={styles.cellCenter}>{formatDateTime(row.investigationOrderTime)}</td>
                  <td className={styles.cellCenter}>{formatDateTime(row.billDateTime)}</td>
                  <td className={styles.cellCenter}>{formatDateTime(row.patientArrivalTime)}</td>
                  <td className={styles.cellCenter}>{formatDateTime(row.procedureStartTime)}</td>
                  <td className={styles.cellCenter}>{formatDateTime(row.imageAcquiredTime)}</td>
                  <td className={styles.cellCenter}>{formatWaitingTime(row)}</td>
                  <td className={styles.cellCenter}>{formatDateTime(row.reportDraftDateTime)}</td>
                  <td className={styles.cellCenter}>{formatDateTime(row.reportProvisionDateTime)}</td>
                  <td className={styles.cellCenter}>{formatDateTime(row.reportFinalDateTime)}</td>
                  <td className={`${styles.cellCenter} ${tat === emptyValue ? '' : styles.tatValue}`}>{tat}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
