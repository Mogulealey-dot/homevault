import { daysUntil, formatDate } from '../../utils/formatters'
import EmptyState from '../common/EmptyState'
import styles from './MaintenanceSchedule.module.css'

function groupTasks(tasks) {
  const overdue = [], thisWeek = [], thisMonth = [], upcoming = []
  for (const task of tasks) {
    if (task.status === 'done') continue
    const days = daysUntil(task.scheduledDate)
    if (days === null || days > 60) { upcoming.push(task); continue }
    if (days < 0) overdue.push(task)
    else if (days <= 7) thisWeek.push(task)
    else if (days <= 31) thisMonth.push(task)
    else upcoming.push(task)
  }
  return { overdue, thisWeek, thisMonth, upcoming }
}

export default function MaintenanceSchedule({ tasks = [], onMarkDone, onEdit, onDelete, onAdd }) {
  const groups = groupTasks(tasks)

  const TaskItem = ({ task, cls }) => {
    const days = daysUntil(task.scheduledDate)
    let dueCls = styles.dueOk
    let dueLabel = formatDate(task.scheduledDate)
    if (days === null) dueLabel = 'No date'
    else if (days < 0) { dueCls = styles.dueOverdue; dueLabel = `${Math.abs(days)}d overdue` }
    else if (days <= 7) { dueCls = styles.dueSoon; dueLabel = `${days}d` }
    else dueLabel = formatDate(task.scheduledDate)

    return (
      <div className={`${styles.task} ${cls || ''}`}>
        <div className={styles.taskIcon}>🔧</div>
        <div className={styles.taskInfo}>
          <div className={styles.taskTitle}>{task.title}</div>
          <div className={styles.taskMeta}>
            {task.itemName && <span>📦 {task.itemName}</span>}
            {task.recurrence !== 'once' && task.recurrence && <span>🔄 {task.recurrence}</span>}
            {task.estimatedCost && <span>💰 ${task.estimatedCost}</span>}
          </div>
        </div>
        <span className={`${styles.dueBadge} ${dueCls}`}>{dueLabel}</span>
        <div className={styles.actions}>
          <button className="btn btn-primary btn-sm" onClick={() => onMarkDone(task.id)}>
            ✓ Done
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button className="btn btn-icon" onClick={() => onDelete(task.id)} title="Delete">
            🗑️
          </button>
        </div>
      </div>
    )
  }

  const Group = ({ title, items, cls }) => {
    if (items.length === 0) return null
    return (
      <div className={styles.group}>
        <div className={styles.groupHeader}>
          {title}
          <span className={styles.groupCount}>{items.length}</span>
        </div>
        <div className={styles.list}>
          {items.map((t) => <TaskItem key={t.id} task={t} cls={cls} />)}
        </div>
      </div>
    )
  }

  const allCount = groups.overdue.length + groups.thisWeek.length + groups.thisMonth.length + groups.upcoming.length

  return (
    <div className={styles.root}>
      {allCount === 0 ? (
        <EmptyState
          icon="✅"
          title="No maintenance tasks"
          description="Schedule maintenance tasks to keep track of home upkeep."
          action={{ label: '+ Add Task', onClick: onAdd }}
        />
      ) : (
        <>
          <Group title="🔴 Overdue" items={groups.overdue} cls={styles.overdue} />
          <Group title="🟡 This Week" items={groups.thisWeek} cls={styles.thisWeek} />
          <Group title="🟠 This Month" items={groups.thisMonth} />
          <Group title="🔵 Upcoming" items={groups.upcoming} />
        </>
      )}
    </div>
  )
}
