import styles from './EmptyState.module.css'

export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className={styles.root}>
      <div className={styles.icon}>{icon}</div>
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
