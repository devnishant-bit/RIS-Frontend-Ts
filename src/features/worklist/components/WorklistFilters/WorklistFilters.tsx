import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { SearchIcon } from './worklistFiltersIcon';
import type { SearchIconName } from './worklistFiltersIcon';
import {
  ASSIGNED_DOCTOR_OPTIONS,
  MODALITIES,
  RANGE_PRESETS,
  REFERRING_DOCTOR_OPTIONS,
  STATUSES,
  TAG_OPTIONS,
  createDefaultFilters,
  getPresetRange,
} from './worklistFiltersData';
import type {
  ModalityCode,
  RangePreset,
  SearchFilters,
  SelectOption,
  StudyStatus,
} from './worklistFiltersData';
import styles from './WorklistFilters.module.css';

export type SearchBarTheme = 'light' | 'dark';

export interface SearchBarProps {
  theme?: SearchBarTheme;
  /** Called when the user presses Search (or Enter in a field). */
  onSearch?: (filters: SearchFilters) => void;
  /** Called when the user clears the filter form. */
  onClear?: () => void;
}

const VIEW_TRANSITION_MS = 950;

const cx = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(' ');

const STATUS_CLASS: Record<StudyStatus, string> = {
  Ready: styles.statusReady,
  Draft: styles.statusDraft,
  Preliminary: styles.statusPreliminary,
  Final: styles.statusFinal,
};

/* ---------- Small building blocks ---------- */

interface FloatingFieldProps {
  id: string;
  label: string;
  icon: SearchIconName;
  value: string;
  onChange: (value: string) => void;
  segmentClassName?: string;
}

/** Collapsed-bar text field with a label that floats up once there is content. */
function FloatingField({ id, label, icon, value, onChange, segmentClassName }: FloatingFieldProps) {
  return (
    <div className={cx(styles.segment, segmentClassName)}>
      <SearchIcon name={icon} className={styles.quickIcon} />
      <div className={styles.segmentBody}>
        <div className={styles.floatGroup}>
          <input
            id={id}
            type="text"
            autoComplete="off"
            className={styles.floatInput}
            placeholder=" "
            value={value}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
          />
          <label className={styles.floatLabel} htmlFor={id}>
            {label}
          </label>
        </div>
      </div>
    </div>
  );
}

interface QuickDateProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  segmentClassName?: string;
}

