import type { Resource } from "../pages/Calendar1";

export function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function offsetDateISO(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildMockResources(): Resource[] {
  const today = todayISO();
  const tomorrow = offsetDateISO(1);
  const dayAfterTomorrow = offsetDateISO(2);

  return [
    {
      id: "ct-room-1",
      name: "CT Room 1",
      machine: "Siemens SOMATOM",
      modality: "CT",
      location: "Main Center",
      department: "Radiology",
      capacity: 1,
      scheduler: {
        scheduleStartTime: "08:00",
        scheduleEndTime: "17:00",
        processingDurationMinutes: 30,
      },
      appointments: [
        {
          id: 1,
          date: today,
          start: "08:00",
          end: "08:30",
          patient: "John Doe",
          mrn: "00012345",
          status: "booked",
        },
        {
          id: 2,
          date: today,
          start: "10:00",
          end: "10:30",
          patient: "Alice Smith",
          mrn: "MRN125457",
          status: "confirmed",
        },
        {
          id: 3,
          date: today,
          start: "12:00",
          end: "12:30",
          patient: "Robert Brown",
          mrn: "MRN125458",
          status: "booked",
        },
        {
          id: 4,
          date: tomorrow,
          start: "09:00",
          end: "09:30",
          patient: "Michael Johnson",
          mrn: "MRN200001",
          status: "confirmed",
        },
        {
          id: 5,
          date: dayAfterTomorrow,
          start: "11:00",
          end: "11:30",
          patient: "Sarah Williams",
          mrn: "MRN200002",
          status: "confirmed",
        },
      ],
      blockedPeriods: [],
    },
    {
      id: "ct-room-2",
      name: "CT Room 2",
      machine: "GE Revolution",
      modality: "CT",
      location: "Main Center",
      department: "Radiology",
      capacity: 1,
      scheduler: {
        scheduleStartTime: "08:30",
        scheduleEndTime: "18:00",
        processingDurationMinutes: 45,
      },
      appointments: [
        {
          id: 6,
          date: today,
          start: "09:15",
          end: "10:00",
          patient: "Michael Johnson",
          mrn: "MRN200001",
          status: "booked",
        },
        {
          id: 7,
          date: today,
          start: "11:30",
          end: "12:15",
          patient: "Sarah Williams",
          mrn: "MRN200002",
          status: "confirmed",
        },
        {
          id: 8,
          date: today,
          start: "14:15",
          end: "15:00",
          patient: "David Miller",
          mrn: "MRN200003",
          status: "booked",
        },
        {
          id: 9,
          date: tomorrow,
          start: "10:00",
          end: "10:45",
          patient: "David Miller",
          mrn: "MRN200003",
          status: "confirmed",
        },
      ],
      blockedPeriods: [],
    },
    {
      id: "mri-room-1",
      name: "MRI Room 1",
      machine: "Philips Ingenia",
      modality: "MRI",
      location: "Main Center",
      department: "Radiology",
      capacity: 1,
      scheduler: {
        scheduleStartTime: "07:30",
        scheduleEndTime: "19:00",
        breakStartTime: "13:00",
        breakEndTime: "13:30",
        processingDurationMinutes: 60,
      },
      appointments: [
        {
          id: 10,
          date: today,
          start: "08:30",
          end: "09:30",
          patient: "Emily Davis",
          mrn: "MRN300001",
          status: "confirmed",
        },
        {
          id: 11,
          date: today,
          start: "11:30",
          end: "12:30",
          patient: "Daniel Wilson",
          mrn: "MRN300002",
          status: "booked",
        },
        {
          id: 12,
          date: tomorrow,
          start: "14:00",
          end: "15:00",
          patient: "Emily Davis",
          mrn: "MRN300001",
          status: "confirmed",
        },
      ],
      blockedPeriods: [],
    },
    {
      id: "mri-room-2",
      name: "MRI Room 2",
      machine: "Siemens MAGNETOM",
      modality: "MRI",
      location: "Main Center",
      department: "Radiology",
      capacity: 1,
      scheduler: {
        scheduleStartTime: "09:00",
        scheduleEndTime: "21:00",
        breakStartTime: "14:00",
        breakEndTime: "14:30",
        processingDurationMinutes: 45,
      },
      appointments: [
        {
          id: 13,
          date: today,
          start: "10:30",
          end: "11:15",
          patient: "James Anderson",
          mrn: "MRN400001",
          status: "booked",
        },
        {
          id: 14,
          date: today,
          start: "12:45",
          end: "13:30",
          patient: "Olivia Thomas",
          mrn: "MRN400002",
          status: "confirmed",
        },
        {
          id: 15,
          date: tomorrow,
          start: "15:00",
          end: "15:45",
          patient: "James Anderson",
          mrn: "MRN400001",
          status: "confirmed",
        },
      ],
      blockedPeriods: [],
    },
    {
      id: "mri-room-3",
      name: "MRI Room 3",
      machine: "GE Signa",
      modality: "MRI",
      location: "Main Center",
      department: "Radiology",
      capacity: 1,
      scheduler: {
        scheduleStartTime: "10:00",
        scheduleEndTime: "18:00",
        processingDurationMinutes: 45,
      },
      appointments: [
        {
          id: 16,
          date: today,
          start: "13:45",
          end: "14:30",
          patient: "Sophia Martinez",
          mrn: "MRN500001",
          status: "confirmed",
        },
        {
          id: 17,
          date: tomorrow,
          start: "11:00",
          end: "11:45",
          patient: "Sophia Martinez",
          mrn: "MRN500001",
          status: "confirmed",
        },
      ],
      blockedPeriods: [
        {
          id: 1,
          date: today,
          start: "14:30",
          end: "15:15",
          status: "maintenance",
          reason: "Scheduled equipment maintenance",
        },
      ],
    },
  ];
}
