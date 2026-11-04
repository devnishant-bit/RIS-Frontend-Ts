import styles from "./Table.module.css";
import {
  FaEye,
  FaDesktop,
  FaUserDoctor,
  FaPen,
  FaRegNoteSticky,
  FaTriangleExclamation,
  FaCamera,
  FaEllipsisVertical,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import { useMediaQuery, MOBILE_QUERY } from "./useMediaQuery";

export interface WorklistTableRow {
  examid: string | number;
  patientId?: string | number;
  patientName?: string;
  accessionNo?: string;
  dateTime?: string;
  genderAge?: string;
  procedureDescription?: string;
  study?: string;
  accession?: string;
  site?: string;
  time?: string;
  priorityid?: number | string;
  assigneddoctor?: { doctorId?: string | number; doctorName?: string }[];
  refDoctor?: string;
  images?: number;
  reportStatus?: "Draft" | "Preliminary" | "Final" | string;
  qastatus?: string;
  flagged?: boolean;
}

export interface WorklistTableProps {
  rows: WorklistTableRow[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onView?: (row: WorklistTableRow) => void;
  onWebView?: (row: WorklistTableRow) => void;
  onSelfAssign?: (row: WorklistTableRow) => void;
  onOpenReport?: (row: WorklistTableRow) => void;
  onOpenNotes?: (row: WorklistTableRow) => void;
  onOpenAttachments?: (row: WorklistTableRow) => void;
  onToggleFlag?: (row: WorklistTableRow) => void;
  onMore?: (row: WorklistTableRow) => void;
  loading?: boolean;
}

function initialsOf(name?: string): string {
  return (name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("");
}


const KNOWN_MODALITIES = new Set([
  "CT", "MR", "XRAY", "US", "PT", "ECG", "XA", "NM",
  "MG", "OPG", "ES", "EC", "GS", "ENT", "OTHERS",
]);

// Normalises the raw string to one of the keys above.
// Anything unknown (e.g. "MA" in your dummy data) falls back to OTHERS.
function getModalityKey(modality?: string): string {
  const key = (modality ?? "").trim().toUpperCase();
  if (key === "PET") return "PT";
  return KNOWN_MODALITIES.has(key) ? key : "OTHERS";
}

const SHY = "\u00AD"; // soft hyphen: invisible unless the line breaks here

// Inserts a possible hyphen point inside long words, keeping at least
// 3 letters on each side so we never get "a-bdomen" or "Abdomen-n".
function softHyphenate(text: string): string {
  return text.replace(/\p{L}{6,}/gu, (word) => {
    const chars = Array.from(word);
    return chars
      .map((ch, i) => {
        const left = i + 1;
        const right = chars.length - left;
        return left >= 3 && right >= 3 ? ch + SHY : ch;
      })
      .join("");
  });
}


export default function WorklistTable({
  rows,
  currentPage,
  totalPages,
  totalRecords,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onWebView,
  onSelfAssign,
  onOpenReport,
  onOpenNotes,
  onOpenAttachments,
  onToggleFlag,
  onMore,
  loading = false,
}: WorklistTableProps) {
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, totalRecords);
  const isMobile = useMediaQuery(MOBILE_QUERY);

  return (
    <div className={styles.card}>
      <div className={styles.tableWrapper}>
        {isMobile ? (
          <div className={styles.cardList}>
            {loading ? (
              Array.from({ length: Math.min(rowsPerPage, 4) }).map((_, i) => (
                <div key={`msk-${i}`} className={styles.mCard}>
                  <div className={styles.skeletonBar} style={{ width: "55%" }} />
                  <div className={styles.skeletonBar} style={{ width: "85%" }} />
                  <div className={styles.skeletonBar} style={{ width: "70%" }} />
                </div>
              ))
            ) : rows.length === 0 ? (
              <div className={styles.statusCell}>No records found.</div>
            ) : (
              rows.map((row) => {
                const doctor = row.assigneddoctor?.[0];
                return (
                  <article key={row.examid} className={styles.mCard}>
                    {/* TOP: action buttons */}
                    <div className={styles.mCardTop}>
                      <div className={styles.mActions}>
                        <button data-action="webview" title="Web View" aria-label="Web View" onClick={() => onWebView?.(row)}><FaDesktop /></button>
                        <button data-action="assign" title="Assign to me" aria-label="Assign to me" onClick={() => onSelfAssign?.(row)}><FaUserDoctor /></button>
                        <button data-action="report" title="Report" aria-label="Report" onClick={() => onOpenReport?.(row)}><FaPen /></button>
                        <button data-action="notes" title="Clinical Notes" aria-label="Clinical Notes" onClick={() => onOpenNotes?.(row)}><FaRegNoteSticky /></button>
                        <button data-action="attach" title="Attachments" aria-label="Attachments" onClick={() => onOpenAttachments?.(row)}><FaCamera /></button>
                      </div>
                      <div className={styles.trailing}>
                        <button
                          title="Flag"
                          aria-label="Flag"
                          className={row.flagged ? styles.flagActive : undefined}
                          onClick={() => onToggleFlag?.(row)}
                        >
                          <FaTriangleExclamation />
                        </button>
                        <button title="More" aria-label="More" onClick={() => onMore?.(row)}>
                          <FaEllipsisVertical />
                        </button>
                      </div>
                    </div>

                    {/* BODY: data */}
                    <div className={styles.mHead}>
                      <div>
                        <div className={styles.mName}>{row.patientName ?? "—"}</div>
                        <div className={styles.mSub}>ID {row.patientId ?? row.examid}</div>
                      </div>
                      <span
                        className={styles.statusPill}
                        data-status={(row.reportStatus ?? "draft").toUpperCase()}
                      >
                        {row.reportStatus ?? "Draft"}
                      </span>
                    </div>

                    <div className={styles.mDesc}>{row.procedureDescription ?? "—"}</div>

                    <dl className={styles.mGrid}>
                      <div><dt>Accession No</dt><dd>{row.accessionNo ?? row.accession ?? "—"}</dd></div>
                      <div><dt>Date &amp; Time</dt><dd>{row.dateTime ?? row.time ?? "—"}</dd></div>
                      <div><dt>Gender/Age</dt><dd>{row.genderAge ?? "—"}</dd></div>
                      <div><dt>Ref Doctor</dt><dd>{row.refDoctor ?? "—"}</dd></div>
                      <div>
                        <dt>Modality</dt>
                        <dd>
                          <span className={styles.modalityChip} data-modality={getModalityKey(row.study)}>
                            {row.study ?? "—"}
                          </span>
                        </dd>
                      </div>
                      <div><dt>Assigned Doctor</dt><dd>{doctor?.doctorName ?? "Unassigned"}</dd></div>
                      <div><dt>Images</dt><dd>{row.images ?? 0}</dd></div>
                    </dl>

                    {/* BOTTOM: view */}
                    <button className={styles.mViewBtn} onClick={() => onView?.(row)}>
                      <FaEye /> View
                    </button>
                  </article>
                );
              })
            )}
          </div>
        ) : (
        <table className={styles.table}>
          <colgroup>
            <col className={styles.colAction} />
            <col className={styles.colId} />
            <col className={styles.colName} />
            <col className={styles.colAccession} />
            <col className={styles.colDate} />
            <col className={styles.colGender} />
            <col className={styles.colDesc} />
            <col className={styles.colStatus} />
            <col className={styles.colRefDoc} />
            <col className={styles.colModality} />
            <col className={styles.colAssigned} />
            <col className={styles.colImages} />
            <col className={styles.colTrailing} />
          </colgroup>
          <thead>
            <tr>
              <th>{softHyphenate("Action")}</th>
              <th>{softHyphenate("Patient ID")}</th>
              <th>{softHyphenate("Patient Name")}</th>
              <th>{softHyphenate("Accession No")}</th>
              <th className={styles.colDate}>
                Date &<br />Time
              </th>
              <th>{softHyphenate("Gender/Age")}</th>
              <th>{softHyphenate("Description")}</th>
              <th>{softHyphenate("Status")}</th>
              <th>{softHyphenate("Ref Doctor")}</th>
              <th>{softHyphenate("Modality")}</th>
              <th className={styles.colAssigned}>
                {softHyphenate("Assigned")}<br />{softHyphenate("Doctor")}
              </th>
              <th>{softHyphenate("Images")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <tr
                  key={`sk-${i}`}
                  className={styles.skeletonRow}
                    style={{ animationDelay: `${Math.min(i, 12) * 60}ms` }}
                >
                  {Array.from({ length: 13 }).map((_, c) => (
                    <td key={c}>
                      <div
                        className={styles.skeletonBar}
                        style={{ width: `${45 + ((i + c) % 4) * 14}%` }}
                      />
                    </td>
                  ))}
                </tr>
              )) 
            ) : rows.length === 0 ? (
              <tr><td colSpan={13} className={styles.statusCell}>No records found.</td></tr>
            ) : (
              rows.map((row, index) => {
                const doctor = row.assigneddoctor?.[0];
                const initials = initialsOf(row.patientName);

                return (
                  <tr key={row.examid} data-modality={getModalityKey(row.study)} style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}>
                    <td className={styles.actionCell} data-label="Action">
                      <div className={styles.actions}>
                        <button title="View" onClick={() => onView?.(row)}><FaEye /></button>
                        <button title="Web View" onClick={() => onWebView?.(row)}><FaDesktop /></button>
                        <button title="Assign to me" onClick={() => onSelfAssign?.(row)}><FaUserDoctor /></button>
                        <button title="Report" onClick={() => onOpenReport?.(row)}><FaPen /></button>
                        <button title="Clinical Notes" onClick={() => onOpenNotes?.(row)}><FaRegNoteSticky /></button>
                        <button title="Attachments" onClick={() => onOpenAttachments?.(row)}><FaCamera /></button>
                      </div>
                    </td>
                    <td className={styles.idCell} data-label="Patient ID">
                      {softHyphenate(String(row.patientId ?? row.examid))}
                    </td>
                    <td className={styles.nameCell} data-label="Patient Name">
                      <div className={styles.personCell}>
                        <div className={styles.avatar}>{initials}</div>
                        <span className={styles.personName}>
                          {softHyphenate(row.patientName ?? "—")}
                        </span>
                      </div>
                    </td>
                    <td data-label="Accession No">{softHyphenate(row.accessionNo ?? row.accession ?? "—")}</td>
                    <td data-label="Date & Time">{softHyphenate(row.dateTime ?? row.time ?? "—")}</td>
                    <td data-label="Gender/Age">{softHyphenate(row.genderAge ?? "—")}</td>
                    <td className={styles.descCell} data-label="Description" title={row.procedureDescription}>
                      {softHyphenate(row.procedureDescription ?? "—")}
                    </td>
                    <td data-label="Status">
                      <span
                        className={styles.statusPill}
                        data-status={(row.reportStatus ?? "draft").toUpperCase()}
                      >
                        {row.reportStatus ?? "Draft"}
                        </span>
                    </td>
                    <td data-label="Ref Doctor" title={row.refDoctor}>{softHyphenate(row.refDoctor ?? "—")}</td>
                    <td data-label="Modality">
                          <span
                            className={styles.modalityChip}
                            data-modality={getModalityKey(row.study)}
                          >
                            {row.study ?? "—"}
                          </span>
                    </td>
                    <td data-label="Assigned Doctor" title={doctor?.doctorName}>{softHyphenate(doctor?.doctorName ?? "Unassigned")}</td>
                    <td className={styles.imagesCell} data-label="Images">{row.images ?? 0}</td>
                    <td>
                      <div className={styles.trailing}>
                        <button
                          title="Flag"
                          className={row.flagged ? styles.flagActive : undefined}
                          onClick={() => onToggleFlag?.(row)}
                        >
                          <FaTriangleExclamation />
                        </button>
                        <button title="More" onClick={() => onMore?.(row)}>
                          <FaEllipsisVertical />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        )}
      </div>

      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {startRecord} - {endRecord} of {totalRecords} records
        </div>
        <div className={styles.paginationControls}>
          <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
            <FaChevronLeft />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((page) => (
            <button
              key={page}
              className={page === currentPage ? styles.pageActive : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
            <FaChevronRight />
          </button>
        </div>
        <div className={styles.rowsPerPage}>
          Rows per page
          <select value={rowsPerPage} onChange={(e) => onRowsPerPageChange(Number(e.target.value))}>
            {[8, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