function QuickDate({ id, label, value, onChange, segmentClassName }: QuickDateProps) {
  return (
    <div className={cx(styles.dateSegment, segmentClassName)}>
      <SearchIcon name="calendar" className={styles.quickIcon} />
      <div className={styles.dateBody}>
        <label className={styles.dateLabel} htmlFor={id}>
          {label}
        </label>
        <div className={styles.dateUnderline}>
          <input
            id={id}
            type="text"
            autoComplete="off"
            inputMode="numeric"
            className={styles.dateInput}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
          <SearchIcon name="caretDown" className={styles.dateCaret} />
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
}

function FormField({ id, label, children }: FormFieldProps) {
  return (
    <div className={cx(styles.formField, styles.col3)}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

interface TextControlProps {
  id: string;
  label: string;
  icon: SearchIconName;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

function TextControl({ id, label, icon, value, placeholder, onChange }: TextControlProps) {
  return (
    <FormField id={id} label={label}>
      <div className={styles.control}>
        <input
          id={id}
          type="text"
          autoComplete="off"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <SearchIcon name={icon} className={styles.leadIcon} />
      </div>
    </FormField>
  );
}

interface SelectControlProps {
  id: string;
  label: string;
  icon: SearchIconName;
  value: string;
  placeholder: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

function SelectControl({ id, label, icon, value, placeholder, options, onChange }: SelectControlProps) {
  return (
    <FormField id={id} label={label}>
      <div className={styles.control}>
        <select
          id={id}
          className={cx(styles.input, styles.select)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SearchIcon name={icon} className={styles.leadIcon} />
        <SearchIcon name="caretDown" className={styles.trailIcon} />
      </div>
    </FormField>
  );
}

interface DateControlProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function DateControl({ id, label, value, onChange }: DateControlProps) {
  return (
    <FormField id={id} label={label}>
      <div className={styles.control}>
        <input
          id={id}
          type="text"
          autoComplete="off"
          inputMode="numeric"
          className={cx(styles.input, styles.dateControl)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <SearchIcon name="calendar" className={cx(styles.leadIcon, styles.leadIconAccent)} />
        <SearchIcon name="caretDown" className={styles.trailIcon} />
      </div>
    </FormField>
  );
}

interface ModalityChipsProps {
  selected: ModalityCode[];
  onToggle: (code: ModalityCode) => void;
  onToggleAll: () => void;
  portalTarget: HTMLElement | null;
}

/** Rendered in both views; both read the same state, so they never drift apart. */
function ModalityChips({ selected, onToggle, onToggleAll, portalTarget }: ModalityChipsProps) {
  const id = useId();
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const visibleModalities = MODALITIES.slice(0, 9);
  const extraModalities = MODALITIES.slice(9);
  const allSelected = selected.length === MODALITIES.length;

  useEffect(() => {
    if (!moreOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!moreButtonRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        setMoreOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    const closeForViewportChange = () => setMoreOpen(false);

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', closeForViewportChange);
    window.addEventListener('scroll', closeForViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', closeForViewportChange);
      window.removeEventListener('scroll', closeForViewportChange, true);
    };
  }, [moreOpen]);

  const openMore = () => {
    if (moreOpen) {
      setMoreOpen(false);
      return;
    }

    const button = moreButtonRef.current;
    const root = portalTarget;
    if (!button || !root) return;

    const buttonRect = button.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const popoverWidth = Math.min(272, window.innerWidth - 32);
    const buttonLeft = buttonRect.left - rootRect.left + root.scrollLeft;
    setPopoverPosition({
      top: buttonRect.bottom - rootRect.top + root.scrollTop + 6,
      left: Math.max(0, Math.min(buttonLeft, root.clientWidth - popoverWidth)),
    });
    setMoreOpen(true);
  };

  return (
    <div className={styles.chipGroup} role="group" aria-label="Modalities">
      <button
        type="button"
        className={cx(styles.chip, allSelected && styles.chipActive)}
        aria-pressed={allSelected}
        onClick={onToggleAll}
      >
        <SearchIcon name="check" className={styles.chipIcon} />
        Select all
      </button>
      <span className={styles.chipSeparator} aria-hidden="true" />
      {visibleModalities.map((code) => {
        const active = selected.includes(code);
        return (
          <button
            key={code}
            type="button"
            className={cx(styles.chip, active && styles.chipActive)}
            aria-pressed={active}
            onClick={() => onToggle(code)}
          >
            {code}
          </button>
        );
      })}
      {extraModalities.length > 0 && <button
        ref={moreButtonRef}
        type="button"
        className={styles.moreButton}
        aria-expanded={moreOpen}
        aria-controls={id}
        aria-haspopup="true"
        title={`Show ${extraModalities.length} more modalities`}
        onClick={openMore}
      >
        More ({extraModalities.length})
        <SearchIcon name="caretDown" className={styles.moreIcon} />
      </button>}
      {moreOpen && portalTarget && createPortal(
        <div
          ref={popoverRef}
          id={id}
          className={styles.modalityPopover}
          role="group"
          aria-label="More modalities"
          style={{ top: popoverPosition.top, left: popoverPosition.left }}
        >
          {extraModalities.map((code) => {
            const active = selected.includes(code);
            return (
              <button
                key={code}
                type="button"
                className={cx(styles.chip, styles.popoverChip, active && styles.chipActive)}
                aria-pressed={active}
                onClick={() => {
                  onToggle(code);
                  setMoreOpen(false);
                }}
              >
                {code}
              </button>
            );
          })}
        </div>,
        portalTarget,
      )}
    </div>
  );
}

/* ---------- Main component ---------- */

export default function SearchBar({ theme = 'light', onSearch, onClear }: SearchBarProps) {
  const uid = useId();
  const [filters, setFilters] = useState<SearchFilters>(createDefaultFilters);
  const [expanded, setExpanded] = useState(false);
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const collapsedRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const previousExpanded = useRef(expanded);

  const update = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const updateDate = (key: 'dateFrom' | 'dateTo', value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value, rangePreset: null }));

  const applyPreset = (preset: RangePreset) => {
    const { from, to } = getPresetRange(preset);
    setFilters((prev) => ({ ...prev, dateFrom: from, dateTo: to, rangePreset: preset }));
  };

  const toggleModality = (code: ModalityCode) =>
    setFilters((prev) => {
      const next = new Set(prev.modalities);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return { ...prev, modalities: MODALITIES.filter((item) => next.has(item)) };
    });

  const toggleAllModalities = () =>
    setFilters((prev) => ({
      ...prev,
      modalities: prev.modalities.length === MODALITIES.length ? [] : [...MODALITIES],
    }));

  const clearAll = () => {
    setFilters(createDefaultFilters());
    onClear?.();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(filters);
  };

  /* Height animation between the two views.
     Freeze the current height, switch views, then animate to the new view's height. */
  const switchView = (next: boolean) => {
    if (next === expanded) return;
    const viewport = viewportRef.current;
    if (viewport) viewport.style.height = `${viewport.getBoundingClientRect().height}px`;
    setExpanded(next);
  };

  useLayoutEffect(() => {
    if (previousExpanded.current === expanded) return;
    previousExpanded.current = expanded;

    const viewport = viewportRef.current;
    const target = expanded ? expandedRef.current : collapsedRef.current;
    if (!viewport || !target) return;

    const frame = requestAnimationFrame(() => {
      viewport.style.height = `${target.scrollHeight}px`;
    });
    const timer = window.setTimeout(() => {
      viewport.style.height = '';
    }, VIEW_TRANSITION_MS);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [expanded]);

  const advancedFilterCount = [
    filters.assignedDoctor,
    filters.referringDoctor,
    filters.tag,
    filters.procedure.trim(),
    filters.reportContent.trim(),
  ].filter(Boolean).length;

  const expandedId = `${uid}-expanded`;

  return (
    <section ref={setRootElement} className={styles.root} data-theme={theme} aria-label="Radiology search and filters">
      <form onSubmit={handleSubmit} role="search" noValidate>
        <div className={styles.viewport} ref={viewportRef}>
          {/* ---------------- Collapsed quick bar ---------------- */}
          <div
            ref={collapsedRef}
            className={cx(styles.collapsedView, expanded && styles.viewHidden)}
            inert={expanded}
          >
            <div className={cx(styles.card, styles.cardCommand)}>
              <div className={styles.quickRow}>
                <div className={styles.quickFields}>
                  <FloatingField
                    id={`${uid}-col-pid`}
                    label="Patient ID"
                    icon="idCard"
                    value={filters.patientId}
                    onChange={(value) => update('patientId', value)}
                    segmentClassName={styles.segmentFirst}
                  />
                  <span className={styles.divider} aria-hidden="true" />
                  <FloatingField
                    id={`${uid}-col-pname`}
                    label="Patient Name"
                    icon="user"
                    value={filters.patientName}
                    onChange={(value) => update('patientName', value)}
                    segmentClassName={styles.segmentMiddle}
                  />
                  <span className={styles.divider} aria-hidden="true" />
                  <QuickDate
                    id={`${uid}-col-from`}
                    label="From Date"
                    value={filters.dateFrom}
                    onChange={(value) => updateDate('dateFrom', value)}
                  />
                  <span className={styles.divider} aria-hidden="true" />
                  <QuickDate
                    id={`${uid}-col-to`}
                    label="To Date"
                    value={filters.dateTo}
                    onChange={(value) => updateDate('dateTo', value)}
                    segmentClassName={styles.dateSegmentLast}
                  />
                </div>

                <div className={styles.quickActions}>
                  <button
                    type="button"
                    className={styles.textButton}
                    title="Clear search fields"
                    onClick={clearAll}
                  >
                    <SearchIcon name="reset" className={styles.buttonIconSmall} />
                    Clear
                  </button>
                  <button
                    type="button"
                    className={styles.filtersButton}
                    title="Open advanced clinical filters"
                    aria-expanded={expanded}
                    aria-controls={expandedId}
                    onClick={() => switchView(true)}
                  >
                    <SearchIcon name="sliders" className={styles.buttonIconSmallMuted} />
                    Filters
                    {advancedFilterCount > 0 && (
                      <span className={styles.countBadge}>{advancedFilterCount}</span>
                    )}
                    <SearchIcon name="caretDown" className={styles.caretTiny} />
                  </button>
                  <button type="submit" className={styles.primaryButton} title="Execute search">
                    <SearchIcon name="search" className={styles.buttonIconSmall} />
                    Search
                  </button>
                </div>
              </div>

              <div className={cx(styles.modalityBar, styles.modalityBarStrip)}>
                <span className={styles.modalityTitle}>Modalities</span>
                <ModalityChips
                  selected={filters.modalities}
                  onToggle={toggleModality}
                  onToggleAll={toggleAllModalities}
                  portalTarget={rootElement}
                />
              </div>
            </div>
          </div>

          {/* ---------------- Expanded filter form ---------------- */}
          <div
            id={expandedId}
            ref={expandedRef}
            className={cx(styles.expandedView, expanded && styles.expandedActive)}
            inert={!expanded}
          >
            <div className={cx(styles.card, styles.cardRaised, styles.expandedCard)}>
              <div className={styles.grid}>
                <TextControl
                  id={`${uid}-exp-pid`}
                  label="Patient ID"
                  icon="idCard"
                  placeholder="Patient ID"
                  value={filters.patientId}
                  onChange={(value) => update('patientId', value)}
                />
                <DateControl
                  id={`${uid}-exp-from`}
                  label="From Date"
                  value={filters.dateFrom}
                  onChange={(value) => updateDate('dateFrom', value)}
                />
                <DateControl
                  id={`${uid}-exp-to`}
                  label="To Date"
                  value={filters.dateTo}
                  onChange={(value) => updateDate('dateTo', value)}
                />
                <SelectControl
                  id={`${uid}-exp-assigned`}
                  label="Assigned Doctor"
                  icon="stethoscope"
                  placeholder="Search Assigned Doc"
                  options={ASSIGNED_DOCTOR_OPTIONS}
                  value={filters.assignedDoctor}
                  onChange={(value) => update('assignedDoctor', value)}
                />
              </div>

              <div className={styles.grid}>
                <TextControl
                  id={`${uid}-exp-pname`}
                  label="Patient Name"
                  icon="user"
                  placeholder="Patient Name"
                  value={filters.patientName}
                  onChange={(value) => update('patientName', value)}
                />
                <SelectControl
                  id={`${uid}-exp-referring`}
                  label="Referring Doctor"
                  icon="userCheck"
                  placeholder="Search Ref Doctor"
                  options={REFERRING_DOCTOR_OPTIONS}
                  value={filters.referringDoctor}
                  onChange={(value) => update('referringDoctor', value)}
                />
                <SelectControl
                  id={`${uid}-exp-tag`}
                  label="Tags"
                  icon="tag"
                  placeholder="Search Tag"
                  options={TAG_OPTIONS}
                  value={filters.tag}
                  onChange={(value) => update('tag', value)}
                />
                <TextControl
                  id={`${uid}-exp-procedure`}
                  label="Procedure / Study"
                  icon="search"
                  placeholder="e.g. Chest 2 Views..."
                  value={filters.procedure}
                  onChange={(value) => update('procedure', value)}
                />
              </div>

              <div className={styles.rowSplit}>
                <div className={cx(styles.formField, styles.grow)}>
                  <label className={styles.fieldLabel} htmlFor={`${uid}-exp-content`}>
                    Report Content
                  </label>
                  <div className={styles.control}>
                    <input
                      id={`${uid}-exp-content`}
                      type="text"
                      autoComplete="off"
                      className={styles.input}
                      placeholder="Search keywords within radiology findings, impressions, or clinical notes..."
                      value={filters.reportContent}
                      onChange={(event) => update('reportContent', event.target.value)}
                    />
                    <SearchIcon name="article" className={styles.leadIcon} />
                  </div>
                </div>

                <div className={styles.formFieldFit}>
                  <span className={styles.fieldLabel} id={`${uid}-preset-label`}>
                    Range Preset
                  </span>
                  <div className={styles.segmented} role="group" aria-labelledby={`${uid}-preset-label`}>
                    {RANGE_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        aria-pressed={filters.rangePreset === preset}
                        className={cx(
                          styles.segmentButton,
                          filters.rangePreset === preset && styles.segmentButtonActive,
                        )}
                        onClick={() => applyPreset(preset)}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formFieldFit}>
                  <span className={styles.fieldLabel} id={`${uid}-status-label`}>
                    Status
                  </span>
                  <div className={styles.statusGroup} role="group" aria-labelledby={`${uid}-status-label`}>
                    {STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        aria-pressed={filters.status === status}
                        className={cx(
                          styles.statusButton,
                          STATUS_CLASS[status],
                          filters.status === status && styles.statusActive,
                        )}
                        onClick={() => update('status', status)}
                      >
                        <span className={styles.statusDot} />
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={cx(styles.modalityBar, styles.modalityBarForm)}>
                <span className={styles.modalityTitle}>Modalities</span>
                <ModalityChips
                  selected={filters.modalities}
                  onToggle={toggleModality}
                  onToggleAll={toggleAllModalities}
                  portalTarget={rootElement}
                />
                <div className={styles.expandedActions}>
                  <button
                    type="button"
                    className={styles.ghostButton}
                    title="Collapse to quick bar"
                    onClick={() => switchView(false)}
                  >
                    <SearchIcon name="caretUp" className={styles.buttonIconSmallMuted} />
                    Collapse
                  </button>
                  <button
                    type="button"
                    className={cx(styles.ghostButton, styles.ghostButtonQuiet)}
                    title="Clear all filters"
                    onClick={clearAll}
                  >
                    <SearchIcon name="reset" className={styles.buttonIconSmallMuted} />
                    Clear
                  </button>
                  <button type="submit" className={styles.primaryButton} title="Search">
                    <SearchIcon name="search" className={styles.buttonIconSmall} />
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
