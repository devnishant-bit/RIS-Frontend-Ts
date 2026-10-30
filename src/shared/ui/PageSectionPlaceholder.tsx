import type { ReactNode } from 'react'
import styles from './PageSectionPlaceholder.module.css'

export type PageSectionKind =
  | 'filters'
  | 'table'
  | 'form'
  | 'summary'
  | 'chart'
  | 'list'
  | 'workspace'
  | 'calendar'

export interface PageSectionSpec {
  kind: PageSectionKind
  title: string
  componentName: string
  description?: string
  span?: 4 | 6 | 8 | 12
}

interface SectionProps {
  section: PageSectionSpec
}

function SectionFrame({ section, className, children }: SectionProps & { className: string; children: ReactNode }) {
  return (
    <section className={`${styles.frame} ${className}`}>
      <header className={styles.header}>
        <div>
          <h2>{section.title}</h2>
          {section.description && <p>{section.description}</p>}
        </div>
        <code>{section.componentName}</code>
      </header>
      <div className={styles.content}>{children}</div>
    </section>
  )
}

function FilterPanelPlaceholder({ section }: SectionProps) {
  return (
    <SectionFrame section={section} className={styles.filters}>
      <div className={styles.filterControls}>
        <span /><span /><span /><span />
      </div>
      <div className={styles.actionStub} />
    </SectionFrame>
  )
}

function DataTablePlaceholder({ section }: SectionProps) {
  return (
    <SectionFrame section={section} className={styles.table}>
      <div className={styles.tableStub}>
        <div className={styles.tableRow}><span /><span /><span /><span /></div>
        <div className={styles.tableRow}><span /><span /><span /><span /></div>
        <div className={styles.tableRow}><span /><span /><span /><span /></div>
      </div>
      <div className={styles.tableFooter} />
    </SectionFrame>
  )
}

function FormPlaceholder({ section }: SectionProps) {
  return (
    <SectionFrame section={section} className={styles.form}>
      <div className={styles.formFields}>
        <span /><span /><span /><span />
      </div>
      <div className={styles.actionStub} />
    </SectionFrame>
  )
}

function SummaryPlaceholder({ section }: SectionProps) {
  return (
    <SectionFrame section={section} className={styles.summary}>
      <div className={styles.summaryCards}><span /><span /><span /></div>
    </SectionFrame>
  )
}

function ChartPlaceholder({ section }: SectionProps) {
  return (
    <SectionFrame section={section} className={styles.chart}>
      <div className={styles.chartStub}><span /><span /><span /><span /><span /><span /></div>
    </SectionFrame>
  )
}

function ListPlaceholder({ section }: SectionProps) {
  return (
    <SectionFrame section={section} className={styles.list}>
      <div className={styles.listStub}><span /><span /><span /><span /></div>
    </SectionFrame>
  )
}

function WorkspacePlaceholder({ section }: SectionProps) {
  return (
    <SectionFrame section={section} className={styles.workspace}>
      <div className={styles.workspaceStub}>Page workspace</div>
    </SectionFrame>
  )
}

function CalendarPlaceholder({ section }: SectionProps) {
  return (
    <SectionFrame section={section} className={styles.calendar}>
      <div className={styles.calendarStub}>
        {Array.from({ length: 28 }, (_, index) => <span key={index} />)}
      </div>
    </SectionFrame>
  )
}

export function PageSectionPlaceholder({ section }: SectionProps) {
  const spanClass = {
    4: styles.span4,
    6: styles.span6,
    8: styles.span8,
    12: styles.span12,
  }[section.span ?? 12]

  let component: ReactNode
  switch (section.kind) {
    case 'filters': component = <FilterPanelPlaceholder section={section} />; break
    case 'table': component = <DataTablePlaceholder section={section} />; break
    case 'form': component = <FormPlaceholder section={section} />; break
    case 'summary': component = <SummaryPlaceholder section={section} />; break
    case 'chart': component = <ChartPlaceholder section={section} />; break
    case 'list': component = <ListPlaceholder section={section} />; break
    case 'calendar': component = <CalendarPlaceholder section={section} />; break
    default: component = <WorkspacePlaceholder section={section} />
  }

  return <div className={`${styles.cell} ${spanClass}`}>{component}</div>
}
