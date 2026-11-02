// Types, constants and pure helpers for the Preferences modal.
// Nothing in here touches React or the network.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Id = number | string;

export interface Product {
  productid: number;
  productname: string;
}

export interface ModuleItem {
  moduleid: number;
}

export interface PreferenceDef {
  preferenceid: Id;
  preferencename: string;
  typeid: number;
  parentid?: Id | null;
  active?: boolean;
  // ti_tb_preference.preference_group_type_id (key name is matched loosely)
  [key: string]: unknown;
}

export interface UserPreferenceRow {
  preferenceid: Id;
  preferencevalue: string;
  status: boolean;
}

/**
 * What the user has chosen for ONE preference.
 *  - { selected: 'Pro' }            single value (radio, select, text, time...)
 *  - { value: '2024-03-01' }        date (yyyy-mm-dd for <input type="date">)
 *  - { Option1: true, Option2: false }  checkbox / multi-select
 */
export interface PrefEntry {
  [key: string]: boolean | string | null | undefined;
  selected?: string | null;
  value?: string;
}

export type ModulePrefs = Record<string, PrefEntry>; // preferenceId -> entry
export type SelectedPreferences = Record<string, ModulePrefs>; // moduleId -> prefs

export const PREFERENCE_TYPES = {
  CHECKBOX: 'CHECKBOX',
  RADIO: 'RADIO',
  COMBOBOX_SINGLE: 'COMBOBOX_SINGLE',
  COMBOBOX_MULTI: 'COMBOBOX_MULTI',
  TEXTBOX_NUMBER: 'TEXTBOX_NUMBER',
  TEXTBOX_STRING: 'TEXTBOX_STRING',
  DATETIME: 'DATETIME',
  DATE: 'DATE',
  TIME: 'TIME',
  TEXT_STRING: 'TEXT_STRING',
  TEXT_NUMBER: 'TEXT_NUMBER',
} as const;

export type PreferenceType = (typeof PREFERENCE_TYPES)[keyof typeof PREFERENCE_TYPES];

