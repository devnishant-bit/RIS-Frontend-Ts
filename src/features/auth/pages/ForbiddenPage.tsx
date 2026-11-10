import { Link } from 'react-router-dom'
import { routePaths } from '../../../routes/routePaths'
import styles from './ForbiddenPage.module.css'

export function ForbiddenPage() {
  return (
    <section className={styles.page}>
      <p className={styles.eyebrow}>Access example</p>
      <h1>This demo profile does not have that permission</h1>
      <p>Sign in with the admin demo profile to view the reports and user administration examples.</p>
      <Link className={styles.link} to={routePaths.worklist}>Return to Worklist</Link>
    </section>
  )
}