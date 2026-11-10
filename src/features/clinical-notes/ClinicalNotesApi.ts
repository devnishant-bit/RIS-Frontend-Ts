// import axios from 'axios';

export type NoteTone = 'urgent' | 'nurse' | 'radiologist';

export interface ClinicalNote {
  id: string;
  author: string;
  initials: string;
  tone: NoteTone;
  text: string;
  createdAt: string; // ISO string
  ownerId?: string;   // id of the user who wrote the note
  isPrivate?: boolean; // true = visible only to ownerId
}

export interface NewClinicalNote {
  studyId: string;
  text: string;
  author: string;
  initials: string;
  tone: NoteTone;
  ownerId: string;
  isPrivate: boolean;
}

const STORAGE_KEY = 'clinicalNotes';

const readStore = (): Record<string, ClinicalNote[]> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
};

const writeStore = (store: Record<string, ClinicalNote[]>) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const seedNotes = (): ClinicalNote[] => {
  const now = Date.now();
  return [
    {
      id: 'n1',
      author: 'Dr. A. Miller',
      initials: 'AM',
      tone: 'urgent',
      text: 'Suspected consolidation in right lower lobe. Requested urgent radiologist review prior to patient discharge.',
      createdAt: new Date(now - 22 * 60 * 1000).toISOString(),
      ownerId: 'seed',
      isPrivate: false,
    },
    {
      id: 'n2',
      author: 'Nurse Sarah K.',
      initials: 'SK',
      tone: 'nurse',
      text: 'Patient reports mild dyspnea upon exertion. Contrast allergy verified negative prior to image acquisition.',
      createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
      ownerId: 'seed',
      isPrivate: false,
    },
  ];
};

// A private note is visible only to its owner. Notes saved before this
// feature existed have no isPrivate flag and are treated as public.
const canView = (note: ClinicalNote, userId: string) =>
  !note.isPrivate || note.ownerId === userId;

export const fetchNotes = async (studyId: string, userId: string): Promise<ClinicalNote[]> => {
  // The backend must do this filtering itself, using the logged-in user from
  // the token/session, and never send other users' private notes to the browser:
  // return (await axios.get(`/api/studies/${studyId}/notes`)).data;
  await wait(400);
  const store = readStore();
  if (!(studyId in store)) {
    store[studyId] = studyId === '1001' ? seedNotes() : []; // demo notes only for exam 1001
    writeStore(store);
  }
  return store[studyId].filter((n) => canView(n, userId));
};

export const createNote = async (payload: NewClinicalNote): Promise<ClinicalNote> => {
  // return (await axios.post(`/api/studies/${payload.studyId}/notes`, payload)).data;
  await wait(500);
  const note: ClinicalNote = {
    id: `n${Date.now()}`,
    author: payload.author,
    initials: payload.initials,
    tone: payload.tone,
    text: payload.text,
    createdAt: new Date().toISOString(),
    ownerId: payload.ownerId,
    isPrivate: payload.isPrivate,
  };
  const store = readStore();
  store[payload.studyId] = [note, ...(store[payload.studyId] ?? [])];
  writeStore(store);
  return note;
};

export const deleteNote = async (
  studyId: string,
  noteId: string,
  userId: string
): Promise<void> => {
  // await axios.delete(`/api/studies/${studyId}/notes/${noteId}`);
  await wait(300);
  const store = readStore();
  const target = (store[studyId] ?? []).find((n) => n.id === noteId);
  if (target?.isPrivate && target.ownerId !== userId) {
    throw new Error('Not allowed to delete this note');
  }
  store[studyId] = (store[studyId] ?? []).filter((n) => n.id !== noteId);
  writeStore(store);
};

export const completeStudyNotes = async (_studyId: string): Promise<void> => {
  // await axios.post(`/api/studies/${_studyId}/notes/complete`);
  await wait(500);
};