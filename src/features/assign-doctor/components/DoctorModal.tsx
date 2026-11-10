import type { Doctor, DoctorStatus } from "../types";
import { useAssignDoctor } from "../hooks/useAssignDoctor";
import styles from "./DoctorModal.module.css";
import useTheme from "@/shared/Theme/useTheme";


interface Props {
  isOpen: boolean;
  examid: number | string | null;
  onClose: () => void;
  onSave?: (doctors: Doctor[]) => void;
  onStatusUpdate?: () => void;
}

const AVATAR_COLORS = 6;

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function Avatar({ doctor, status, large = false }: { doctor: Doctor; status: DoctorStatus; large?: boolean }) {
  return (
    <div
      className={`${styles.avatar} ${large ? styles.avatarLg : ""}`}
      data-tone={doctor.id % AVATAR_COLORS}
    >
      {initialsOf(doctor.docname)}
      <span className={`${styles.avatarDot} ${styles[status]}`} title={status === "online" ? "Online" : "Away"} />
    </div>
  );
}

export default function DoctorModal({ isOpen, examid, onClose, onSave, onStatusUpdate }: Props) {
  const { theme } = useTheme();
  const {
    loading, saving, error, searchInput, setSearchInput,
    filteredDoctors, selectedDoctors, selectDoctor, removeDoctor, clearAll,
    getDoctorStatus, save, close,
  } = useAssignDoctor({ isOpen, examid, onSave, onStatusUpdate, onClose });

  if (!isOpen) return null;

  const isSelected = (id: number) => selectedDoctors.some((d) => d.id === id);

  return (
    <div className={styles.overlay} data-theme={theme}>
        <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="assign-doctors-title">
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h2 id="assign-doctors-title" className={styles.title}>Assign Doctors</h2>
              <div className={styles.examRow}>
                <span className={styles.examLabel}>Exam ID:</span>
                <span className={styles.examChip}>{examid ?? "Not available"}</span>
              </div>
            </div>
            <button type="button" className={styles.closeBtn} onClick={close} aria-label="Close dialog">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className={styles.body}>
            {loading && <p className={styles.note}>Loading doctors...</p>}
            {error && <p className={styles.error}>{error}</p>}

            {!loading && !error && (
              <>
                {/* Search */}
                <div className={styles.searchWrap}>
                  <svg className={styles.searchIcon} viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                  </svg>
                  <input
                    id="doctor-search"
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search doctors..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    autoComplete="off"
                  />
                  {searchInput && (
                    <button type="button" className={styles.clearSearch} onClick={() => setSearchInput("")} title="Clear search" aria-label="Clear search">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Matching physicians */}
                {searchInput.trim() && (
                  <div>
                    <div className={styles.sectionLabel}>Matching Physicians</div>
                    <ul className={styles.results} role="listbox">
                      {filteredDoctors.length === 0 && <li className={styles.empty}>No matches</li>}
                      {filteredDoctors.map((doctor) => {
                        const status = getDoctorStatus(doctor.userid);
                        const selected = isSelected(doctor.id);
                        return (
                          <li
                            key={doctor.id}
                            role="option"
                            aria-selected={selected}
                            className={`${styles.result} ${selected ? styles.resultSelected : ""}`}
                            onClick={() => !selected && selectDoctor(doctor)}
                          >
                            <div className={styles.resultMain}>
                              <Avatar doctor={doctor} status={status} />
                              <span className={styles.resultName}>{doctor.docname}</span>
                              <span className={`${styles.statusText} ${styles[status]}`}>
                                <span className={`${styles.statusDot} ${styles[status]}`} />
                                {status}
                              </span>
                            </div>
                            {selected ? (
                              <span className={styles.selectedBadge}>Selected</span>
                            ) : (
                              <button
                                type="button"
                                className={styles.addBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectDoctor(doctor);
                                }}
                              >
                                + Add
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Selected doctors */}
                <div className={styles.selectedSection}>
                  <div className={styles.selectedHeader}>
                    <h3 className={styles.selectedTitle}>
                      Selected Doctors:
                      <span className={styles.selectedCount}>({selectedDoctors.length} assigned)</span>
                    </h3>
                    {selectedDoctors.length > 0 && (
                      <button type="button" className={styles.clearAll} onClick={clearAll}>
                        Clear all
                      </button>
                    )}
                  </div>

                  {selectedDoctors.length === 0 ? (
                    <p className={styles.note}>No doctors selected.</p>
                  ) : (
                    <div className={styles.cards}>
                      {selectedDoctors.map((doctor) => {
                        const status = getDoctorStatus(doctor.userid);
                        return (
                          <div key={doctor.id} className={styles.card}>
                            <div className={styles.resultMain}>
                              <Avatar doctor={doctor} status={status} large />
                              <p className={styles.cardName}>{doctor.docname}</p>
                              <span className={`${styles.statusBadge} ${styles[status]}`}>{status}</span>
                            </div>
                            <button
                              type="button"
                              className={styles.removeBtn}
                              onClick={() => removeDoctor(doctor)}
                              aria-label={`Remove ${doctor.docname}`}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={close}>
              Cancel
            </button>
            <button type="button" className={styles.saveBtn} onClick={save} disabled={saving || loading || !!error}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
    </div>
  );
}