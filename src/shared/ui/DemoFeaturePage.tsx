import { Link } from 'react-router-dom'
import { routePaths } from '../../routes/routePaths'
import { PageSectionPlaceholder, type PageSectionSpec } from './PageSectionPlaceholder'
import { pageSectionComponents } from '../../routes/pageSectionComponents'
import styles from './DemoFeaturePage.module.css'

interface DemoFeaturePageProps {
  title: string
  description: string
  parentPath?: string
  sections?: PageSectionSpec[]
}

export function DemoFeaturePage({ title, description, parentPath, sections }: DemoFeaturePageProps) {
  const pageSections: PageSectionSpec[] = sections?.length
    ? sections
    : [{ kind: 'workspace', title: `${title} content`, componentName: 'PageContentSection' }]

  return (
    <section className={styles.page}>
      <p className={styles.eyebrow}>Replaceable route placeholder</p>
      <h1>{title}</h1>
      <p>{description}</p>
      {parentPath && <p className={styles.routePath}>Parent route: <code>{parentPath}</code></p>}
      <div className={styles.sectionGrid}>
        {pageSections.map((section) => {
          const SectionComponent = pageSectionComponents[section.componentName]
          return SectionComponent
            ? <SectionComponent key={section.componentName} section={section} />
            : <PageSectionPlaceholder key={section.componentName} section={section} />
        })}
      </div>
      <Link className={styles.link} to={routePaths.worklist}>Go to Worklist</Link>
    </section>
  )
}
