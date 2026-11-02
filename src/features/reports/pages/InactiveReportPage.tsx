import { useState } from 'react'
import { FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa'
import * as XLSX from 'xlsx-js-style'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { InactiveReportSearchFilters } from '../components/InactiveReportSearchFilters'
import { InactiveReportResultsTable } from '../components/InactiveReportResultsTable'
import { fetchInactiveReport } from '../data/inactiveReportApi'
import type { InactiveReportFilters as Filters, InactiveReportRow } from '../data/inactiveReportApi'
import styles from './InactiveReport.module.css'

const emptyFilters: Filters = { dateFrom: '', dateTo: '', patientId: '', patientName: '' }
const columns = ['Sl No', 'Exam ID', 'Patient ID', 'Patient Name', 'Age', 'Gender', 'Image Count', 'Notes', 'Username', 'Active', 'Date']

function exportRow(row: InactiveReportRow) {
  return [row.slNo, row.examId, row.patientId, row.patientName, row.patientAge, row.patientGender, row.imageCount, row.notes, row.username, row.active, row.date]
}

export function InactiveReportPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [rows, setRows] = useState<InactiveReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)

  const updateFilter = (key: keyof Filters, value: string) => setFilters((current) => ({ ...current, [key]: value }))

  const search = async () => {
    setSearchPerformed(true)
    setLoading(true)
    setRows([])
    try {
      setRows(await fetchInactiveReport(filters))
    } catch (error) {
      console.error('Error fetching inactive report:', error)
      await Swal.fire({ title: 'Error!', text: 'Error fetching data.', icon: 'error', confirmButtonText: 'Ok' })
    } finally {
      setLoading(false)
    }
  }

  const warnNoRows = async () => {
    await Swal.fire({ title: 'Warning!', text: 'No data available to export.', icon: 'warning', confirmButtonText: 'Ok' })
  }

  const exportExcel = async () => {
    if (!rows.length) return warnNoRows()
    const headerStyle = { fill: { fgColor: { rgb: '007BFF' } }, font: { bold: true, color: { rgb: 'FFFFFF' } }, alignment: { horizontal: 'center' } }
    const sheetData = [[...columns.map((label) => ({ v: label, s: headerStyle }))], ...rows.map(exportRow)]
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Study Inactive Report')
    XLSX.writeFile(workbook, 'Study_Inactive_Report.xlsx')
  }

  const exportPdf = async () => {
    if (!rows.length) return warnNoRows()
    const document = new jsPDF({ orientation: 'landscape' })
    document.text('Study Inactive Report', 14, 10)
    autoTable(document, { head: [columns], body: rows.map(exportRow), startY: 20, styles: { fontSize: 8 }, headStyles: { fillColor: [22, 160, 133] } })
    document.save('Study_Inactive_Report.pdf')
  }

  return (
    <section className={styles.inactiveReportContainer}>
      <header className={styles.pageHeading}>
        <h2>Study Inactive Report</h2>
        <div className={styles.reportSubtitle}>Inactive study records and activity information</div>
      </header>
      <div className={styles.filterAndActions}>
        <InactiveReportSearchFilters filters={filters} loading={loading} onChange={updateFilter} onSearch={search} />
        <div className={styles.inactiveReportActions}>
          <button type="button" className={styles.inactiveReportPrint} onClick={() => window.print()} title="Print" aria-label="Print"><FaPrint /></button>
          <button type="button" className={styles.inactiveReportExportExcel} onClick={exportExcel} title="Export to Excel" aria-label="Export to Excel"><FaFileExcel /></button>
          <button type="button" className={styles.inactiveReportExportPdf} onClick={exportPdf} title="Export to PDF" aria-label="Export to PDF"><FaFilePdf /></button>
        </div>
      </div>
      <InactiveReportResultsTable rows={rows} loading={loading} searchPerformed={searchPerformed} />
    </section>
  )
}
