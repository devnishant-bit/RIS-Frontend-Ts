export type WorklistStatus = 'Unread' | 'In Progress' | 'Reported'

export interface WorklistStudy {
  examId: string
  patientId: string
  patientName: string
  accessionNumber: string
  acquiredDateTime: string
  gender: 'F' | 'M' | 'U'
  patientAge: number
  procedureDescription: string
  reportStatus: WorklistStatus
  referringPhysician: string
  modality: string
  assignedDoctor: string
  imageCount: number
}
