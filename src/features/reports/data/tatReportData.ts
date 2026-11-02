export interface TatReportRecord {
  id: number
  patientId: string
  patientName: string
  billNo: string
  procedure: string
  investigationOrderTime: string | null
  billDateTime: string | null
  patientArrivalTime: string | null
  procedureStartTime: string | null
  imageAcquiredTime: string | null
  reportDraftDateTime: string | null
  reportProvisionDateTime: string | null
  reportFinalDateTime: string | null
}

export interface TatReportFilters {
  patientName: string
  patientId: string
  procedure: string
  dateFrom: string
  dateTo: string
}

// Temporary sample data from the older TAT report. Replace this service's
// implementation with the API request when the endpoint is available.
const sampleTatReport: TatReportRecord[] = [
  {
    id: 1, patientId: 'M12345', patientName: 'John', billNo: 'B123', procedure: 'CT ABDOMEN',
    investigationOrderTime: '2024-03-25T10:00', billDateTime: '2024-03-26T10:50',
    patientArrivalTime: '2024-03-26T11:00', procedureStartTime: '2024-03-26T11:25',
    imageAcquiredTime: '2024-03-26T11:55', reportDraftDateTime: '2024-03-26T12:30',
    reportProvisionDateTime: '2024-03-26T12:50', reportFinalDateTime: '2024-03-26T13:10',
  },
  {
    id: 2, patientId: 'M25658', patientName: 'Joseph', billNo: 'B568', procedure: 'CT ANGIO',
    investigationOrderTime: '2024-03-25T11:00', billDateTime: '2024-03-26T11:15',
    patientArrivalTime: '2024-03-26T11:20', procedureStartTime: '2024-03-26T11:35',
    imageAcquiredTime: '2024-03-26T12:05', reportDraftDateTime: '2024-03-26T12:40',
    reportProvisionDateTime: null, reportFinalDateTime: '2024-03-26T14:20',
  },
  {
    id: 3, patientId: 'M38971', patientName: 'Raman', billNo: 'B1013', procedure: 'MRI BRAIN',
    investigationOrderTime: '2024-03-25T12:00', billDateTime: '2024-03-26T12:00',
    patientArrivalTime: '2024-03-26T12:10', procedureStartTime: '2024-03-26T12:50',
    imageAcquiredTime: '2024-03-26T13:40', reportDraftDateTime: '2024-03-26T14:30',
    reportProvisionDateTime: '2024-03-26T15:00', reportFinalDateTime: '2024-03-26T15:30',
  },
  {
    id: 4, patientId: 'M40210', patientName: 'Meera', billNo: 'B1120', procedure: 'CT BRAIN',
    investigationOrderTime: '2024-03-26T09:30', billDateTime: '2024-03-26T09:45',
    patientArrivalTime: '2024-03-26T10:00', procedureStartTime: '2024-03-26T10:20',
    imageAcquiredTime: '2024-03-26T10:35', reportDraftDateTime: null,
    reportProvisionDateTime: null, reportFinalDateTime: null,
  },
]

export async function fetchTatReport(filters: TatReportFilters): Promise<TatReportRecord[]> {
  // Keep the old screen's brief loading state while this is backed by sample data.
  await new Promise((resolve) => window.setTimeout(resolve, 400))

  const name = filters.patientName.trim().toLocaleLowerCase()
  const patientId = filters.patientId.trim().toLocaleLowerCase()
  const procedure = filters.procedure.trim().toLocaleLowerCase()

  return sampleTatReport.filter((record) => {
    const billDate = record.billDateTime?.slice(0, 10) ?? ''
    return record.patientName.toLocaleLowerCase().includes(name)
      && record.patientId.toLocaleLowerCase().includes(patientId)
      && record.procedure.toLocaleLowerCase().includes(procedure)
      && (!filters.dateFrom || billDate >= filters.dateFrom)
      && (!filters.dateTo || billDate <= filters.dateTo)
  })
}