export interface TypedConfig {
  type: PreferenceType;
  options: string[];
  disabledOptions?: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Display-only sub-labels for modality codes.
export const MODALITY_DESCRIPTIONS: Record<string, string> = {
  XA: 'X-Ray Angio',
  MR: 'Resonance',
  XRAY: 'General X-Ray',
  ECG: 'Cardiogram',
  CT: 'Tomography',
  MG: 'Mammography',
  Others: 'Miscellaneous',
  GS: 'Grey Scale',
  ES: 'Endoscopy',
  EC: 'Echocardiography',
  ENT: 'Otolaryngology',
  PT: 'Positron Emission',
  NM: 'Nuclear Med',
  US: 'Ultrasound',
  RF: 'Radio Fluoroscopy',
  OPG: 'Orthopantomo',
  PX: 'Panoramic X-ray',
};

// The only preference with its own source of options (getuseredition).
export const EDITION_PREFERENCE_NAME = 'Edition';

// Checkbox groups with more options than this render as a grid with
// Select All / Deselect All.
export const LARGE_GROUP_THRESHOLD = 4;

// Values stored as ONE selected value: { selected: value }.
export const SINGLE_SELECT_VALUES = [
  'Pro', 'Prime', 'Premium',
  'Today', 'Yesterday', '14 Days', '30 Days',
  'Window', 'Tab',
];

// Options that no API supplies. They are only the OPTIONS; the control type
// still comes from the API typeid.
export const KNOWN_OPTIONS_BY_NAME: Record<string, string[]> = {
  Period: ['Today', 'Yesterday', '14 Days', '30 Days'],
  status: ['Ready'],
  'Web View Format': ['Window', 'Tab'],
};

// Last-resort options when nothing else provides any.
export const PLACEHOLDER_OPTIONS = ['Enable', 'Disable'];

// ti_tb_preference_type.preference_type_id -> control type.
export const PREFERENCE_TYPE_BY_ID: Record<number, PreferenceType> = {
  1: PREFERENCE_TYPES.CHECKBOX,
  2: PREFERENCE_TYPES.RADIO,
  3: PREFERENCE_TYPES.COMBOBOX_SINGLE,
  4: PREFERENCE_TYPES.COMBOBOX_MULTI,
  5: PREFERENCE_TYPES.TEXTBOX_NUMBER,
  6: PREFERENCE_TYPES.TEXTBOX_STRING,
  7: PREFERENCE_TYPES.DATETIME,
  8: PREFERENCE_TYPES.DATE,
  9: PREFERENCE_TYPES.TIME,
  10: PREFERENCE_TYPES.TEXT_STRING,
  11: PREFERENCE_TYPES.TEXT_NUMBER,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// "dd-mm-yyyy" style string (the DB date format). Never an option label.
export const isDateLike = (value: unknown): boolean =>
  typeof value === 'string' && /^\d+-\d+-\d+$/.test(value);

export const getTypedConfig = (preference: PreferenceDef): TypedConfig | null => {
  const type = PREFERENCE_TYPE_BY_ID[preference.typeid];
  return type ? { type, options: [] } : null;
};

// Type 10/11 = an item inside another preference, not a control of its own.
export const isOptionPreference = (preference: PreferenceDef): boolean => {
  const type = PREFERENCE_TYPE_BY_ID[preference.typeid];
  return type === PREFERENCE_TYPES.TEXT_STRING || type === PREFERENCE_TYPES.TEXT_NUMBER;
};

export const isComboboxType = (type?: PreferenceType): boolean =>
  type === PREFERENCE_TYPES.COMBOBOX_SINGLE || type === PREFERENCE_TYPES.COMBOBOX_MULTI;

// Types whose choices are a list of options.
export const isOptionHolderType = (type: PreferenceType): boolean =>
  type === PREFERENCE_TYPES.CHECKBOX ||
  type === PREFERENCE_TYPES.RADIO ||
  isComboboxType(type);

// Tolerate "12" vs 12.
export const sameId = (a: unknown, b: unknown): boolean =>
  a != null && b != null && String(a) === String(b);

// "0" / 0 / "" / null all mean "no parent".
export const getParentId = (preference: PreferenceDef): Id | null => {
  const v = preference.parentid;
  return v == null || v === 0 || v === '0' || v === '' ? null : v;
};

// Comboboxes that share a parent and a group type are mutually exclusive.
export const getGroupTypeId = (preference: PreferenceDef): unknown => {
  const key = Object.keys(preference).find((k) => /group.*type/i.test(k));
  return key ? preference[key] : null;
};

// Drops inactive preferences AND anything nested under them, so the children of
// a hidden group don't resurface as top-level items.
export const getVisiblePrefs = (prefs: PreferenceDef[]): PreferenceDef[] => {
  const hidden = new Set(
    prefs.filter((p) => p.active === false).map((p) => String(p.preferenceid))
  );
  let changed = true;
  while (changed) {
    changed = false;
    prefs.forEach((p) => {
      const pid = getParentId(p);
      const id = String(p.preferenceid);
      if (pid != null && hidden.has(String(pid)) && !hidden.has(id)) {
        hidden.add(id);
        changed = true;
      }
    });
  }
  return prefs.filter((p) => !hidden.has(String(p.preferenceid)));
};

// DB stores dd-mm-yyyy; <input type="date"> needs yyyy-mm-dd.
const toInputDate = (dbDate: string): string | null => {
  const [day = '', month = '', year = ''] = dbDate.split('-');
  return day && month && year
    ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    : null;
};

// yyyy-mm-dd (or any Date-parsable value) -> dd-mm-yyyy for the save API.
export const formatDateForApi = (date?: string | null): string | null => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

/**
 * Turns the user's saved rows into the UI state shape, using each preference's
 * typeid to decide how a row is stored. Also returns the option names found in
 * the saved rows (used for option-holding types that have no child rows).
 */
export function parseUserPreferences(
  rows: UserPreferenceRow[],
  preferenceList: PreferenceDef[]
): { userPreferences: ModulePrefs; savedOptionsById: Record<string, string[]> } {
  // preferenceid -> { type } from the API typeid. Edition is always single-select.
  const typedConfigById: Record<string, { type: PreferenceType }> = {};
  preferenceList.forEach((preference) => {
    const typedConfig =
      preference.preferencename === EDITION_PREFERENCE_NAME
        ? { type: PREFERENCE_TYPES.RADIO as PreferenceType }
        : getTypedConfig(preference);
    if (typedConfig) typedConfigById[String(preference.preferenceid)] = typedConfig;
  });

  // Option names present in the saved rows. Date-looking values are never
  // options (e.g. an epoch "01-01-1970" returned for an empty value).
  const savedOptionsById: Record<string, string[]> = {};
  rows.forEach(({ preferenceid, preferencevalue }) => {
    const typedConfig = typedConfigById[String(preferenceid)];
    if (!typedConfig || !isOptionHolderType(typedConfig.type)) return;
    if (isDateLike(preferencevalue)) return;
    const key = String(preferenceid);
    const list = savedOptionsById[key] ?? (savedOptionsById[key] = []);
    if (!list.includes(preferencevalue)) list.push(preferencevalue);
  });

  const userPreferences = rows.reduce<ModulePrefs>((acc, pref) => {
    const { preferencevalue, status } = pref;
    const id = String(pref.preferenceid);
    const typedConfig = typedConfigById[id];

    // Edition / Period / Web View Format values are stored as one selected value.
    if (SINGLE_SELECT_VALUES.includes(preferencevalue)) {
      acc[id] = { selected: preferencevalue };
      return acc;
    }

    if (typedConfig) {
      switch (typedConfig.type) {
        case PREFERENCE_TYPES.CHECKBOX:
        case PREFERENCE_TYPES.COMBOBOX_MULTI:
          acc[id] = acc[id] || {};
          acc[id][preferencevalue] = status;
          break;
        case PREFERENCE_TYPES.DATE: {
          const value = toInputDate(String(preferencevalue));
          acc[id] = value ? { value } : {};
          break;
        }
        default:
          // RADIO, COMBOBOX_SINGLE, TEXT_*, TEXTBOX_*, DATETIME, TIME
          if (status !== false) acc[id] = { selected: preferencevalue };
      }
      return acc;
    }

    // No known typeid: plain { [value]: status } (modality, status, on/off).
    acc[id] = acc[id] || {};
    acc[id][preferencevalue] = status;

    if (isDateLike(preferencevalue)) {
      const value = toInputDate(preferencevalue);
      if (value) acc[id] = { ...acc[id], value };
    }
    return acc;
  }, {});

  return { userPreferences, savedOptionsById };
}