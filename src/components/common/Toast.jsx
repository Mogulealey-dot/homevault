import styles from './Toast.module.css'

export default function Toast({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${t.type === 'error' ? styles.error : t.type === 'info' ? styles.info : ''}`}>
          <span className={styles.message}>{t.message}</span>
          <button className={styles.close} onClick={() => onRemove(t.id)} aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  )
}
