export interface PatientHistoryRecord {
  id: string;
  patientId: string;
  date: string;
  accessionNumber: string;
  modality: string;
  studyDescription: string;
  imageCount: number;
  status: "Completed";
  reportStatus: "Final" | "Pending" | "Not Required";
  doctor?: string;
}

export const mockPatientHistory: Record<string, PatientHistoryRecord[]> = {
  p1: [
    {
      id: "s1",
      patientId: "p1",
      date: "12-Aug-2025",
      accessionNumber: "ACC0012345",
      modality: "CT",
      studyDescription: "CT Brain",
      imageCount: 320,
      status: "Completed",
      reportStatus: "Final",
      doctor: "Dr. Suresh Kumar",
    },
    {
      id: "s2",
      patientId: "p1",
      date: "05-Jun-2025",
      accessionNumber: "ACC0011987",
      modality: "USG",
      studyDescription: "USG Abdomen",
      imageCount: 45,
      status: "Completed",
      reportStatus: "Final",
      doctor: "Dr. Smith Johnson",
    },
    {
      id: "s3",
      patientId: "p1",
      date: "18-Mar-2025",
      accessionNumber: "ACC0011023",
      modality: "X-RAY",
      studyDescription: "Chest PA",
      imageCount: 1,
      status: "Completed",
      reportStatus: "Pending",
      doctor: "Dr. Sarah Wilson",
    },
    {
      id: "s4",
      patientId: "p1",
      date: "10-Jan-2025",
      accessionNumber: "ACC0009843",
      modality: "MRI",
      studyDescription: "MRI Brain",
      imageCount: 180,
      status: "Completed",
      reportStatus: "Final",
      doctor: "Dr. Suresh Kumar",
    },
  ],
  p2: [
    {
      id: "s2-1",
      patientId: "p2",
      date: "14-Jul-2025",
      accessionNumber: "ACC0012111",
      modality: "CT",
      studyDescription: "CT Chest",
      imageCount: 240,
      status: "Completed",
      reportStatus: "Final",
      doctor: "Dr. Suresh Kumar",
    },
    {
      id: "s2-2",
      patientId: "p2",
      date: "20-Feb-2025",
      accessionNumber: "ACC0010543",
      modality: "X-RAY",
      studyDescription: "X-Ray Chest PA",
      imageCount: 2,
      status: "Completed",
      reportStatus: "Final",
      doctor: "Dr. Michael Brown",
    },
  ],
  p3: [
    {
      id: "s3-1",
      patientId: "p3",
      date: "22-Apr-2025",
      accessionNumber: "ACC0011432",
      modality: "MRI",
      studyDescription: "MRI Lumbar Spine",
      imageCount: 160,
      status: "Completed",
      reportStatus: "Final",
      doctor: "Dr. Sarah Wilson",
    },
  ],
  p4: [
    {
      id: "s4-1",
      patientId: "p4",
      date: "09-Sep-2025",
      accessionNumber: "ACC0012543",
      modality: "CT",
      studyDescription: "CT Abdomen & Pelvis",
      imageCount: 310,
      status: "Completed",
      reportStatus: "Final",
      doctor: "Dr. Suresh Kumar",
    },
  ],
};

// Fallback for default display (John Doe)
const defaultHistory = mockPatientHistory.p1;

export function getPatientHistory(patientId?: string): PatientHistoryRecord[] {
  if (!patientId) return defaultHistory;
  return mockPatientHistory[patientId] || defaultHistory;
}

export function getFinalizedReports(patientId?: string): PatientHistoryRecord[] {
  return getPatientHistory(patientId).filter(
    (record) => record.reportStatus === "Final",
  );
}
