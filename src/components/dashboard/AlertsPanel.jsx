import styles from './AlertsPanel.module.css'

const ALERT_ICONS = {
  expiry: '🗓️',
  lowstock: '📉',
  maintenance: '🔧',
  warranty: '🛡️',
  loan: '🤝',
}

export default function AlertsPanel({ alerts = [], onNavigate }) {
  const displayed = alerts.slice(0, 8)

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>
          🔔 Alerts
          {alerts.length > 0 && <span className={styles.count}>{alerts.length}</span>}
        </div>
        {alerts.length > 8 && (
          <button className={styles.viewAll} onClick={() => onNavigate?.('dashboard')}>
            View all ({alerts.length})
          </button>
        )}
      </div>

      <div className={styles.list}>
        {displayed.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>✅</span>
            All clear — no alerts right now!
          </div>
        ) : (
          displayed.map((alert) => (
            <div key={alert.id} className={`${styles.alertItem} ${styles[alert.severity]}`}>
              <span className={styles.alertIcon}>{ALERT_ICONS[alert.type] || '⚠️'}</span>
              <div className={styles.alertContent}>
                <div className={styles.alertTitle}>{alert.title}</div>
                <div className={styles.alertDesc}>{alert.description}</div>
              </div>
              <button
                className={styles.alertAction}
                onClick={() => onNavigate?.(alert.page)}
              >
                {alert.actionLabel} →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
