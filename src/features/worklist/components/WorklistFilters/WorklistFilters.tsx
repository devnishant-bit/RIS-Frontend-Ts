import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { SearchIcon } from './worklistFiltersIcon';
import type { SearchIconName } from './worklistFiltersIcon';
import { useMediaQuery, MOBILE_QUERY } from '@/shared/hooks/useMediaQuery';

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
import useTheme from '@/shared/Theme/useTheme';

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

/* ---------- Date range helpers (DD-MM-YYYY strings) ---------- */

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad = (value: number) => String(value).padStart(2, '0');

const formatDate = (date: Date) =>
  `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

const parseDate = (value: string): Date | null => {
  const match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
};

const dayKey = (date: Date) => date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

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


interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}

function FormField({ id, label, children, className }: FormFieldProps) {
  return (
    <div className={cx(styles.formField, styles.col3, className)}>
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
  className?: string;
}

function TextControl({ id, label, icon, value, placeholder, onChange, className }: TextControlProps) {
  return (
    <FormField id={id} label={label} className={className}>
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

interface RangeCalendarProps {
  from: string;
  to: string;
  onPick: (from: string, to: string) => void;
}

/** One calendar for both ends: first click = start, second click = end. */
function RangeCalendar({ from, to, onPick }: RangeCalendarProps) {
  const committedStart = parseDate(from);
  const committedEnd = parseDate(to);
  const [view, setView] = useState(() => {
    const base = committedStart ?? new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [hover, setHover] = useState<Date | null>(null);

  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  // While picking, preview anchor..hover; otherwise show the committed range.
  const rangeA = anchor ?? committedStart;
  const rangeB = anchor ? (hover ?? anchor) : (committedEnd ?? rangeA);
  const [lo, hi] =
    rangeA && rangeB
      ? dayKey(rangeA) <= dayKey(rangeB)
        ? [rangeA, rangeB]
        : [rangeB, rangeA]
      : [null, null];

  const pick = (day: Date) => {
    if (!anchor) {
      setAnchor(day);
      setHover(null);
      return;
    }
    const [start, end] = dayKey(day) < dayKey(anchor) ? [day, anchor] : [anchor, day];
    onPick(formatDate(start), formatDate(end));
  };

  const first = new Date(view.year, view.month, 1);
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(view.year, view.month, i + 1)),
  ];
  const todayKey = dayKey(new Date());

  return (
    <>
      <div className={styles.calHeader}>
        <button
          type="button"
          className={styles.calNav}
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span className={styles.calTitle} aria-live="polite">
          {first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          className={styles.calNav}
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className={styles.calWeekdays} aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <span key={day} className={styles.calWeekday}>
            {day}
          </span>
        ))}
      </div>

      <div className={styles.calGrid} onMouseLeave={() => setHover(null)}>
        {cells.map((day, index) => {
          if (!day) return <span key={`blank-${index}`} />;
          const key = dayKey(day);
          const isEdge = Boolean(lo && hi && (key === dayKey(lo) || key === dayKey(hi)));
          const inRange = Boolean(lo && hi && key > dayKey(lo) && key < dayKey(hi));
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isEdge}
              aria-label={day.toLocaleDateString('en-GB', { dateStyle: 'full' })}
              className={cx(
                styles.calDay,
                key === todayKey && styles.calDayToday,
                inRange && styles.calDayInRange,
                isEdge && styles.calDayEdge,
              )}
              onMouseEnter={() => setHover(day)}
              onFocus={() => setHover(day)}
              onClick={() => pick(day)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <p className={styles.calHint}>{anchor ? 'Now pick the end date' : 'Pick the start date'}</p>
    </>
  );
}

interface DateRangeFieldProps {
  id: string;
  label: string;
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  portalTarget: HTMLElement | null;
  variant: 'quick' | 'form';
  className?: string;
}

/** Single date field that opens one calendar for the whole from/to range. */
function DateRangeField({
  id,
  label,
  from,
  to,
  onChange,
  portalTarget,
  variant,
  className,
}: DateRangeFieldProps) {
  const popoverId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const close = () => setOpen(false);

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const button = buttonRef.current;
    const root = portalTarget;
    if (!button || !root) return;

    const buttonRect = button.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const popoverWidth = Math.min(288, window.innerWidth - 32);
    const buttonLeft = buttonRect.left - rootRect.left + root.scrollLeft;
    setPosition({
      top: buttonRect.bottom - rootRect.top + root.scrollTop + 6,
      left: Math.max(0, Math.min(buttonLeft, root.clientWidth - popoverWidth)),
    });
    setOpen(true);
  };

  const display =
    from && to ? (
      <>
        {from}
        <span className={styles.rangeSep} aria-hidden="true">
          –
        </span>
        {to}
      </>
    ) : (
      <span className={styles.rangePlaceholder}>Select date range</span>
    );

  const popover =
    open &&
    portalTarget &&
    createPortal(
      <div
        ref={popoverRef}
        id={popoverId}
        className={styles.rangePopover}
        role="dialog"
        aria-label="Choose date range"
        style={{ top: position.top, left: position.left }}
      >
        <RangeCalendar
          from={from}
          to={to}
          onPick={(nextFrom, nextTo) => {
            onChange(nextFrom, nextTo);
            setOpen(false);
          }}
        />
      </div>,
      portalTarget,
    );

  if (variant === 'quick') {
    return (
      <div className={cx(styles.dateSegment, className)}>
        <SearchIcon name="calendar" className={styles.quickIcon} />
        <div className={styles.dateBody}>
          <label className={styles.dateLabel} htmlFor={id}>
            {label}
          </label>
          <div className={styles.dateUnderline}>
            <button
              ref={buttonRef}
              id={id}
              type="button"
              className={styles.rangeValue}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={popoverId}
              onClick={toggle}
            >
              {display}
            </button>
            <SearchIcon name="caretDown" className={styles.dateCaret} />
          </div>
        </div>
        {popover}
      </div>
    );
  }

  return (
    <FormField id={id} label={label} className={className}>
      <div className={styles.control}>
        <button
          ref={buttonRef}
          id={id}
          type="button"
          className={cx(styles.input, styles.dateControl, styles.rangeButton)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={popoverId}
          onClick={toggle}
        >
          {display}
        </button>
        <SearchIcon name="calendar" className={cx(styles.leadIcon, styles.leadIconAccent)} />
        <SearchIcon name="caretDown" className={styles.trailIcon} />
        {popover}
      </div>
    </FormField>
  );
}


interface ModalityChipsProps {
  selected: ModalityCode[];
  onToggle: (code: ModalityCode) => void;
  onToggleAll: () => void;
  portalTarget: HTMLElement | null;
  /** Collapsed bar: show every modality (no "More" button), "Others" last. */
  showAll?: boolean;
}

const isOthers = (code: ModalityCode) => String(code).toUpperCase() === 'OTHERS';

/** Rendered in both views; both read the same state, so they never drift apart. */
function ModalityChips({ selected, onToggle, onToggleAll, portalTarget, showAll = false }: ModalityChipsProps) {
  const id = useId();
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const regularModalities = MODALITIES.filter((code) => !isOthers(code));
  const othersModalities = MODALITIES.filter(isOthers);

  // Collapsed: everything, with Others at the end.
  // Expanded: first 9 are visible; the rest, plus Others, go in "More".
  const visibleModalities = showAll
    ? [...regularModalities, ...othersModalities]
    : regularModalities.slice(0, 9);
  const extraModalities = showAll
    ? []
    : [...regularModalities.slice(9), ...othersModalities];

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

export default function SearchBar({ theme: themeProp, onSearch, onClear }: SearchBarProps) {
  const { theme: appTheme } = useTheme();
  const theme = themeProp ?? appTheme;
  const uid = useId();
  const [filters, setFilters] = useState<SearchFilters>(createDefaultFilters);
  const [expanded, setExpanded] = useState(false);
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const collapsedRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const previousExpanded = useRef(expanded);

  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobile = () => {
    setExpanded(true); // phones use the single-column form, not the quick bar
    setMobileOpen(true);
  };
  const closeMobile = () => {
    setMobileOpen(false);
    setExpanded(false);
  };

  const update = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const updateDateRange = (from: string, to: string) =>
    setFilters((prev) => ({ ...prev, dateFrom: from, dateTo: to, rangePreset: null }));

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
    if (isMobile) closeMobile();
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
      {isMobile && !mobileOpen ? (
        <div className={styles.mobileTriggerWrap}>
          <button
            type="button"
            className={styles.mobileTrigger}
            aria-label="Open search and filters"
            aria-expanded={false}
            onClick={openMobile}
          >
            <SearchIcon name="search" className={styles.mobileTriggerIcon} />
            {advancedFilterCount > 0 && (
              <span className={cx(styles.countBadge, styles.mobileBadge)}>{advancedFilterCount}</span>
            )}
          </button>
        </div>
      ) : (
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
                    <DateRangeField
                      variant="quick"
                      id={`${uid}-col-date`}
                      label="Date"
                      from={filters.dateFrom}
                      to={filters.dateTo}
                      onChange={updateDateRange}
                      portalTarget={rootElement}
                      className={styles.dateSegmentLast}
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
                    showAll
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
                  <TextControl
                    id={`${uid}-exp-pname`}
                    label="Patient Name"
                    icon="user"
                    placeholder="Patient Name"
                    value={filters.patientName}
                    onChange={(value) => update('patientName', value)}
                    className={styles.spanTwo}
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
                  <DateRangeField
                    variant="form"
                    id={`${uid}-exp-date`}
                    label="Date"
                    from={filters.dateFrom}
                    to={filters.dateTo}
                    onChange={updateDateRange}
                    portalTarget={rootElement}
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
                      title={isMobile ? 'Close search' : 'Collapse to quick bar'}
                      onClick={() => (isMobile ? closeMobile() : switchView(false))}
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
      )}
    </section>
  );
}
