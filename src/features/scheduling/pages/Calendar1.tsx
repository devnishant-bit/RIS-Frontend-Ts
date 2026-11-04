import React from "react";
import styles from "./Calendar1.module.css";
import CalendarJS from "@calendarjs/ce";
import "@calendarjs/ce/dist/style.css";
import axios from "axios";
import config from "../../../shared/api/config";
import { getPatientHistory } from "../data/mockPatientHistory";

import { buildMockResources } from "../data/mockResources";

export type AppointmentStatus = "booked" | "confirmed";

export type BlockedPeriodStatus = "maintenance";
export interface PatientDetails {
  patientId?: string | number;
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  Description?: string;
  Phone?: string | number;
  Email?: string;
  Modality?: string;
  referringDoctor?: string;
}

interface DoctorOption {
  id: string | number;
  docname: string;
  status?: boolean | number | string;
  active?: boolean | number | string;
  isactive?: boolean | number | string;
  isActive?: boolean | number | string;
}

export interface Appointment {
  id: number;
  date: string;
  start: string;
  end: string;
  patient?: string;
  mrn?: string;
  patientDetails?: PatientDetails;
  study?: string;
  modality?: string;
  referringDoctor?: string;
  status: AppointmentStatus;
}

export interface BlockedPeriod {
  id: number;
  date: string;
  start: string;
  end: string;
  status: BlockedPeriodStatus;
  reason?: string;
}

export interface EquipmentScheduler {
  scheduleStartTime: string;
  scheduleEndTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  processingDurationMinutes: number;
}

export interface Resource {
  id: string;
  name: string;
  machine: string;
  modality: string;
  location: string;
  department: string;
  capacity: number;
  scheduler: EquipmentScheduler;
  appointments: Appointment[];
  blockedPeriods: BlockedPeriod[];
}

export type QuickActionModal =
  | "history"
  | "previousStudies"
  | "printSlip"
  | "shareLink"
  | "qrCode"
  | null;

export type ShareChannel = "whatsapp" | "sms" | "email";
export type HistoryTab = "visits" | "studies" | "reports";



export interface QuickActionPatient {
  name: string;
  mrn: string;
  ageSex: string;
  phone: string;
}

export interface QuickActionAppointment {
  appointmentNumber: string;
  date: string;
  time: string;
  department: string;
  modality: string;
  refDoctor: string;
}

export interface QuickActionStudyRow {
  id: string;
  date: string;
  accessionNumber: string;
  modality: string;
  studyDescription: string;
  imageCount: number;
  status: "Completed";
  reportStatus?: "Final" | "Pending" | "Not Required";
}
export interface AvailableSlot {
  date: string;
  start: string;
  end: string;
  resourceId: string;
}

export interface SelectedSlot {
  date: string;
  start: string;
  end: string;
  resourceId: string;
}

export interface CalendarState {
  selectedDate: Date;
  selectedStudy: string;
  resources: Resource[];
  selectedModality: string;
  selectedPriority: string;
  selectedContrast: string;

  selectedSlot: SelectedSlot | null;

  featurename: string | null;
  location: string;
  department: string;
  room: string;

  showOnlyAvailable: boolean;
  view: "timeline" | "list";
  showAllUpcoming: boolean;

  appointmentType: "new" | "followup";
  appointmentMode: string;
  clinicalIndication: string;
  patientSearch: string;
  preparationProtocol: string;
  instructions: string;

  sendSms: boolean;
  sendEmail: boolean;

  draftSaved: boolean;
  appointmentConfirmed: boolean;

  selectedFileName: string | null;

  patientDetails: PatientDetails | null;
  patients: PatientDetails[];
  doctors: DoctorOption[];
  isWalkIn: boolean;

  quickActionModal: QuickActionModal;

  shareChannel: ShareChannel;
  shareMobileNumber: string;
  shareEmail: string;
  shareLinkSentMessage: string | null;

  historyActiveTab: HistoryTab;

  selectedQuickActionPatient: QuickActionPatient | null;
  quickActionSearchQuery: string;
}

