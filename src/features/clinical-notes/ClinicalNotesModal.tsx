import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiFileText, FiLock, FiSend, FiTrash2, FiUnlock, FiX } from 'react-icons/fi';
import styles from './ClinicalNotesModal.module.css';
import {
  type ClinicalNote,
  type NoteTone,
  completeStudyNotes,
  createNote,
  deleteNote,
  fetchNotes,
} from './ClinicalNotesApi';
import useTheme from '@/shared/Theme/useTheme';

const EXIT_MS = 220;

export interface NotesStudy {
  studyId: string;
  patientId: string;
  patientName: string;
  studyName: string;
  accession: string;
}

export interface NotesUser {
  id: string;
  name: string;
  initials: string;
  tone?: NoteTone;
}

interface ClinicalNotesModalProps {
  open: boolean;
  study: NotesStudy | null;
  currentUser: NotesUser;
  theme?: 'light' | 'dark';
  onClose: () => void;
  onCompleted?: (studyId: string) => void;
}

const formatRelative = (iso: string): string => {
  const date = new Date(iso);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  const clock = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${clock} (${diffMin} mins ago)`;
  const hrs = Math.floor(diffMin / 60);
  if (hrs < 24) return `${clock} (${hrs} hour${hrs > 1 ? 's' : ''} ago)`;
  const isYesterday = hrs < 48;
  return isYesterday
    ? `Yesterday, ${clock}`
    : `${date.toLocaleDateString([], { day: '2-digit', month: 'short' })}, ${clock}`;
};

const ClinicalNotesModal: React.FC<ClinicalNotesModalProps> = ({
  open,
  study,
  currentUser,
  theme: themeOverride,
  onClose,
  onCompleted,
}) => {
  const { theme: appTheme } = useTheme()
  const theme = themeOverride ?? appTheme
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [shake, setShake] = useState(false);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Mount / unmount with exit animation
  useEffect(() => {
    if (open) {
      // setMounted(true);
      // setClosing(false);
    } else if (mounted) {
      // setClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  // Load notes each time the modal opens for a study
  useEffect(() => {
    if (!open || !study) return;
    let cancelled = false;
    // setLoading(true);
    // setError(null);
    // setDraft('');
    // setIsPrivate(false);
    // setFreshId(null);
    // setRemovingIds([]);
    fetchNotes(study.studyId, currentUser.id)
      .then((data) => {
        if (!cancelled) setNotes(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load notes. Try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    const t = setTimeout(() => textareaRef.current?.focus(), 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, study, currentUser.id]);

  // Lock body scroll + Esc to close
  useEffect(() => {
    if (!mounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [mounted, onClose]);

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [notes]
  );

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleAdd = useCallback(async () => {
    if (!study || adding) return;
    const text = draft.trim();
    if (!text) {
      triggerShake();
      textareaRef.current?.focus();
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const created = await createNote({
        studyId: study.studyId,
        text,
        author: currentUser.name,
        initials: currentUser.initials,
        tone: currentUser.tone ?? 'radiologist',
        ownerId: currentUser.id, 
        isPrivate, 
      });
      setNotes((prev) => [created, ...prev]);
      setFreshId(created.id);
      setDraft('');
      setIsPrivate(false);  
      setTimeout(() => setFreshId(null), 1600);
    } catch {
      setError('Could not add the note. Try again.');
    } finally {
      setAdding(false);
      textareaRef.current?.focus();
    }
  }, [study, adding, draft, isPrivate, currentUser]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!study) return;
      setRemovingIds((prev) => [...prev, id]);
      try {
        await deleteNote(study.studyId, id, currentUser.id);
        setTimeout(() => {
          setNotes((prev) => prev.filter((n) => n.id !== id));
          setRemovingIds((prev) => prev.filter((x) => x !== id));
        }, EXIT_MS);
      } catch {
        setRemovingIds((prev) => prev.filter((x) => x !== id));
        setError('Could not delete the note. Try again.');
      }
    },
    [study, currentUser.id]
  );

  const handleComplete = useCallback(async () => {
    if (!study || completing) return;
    setCompleting(true);
    try {
      await completeStudyNotes(study.studyId);
      onCompleted?.(study.studyId);
      onClose();
    } catch {
      setError('Could not save. Try again.');
    } finally {
      setCompleting(false);
    }
  }, [study, completing, onCompleted, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  if (!mounted || !study) return null;



  return createPortal(
    <div
      className={`${styles.overlay} ${closing ? styles.overlayOut : ''}`}
      data-theme={theme}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modal} ${closing ? styles.modalOut : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="clinical-notes-title"
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <FiFileText />
          </div>
          <div className={styles.headerText}>
            <div className={styles.titleRow}>
              <h2 id="clinical-notes-title" className={styles.title}>
                Study &amp; Clinical Notes
              </h2>
            </div>
            <p className={styles.subtitle}>
              Patient #{study.patientId} <span>&bull;</span>{' '}
              {study.studyName} ({study.accession})
            </p>
          </div>
          <button className={styles.iconBtn} onClick={onClose} aria-label="Close notes">
            <FiX />
          </button>
        </header>

        <div className={styles.body}>
          {/* Composer */}
          <section className={`${styles.composer} ${shake ? styles.shake : ''}`}>
            <div className={styles.composerHead}>
              <span className={styles.composerLabel}>
                 Add new clinical note
              </span>
              {/* <span className={`${styles.counter} ${nearLimit ? styles.counterWarn : ''}`}>
                {draft.length} / {MAX_LENGTH}
              </span> */}
            </div>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={draft}
              placeholder="Type an urgent clinical note, observation, or radiologist comment..."
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
            />
            <div className={styles.composerFoot}>
              <button
                type="button"
                role="switch"
                aria-checked={isPrivate}
                disabled={!currentUser.id}
                onClick={() => setIsPrivate((p) => !p)}
                title={isPrivate ? 'Only you can see this note' : 'Visible to everyone with access'}
                className={`${styles.privateToggle} ${isPrivate ? styles.privateToggleOn : ''}`}
              >
                <span className={`${styles.lockIcon} ${isPrivate ? styles.lockSnap : ''}`}>
                  <FiUnlock className={styles.iconUnlocked} />
                  <FiLock className={styles.iconLocked} />
                </span>
                <span className={styles.privateLabel}>{isPrivate ? 'Private note' : 'Make private'}</span>
              </button>
              <button
                className={styles.primaryBtn}
                onClick={handleAdd}
                disabled={adding}
                title="Ctrl + Enter"
              >
                {adding ? <span className={styles.spinner} /> : <FiSend />}
                {adding ? 'Adding' : 'Add Note'}
              </button>
            </div>
          </section>

          {error && <div className={styles.error}>{error}</div>}

          {/* Existing notes */}
          <div className={styles.listHead}>
            <span className={styles.listLabel}>
              Existing notes <span className={styles.countBadge}>{notes.length}</span>
            </span>
          </div>

          <div className={styles.list}>
            {loading &&
              [0, 1, 2].map((i) => <div key={i} className={styles.skeleton} style={{ animationDelay: `${i * 120}ms` }} />)}

            {!loading && sortedNotes.length === 0 && (
              <div className={styles.empty}>No notes yet. Add the first note above.</div>
            )}

            {!loading &&
              sortedNotes.map((note, index) => (
                <article
                  key={note.id}
                  className={[
                    styles.note,
                    styles[`tone_${note.tone}`],
                    note.isPrivate ? styles.notePrivate : '',
                    removingIds.includes(note.id) ? styles.noteOut : styles.noteIn,
                    note.id === freshId ? styles.noteFresh : '',
                  ].join(' ')}
                  style={{ animationDelay: note.id === freshId ? '0ms' : `${index * 70}ms` }}
                >
                  <div className={styles.avatar}>{note.initials}</div>
                  <div className={styles.noteMain}>
                    <div className={styles.noteMeta}>
                      <div className={styles.noteNameRow}>
                        <strong>{note.author}</strong>
                        {note.isPrivate && (
                          <span className={styles.privateBadge}>
                            <FiLock /> Private
                          </span>
                        )}
                      </div>
                      <span>{formatRelative(note.createdAt)}</span>
                    </div>
                    <p className={styles.noteText}>{note.text}</p>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(note.id)}
                    aria-label={`Delete note by ${note.author}`}
                  >
                    <FiTrash2 />
                  </button>
                </article>
              ))}
          </div>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerActions}>
            <button className={styles.ghostBtn} onClick={onClose}>
              Close
            </button>
            <button className={styles.primaryBtn} onClick={handleComplete} disabled={completing}>
              {completing && <span className={styles.spinner} />}
              Save
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default ClinicalNotesModal;