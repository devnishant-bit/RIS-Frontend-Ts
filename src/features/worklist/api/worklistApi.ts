import axios from 'axios'
import config from '@/config'
import { getFeatureIdByName, WORKLIST_FEATURE_NAME } from '../../assign-doctor'

export interface WorklistItem {
  examid: number | string
  studyuid: string
  patientId: string
  patientName: string
  accessionNumber: string
  acquiredDate: string
  acquiredTime: string
  patientGender: string
  patientAge: string
  procedureDescription: string
  reportstatus: number
  referringPhysician: string
  modality: string
  assigneddoctor?: { doctorId?: number | string; doctorName?: string }[]
  imageCount: number
  criticality?: boolean
  priorityid?: number
}

export interface WorklistQuery {
  patientId?: string
  patientName?: string
  procedure?: string
  referringPhysician?: string
  assignedDoctor?: string
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  /** Selected modality keys, e.g. ['CT','XRAY'] */
  modalities: string[]
  /** Every modality key the UI offers (used for the "all selected" and "Others" rules) */
  allModalities: string[]
  toggleAssign?: boolean
}

export interface WorklistResult {
  rows: WorklistItem[]
  total: number
}

export class WorklistAuthError extends Error {}

/** Same rules as the old fetchWorklist */
function buildModalities(selected: string[], all: string[]): string | string[] | null {
  if (selected.length === 0) return null
  if (selected.length === all.length) return ''
  if (selected.includes('Others')) {
    // backend does NOT IN on the list, with "Others" last
    const notSelected = all.filter((m) => m !== 'Others' && !selected.includes(m))
    return notSelected.length === 0 ? '' : [...notSelected, 'Others']
  }
  return selected
}

export async function fetchWorklistPage(
  query: WorklistQuery,
  page: number,
  pageSize: number,
): Promise<WorklistResult> {
  const payload: Record<string, unknown> = {
    limit: pageSize,
    starttime: '00:00:00',
    endtime: '23:59:59',
    featureid: getFeatureIdByName(WORKLIST_FEATURE_NAME),
    userid: localStorage.getItem('userid'),
    toggle: query.toggleAssign ?? false,
    modalities: buildModalities(query.modalities, query.allModalities),
  }

  if (query.startDate && query.endDate) {
    payload.startdate = query.startDate
    payload.enddate = query.endDate
  }
  if (query.patientId) payload.patientId = query.patientId
  if (query.patientName) payload.fullname = query.patientName
  if (query.procedure) payload.procedureDescription = query.procedure
  if (query.referringPhysician) payload.referringPhysician = query.referringPhysician
  if (query.assignedDoctor) payload.assigneddoctor = query.assignedDoctor

  const isFirstPage = page === 1
  if (!isFirstPage) payload.offset = (page - 1) * pageSize

  try {
    const { data } = await axios.post(
      `${config.apiBaseUrl}/tiservice/worklist/${isFirstPage ? 'retrievestartworklist' : 'retrievenextworklist'}`,
      payload,
    )
    if (data.retval !== 'SUCCESS') return { rows: [], total: 0 }
    return {
      rows: data.worklist as WorklistItem[],
      total: isFirstPage ? parseInt(data.count, 10) : -1, // -1 = keep previous total
    }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 403 && err.response.data === 'ERROR_RBAC') {
      throw new WorklistAuthError('You are not authorized to view this page')
    }
    throw err
  }
}