function Calendar1(): React.ReactNode {
  const initialDate = new Date();
  const initialState: CalendarState = {
      selectedDate: initialDate,

      selectedStudy: "CT Abdomen & Pelvis",
      resources: createInitialResources(),
      selectedModality: "CT",
      selectedPriority: "Routine",
      selectedContrast: "No",
      selectedSlot: null,
      featurename: "Ris Display List",
      location: "Main Center",
      department: "Radiology",
      room: "All",
      doctors: [],
      
      showOnlyAvailable: false,
      view: "timeline",
      showAllUpcoming: false,
      
      appointmentType: "new",
      appointmentMode: "In-Person",
      
      clinicalIndication: "",
      patientSearch: "",
      
      preparationProtocol: "Oral & IV Contrast",
      
      instructions:
      "Fasting 4-6 hours prior to exam.\nBring previous reports if any.",
      
      sendSms: true,
      sendEmail: true,
      
      draftSaved: false,
      appointmentConfirmed: false,
      
      selectedFileName: null,
      isWalkIn: false,
      
      patientDetails: null,
      patients: [],

      quickActionModal: null,
      shareChannel: "whatsapp",
      shareMobileNumber: "9876543210",
      shareEmail: "",
      shareLinkSentMessage: null,
      historyActiveTab: "visits",
      selectedQuickActionPatient: null,
      quickActionSearchQuery: "",
    };
  const [renderState, setRenderState] = React.useState<CalendarState>(initialState);
  const stateRef = React.useRef(renderState);
  stateRef.current = renderState;
  const setState = (update: Partial<CalendarState> | ((previous: CalendarState) => Partial<CalendarState>)): void => {
    setRenderState((previous) => ({ ...previous, ...(typeof update === 'function' ? update(previous) : update) }));
  };
  const previousStateRef = React.useRef<CalendarState | null>(null);
  const calendarContainerRef = React.useRef<HTMLDivElement>(null);
  const calendarInstanceRef = React.useRef<ReturnType<typeof CalendarJS.Calendar> | null>(null);
  const quickActionData: QuickActionAppointment = {
    appointmentNumber: "APPT-000789",
    date: "15-Sep-2025",
    time: "10:30 AM",
    department: "Radiology",
    modality: "CT",
    refDoctor: "Dr. Suresh Kumar",
  };

  const getExamIdFromUrl = (): number | null => {
  const params = new URLSearchParams(window.location.search);
  const examIdParam = params.get("examId") || params.get("examid");

  if (!examIdParam) {
    console.error("Exam ID is missing from the URL.");
    return null;
  }

  const examId = Number(examIdParam);

  if (!Number.isFinite(examId)) {
    console.error("Invalid exam ID:", examIdParam);
    return null;
  }

  return examId;
};

  const getPriorityFromUrl = (): string | null => {
    const params = new URLSearchParams(window.location.search);
    const priorityParam = params.get("priority") || params.get("prority");

    if (!priorityParam) {
      return null;
    }

    const priorityMap: Record<string, string> = {
      "12": "Routine",
      "13": "Urgent",
      "15": "STAT",
      routine: "Routine",
      urgent: "Urgent",
      stat: "STAT",
    };

    return priorityMap[priorityParam.trim().toLowerCase()] || null;
  };

  const getFeatureIdByName = (featurename: string | null) => {
     // Retrieve the features data from localStorage
    const storedFeatures = JSON.parse(localStorage.getItem("features") || "[]");
    //console.log("Context features:", storedFeatures); // Debugging log

    // Check if features are defined and not empty
    if (!storedFeatures || storedFeatures.length === 0) {
      console.error("Features are undefined or empty in context.");
      return null;
    }

    // Find the feature by name
    const feature = storedFeatures.find((f:any) => f.featurename === featurename);

    // Return the featureid if found, otherwise return null
    return feature ? feature.featureid : null;
  };

  const fetchDoctors = async (): Promise<void> => {
    const featureId = getFeatureIdByName(stateRef.current.featurename);

    if (!featureId) {
      return;
    }

    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/tiservice/doctor/getalldoctors`,
        { featureid: featureId },
      );

      if (response.data?.retval !== "SUCCESS") {
        return;
      }

      const doctors: DoctorOption[] = (response.data.doctorlist || [])
        .map((doctor: DoctorOption & { doctorid?: string | number; doctorname?: string; name?: string }) => ({
          id: doctor.id ?? doctor.doctorid ?? "",
          docname: doctor.docname ?? doctor.doctorname ?? doctor.name ?? "",
          status: doctor.status,
          active: doctor.active,
          isactive: doctor.isactive,
          isActive: doctor.isActive,
        }));

      const activeDoctors = doctors.filter((doctor) => isActiveDoctor(doctor));

      setState((previousState) => ({
        doctors: activeDoctors,
        patientDetails: previousState.patientDetails
          ? {
            ...previousState.patientDetails,
            referringDoctor: normalizeReferringDoctor(
              previousState.patientDetails.referringDoctor,
              activeDoctors,
            ),
          }
          : previousState.patientDetails,
      }));
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchPatientDetails = async (
    examId: number
  ): Promise<void> => {
    const featureId = getFeatureIdByName(
      stateRef.current.featurename
    );

    if (!featureId) {
      console.error(
        "Feature ID not found for:",
        stateRef.current.featurename
      );
      return;
    }

    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/tiservice/report/getpatient`,
        {
          featureid: featureId,
          examid: examId,
        }
      );

      if (response.data?.retval === "SUCCESS") {
        const patient = response.data.patient || {};
        const patientDescription = patient.Description ?? "";
        const patientModality = normalizeModalityValue(patient.Modality ?? "");
        const patientReferringDoctor =
          patient.referringDoctor ??
          patient.ReferringDoctor ??
          patient.referringdoctor ??
          patient.exam_referring_doctor ??
          "";

        setState({
          patientDetails: {
            patientId: patient.patientId ?? "",
            patientName: patient.patientName ?? "",
            patientAge: patient.patientAge ?? "",
            patientGender: patient.patientGender ?? "",
            Description: patientDescription,
            Phone: patient.Phone ?? "",
            Email: patient.Email ?? "",
            Modality: patientModality,
            referringDoctor: normalizeReferringDoctor(
              patientReferringDoctor,
              stateRef.current.doctors,
            ),
          },
          patients: [
            ...stateRef.current.patients.filter(
              (existingPatient) =>
                String(existingPatient.patientId) !== String(patient.patientId),
            ),
            {
              patientId: patient.patientId ?? "",
              patientName: patient.patientName ?? "",
              patientAge: patient.patientAge ?? "",
              patientGender: patient.patientGender ?? "",
              Description: patientDescription,
              Phone: patient.Phone ?? "",
              Email: patient.Email ?? "",
              Modality: patientModality,
              referringDoctor: patientReferringDoctor,
            },
          ],
          selectedStudy: stateRef.current.isWalkIn ? stateRef.current.selectedStudy : patientDescription || stateRef.current.selectedStudy,
          selectedModality: stateRef.current.isWalkIn ? stateRef.current.selectedModality : patientModality || stateRef.current.selectedModality,
        });
      } else {
        console.error(
          "Failed to fetch patient details:",
          response.data
        );
      }
    } catch (error) {
      console.error(
        "Error fetching patient details:",
        error
      );
    }
  };

  const updatePatientDetails = (changes: Partial<PatientDetails>): void => {
    setState((previousState) => ({
      patientDetails: {
        ...(previousState.patientDetails || {}),
        ...changes,
      },
    }));
  };

  const isActiveDoctor = (doctor: DoctorOption): boolean => {
    const status = doctor.status ?? doctor.active ?? doctor.isactive ?? doctor.isActive;

    if (status === undefined || status === null || status === "") {
      return true;
    }

    return (
      status === true ||
      status === 1 ||
      status === "true" ||
      status === "1" ||
      String(status).toLowerCase() === "active" ||
      String(status).toLowerCase() === "yes"
   );
  };

  const normalizeReferringDoctor = (
    value: unknown,
    doctors: DoctorOption[],
  ): string => {
    const referringDoctor = String(value ?? "").trim();

    if (!referringDoctor || ["null", "undefined", "na", "n/a"].includes(referringDoctor.toLowerCase())) {
      return "";
    }

    const doctor = doctors.find(
      (option) =>
        String(option.id).trim() === referringDoctor ||
        option.docname.trim().toLowerCase() === referringDoctor.toLowerCase(),
    );

    return doctor ? String(doctor.id) : referringDoctor;
  };

  const getPatientDetailsForAppointment = (
    appointment: Appointment,
  ): PatientDetails | null => {
    const patient = stateRef.current.patients.find(
      (item) =>
        String(item.patientId ?? "").toLowerCase() === String(appointment.mrn ?? "").toLowerCase() ||
        String(item.patientName ?? "").toLowerCase() === String(appointment.patient ?? "").toLowerCase(),
    );

    if (!patient && !appointment.patientDetails) {
      return null;
    }

    return {
      ...(appointment.patientDetails || {}),
      patientId: appointment.patientDetails?.patientId ?? patient?.patientId ?? appointment.mrn ?? "",
      patientName: appointment.patientDetails?.patientName ?? patient?.patientName ?? appointment.patient ?? "",
      patientAge: appointment.patientDetails?.patientAge ?? patient?.patientAge ?? "",
      patientGender: appointment.patientDetails?.patientGender ?? patient?.patientGender ?? "",
      Phone: appointment.patientDetails?.Phone ?? patient?.Phone ?? "",
      Email: appointment.patientDetails?.Email ?? patient?.Email ?? "",
      Description: appointment.patientDetails?.Description ?? appointment.study ?? "",
      Modality: normalizeModalityValue(
        appointment.patientDetails?.Modality ?? appointment.modality ?? "",
      ),
      referringDoctor: normalizeReferringDoctor(
        appointment.patientDetails?.referringDoctor ?? appointment.referringDoctor ?? "",
        stateRef.current.doctors,
      ),
    };
  };

  const normalizeModalityValue = (value: unknown): string => {
    const rawValue = String(value ?? "").trim();

    if (!rawValue || ["null", "undefined", "na", "n/a"].includes(rawValue.toLowerCase())) {
      return "";
    }

    const normalized = rawValue
      .replace(/[_\-\s]+/g, "")
      .toUpperCase();

    const aliases: Record<string, string> = {
      XRAY: "XRAY",
      XR: "XRAY",
      XRAYS: "XRAY",
      XRAYING: "XRAY",
      MR: "MRI",
      MRIA: "MRI",
      MAMMOGRAPHY: "MAMMO",
      MG: "MAMMO",
      US: "USG",
      USGRA: "USG",
      ULTRASOUND: "USG",
      OTHERS: "OTHER",
    };

    return aliases[normalized] || normalized;
  };

  const getSelectedDoctorId = (): string => {
    const patientDoctor = stateRef.current.patientDetails?.referringDoctor ?? "";
    const normalizedDoctor = normalizeReferringDoctor(
      patientDoctor,
      stateRef.current.doctors,
    );

    if (!stateRef.current.isWalkIn && !normalizedDoctor) {
      return "N/A";
    }

    if (!stateRef.current.isWalkIn) {
      const matchingDoctor = stateRef.current.doctors.find(
        (doctor) =>
          String(doctor.id).trim() === String(normalizedDoctor).trim() ||
          doctor.docname.trim().toLowerCase() === String(patientDoctor).trim().toLowerCase(),
      );

      return matchingDoctor ? String(matchingDoctor.id) : "N/A";
    }

    return normalizedDoctor;
  };

  function formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const handleCalendarDate = (date: Date): void => {
    setState({
      selectedDate: date,
    });
  };

  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatLongDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const goToToday = (): void => {
    setState({
      selectedDate: new Date(),
    });
  };

  const previousDay = (): void => {
    const date = new Date(stateRef.current.selectedDate);

    date.setDate(date.getDate() - 1);

    setState({
      selectedDate: date,
      selectedSlot: null,
      appointmentConfirmed: false,
    });
  };

  const nextDay = (): void => {
    const date = new Date(stateRef.current.selectedDate);

    date.setDate(date.getDate() + 1);

    setState({
      selectedDate: date,
      selectedSlot: null,
      appointmentConfirmed: false,
    });
  };

  function formatTime(time: string): string {
    const minutes = timeToMinutes(time);

    let hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const suffix = hour >= 12 ? "PM" : "AM";

    if (hour === 0) {
      hour = 12;
    }

    if (hour > 12) {
      hour -= 12;
    }

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0",
    )} ${suffix}`;
  }

  function getTimelineRange(): {
    start: number;
    end: number;
  } {
    const resources = getFilteredResources();

    if (resources.length === 0) {
      return {
        start: 8 * 60,
        end: 17 * 60,
      };
    }

    const actualStart = Math.min(
      ...resources.map((resource) =>
        timeToMinutes(resource.scheduler.scheduleStartTime),
      ),
    );

    const actualEnd = Math.max(
      ...resources.map((resource) =>
        timeToMinutes(resource.scheduler.scheduleEndTime),
      ),
    );

    return {
      start: Math.floor(actualStart / 30) * 30,
      end: Math.ceil(actualEnd / 30) * 30,
    };
  }

  function getSelectedStudyValue(): string {
    return stateRef.current.isWalkIn
      ? stateRef.current.selectedStudy
      : stateRef.current.patientDetails?.Description || stateRef.current.selectedStudy;
  }

  function getSelectedModalityValue(): string {
    const value = stateRef.current.isWalkIn
      ? stateRef.current.selectedModality
      : stateRef.current.patientDetails?.Modality || stateRef.current.selectedModality;

    return normalizeModalityValue(value);
  }

  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
  }

  function minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  }

  function isTimeOverlapping(
    start: string,
    end: string,
    existingStart: string,
    existingEnd: string,
  ): boolean {
    return isTimeOverlappingMinutes(
      timeToMinutes(start),
      timeToMinutes(end),
      timeToMinutes(existingStart),
      timeToMinutes(existingEnd),
    );
  }

  function isPastDate(date: string): boolean {
    const today = new Date();

    const todayISO = formatDateISO(today);

    return date < todayISO;
  }

  function isPastTime(date: string, endTime: string): boolean {
    const today = new Date();

    const todayISO = formatDateISO(today);

    // Future date
    if (date > todayISO) {
      return false;
    }

    // Past date
    if (date < todayISO) {
      return true;
    }

    // Same day - compare the slot's end time
    const nowMinutes = today.getHours() * 60 + today.getMinutes();

    const slotEndMinutes = timeToMinutes(endTime);

    return slotEndMinutes <= nowMinutes;
  }

  function isTimeOverlappingMinutes(
    startA: number,
    endA: number,
    startB: number,
    endB: number,
  ): boolean {
    return startA < endB && endA > startB;
  }

  function getAvailableSlots(resource: Resource, date: string): AvailableSlot[] {
    if (isPastDate(date)) {
      return [];
    }

    const slots: AvailableSlot[] = [];

    const schedule = resource.scheduler;

    const duration = schedule.processingDurationMinutes;

    const operatingStart = timeToMinutes(schedule.scheduleStartTime);

    const operatingEnd = timeToMinutes(schedule.scheduleEndTime);

    const breakStart = schedule.breakStartTime
      ? timeToMinutes(schedule.breakStartTime)
      : null;

    const breakEnd = schedule.breakEndTime
      ? timeToMinutes(schedule.breakEndTime)
      : null;
    // Generate slots in 30-minute increments
    for (
      let startMinutes = operatingStart;
      startMinutes + duration <= operatingEnd;
      startMinutes += duration
    ) {
      const start = minutesToTime(startMinutes);

      const end = minutesToTime(startMinutes + duration);

      if (isPastTime(date, end)) {
        continue;
      }

      /*
       * Don't create an appointment
       * that crosses the equipment break.
       */
      if (
        breakStart !== null &&
        breakEnd !== null &&
        isTimeOverlappingMinutes(
          startMinutes,
          startMinutes + duration,
          breakStart,
          breakEnd,
        )
      ) {
        continue;
      }

      const appointmentConflict = resource.appointments.some(
        (appointment) =>
          appointment.date === date &&
          isTimeOverlapping(
            start,
            end,
            appointment.start,
            appointment.end,
          ),
      );

      if (appointmentConflict) {
        continue;
      }

      const blockedConflict = resource.blockedPeriods.some(
        (blockedPeriod) =>
          blockedPeriod.date === date &&
          isTimeOverlapping(
            start,
            end,
            blockedPeriod.start,
            blockedPeriod.end,
          ),
      );

      if (blockedConflict) {
        continue;
      }

      slots.push({
        date,
        start,
        end,
        resourceId: resource.id,
      });
    }

    return slots;
  }

  const isCountedAppointment = (appointment: Appointment): boolean =>
    appointment.status === "booked" || appointment.status === "confirmed";

  const getScheduledSlotCount = (resource: Resource): number => {
    const schedule = resource.scheduler;
    const operatingStart = timeToMinutes(schedule.scheduleStartTime);
    const operatingEnd = timeToMinutes(schedule.scheduleEndTime);
    const breakStart = schedule.breakStartTime
      ? timeToMinutes(schedule.breakStartTime)
      : null;
    const breakEnd = schedule.breakEndTime
      ? timeToMinutes(schedule.breakEndTime)
      : null;
    let slotCount = 0;

    for (
      let startMinutes = operatingStart;
      startMinutes + schedule.processingDurationMinutes <= operatingEnd;
      startMinutes += schedule.processingDurationMinutes
    ) {
      const endMinutes = startMinutes + schedule.processingDurationMinutes;

      if (
        breakStart !== null &&
        breakEnd !== null &&
        isTimeOverlappingMinutes(startMinutes, endMinutes, breakStart, breakEnd)
      ) {
        continue;
      }

      slotCount += 1;
    }

    return slotCount;
  };

  const getAvailabilityOverview = (): {
    today: { appointments: number; capacity: number };
    week: { appointments: number; capacity: number };
    rooms: Array<{ label: string; appointments: number; capacity: number }>;
  } => {
    const resources = getResources();
    const today = formatDateISO(new Date());
    const weekDates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + index);
      return formatDateISO(date);
    });

    const getAppointmentCount = (resource: Resource, dates: string[]): number =>
      resource.appointments.filter(
        (appointment) =>
          dates.includes(appointment.date) && isCountedAppointment(appointment),
      ).length;

    const todayAppointments = resources.reduce(
      (total, resource) => total + getAppointmentCount(resource, [today]),
      0,
    );
    const todayCapacity = resources.reduce(
      (total, resource) => total + getScheduledSlotCount(resource),
      0,
    );
    const weekAppointments = resources.reduce(
      (total, resource) => total + getAppointmentCount(resource, weekDates),
      0,
    );
    const weekCapacity = todayCapacity * weekDates.length;
    const modalityRooms = ["CT", "MRI"].map((modality) => {
      const resource = resources.find(
        (item) => normalizeModalityValue(item.modality) === modality,
      );

      return {
        label: resource?.name || `${modality} Room`,
        appointments: resource ? getAppointmentCount(resource, [today]) : 0,
        capacity: resource ? getScheduledSlotCount(resource) : 0,
      };
    });

    return {
      today: { appointments: todayAppointments, capacity: todayCapacity },
      week: { appointments: weekAppointments, capacity: weekCapacity },
      rooms: modalityRooms,
    };
  };

  function createInitialResources(): Resource[] {
    return buildMockResources();
  }

  function getResources(): Resource[] {
    return stateRef.current.resources;
  }

  function getFilteredResources(): Resource[] {
    let resources = getResources();

    const selectedModality = normalizeModalityValue(
      getSelectedModalityValue(),
    );

    if (selectedModality) {
      resources = resources.filter(
        (resource) => normalizeModalityValue(resource.modality) === selectedModality,
      );
    }

    if (stateRef.current.location !== "All") {
      resources = resources.filter(
        (resource) => resource.location === stateRef.current.location,
      );
    }

    if (stateRef.current.department !== "All") {
      resources = resources.filter(
        (resource) => resource.department === stateRef.current.department,
      );
    }

    if (stateRef.current.room !== "All") {
      resources = resources.filter(
        (resource) => resource.id === stateRef.current.room,
      );
    }

    if (stateRef.current.showOnlyAvailable) {
      const selectedDate = formatDateISO(stateRef.current.selectedDate);

      resources = resources.filter(
        (resource) => getAvailableSlots(resource, selectedDate).length > 0,
      );
    }

    return resources;
  }

  const handlePriority = (priority: string): void => {
    if (!stateRef.current.isWalkIn) {
      return;
    }

    setState({
      selectedPriority: priority,
    });
  };

  const handleContrast = (contrast: string): void => {
    setState({
      selectedContrast: contrast,
    });
  };

  const handleAppointmentType = (type: "new" | "followup"): void => {
    setState({
      appointmentType: type,
    });
  };

  const handleSlotSelect = (
    resourceId: string,
    date: string,
    start: string,
    end: string,
  ): void => {
    const resource = getResources().find((item) => item.id === resourceId);

    if (!resource) {
      return;
    }

    // Get the currently available slots for this resource/date
    const availableSlots = getAvailableSlots(resource, date);

    // Make sure the selected slot is actually available
    const isAvailable = availableSlots.some(
      (slot) =>
        slot.resourceId === resourceId &&
        slot.date === date &&
        slot.start === start &&
        slot.end === end,
    );

    if (!isAvailable) {
      return;
    }

    setState({
      selectedSlot: {
        resourceId,
        date,
        start,
        end,
      },
      appointmentConfirmed: false,
    });
  };

  const handleBookedAppointmentSelect = (
    resourceId: string,
    appointment: Appointment,
  ): void => {
    const resource = getResources().find((item) => item.id === resourceId);
    const patientDetails = getPatientDetailsForAppointment(appointment);
    const modality = normalizeModalityValue(
      appointment.modality ?? resource?.modality ?? stateRef.current.selectedModality,
    );
    const study = appointment.study || patientDetails?.Description || stateRef.current.selectedStudy;

    setState({
      selectedDate: new Date(`${appointment.date}T00:00:00`),
      selectedSlot: {
        resourceId,
        date: appointment.date,
        start: appointment.start,
        end: appointment.end,
      },
      patientDetails: patientDetails || stateRef.current.patientDetails,
      selectedStudy: study,
      selectedModality: modality,
      draftSaved: appointment.status === "booked",
      appointmentConfirmed: appointment.status === "confirmed",
    });
  };

  const isSelectedSlotBooked = (): boolean => {
    const { selectedSlot, resources } = stateRef.current;

    if (!selectedSlot) {
      return false;
    }

    return resources.some(
      (resource) =>
        resource.id === selectedSlot.resourceId &&
        resource.appointments.some(
          (appointment) =>
            appointment.date === selectedSlot.date &&
            appointment.start === selectedSlot.start &&
            appointment.end === selectedSlot.end &&
            appointment.status === "booked",
        ),
    );
  };

  const isSelectedSlotConfirmed = (): boolean => {
    const { selectedSlot, resources } = stateRef.current;
    if (!selectedSlot) return false;
    return resources.some((r) =>
      r.id === selectedSlot.resourceId &&
      r.appointments.some((a) =>
        a.date === selectedSlot.date && a.start === selectedSlot.start &&
        a.end === selectedSlot.end && a.status === "confirmed"
      )
    );
  };

  const clearAll = (): void => {
    setState({
      selectedStudy: "CT Abdomen & Pelvis",
      selectedModality: "CT",
      selectedPriority: "Routine",
      selectedContrast: "No",

      selectedSlot: null,

      location: "Main Center",
      department: "Radiology",
      room: "All",

      showOnlyAvailable: false,
      view: "timeline",

      appointmentType: "new",
      appointmentMode: "In-Person",

      clinicalIndication: "",
      patientSearch: "",

      preparationProtocol: "Oral & IV Contrast",

      instructions:
        "Fasting 4-6 hours prior to exam.\nBring previous reports if any.",

      sendSms: true,
      sendEmail: true,

      draftSaved: false,
      appointmentConfirmed: false,

      selectedFileName: null,
      isWalkIn: false,
      patientDetails: null,
    });
  };

  function createSlotAppointment(isDraft: boolean): void {
    const { selectedSlot } = stateRef.current;

    if (!selectedSlot) {
      window.alert("Please select an available slot first.");
      return;
    }

    const resourceIndex = stateRef.current.resources.findIndex(
      (resource) => resource.id === selectedSlot.resourceId,
    );

    if (resourceIndex === -1) {
      window.alert("Selected resource could not be found.");
      return;
    }

    const resource = stateRef.current.resources[resourceIndex];

    // Check whether this slot has already been booked.
    const existingAppointment = resource.appointments.find(
      (appointment) =>
        appointment.date === selectedSlot.date &&
        appointment.start === selectedSlot.start &&
        appointment.end === selectedSlot.end,
    );

    // If already booked, just mark the draft as saved.
    if (existingAppointment) {
      if (isDraft) {
        setState({
          draftSaved: true,
          appointmentConfirmed: existingAppointment.status === "confirmed",
        });
      }
      return;
    }

    // Make sure the slot is still available.
    const availableSlots = getAvailableSlots(resource, selectedSlot.date);

    const isStillAvailable = availableSlots.some(
      (slot) =>
        slot.start === selectedSlot.start && slot.end === selectedSlot.end,
    );

    if (!isStillAvailable) {
      window.alert("This slot is no longer available.");

      setState({
        selectedSlot: null,
        draftSaved: false,
        appointmentConfirmed: false,
      });

      return;
    }

    const nextAppointmentId =
      Math.max(
        0,
        ...stateRef.current.resources.flatMap((item) =>
          item.appointments.map((appointment) => appointment.id),
        ),
      ) + 1;

    const patientDetails = stateRef.current.patientDetails;

    const newAppointment: Appointment = {
      id: nextAppointmentId,
      date: selectedSlot.date,
      start: selectedSlot.start,
      end: selectedSlot.end,
      patient: patientDetails?.patientName || "—",
      mrn: String(patientDetails?.patientId ?? "—"),
      patientDetails: patientDetails || undefined,
      study: getSelectedStudyValue(),
      modality: getSelectedModalityValue(),
      referringDoctor: patientDetails?.referringDoctor,
      status: "booked",
    };

    const updatedResources = stateRef.current.resources.map((item, index) =>
      index === resourceIndex
        ? {
          ...item,
          appointments: [...item.appointments, newAppointment],
        }
        : item,
    );

    setState({
      resources: updatedResources,
      draftSaved: isDraft,
      appointmentConfirmed: false,
    });
  }

  const saveDraft = (): void => {
    createSlotAppointment(true);
  };

  const bookSelectedSlot = (): void => {
    createSlotAppointment(false);
  };

  const confirmAppointment = (): void => {
    const patientDetails = stateRef.current.patientDetails;

    if (stateRef.current.isWalkIn && !/^\d{10}$/.test(String(patientDetails?.Phone ?? ""))) {
      window.alert("Please enter a valid 10-digit phone number.");
      return;
    }
    if (stateRef.current.isWalkIn && !String(patientDetails?.patientName ?? "").trim()) {
      window.alert("Please enter the walk-in patient's name.");
      return;
    }

    const { selectedSlot } = stateRef.current;

    if (!selectedSlot) {
      window.alert("Please select an appointment slot first.");

      return;
    }

    const resourceIndex = stateRef.current.resources.findIndex(
      (resource) => resource.id === selectedSlot.resourceId,
    );

    if (resourceIndex === -1) {
      window.alert("Selected resource could not be found.");

      return;
    }

    const resource = stateRef.current.resources[resourceIndex];

    // Find the appointment that was created
    // when the slot was booked.
    const appointmentIndex = resource.appointments.findIndex(
      (appointment) =>
        appointment.date === selectedSlot.date &&
        appointment.start === selectedSlot.start &&
        appointment.end === selectedSlot.end &&
        appointment.status === "booked",
    );

    if (appointmentIndex === -1) {
      window.alert("Please book the selected slot first.");

      return;
    }

    const updatedResources = stateRef.current.resources.map((item, index) =>
      index === resourceIndex
        ? {
          ...item,
          appointments: item.appointments.map((appointment, index) =>
            index === appointmentIndex
              ? {
                ...appointment,
                status: "confirmed" as const,
              }
              : appointment,
          ),
        }
        : item,
    );

    setState({
      resources: updatedResources,
      appointmentConfirmed: true,
      draftSaved: false,
    });
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      window.alert("File size must be 5MB or less.");

      event.target.value = "";

      return;
    }

    setState({
      selectedFileName: file.name,
    });
  };

  const openQuickActionModal = (modal: QuickActionModal): void => {
    setState({
      quickActionModal: modal,
      shareLinkSentMessage: null,
      historyActiveTab: "visits",
      selectedQuickActionPatient: null,
      quickActionSearchQuery: "",
    });
  };

  function getCurrentFormPatient(): QuickActionPatient {
    const patient = stateRef.current.patientDetails;

    return {
      name: String(patient?.patientName ?? "—"),
      mrn: String(patient?.patientId ?? "—"),
      ageSex: `${patient?.patientAge || "—"}/${patient?.patientGender || "—"}`,
      phone: String(patient?.Phone ?? "—"),
    };
  }

  function getReferringDoctorName(): string {
    const referringDoctor = stateRef.current.patientDetails?.referringDoctor || "";
    const doctor = stateRef.current.doctors.find(
      (option) =>
        String(option.id) === String(referringDoctor) ||
        option.docname === referringDoctor,
    );

    return doctor?.docname || "N/A";
  }

  function getActiveQuickActionPatient(): QuickActionPatient {
    return stateRef.current.selectedQuickActionPatient || getCurrentFormPatient();
  }

  function getConfirmedAppointmentSnapshot(): QuickActionAppointment | null {
    const { selectedSlot, resources, selectedModality } =
      stateRef.current;

    if (!isSelectedSlotConfirmed() || !selectedSlot) {
      return null;
    }

    const resource = resources.find((r) => r.id === selectedSlot.resourceId);
    if (!resource) return null;

    const appointment = resource.appointments.find(
      (a) =>
        a.date === selectedSlot.date &&
        a.start === selectedSlot.start &&
        a.end === selectedSlot.end &&
        a.status === "confirmed",
    );
    if (!appointment) return null;

    return {
      appointmentNumber: `APPT-${String(appointment.id).padStart(6, "0")}`,
      date: formatDate(new Date(`${selectedSlot.date}T00:00:00`)),
      time: `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`,
      department: resource.department,
      modality: selectedModality,
      refDoctor: getReferringDoctorName(),
    };
  }

  function getEffectiveAppointment(): QuickActionAppointment {
    return (
      getConfirmedAppointmentSnapshot() || quickActionData
    );
  }

  function getQuickActionSearchMatches(): QuickActionPatient[] {
    const query = stateRef.current.quickActionSearchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return getQuickActionPatientDirectory().filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.mrn.toLowerCase().includes(query) ||
        patient.phone.toLowerCase().includes(query),
    );
  }

  const handleQuickActionSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setState({
      quickActionSearchQuery: event.target.value,
    });
  };

  function getQuickActionPatientDirectory(): QuickActionPatient[] {
    return stateRef.current.patients.map((patient) => ({
      name: String(patient.patientName ?? ""),
      mrn: String(patient.patientId ?? ""),
      ageSex: `${patient.patientAge || "—"}/${patient.patientGender || "—"}`,
      phone: String(patient.Phone ?? "—"),
    }));
  }

  const handleQuickActionPatientSelect = (
    patient: QuickActionPatient,
  ): void => {
    setState({
      selectedQuickActionPatient: patient,
      quickActionSearchQuery: "",
    });
  };

  const closeQuickActionModal = (): void => {
    setState({
      quickActionModal: null,
      shareLinkSentMessage: null,
    });
  };

  const handleShareChannelSelect = (channel: ShareChannel): void => {
    setState({
      shareChannel: channel,
      shareLinkSentMessage: null,
    });
  };

  const handleShareMobileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 10);

    setState({
      shareMobileNumber: digits,
    });
  };

  const handleShareEmailChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setState({
      shareEmail: event.target.value,
    });
  };

  const handleSendShareLink = (): void => {
    const { shareChannel, shareMobileNumber, shareEmail } = stateRef.current;

    const destination =
      shareChannel === "email"
        ? shareEmail
        : `+91 ${shareMobileNumber}`;

    setState({
      shareLinkSentMessage: `Link sent via ${shareChannel} to ${destination}`,
    });
  };

  const handleHistoryTabChange = (tab: HistoryTab): void => {
    setState({
      historyActiveTab: tab,
    });
  };

  const handlePrintSlip = (): void => {
    window.print();
  };

  const handleDownloadSlipPdf = (): void => {
    console.log("Download PDF - not yet implemented");
  };

  const handleViewStudy = (study: QuickActionStudyRow): void => {
    console.log("View study", study);
  };

  function renderModalityButton(label: string, icon: string): React.ReactNode {
    const normalizedLabel = normalizeModalityValue(label);
    const selected = getSelectedModalityValue() === normalizedLabel;

    return (
      <button
        type="button"
        className={`${styles.modalityButton} ${selected ? styles.modalitySelected : ""
          }`}
        disabled={!stateRef.current.isWalkIn}
        onClick={() => {
          if (!stateRef.current.isWalkIn) {
            return;
          }

          setState({
            selectedModality: normalizedLabel,
            selectedSlot: null,
            appointmentConfirmed: false,
          });
        }}
      >
        <span className={styles.modalityIcon}>{icon}</span>

        <span>{label}</span>
      </button>
    );
  }

  function renderCalendar(): React.ReactNode {
    return (
      // <div className={styles.calendarBox}>
        <div
          ref={calendarContainerRef}
          className={styles.calendarContainer}
        />
      // </div>
    );
  }

  function renderResourceTimeline(): React.ReactNode {
    const resources = getFilteredResources();
    const selectedDate = formatDateISO(stateRef.current.selectedDate);
    const { start, end } = getTimelineRange();
    const cellMinutes = 15;
    const cellCount = (end - start) / cellMinutes;
    const timeToColumn = (time: string): number =>
      1 + (timeToMinutes(time) - start) / cellMinutes;
    const durationToSpan = (startTime: string, endTime: string): number =>
      (timeToMinutes(endTime) - timeToMinutes(startTime)) /
      cellMinutes;
    const gridStyle = {
      gridTemplateColumns: `repeat(${cellCount}, 44px)`,
    };

    return (
      <div className={styles.resourceTimelineScroll}>
        <div className={styles.resourceTimeline}>
          <div className={styles.resourceTimelineHeader}>
            <div className={styles.resourceTimelineCorner}>Resources</div>
            <div className={styles.resourceTimelineHours} style={gridStyle}>
              {Array.from(
                { length: (end - start) / 30 },
                (_, index) => start + index * 30,
              ).map((minutes) => {
                const time = minutesToTime(minutes);

                return (
                  <div
                    key={time}
                    className={styles.resourceTimelineHour}
                    style={{
                      gridColumn: `${timeToColumn(time)} / span 2`,
                    }}
                  >
                    {formatTime(time)}
                  </div>
                );
              })}
            </div>
          </div>

          {resources.map((resource) => {
            const schedule = resource.scheduler;
            const slots = getAvailableSlots(resource, selectedDate);
            const appointments = stateRef.current.showOnlyAvailable
              ? []
              : resource.appointments.filter(
                  (appointment) => appointment.date === selectedDate,
                );
            const blockedPeriods = stateRef.current.showOnlyAvailable
              ? []
              : resource.blockedPeriods.filter(
                  (blocked) => blocked.date === selectedDate,
                );

            return (
              <div className={styles.resourceTimelineRow} key={resource.id}>
                <div className={styles.resourceTimelineResource}>
                  <strong>{resource.name}</strong>
                  <span>Machine: {resource.machine}</span>
                  <small>
                    Operating: {schedule.scheduleStartTime} -{" "}
                    {schedule.scheduleEndTime}
                    {" · "}
                    Processing: {schedule.processingDurationMinutes} min
                  </small>
                </div>

                <div className={styles.resourceTimelineTrack} style={gridStyle}>
                  <div
                    className={styles.resourceTimelineWorkingHours}
                    style={{
                      gridColumn: `${timeToColumn(schedule.scheduleStartTime)} / span ${durationToSpan(
                        schedule.scheduleStartTime,
                        schedule.scheduleEndTime,
                      )}`,
                    }}
                  />

                  {schedule.breakStartTime && schedule.breakEndTime && (
                    <div
                      className={`${styles.resourceTimelineBlock} ${styles.resourceTimelineBreak}`}
                      style={{
                        gridColumn: `${timeToColumn(schedule.breakStartTime)} / span ${durationToSpan(
                          schedule.breakStartTime,
                          schedule.breakEndTime,
                        )}`,
                      }}
                    >
                      Break
                    </div>
                  )}

                  {blockedPeriods.map((blocked) => (
                    <div
                      key={`blocked-${blocked.id}`}
                      className={`${styles.resourceTimelineBlock} ${styles.resourceTimelineMaintenance}`}
                      style={{
                        gridColumn: `${timeToColumn(blocked.start)} / span ${durationToSpan(
                          blocked.start,
                          blocked.end,
                        )}`,
                      }}
                    >
                      Maintenance
                    </div>
                  ))}

                  {slots.map((slot) => {
                    const duration =
                      timeToMinutes(slot.end) -
                      timeToMinutes(slot.start);
                    const slotTooltip = `Available\nStart: ${formatTime(slot.start)}\nEnd: ${formatTime(slot.end)}\nDuration: ${duration} minutes`;

                    return (
                      <button
                        type="button"
                        key={`available-${slot.start}`}
                        className={`${styles.resourceTimelineEvent} ${styles.resourceTimelineAvailable}`}
                        title={slotTooltip}
                        aria-label={slotTooltip}
                        data-tooltip={slotTooltip}
                        style={{
                          gridColumn: `${timeToColumn(slot.start)} / span ${durationToSpan(
                            slot.start,
                            slot.end,
                          )}`,
                        }}
                        onClick={() =>
                          handleSlotSelect(
                            resource.id,
                            slot.date,
                            slot.start,
                            slot.end,
                          )
                        }
                      >
                        <strong>Available</strong>
                        <span>
                          {formatTime(slot.start)} -{" "}
                          {formatTime(slot.end)}
                        </span>
                      </button>
                    );
                  })}

                  {appointments.map((appointment) => {
                    const duration =
                      timeToMinutes(appointment.end) -
                      timeToMinutes(appointment.start);
                    const appointmentTooltip = `Patient: ${appointment.patient || "Appointment"}\nStart: ${formatTime(appointment.start)}\nEnd: ${formatTime(appointment.end)}\nDuration: ${duration} minutes`;

                    return (
                      <div
                        key={`appointment-${appointment.id}`}
                        className={`${styles.resourceTimelineEvent} ${appointment.status === "booked"
                          ? styles.resourceTimelineBooked
                          : styles.resourceTimelineConfirmed
                          } ${appointment.status === "booked"
                            ? styles.resourceTimelineSelectable
                            : ""
                          }`}
                        title={appointmentTooltip}
                        aria-label={appointmentTooltip}
                        data-tooltip={appointmentTooltip}
                        style={{
                          gridColumn: `${timeToColumn(appointment.start)} / span ${durationToSpan(
                            appointment.start,
                            appointment.end,
                          )}`,
                        }}
                        onClick={() =>
                          handleBookedAppointmentSelect(resource.id, appointment)
                        }
                      >
                        <strong>{appointment.patient || "Appointment"}</strong>
                        <span>
                          {formatTime(appointment.start)} -{" "}
                          {formatTime(appointment.end)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderListView(): React.ReactNode {
    const resources = getFilteredResources();

    const rows: Array<{
      resource: Resource;
      date: string;
      start: string;
      end: string;
      patient?: string;
      mrn?: string;
      status: AppointmentStatus | "available";
      appointmentId?: number;
    }> = [];

    const selectedDate = formatDateISO(stateRef.current.selectedDate);

    resources.forEach((resource) => {
      const availableSlots = getAvailableSlots(resource, selectedDate);

      availableSlots.forEach((slot) => {
        rows.push({
          resource,
          date: slot.date,
          start: slot.start,
          end: slot.end,
          status: "available",
        });
      });
    });

    if (!stateRef.current.showOnlyAvailable) {
      resources.forEach((resource) => {
        resource.appointments
          .filter((appointment) => appointment.date === selectedDate)
          .forEach((appointment) => {
            rows.push({
              resource,
              date: appointment.date,
              start: appointment.start,
              end: appointment.end,
              patient: appointment.patient,
              mrn: appointment.mrn,
              status: appointment.status,
              appointmentId: appointment.id,
            });
          });
      });
    }

    rows.sort((first, second) => {
      const timeDifference =
        timeToMinutes(first.start) - timeToMinutes(second.start);

      return timeDifference !== 0
        ? timeDifference
        : first.resource.name.localeCompare(second.resource.name);
    });

    return (
      <div className={styles.listView}>
        <div className={styles.listViewSummary}>
          <strong>{formatLongDate(stateRef.current.selectedDate)}</strong>
          <span>{rows.length} schedule entries</span>
        </div>
        <div className={styles.listHeader}>
          <span>Time</span>
          <span>Resource</span>
          <span>Patient</span>
          <span>MRN</span>
          <span>Status</span>
        </div>

        {rows.length === 0 ? (
          <div className={styles.emptyState}>
            No schedule entries available.
          </div>
        ) : (
          rows.map((row) => {
            const isAvailable = row.status === "available";

            return (
              <button
                type="button"
                key={`${row.resource.id}-${row.date}-${row.start}-${row.status}-${row.appointmentId ?? "available"}`}
                disabled={!isAvailable}
                className={styles.listRow}
                onClick={() => {
                  if (!isAvailable) {
                    return;
                  }

                  handleSlotSelect(
                    row.resource.id,
                    row.date,
                    row.start,
                    row.end,
                  );
                }}
              >
                <span>
                  {formatTime(row.start)} - {formatTime(row.end)}
                </span>

                <span>{row.resource.name}</span>

                <span>{row.patient || "Available slot"}</span>

                <span>{row.mrn || "—"}</span>

                <span className={styles[`${row.status}Badge`]}>
                  {row.status}
                </span>
              </button>
            );
          })
        )}
      </div>
    );
  }

  function renderSidebar(): React.ReactNode {
    const availability = getAvailabilityOverview();
    const selectedResource = getResources().find(
      (resource) => resource.id === stateRef.current.selectedSlot?.resourceId,
    );
    const selectedDate = formatDateISO(stateRef.current.selectedDate);
    const referringDoctor = getReferringDoctorName();
    const now = new Date();
    const today = formatDateISO(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const allAppointments = getResources()
      .flatMap((resource) =>
        resource.appointments.map((appointment) => ({
          resource,
          appointment,
        })),
      )
      .filter(({ appointment }) =>
        appointment.status === "booked" || appointment.status === "confirmed",
      )
      .sort((first, second) => {
        const dateComparison = first.appointment.date.localeCompare(
          second.appointment.date,
        );

        return dateComparison !== 0
          ? dateComparison
          : timeToMinutes(first.appointment.start) -
          timeToMinutes(second.appointment.start);
      });
    const futureAppointments = allAppointments.filter(
      ({ appointment }) =>
        appointment.date > today ||
        (appointment.date === today &&
          timeToMinutes(appointment.start) > currentMinutes),
    );
    const selectedDayAppointments = allAppointments.filter(
      ({ appointment }) => appointment.date === selectedDate,
    );
    const visibleUpcomingAppointments = stateRef.current.showAllUpcoming
      ? selectedDayAppointments
      : futureAppointments.slice(0, 6);

    return (
      <aside className={styles.sidebar}>
        {/* SUMMARY */}

        <section className={styles.sidebarCard}>
          <h3>
            <span>▣</span>
            Appointment Summary
          </h3>

          <div className={styles.summaryRows}>
            <div>
              <span>Patient</span>

              <strong>
                {getCurrentFormPatient().name}
              </strong>
            </div>

            <div>
              <span>MRN</span>

              <strong>
                {getCurrentFormPatient().mrn}
              </strong>
            </div>

            <div>
              <span>Study</span>

              <strong>{stateRef.current.selectedStudy}</strong>
            </div>

            <div>
              <span>Modality</span>

              <strong>{stateRef.current.selectedModality}</strong>
            </div>

            <div>
              <span>Date</span>

              <strong>
                {stateRef.current.selectedSlot
                  ? formatDate(
                    new Date(`${stateRef.current.selectedSlot.date}T00:00:00`),
                  )
                  : "Not selected"}
              </strong>
            </div>

            <div>
              <span>Time</span>

              <strong>
                {stateRef.current.selectedSlot
                  ? `${formatTime(
                    stateRef.current.selectedSlot.start,
                  )} - ${formatTime(stateRef.current.selectedSlot.end)}`
                  : "Not selected"}
              </strong>
            </div>

            <div>
              <span>Resource</span>

              <strong>{selectedResource?.name || "Not selected"}</strong>
            </div>

            <div>
              <span>Referring Doctor</span>

              <strong>{referringDoctor || "Not selected"}</strong>
            </div>

            <div>
              <span>Status</span>

              <strong
                className={
                  isSelectedSlotConfirmed()
                    ? styles.statusConfirmed
                    : isSelectedSlotBooked() || stateRef.current.draftSaved
                      ? styles.statusDraft
                      : styles.statusPending
                }
              >
                {isSelectedSlotConfirmed()
                  ? "Confirmed"
                  : isSelectedSlotBooked()
                    ? "Booked"
                    : stateRef.current.draftSaved
                      ? "Draft"
                      : "Pending"}
              </strong>
            </div>
          </div>
        </section>

        {/* AVAILABILITY */}

        <section className={styles.sidebarCard}>
          <h3>
            <span>▣</span>
            Availability Overview
          </h3>

          <div className={styles.availabilityRows}>
            <div>
              <span>▣</span>

              <label>Today's Appointments</label>

              <strong>
                {availability.today.appointments} / {availability.today.capacity}
              </strong>
            </div>

            <div>
              <span>▣</span>

              <label>This Week</label>

              <strong>
                {availability.week.appointments} / {availability.week.capacity}
              </strong>
            </div>

            <div>
              <span>◉</span>

              <label>{availability.rooms[0].label}</label>

              <strong>
                {availability.rooms[0].appointments} / {availability.rooms[0].capacity}
              </strong>
            </div>

            <div>
              <span>◉</span>

              <label>{availability.rooms[1].label}</label>

              <strong>
                {availability.rooms[1].appointments} / {availability.rooms[1].capacity}
              </strong>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}

        <section className={styles.sidebarCard}>
          <h3>
            <span>⌕</span>
            Quick Actions
          </h3>

          <div className={styles.quickActions}>
            <button
              type="button"
              onClick={() => openQuickActionModal("history")}
            >
              ◉ &nbsp; Check Patient History
            </button>

            <button
              type="button"
              onClick={() => openQuickActionModal("previousStudies")}
            >
              ▣ &nbsp; View Previous Studies
            </button>

            <button
              type="button"
              disabled={!isSelectedSlotConfirmed()}
              onClick={() => openQuickActionModal("printSlip")}
            >
              ▤ &nbsp; Print Appointment Slip
            </button>

            <button
              type="button"
              disabled={!isSelectedSlotConfirmed()}
              onClick={() => openQuickActionModal("shareLink")}
            >
              ↗ &nbsp; Share Appointment Link
            </button>

            <button
              type="button"
              disabled={!isSelectedSlotConfirmed()}
              onClick={() => openQuickActionModal("qrCode")}
            >
              ▦ &nbsp; Generate QR Code
            </button>
          </div>
        </section>

        {/* UPCOMING */}

        <section className={styles.sidebarCard_upcoming}>
          <div className={styles.upcomingHeader}>
            <h3>
              {stateRef.current.showAllUpcoming
                ? "Selected Day Appointments"
                : "Upcoming Appointments"}
            </h3>

            <button
              type="button"
              onClick={() =>
                setState((state) => ({
                  showAllUpcoming: !state.showAllUpcoming,
                }))
              }
            >
              {stateRef.current.showAllUpcoming ? "Show Upcoming" : "View All"}
            </button>
          </div>

          <div className={styles.upcomingList}>
            {visibleUpcomingAppointments.length === 0 ? (
              <div className={styles.upcomingEmptyState}>
                {stateRef.current.showAllUpcoming
                  ? "No appointments for the selected day."
                  : "No future appointments."}
              </div>
            ) : (
              visibleUpcomingAppointments.map(({ resource, appointment }) => (
                <button
                  type="button"
                  className={`${styles.upcomingAppointment} ${
                    appointment.status === "booked"
                      ? styles.upcomingBooked
                      : styles.upcomingConfirmed
                  }`}
                  key={`${resource.id}-${appointment.id}`}
                  onClick={() =>
                    handleBookedAppointmentSelect(resource.id, appointment)
                  }
                >
                  <i />
                  <div>
                    <strong>{formatTime(appointment.start)}</strong>
                    <span>{appointment.patient || "Appointment"}</span>
                    <small>{appointment.mrn || "MRN not recorded"}</small>
                  </div>
                  <b>{resource.name}</b>
                </button>
              ))
            )}
          </div>
        </section>
      </aside>
    );
  }

  function renderQuickActionModal(): React.ReactNode {
    const { quickActionModal } = stateRef.current;

    if (!quickActionModal) {
      return null;
    }

    let body: React.ReactNode = null;
    let header: { icon: string; title: string } = { icon: "", title: "" };
    let wide = false;

    switch (quickActionModal) {
      case "qrCode":
        header = { icon: "▦", title: "Generate QR Code" };
        body = renderQrCodeModalBody();
        break;
      case "shareLink":
        header = { icon: "↗", title: "Share Appointment Link" };
        body = renderShareModalBody();
        break;
      case "printSlip":
        header = { icon: "▤", title: "Print Appointment Slip" };
        body = renderPrintSlipModalBody();
        break;
      case "previousStudies":
        header = { icon: "▣", title: "View Previous Studies" };
        body = renderPreviousStudiesModalBody();
        wide = true;
        break;
      case "history":
        header = { icon: "◷", title: "Check Patient History" };
        body = renderHistoryModalBody();
        wide = true;
        break;
      default:
        break;
    }

    return (
      <div className={styles.quickActionModalOverlay}>
        <div
          className={`${styles.quickActionModal} ${wide ? styles.quickActionModalWide : ""
            }`}
        >
          <div className={styles.quickActionModalHeader}>
            <span className={styles.quickActionModalHeaderIcon}>
              {header.icon}
            </span>
            <span className={styles.quickActionModalTitle}>
              {header.title}
            </span>
            <button
              type="button"
              className={styles.quickActionModalClose}
              onClick={closeQuickActionModal}
            >
              ✕
            </button>
          </div>

          {body}
        </div>
      </div>
    );
  }

  function renderQuickActionPatientCard(
    showAppointment: boolean,
  ): React.ReactNode {
    const patient = getActiveQuickActionPatient();
    const appointment = getEffectiveAppointment();

    return (
      <div className={styles.quickActionPatientCard}>
        <span className={styles.quickActionPatientAvatar}>☺</span>
        <div>
          <strong>{patient.name}</strong>
          <span>
            MRN: {patient.mrn} &nbsp;|&nbsp; Age/Sex: {patient.ageSex}
          </span>
          <span>
            {showAppointment
              ? `Appointment: ${appointment.appointmentNumber} | ${appointment.date} ${appointment.time}`
              : `Phone: ${patient.phone}`}
          </span>
        </div>
      </div>
    );
  }

  function renderQrCodeModalBody(): React.ReactNode {
    return (
      <div className={styles.quickActionModalBody}>
        <p className={styles.quickActionModalDescription}>
          Scan the QR code to view the appointment details.
        </p>

        {renderQuickActionPatientCard(true)}

        <div className={styles.quickActionQrArea}>
          <div className={styles.quickActionQrPlaceholder}>▦</div>
        </div>

        <p className={styles.quickActionQrCaption}>
          This QR code contains the appointment details and can be scanned by
          the patient.
        </p>

        <div className={styles.quickActionFooter}>
          <button
            type="button"
            className={styles.quickActionButtonSecondary}
            onClick={closeQuickActionModal}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  function renderShareModalBody(): React.ReactNode {
    const {
      shareChannel,
      shareMobileNumber,
      shareEmail,
      shareLinkSentMessage,
    } = stateRef.current;

    const channels: {
      id: ShareChannel;
      label: string;
      icon: React.ReactNode;
    }[] = [
        { id: "whatsapp", label: "WhatsApp", icon: renderWhatsAppIcon() },
        { id: "sms", label: "SMS", icon: renderSmsIcon() },
        { id: "email", label: "Email", icon: renderEmailIcon() },
      ];

    const isEmail = shareChannel === "email";

    return (
      <div className={styles.quickActionModalBody}>
        <p className={styles.quickActionModalDescription}>
          Send the appointment link to the patient via SMS, WhatsApp or
          Email.
        </p>

        {renderQuickActionPatientCard(true)}

        <label className={styles.quickActionFieldLabel}>Share via</label>

        <div className={styles.quickActionShareOptions}>
          {channels.map((channel) => (
            <button
              type="button"
              key={channel.id}
              className={`${styles.quickActionShareOption} ${shareChannel === channel.id
                ? styles.quickActionShareOptionActive
                : ""
                }`}
              onClick={() => handleShareChannelSelect(channel.id)}
            >
              <span className={styles.quickActionShareIcon}>
                {channel.icon}
              </span>
              <strong>{channel.label}</strong>
            </button>
          ))}
        </div>

        <label className={styles.quickActionFieldLabel}>
          {isEmail ? "Email Address" : "Mobile Number"}
        </label>

        {isEmail ? (
          <div className={styles.quickActionEmailRow}>
            <input
              type="email"
              placeholder="patient@example.com"
              value={shareEmail}
              onChange={handleShareEmailChange}
            />
          </div>
        ) : (
          <div className={styles.quickActionPhoneRow}>
            <span className={styles.quickActionCountryCode}>+91</span>
            <input
              type="tel"
              inputMode="numeric"
              value={shareMobileNumber}
              onChange={handleShareMobileChange}
            />
          </div>
        )}

        {shareLinkSentMessage && (
          <div className={styles.quickActionSuccessNote}>
            {shareLinkSentMessage}
          </div>
        )}

        <div className={styles.quickActionFooter}>
          <button
            type="button"
            className={styles.quickActionButtonPrimary}
            onClick={handleSendShareLink}
          >
            Send Link
          </button>
          <button
            type="button"
            className={styles.quickActionButtonSecondary}
            onClick={closeQuickActionModal}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function renderWhatsAppIcon(): React.ReactNode {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#25D366" />
        <path
          d="M12 5.5a6.5 6.5 0 0 0-5.6 9.8L5.5 18.5l3.3-.9A6.5 6.5 0 1 0 12 5.5Z"
          fill="#fff"
        />
        <path
          d="M9.8 8.9c.2-.4.4-.4.6-.4h.4c.15 0 .35 0 .5.4.2.5.6 1.4.65 1.5.05.1.08.2 0 .35-.08.15-.12.25-.25.4-.12.15-.26.32-.37.43-.12.12-.25.25-.1.5.14.25.65 1.05 1.4 1.7.96.85 1.77 1.1 2 1.2.24.1.38.1.52-.05.15-.15.6-.7.76-.95.15-.24.3-.2.5-.12.2.08 1.28.6 1.5.7.22.1.36.15.42.24.06.1.06.55-.13 1.08-.2.53-1.13 1.03-1.56 1.1-.42.06-.9.09-1.45-.1-.34-.1-.77-.24-1.32-.47-2.32-1-3.83-3.33-3.95-3.5-.12-.16-.94-1.25-.94-2.38 0-1.13.6-1.68.8-1.9Z"
          fill="#25D366"
        />
      </svg>
    );
  }

  function renderSmsIcon(): React.ReactNode {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="2" y="4" width="20" height="14" rx="3" fill="#5B7FDB" />
        <path
          d="M4 6.5 12 12l8-5.5"
          fill="none"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  function renderEmailIcon(): React.ReactNode {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="2" y="4" width="20" height="14" rx="2" fill="#fff" stroke="#dadce0" />
        <path
          d="M3 6.2 12 13l9-6.8"
          fill="none"
          stroke="#EA4335"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 6.2v10.6h4V9.6L3 6.2Z" fill="#4285F4" />
        <path d="M21 6.2v10.6h-4V9.6l4-3.4Z" fill="#34A853" />
        <path d="M3 6.2 12 13l9-6.8v2.4L12 15.4 3 8.6V6.2Z" fill="#FBBC05" />
      </svg>
    );
  }

  function renderPrintSlipModalBody(): React.ReactNode {
    const appointment = getEffectiveAppointment();

    const rows: [string, string][] = [
      ["Appointment No.", appointment.appointmentNumber],
      ["Date", appointment.date],
      ["Time", appointment.time],
      ["Department", appointment.department],
      ["Modality", appointment.modality],
      ["Ref. Doctor", appointment.refDoctor],
    ];

    return (
      <div className={styles.quickActionModalBody}>
        <p className={styles.quickActionModalDescription}>
          Generate and print the appointment slip for the selected patient.
        </p>

        {renderQuickActionPatientCard(false)}

        <div className={styles.quickActionAppointmentCard}>
          {rows.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className={styles.quickActionFooter}>
          <button
            type="button"
            className={styles.quickActionButtonPrimary}
            onClick={handlePrintSlip}
          >
            🖨 Print
          </button>
          <button
            type="button"
            className={styles.quickActionButtonSecondary}
            onClick={handleDownloadSlipPdf}
          >
            ⬇ Download PDF
          </button>
          <button
            type="button"
            className={styles.quickActionButtonSecondary}
            onClick={closeQuickActionModal}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  function renderQuickActionSearchRow(): React.ReactNode {
    const matches = getQuickActionSearchMatches();

    return (
      <div className={styles.quickActionSearchWrapper}>
        <label className={styles.quickActionFieldLabel}>
          Patient Search
        </label>
        <div className={styles.quickActionSearchInput}>
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search by MRN, Patient Name, Phone No. etc..."
            value={stateRef.current.quickActionSearchQuery}
            disabled = {(!stateRef.current.isWalkIn)}
            onChange={handleQuickActionSearchChange}
          />
        </div>

        {matches.length > 0 && (
          <div className={styles.quickActionSearchSuggestions}>
            {matches.map((patient) => (
              <button
                type="button"
                key={patient.mrn}
                className={styles.quickActionSearchSuggestion}
                onClick={() => handleQuickActionPatientSelect(patient)}
              >
                <strong>{patient.name}</strong>
                <span>
                  {patient.mrn} &nbsp;|&nbsp; {patient.phone}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function getEffectiveStudies(reportsOnly: boolean = false): QuickActionStudyRow[] {
    const activePatient = getActiveQuickActionPatient();
    const patientObj = stateRef.current.patients.find(
      (patient) =>
        String(patient.patientId ?? "").toLowerCase() === activePatient.mrn.toLowerCase() ||
        String(patient.patientName ?? "").toLowerCase() === activePatient.name.toLowerCase(),
    );
    const history = getPatientHistory(String(patientObj?.patientId ?? ""));
    let rows: QuickActionStudyRow[] = history.map((record) => ({
      id: record.id,
      date: record.date,
      accessionNumber: record.accessionNumber,
      modality: record.modality,
      studyDescription: record.studyDescription,
      imageCount: record.imageCount,
      status: record.status,
      reportStatus: record.reportStatus,
    }));
    if (reportsOnly) {
      rows = rows.filter((r) => r.reportStatus === "Final");
    }
    return rows;
  }

  function renderQuickActionStudiesTable(
    withActions: boolean,
    reportsOnly: boolean = false,
  ): React.ReactNode {
    const studies = getEffectiveStudies(reportsOnly);

    if (studies.length === 0) {
      return (
        <div className={styles.emptyState}>
          {reportsOnly ? "No reports available." : "No studies available."}
        </div>
      );
    }

    return (
      <div className={styles.quickActionTable}>
        <div
          className={`${styles.quickActionTableHeader} ${withActions
            ? styles.quickActionTableRowWithActions
            : styles.quickActionTableRowPlain
            }`}
        >
          <span>Date</span>
          <span>Accession No.</span>
          <span>Modality</span>
          <span>Study Description</span>
          {withActions && <span>Images</span>}
          <span>Status</span>
          {withActions && <span>View</span>}
        </div>

        {studies.map((study) => (
          <div
            key={study.id}
            className={`${styles.quickActionTableRow} ${withActions
              ? styles.quickActionTableRowWithActions
              : styles.quickActionTableRowPlain
              }`}
          >
            <span>{study.date}</span>
            <span>{study.accessionNumber}</span>
            <span>{study.modality}</span>
            <span>{study.studyDescription}</span>
            {withActions && <span>{study.imageCount}</span>}
            <span>
              <span className={styles.quickActionStatusBadge}>
                {study.status}
              </span>
            </span>
            {withActions && (
              <span>
                <button
                  type="button"
                  className={styles.quickActionViewButton}
                  onClick={() => handleViewStudy(study)}
                >
                  👁 View
                </button>
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderPreviousStudiesModalBody(): React.ReactNode {
    return (
      <div className={styles.quickActionModalBody}>
        <p className={styles.quickActionModalDescription}>
          Search and view all previous studies for the patient.
        </p>

        {renderQuickActionSearchRow()}

        {renderQuickActionPatientCard(false)}

        {renderQuickActionStudiesTable(true, false)}

        <div className={styles.quickActionFooter}>
          <button
            type="button"
            className={styles.quickActionButtonSecondary}
            onClick={closeQuickActionModal}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  function renderHistoryModalBody(): React.ReactNode {
    const { historyActiveTab } = stateRef.current;

    const tabs: { id: HistoryTab; label: string }[] = [
      { id: "visits", label: "Previous Visits" },
      { id: "studies", label: "Studies" },
      { id: "reports", label: "Reports" },
    ];

    return (
      <div className={styles.quickActionModalBody}>
        <p className={styles.quickActionModalDescription}>
          View the patient's previous visits, studies, and reports.
        </p>

        {renderQuickActionSearchRow()}

        {renderQuickActionPatientCard(false)}

        <div className={styles.quickActionTabs}>
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={
                historyActiveTab === tab.id
                  ? styles.quickActionTabActive
                  : ""
              }
              onClick={() => handleHistoryTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {historyActiveTab === "reports"
          ? renderQuickActionStudiesTable(false, true)
          : renderQuickActionStudiesTable(false, false)}

        <div className={styles.quickActionFooter}>
          <button
            type="button"
            className={styles.quickActionButtonSecondary}
            onClick={closeQuickActionModal}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  function render(): React.ReactNode {
    const selectedSlot = stateRef.current.selectedSlot;

    return (
      <div className={styles.page}>
        {/* MAIN */}

        <div className={styles.pageGrid}>
          <main className={styles.mainContent}>
            {/* TITLE */}

            <div className={styles.titleSection}>
              <div className={styles.titleText}>
                <h1>Study Scheduling & Appointment Booking</h1>

                <p>
                  Schedule radiology studies and manage appointments efficiently
                </p>
              </div>
              <button
                type="button"
                className={styles.walkInButton}
                onClick={() =>
                  setState((previousState) => ({
                    isWalkIn: !previousState.isWalkIn,
                    patientDetails: previousState.patientDetails || {},
                  }))
                }
              >
                {stateRef.current.isWalkIn ? "✕ Exit Walk-in" : "＋ Walk-in Patient"}
              </button>
            </div>

            {/* =================================================
                SECTION 1 + 2
            ================================================= */}

            <div className={styles.topSections}>
              {/* SECTION 1 */}

              <section className={styles.card}>
                <div className={styles.sectionTitle}>
                  <span>1</span>
                  Patient & Study Information
                </div>

                <div className={styles.patientGrid}>
                  <div className={styles.formGroup}>
                    <label>
                      Patient Search <em>*</em>
                    </label>

                    <div className={styles.inputWithIcon}>
                      <input
                        type="text"
                        placeholder={(stateRef.current.isWalkIn) ? "Search by Name / MRN / Phone" : "Select Walk In Pateint To Search"}
                        
                        value={stateRef.current.patientSearch}
                        disabled = { !stateRef.current.isWalkIn }
                        onChange={(event) =>
                          setState({
                            patientSearch: event.target.value,
                          })
                        }
                      />

                      <span>⌕</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Referring Doctor</label>

                    <select
                      value={getSelectedDoctorId()}
                      disabled={!stateRef.current.isWalkIn}
                      onChange={(event) =>
                        updatePatientDetails({
                          referringDoctor: event.target.value,
                        })
                      }
                    >
                      {!stateRef.current.isWalkIn ? (
                        <option value="N/A">N/A</option>
                      ) : (
                        <option value="">Select referring doctor</option>
                      )}

                      {!stateRef.current.isWalkIn && stateRef.current.doctors.length > 0 && (
                        stateRef.current.doctors.map((doctor) => (
                          <option key={doctor.id} value={String(doctor.id)}>
                            {doctor.docname}
                          </option>
                        ))
                      )}

                      {stateRef.current.isWalkIn && getSelectedDoctorId() &&
                        !stateRef.current.doctors.some(
                          (doctor) =>
                            String(doctor.id) === getSelectedDoctorId(),
                        ) && (
                          <option value={getSelectedDoctorId()}>
                            {stateRef.current.patientDetails?.referringDoctor}
                          </option>
                        )}

                      {stateRef.current.isWalkIn && stateRef.current.doctors.map((doctor) => (
                        <option key={doctor.id} value={String(doctor.id)}>
                          {doctor.docname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>MRN/ PATIENT ID</label>

                    <input
                      type="text"
                      placeholder="Enter MRN if available"
                      value={String(stateRef.current.patientDetails?.patientId ?? "")}
                      readOnly={!stateRef.current.isWalkIn}
                      onChange={(event) =>
                        updatePatientDetails({ patientId: event.target.value })
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Clinical Indication</label>

                    <textarea
                      placeholder="Enter clinical indication"
                      value={stateRef.current.clinicalIndication}
                      onChange={(event) =>
                        setState({
                          clinicalIndication: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      Patient Name <em>*</em>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter patient name"
                      value={stateRef.current.patientDetails?.patientName ?? ""}
                      readOnly={!stateRef.current.isWalkIn}
                      onChange={(event) =>
                        updatePatientDetails({ patientName: event.target.value })
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Study Description</label>

                    <input
                      type="text"
                      placeholder="Study description"
                      value={stateRef.current.patientDetails?.Description ?? ""}
                      readOnly={!stateRef.current.isWalkIn}
                      onChange={(event) =>
                        updatePatientDetails({ Description: event.target.value })
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Age</label>

                    <input
                      type="text"
                      placeholder="Enter age"
                      value={stateRef.current.patientDetails?.patientAge ?? ""}
                      readOnly={!stateRef.current.isWalkIn}
                      onChange={(event) =>
                        updatePatientDetails({ patientAge: event.target.value })
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Gender</label>

                    <input
                      type="text"
                      placeholder="Enter gender"
                      value={stateRef.current.patientDetails?.patientGender ?? ""}
                      readOnly={!stateRef.current.isWalkIn}
                      onChange={(event) =>
                        updatePatientDetails({ patientGender: event.target.value })
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone</label>

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Enter 10-digit phone number"
                      value={String(stateRef.current.patientDetails?.Phone ?? "")}
                      readOnly={!stateRef.current.isWalkIn}
                      onChange={(event) => {
                        const phone = event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);

                        updatePatientDetails({ Phone: phone });
                      }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Priority</label>

                    <div className={styles.priorityGroup}>
                      {["Routine", "Urgent", "STAT"].map((priority) => (
                        <button
                          type="button"
                          key={priority}
                          disabled={!stateRef.current.isWalkIn}
                          className={
                            stateRef.current.selectedPriority === priority
                              ? styles.priorityActive
                              : ""
                          }
                          onClick={() => handlePriority(priority)}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 2 */}

              <section className={styles.card}>
                <div className={styles.sectionTitle}>
                  <span>2</span>
                  Study & Modality Selection
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Study / Procedure <em>*</em>
                  </label>

                  <input
                    type="text"
                    value={getSelectedStudyValue()}
                    readOnly={!stateRef.current.isWalkIn}
                    placeholder="Enter study / procedure"
                    onChange={(event) => {
                      if (!stateRef.current.isWalkIn) {
                        return;
                      }

                      setState({
                        selectedStudy: event.target.value,
                        selectedSlot: null,
                        appointmentConfirmed: false,
                      });
                    }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Modality <em>*</em>
                  </label>

                  <div className={styles.modalityGroup}>
                    {renderModalityButton("CT", "◈")}

                    {renderModalityButton("MRI", "◉")}

                    {renderModalityButton("XRAY", "⚒")}

                    {renderModalityButton("USG", "◔")}

                    {renderModalityButton("MAMMO", "◫")}

                    {renderModalityButton("NM", "♧")}

                    {renderModalityButton("OTHER", "⊙")}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Body Part (Optional)</label>

                  <select>
                    <option>Abdomen</option>

                    <option>Chest</option>

                    <option>Head</option>

                    <option>Pelvis</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Contrast Required</label>

                  <div className={styles.contrastGroup}>
                    {["Yes", "No", "Not Applicable"].map((contrast) => (
                      <button
                        type="button"
                        key={contrast}
                        className={
                          stateRef.current.selectedContrast === contrast
                            ? styles.contrastActive
                            : ""
                        }
                        onClick={() => handleContrast(contrast)}
                      >
                        {contrast}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* =================================================
                SECTION 3
            ================================================= */}

            <section className={styles.card}>
              <div className={styles.sectionTitle}>
                <span>3</span>
                Date, Time & Resource Selection
              </div>

              <div className={styles.scheduler}>
                {/* DATE */}

                <div className={styles.datePanel}>
                  <h4>Select Date</h4>

                  {renderCalendar()}
                </div>

                {/* SCHEDULE */}

                <div className={styles.schedulePanel}>
                  <div className={styles.scheduleToolbar}>
                    {/* DATE CONTROLS */}

                    <div className={styles.dateControls}>
                      
                        <strong>
                        {formatLongDate(stateRef.current.selectedDate)}
                      </strong>
                  
              
                      <button type="button" onClick={previousDay}>
                        ‹
                      </button>

                      <button type="button" onClick={goToToday}>
                        Today
                      </button>
                      <button type="button" onClick={nextDay}>
                        ›
                      </button>
                
                    </div>
                  </div>

                  <div className={styles.schedulerContent}>
                    {/* FILTERS */}

                    <aside className={styles.resourceFilters}>
                      <h4>Resource Filters</h4>

                      <div className={styles.viewButtons}>
                        <button
                          type="button"
                          className={
                            stateRef.current.view === "list" ? styles.activeView : ""
                          }
                          onClick={() =>
                            setState({
                              view: "list",
                            })
                          }
                        >
                          List View
                        </button>

                        <button
                          type="button"
                          className={
                            stateRef.current.view === "timeline"
                              ? styles.activeView
                              : ""
                          }
                          onClick={() =>
                            setState({
                              view: "timeline",
                            })
                          }
                        >
                          Timeline View
                        </button>
                      </div>

                      <label>Location / Center</label>

                      <select
                        value={stateRef.current.location}
                        onChange={(event) =>
                          setState({
                            location: event.target.value,
                          })
                        }
                      >
                        <option>Main Center</option>

                        <option>All</option>
                      </select>

                      <label>Department</label>

                      <select
                        value={stateRef.current.department}
                        onChange={(event) =>
                          setState({
                            department: event.target.value,
                          })
                        }
                      >
                        <option>Radiology</option>

                        <option>All</option>
                      </select>

                      <label>Room / Scanner</label>

                      <select
                        value={stateRef.current.room}
                        onChange={(event) =>
                          setState({
                            room: event.target.value,
                          })
                        }
                      >
                        <option value="All">All</option>

                        {getResources()
                          .filter(
                            (resource) =>
                              resource.modality === stateRef.current.selectedModality,
                          )
                          .map((resource) => (
                            <option value={resource.id} key={resource.id}>
                              {resource.name}
                            </option>
                          ))}
                      </select>

                      <label className={styles.checkLabel}>
                        <input
                          type="checkbox"
                          checked={stateRef.current.showOnlyAvailable}
                          onChange={(event) =>
                            setState({
                              showOnlyAvailable: event.target.checked,
                            })
                          }
                        />

                        <span>Show only available slots</span>
                      </label>
                    </aside>

                    {/* =================================================
                        SCHEDULE CHART
                    ================================================= */}

                    <div className={styles.timelinePanel}>
                      {stateRef.current.view === "list" ? (
                        <>
                          {renderListView()}
                        </>
                      ) : (
                        <>
                          <div className={styles.legend}>
                            <span>
                              <i className={styles.availableDot} />
                              Available
                            </span>
                            <span>
                              <i className={styles.bookedDot} />
                              Booked
                            </span>

                            <span>
                              <i className={styles.confirmedDot} />
                              Confirmed
                            </span>

                            <span>
                              <i className={styles.maintenanceDot} />
                              Maintenance
                            </span>
                          </div>

                          {renderResourceTimeline()}
                        </>
                      )}

                      {/* SELECTED SLOT */}

                      <div className={styles.selectedSlot}>
                        {selectedSlot ? (
                          <>
                            <div>
                              <span>Selected Slot</span>

                              <strong>
                                {new Date(
                                  `${selectedSlot.date}T00:00:00`,
                                ).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                                , {formatTime(selectedSlot.start)} -{" "}
                                {formatTime(selectedSlot.end)}
                              </strong>
                            </div>

                            <div>
                              <strong>
                                {
                                  getResources().find(
                                    (resource) =>
                                      resource.id === selectedSlot.resourceId,
                                  )?.name
                                }
                              </strong>
                            </div>
                          </>
                        ) : (
                          <span>Select an available slot</span>
                        )}

                        <button
                          type="button"
                          disabled={
                            !selectedSlot ||
                            isSelectedSlotBooked() ||
                            isSelectedSlotConfirmed()
                          }
                          onClick={() => bookSelectedSlot()}
                        >
                          Book This Slot
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                SECTION 4 / 5 / 6
            ================================================= */}

            <div className={styles.bottomSections}>
              {/* 4 */}

              <section className={styles.card}>
                <div className={styles.sectionTitle}>
                  <span>4</span>
                  Appointment Details
                </div>

                <div className={styles.appointmentTabs}>
                  <button
                    type="button"
                    className={
                      stateRef.current.appointmentType === "new"
                        ? styles.activeTab
                        : ""
                    }
                    onClick={() => handleAppointmentType("new")}
                  >
                    New Appointment
                  </button>

                  <button
                    type="button"
                    className={
                      stateRef.current.appointmentType === "followup"
                        ? styles.activeTab
                        : ""
                    }
                    onClick={() => handleAppointmentType("followup")}
                  >
                    Follow-up
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <label>Appointment Mode</label>

                  <div className={styles.modeRow}>
                    <select
                      value={stateRef.current.appointmentMode}
                      onChange={(event) =>
                        setState({
                          appointmentMode: event.target.value,
                        })
                      }
                    >
                      <option>In-Person</option>

                      <option>Teleconsultation</option>
                    </select>

                    <button type="button">Add any special</button>
                  </div>
                </div>

                <div className={styles.notifications}>
                  <label>
                    <input
                      type="checkbox"
                      checked={stateRef.current.sendSms}
                      onChange={(event) =>
                        setState({
                          sendSms: event.target.checked,
                        })
                      }
                    />
                    Send SMS Notification
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={stateRef.current.sendEmail}
                      onChange={(event) =>
                        setState({
                          sendEmail: event.target.checked,
                        })
                      }
                    />
                    Send Email Notification
                  </label>
                </div>
              </section>

              {/* 5 */}

              <section className={styles.card}>
                <div className={styles.sectionTitle}>
                  <span>5</span>
                  Preparation & Instructions
                </div>

                <div className={styles.formGroup}>
                  <label>Preparation Protocol</label>

                  <select
                    value={stateRef.current.preparationProtocol}
                    onChange={(event) =>
                      setState({
                        preparationProtocol: event.target.value,
                      })
                    }
                  >
                    <option>Oral & IV Contrast</option>

                    <option>Fasting</option>

                    <option>No Preparation</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Instructions for Patient</label>

                  <textarea
                    value={stateRef.current.instructions}
                    onChange={(event) =>
                      setState({
                        instructions: event.target.value,
                      })
                    }
                  />
                </div>

                <button type="button" className={styles.customInstruction}>
                  ＋ Add Custom Instruction
                </button>
              </section>

              {/* 6 */}

              <section className={styles.card}>
                <div className={styles.sectionTitle}>
                  <span>6</span>
                  Upload Attachments <small>(Optional)</small>
                </div>

                <label className={styles.uploadBox}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    hidden
                    onChange={handleFile}
                  />

                  <span className={styles.uploadIcon}>☁</span>

                  <strong>
                    {stateRef.current.selectedFileName || "Drag & drop files here"}
                  </strong>

                  <span>or click to browse</span>

                  <small>PDF, JPG, PNG · Max 5MB</small>
                </label>
              </section>
            </div>

          </main>

          {renderSidebar()}
        </div>

        {/* FOOTER */}

        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearAll}
          >
            Clear All
          </button>

          <div>
            <button
              type="button"
              className={styles.draftButton}
              onClick={saveDraft}
            >
              {isSelectedSlotBooked() || stateRef.current.draftSaved
                ? "Draft Saved"
                : "Save as Draft"}
            </button>

            <button
              type="button"
              className={styles.confirmButton}
              onClick={confirmAppointment}
            >
              ▣ &nbsp;
              {isSelectedSlotConfirmed()
                ? "Appointment Confirmed"
                : "Confirm Appointment"}
            </button>
          </div>
        </div>

        {renderQuickActionModal()}
      </div>
    );
  }

  // Preserve the class lifecycle behavior while keeping this page a function component.
  React.useEffect(() => {
    
    requestAnimationFrame(() => {
      // Fetch patient details for the selected Worklist exam.
      const examId = getExamIdFromUrl();
      const priority = getPriorityFromUrl();

      if (priority && !stateRef.current.isWalkIn) {
        setState({ selectedPriority: priority });
      }

      if (examId !== null) {
        void fetchPatientDetails(examId);
      }
      void fetchDoctors();
      
      const calendarContainer = calendarContainerRef.current;

      if (calendarContainer) {
        calendarContainer.innerHTML = "";

        calendarInstanceRef.current = CalendarJS.Calendar(calendarContainer, {
          type: "inline",

          value: formatDateISO(stateRef.current.selectedDate),

          onchange: (_self: unknown, value: string | number) => {
            const date = new Date(value);

            if (!isNaN(date.getTime())) {
              handleCalendarDate(date);
            }
          },
        });
      }

    });
  
    return () => { 
    if (calendarContainerRef.current) {
      calendarContainerRef.current.innerHTML = "";
    }
    calendarInstanceRef.current = null;
   };
    // Lifecycle setup runs once; state reads use stateRef so async work sees current values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const previousState = previousStateRef.current;
    previousStateRef.current = stateRef.current;
    if (previousState) {
      const prevState = previousState;
      
    const previousDoctor = prevState.patientDetails?.referringDoctor || "";
    const currentDoctor = stateRef.current.patientDetails?.referringDoctor || "";
    const doctorsChanged = prevState.doctors !== stateRef.current.doctors;
    const patientDoctorChanged = previousDoctor !== currentDoctor;

    if (!stateRef.current.patientDetails) {
      return;
    }

    if (!stateRef.current.isWalkIn) {
      const patientDescription = stateRef.current.patientDetails.Description || "";
      const patientModality = normalizeModalityValue(stateRef.current.patientDetails.Modality || "");

      if (stateRef.current.selectedStudy !== patientDescription && patientDescription) {
        setState({ selectedStudy: patientDescription });
        return;
      }

      if (stateRef.current.selectedModality !== patientModality && patientModality) {
        setState({ selectedModality: patientModality });
        return;
      }
    }

    if (!doctorsChanged && !patientDoctorChanged) {
      return;
    }

    const normalizedDoctor = normalizeReferringDoctor(
      currentDoctor,
      stateRef.current.doctors,
    );
    const safeNormalizedDoctor = !stateRef.current.isWalkIn && !normalizedDoctor
      ? ""
      : normalizedDoctor;

    if (safeNormalizedDoctor !== currentDoctor) {
      setState({
        patientDetails: {
          ...stateRef.current.patientDetails,
          referringDoctor: safeNormalizedDoctor,
        },
      });
    }
  
    }
  });

  return render();
}

export default Calendar1;
