export interface Doctor {
  id: number;
  docname: string;
  userid?: number;
}

export interface AssignedDoctorRef {
  doctorId?: string | number;
  doctorName?: string;
}

export interface DoctorOption {
  label: string;
  value: number;
}

export interface LiveUser {
  userid: number;
}

export type DoctorStatus = "online" | "away";

export interface ExamDocPayload {
  userid: string | null;
  date: string;
  time: string;
  examid: number | string;
  doctorid: number;
  status: boolean;
}