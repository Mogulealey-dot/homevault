import { useFirestore } from '../../hooks/useFirestore'
import { formatRelativeTime } from '../../utils/formatters'
import styles from './RecentActivity.module.css'

const ACTION_ICONS = {
  add: '➕',
  update: '✏️',
  delete: '🗑️',
  loan: '🤝',
  maintenance: '🔧',
  shopping: '🛒',
  pantry: '🍎',
}

export default function RecentActivity({ uid }) {
  const { data: activity, loading } = useFirestore(uid, 'activity_log')
  const recent = activity.slice(0, 10)

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>Recent Activity</div>
        <div className={styles.empty}>Loading…</div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>Recent Activity</div>
      {recent.length === 0 ? (
        <div className={styles.empty}>No recent activity yet.</div>
      ) : (
        <div className={styles.list}>
          {recent.map((entry) => (
            <div key={entry.id} className={styles.item}>
              <div className={styles.iconWrap}>
                {ACTION_ICONS[entry.action] || '📝'}
              </div>
              <div className={styles.content}>
                <div className={styles.desc}>{entry.description || `${entry.action}: ${entry.itemName}`}</div>
                <div className={styles.time}>{formatRelativeTime(entry.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
