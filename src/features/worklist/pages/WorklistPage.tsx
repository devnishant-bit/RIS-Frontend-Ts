import { useMemo, useState } from 'react'
// import { useAuth } from '../../../shared/auth/useAuth'
import { demoStudies } from '../data/demoStudies'
import type { WorklistStatus } from '../types'
import SearchBar from '../components/WorklistFilters/WorklistFilters'
import {
  ASSIGNED_DOCTOR_OPTIONS,
  MODALITIES,
  REFERRING_DOCTOR_OPTIONS,
  type SearchFilters,
  type StudyStatus,
} from '../components/WorklistFilters/worklistFiltersData'
import WorklistTable from '../components/WorklistTable/WorklistTable'
import styles from './WorklistPage.module.css'

function parseSearchDate(value: string, endOfDay = false): Date | null {
  const [day, month, year] = value.split('-').map(Number)
  if (!day || !month || !year) return null
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return null
  if (endOfDay) date.setHours(23, 59, 59, 999)
  return date
}

const statusToWorklistStatuses: Record<StudyStatus, WorklistStatus[]> = {
  Ready: ['Unread'],
  Draft: ['Unread'],
  Preliminary: ['In Progress'],
  Final: ['Reported'],
}

export function WorklistPage() {
  // const { user } = useAuth()
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const filteredStudies = useMemo(() => {
    if (!appliedFilters) return demoStudies

    const normalizedPatientId = appliedFilters.patientId.trim().toLocaleLowerCase()
    const normalizedPatientName = appliedFilters.patientName.trim().toLocaleLowerCase()
    const normalizedProcedure = appliedFilters.procedure.trim().toLocaleLowerCase()
    const fromDate = parseSearchDate(appliedFilters.dateFrom)
    const toDate = parseSearchDate(appliedFilters.dateTo, true)
    const assignedDoctor = ASSIGNED_DOCTOR_OPTIONS.find(
      (option) => option.value === appliedFilters.assignedDoctor,
    )?.label.toLocaleLowerCase()
    const referringDoctor = REFERRING_DOCTOR_OPTIONS.find(
      (option) => option.value === appliedFilters.referringDoctor,
    )?.label.toLocaleLowerCase()
    const selectedModalities = appliedFilters.modalities.map((value) =>
      value === 'XRAY' ? 'XR' : value.toLocaleUpperCase(),
    )
    const allModalitiesSelected = appliedFilters.modalities.length === MODALITIES.length

    return demoStudies.filter((study) => {
      const acquiredAt = new Date(study.acquiredDateTime)
      const matchesPatientId = !normalizedPatientId || study.patientId.toLocaleLowerCase().includes(normalizedPatientId)
      const matchesPatientName = !normalizedPatientName || study.patientName.toLocaleLowerCase().includes(normalizedPatientName)
      const matchesProcedure = !normalizedProcedure || study.procedureDescription.toLocaleLowerCase().includes(normalizedProcedure)
      const matchesFromDate = !fromDate || acquiredAt >= fromDate
      const matchesToDate = !toDate || acquiredAt <= toDate
      const matchesAssignedDoctor = !assignedDoctor || study.assignedDoctor.toLocaleLowerCase() === assignedDoctor
      const matchesReferringDoctor = !referringDoctor || study.referringPhysician.toLocaleLowerCase() === referringDoctor
      const matchesModality = allModalitiesSelected || selectedModalities.includes(study.modality.toLocaleUpperCase())
      const matchesStatus = statusToWorklistStatuses[appliedFilters.status].includes(study.reportStatus)

      // The synthetic studies currently have no tags or report text to search.
      return matchesPatientId && matchesPatientName && matchesProcedure && matchesFromDate &&
        matchesToDate && matchesAssignedDoctor && matchesReferringDoctor && matchesModality && matchesStatus
    })
  }, [appliedFilters])

  const pagedStudies = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    return filteredStudies.slice(startIndex, startIndex + pageSize)
  }, [filteredStudies, page, pageSize])

  const tableRows = useMemo(() => pagedStudies.map((study) => ({
    examid: study.examId,
    patientId: study.patientId,
    patientName: study.patientName,
    accessionNo: study.accessionNumber,
    dateTime: new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(study.acquiredDateTime)),
    genderAge: `${study.gender} / ${study.patientAge}`,
    procedureDescription: study.procedureDescription,
    study: study.modality,
    assigneddoctor: study.assignedDoctor ? [{ doctorName: study.assignedDoctor }] : [],
    refDoctor: study.referringPhysician,
    images: study.imageCount,
    reportStatus: {
      Unread: 'Draft',
      'In Progress': 'Preliminary',
      Reported: 'Final',
    }[study.reportStatus],
  })), [pagedStudies])

  const totalPages = Math.max(1, Math.ceil(filteredStudies.length / pageSize))

  function resetFilters() {
    setAppliedFilters(null)
    setPage(1)
  }

  return (
    <section className={styles.page}>
      <SearchBar
        onSearch={(filters) => { setAppliedFilters(filters); setPage(1) }}
        onClear={resetFilters}
      />

      <section className={styles.resultsCard} aria-label="Worklist results">
        {/* <div className={styles.resultsHeading}>
          <div>
            <h2>Studies</h2>
            <p>{filteredStudies.length} matching {filteredStudies.length === 1 ? 'study' : 'studies'}</p>
          </div>
          <span className={styles.resultIcon} aria-hidden="true">▤</span>
        </div> */}

        <WorklistTable
          rows={tableRows}
          currentPage={page}
          totalPages={totalPages}
          totalRecords={filteredStudies.length}
          rowsPerPage={pageSize}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => { setPageSize(value); setPage(1) }}
        />
      </section>
    </section>
  )
}
