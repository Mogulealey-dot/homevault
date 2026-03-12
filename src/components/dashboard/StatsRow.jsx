import { formatCurrency } from '../../utils/formatters'
import styles from './StatsRow.module.css'

const STAT_CONFIGS = [
  {
    key: 'items',
    icon: '📦',
    label: 'Total Items',
    color: '#eff6ff',
    iconColor: '#3b82f6',
  },
  {
    key: 'value',
    icon: '💰',
    label: 'Total Value',
    color: '#f0fdf4',
    iconColor: '#22c55e',
    format: (v) => formatCurrency(v),
  },
  {
    key: 'alerts',
    icon: '🔔',
    label: 'Active Alerts',
    color: '#fff7ed',
    iconColor: '#f59e0b',
    danger: true,
  },
  {
    key: 'locations',
    icon: '📍',
    label: 'Locations',
    color: '#fdf4ff',
    iconColor: '#a855f7',
  },
]

export default function StatsRow({ stats, alertCount }) {
  const values = {
    items: stats?.totalItems ?? 0,
    value: stats?.totalValue ?? 0,
    alerts: alertCount ?? 0,
    locations: stats?.locationCount ?? 0,
  }

  return (
    <div className={styles.row}>
      {STAT_CONFIGS.map((cfg) => {
        const val = values[cfg.key]
        const display = cfg.format ? cfg.format(val) : val.toLocaleString()
        const isAlert = cfg.key === 'alerts' && val > 0

        return (
          <div key={cfg.key} className={styles.card}>
            <div
              className={styles.iconWrap}
              style={{ background: cfg.color }}
            >
              <span>{cfg.icon}</span>
            </div>
            <div className={styles.info}>
              <div
                className={styles.value}
                style={{ color: isAlert ? 'var(--crimson)' : undefined }}
              >
                {display}
              </div>
              <div className={styles.label}>{cfg.label}</div>
              {cfg.key === 'alerts' && val === 0 && (
                <div className={`${styles.trend} ${styles.trendUp}`}>✓ All clear</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
