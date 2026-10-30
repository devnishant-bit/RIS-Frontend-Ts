export const MODALITIES = [
  'XA',
  'MR',
  'XRAY',
  'ECG',
  'CT',
  'MG',
  'Others',
  'GS',
  'ES',
  'EC',
  'ENT',
  'RF',
  'PT',
  'NM',
] as const;

export type ModalityCode = (typeof MODALITIES)[number];

export const RANGE_PRESETS = ['Today', 'Yesterday', '14 Days', '30 Days'] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

export type StudyStatus = 'Ready' | 'Draft' | 'Preliminary' | 'Final';
export const STATUSES: StudyStatus[] = ['Ready', 'Draft', 'Preliminary', 'Final'];

export interface SearchFilters {
  patientId: string;
  patientName: string;
  /** dd-mm-yyyy */
  dateFrom: string;
  /** dd-mm-yyyy */
  dateTo: string;
  /** null once the user edits a date by hand */
  rangePreset: RangePreset | null;
  assignedDoctor: string;
  referringDoctor: string;
  tag: string;
  procedure: string;
  reportContent: string;
  status: StudyStatus;
  modalities: ModalityCode[];
}

export interface SelectOption {
  value: string;
  label: string;
}

/*
 * Synthetic placeholder options copied from the HTML mock-up.
 * Replace with API data once the contract is agreed.
 */
export const ASSIGNED_DOCTOR_OPTIONS: SelectOption[] = [
  { value: 'demo_reader_01', label: 'Demo Reader 01' },
  { value: 'demo_reader_02', label: 'Demo Reader 02' },
  { value: 'demo_reader_03', label: 'Demo Reader 03' },
];

export const REFERRING_DOCTOR_OPTIONS: SelectOption[] = [
  { value: 'demo_provider_01', label: 'Demo Provider 01' },
  { value: 'demo_provider_02', label: 'Demo Provider 02' },
  { value: 'demo_provider_03', label: 'Demo Provider 03' },
  { value: 'demo_provider_04', label: 'Demo Provider 04' },
  { value: 'demo_provider_05', label: 'Demo Provider 05' },
];

export const TAG_OPTIONS: SelectOption[] = [
  { value: 'urgent', label: 'STAT / Urgent' },
  { value: 'inpatient', label: 'Inpatient' },
  { value: 'vip', label: 'VIP Protocol' },
  { value: 'followup', label: 'Follow-Up' },
  { value: 'critical', label: 'Critical Finding' },
];

/* ---------- Date helpers (dd-mm-yyyy) ---------- */

const pad = (value: number) => String(value).padStart(2, '0');

export const formatDate = (date: Date) =>
  `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const getPresetRange = (preset: RangePreset): { from: string; to: string } => {
  const today = formatDate(new Date());
  switch (preset) {
    case 'Yesterday':
      return { from: formatDate(daysAgo(1)), to: formatDate(daysAgo(1)) };
    case '14 Days':
      return { from: formatDate(daysAgo(14)), to: today };
    case '30 Days':
      return { from: formatDate(daysAgo(30)), to: today };
    case 'Today':
    default:
      return { from: today, to: today };
  }
};

export const createDefaultFilters = (): SearchFilters => {
  const { from, to } = getPresetRange('Today');
  return {
    patientId: '',
    patientName: '',
    dateFrom: from,
    dateTo: to,
    rangePreset: 'Today',
    assignedDoctor: '',
    referringDoctor: '',
    tag: '',
    procedure: '',
    reportContent: '',
    status: 'Ready',
    modalities: [...MODALITIES],
  };
};
