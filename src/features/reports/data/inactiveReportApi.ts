import { httpClient } from '../../../shared/api/httpClient'

export interface InactiveReportFilters {
  dateFrom: string
  dateTo: string
  patientId: string
  patientName: string
}

export interface InactiveReportRow {
  slNo: number
  examId: string | number
  patientId: string
  patientName: string
  patientAge: string | number
  patientGender: string
  imageCount: number
  notes: string
  username: string
  active: 'yes' | 'no'
  date: string
}

interface InactiveReportApiItem {
  examid: string | number
  patientId: string
  patientName: string
  patientAge: string | number
  patientGender: string
  imageCount: number
  notes: string
  username: string
  active: boolean
  date: string
}

interface InactiveReportApiResponse {
  retval: string
  finalreports?: InactiveReportApiItem[]
}

function getFeatureId() {
  try {
    const savedFeatures: Array<{ featurename?: string; featureid?: string | number }> =
      JSON.parse(window.localStorage.getItem('features') ?? '[]')
    return savedFeatures.find((feature) => feature.featurename === 'Modality Stat Report')?.featureid ?? null
  } catch {
    return null
  }
}

/** Calls the same endpoint and sends the same payload as the older Inactive Report. */
export async function fetchInactiveReport(filters: InactiveReportFilters): Promise<InactiveReportRow[]> {
  const response = await httpClient.post<InactiveReportApiResponse>('/tiservice/report/getinactivelog', {
    featureid: getFeatureId(),
    fromdate: filters.dateFrom || null,
    todate: filters.dateTo || null,
    patientId: filters.patientId || null,
    fullname: filters.patientName || null,
  })

  if (response.data.retval !== 'SUCCESS') {
    throw new Error('Failed to fetch inactive study report.')
  }

  return (response.data.finalreports ?? []).map((item, index) => ({
    slNo: index + 1,
    examId: item.examid,
    patientId: item.patientId,
    patientName: item.patientName,
    patientAge: item.patientAge,
    patientGender: item.patientGender,
    imageCount: item.imageCount,
    notes: item.notes,
    username: item.username,
    active: item.active ? 'yes' : 'no',
    date: item.date ? new Date(item.date).toLocaleDateString('en-GB') : '',
  }))
}
