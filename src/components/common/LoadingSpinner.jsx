import styles from './LoadingSpinner.module.css'

export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const spinner = <div className={`${styles.spinner} ${styles[size]}`} />

  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        {spinner}
        <span className={styles.fullPageText}>Loading…</span>
      </div>
    )
  }

  return spinner
}
